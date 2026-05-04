-- =========================================================
-- Migration: Event booking hardening, waitlist promotion, and truthful counters
-- =========================================================

-- Recalculate sold counters from the source of truth instead of one-way increments.
CREATE OR REPLACE FUNCTION m2m.refresh_event_ticket_counts(p_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $function$
DECLARE
  v_male_confirmed INT := 0;
  v_female_confirmed INT := 0;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE LOWER(COALESCE(p.gender, '')) = 'male'),
    COUNT(*) FILTER (WHERE LOWER(COALESCE(p.gender, '')) = 'female')
  INTO v_male_confirmed, v_female_confirmed
  FROM m2m.event_bookings eb
  JOIN m2m.profiles p ON p.id = eb.user_id
  WHERE eb.event_id = p_event_id
    AND eb.status IN ('confirmed', 'checked_in');

  UPDATE m2m.events
  SET male_tickets_sold = COALESCE(v_male_confirmed, 0),
      female_tickets_sold = COALESCE(v_female_confirmed, 0)
  WHERE id = p_event_id;
END;
$function$;

CREATE OR REPLACE FUNCTION m2m.sync_event_ticket_counts_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM m2m.refresh_event_ticket_counts(OLD.event_id);
    RETURN OLD;
  END IF;

  PERFORM m2m.refresh_event_ticket_counts(NEW.event_id);

  IF TG_OP = 'UPDATE' AND OLD.event_id IS DISTINCT FROM NEW.event_id THEN
    PERFORM m2m.refresh_event_ticket_counts(OLD.event_id);
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS booking_ticket_count ON m2m.event_bookings;
CREATE TRIGGER booking_ticket_count
  AFTER INSERT OR UPDATE OR DELETE ON m2m.event_bookings
  FOR EACH ROW
  EXECUTE FUNCTION m2m.sync_event_ticket_counts_trigger();

DROP FUNCTION IF EXISTS update_ticket_count();

-- Delete stale pending bookings and return the affected rows for operational follow-up.
CREATE OR REPLACE FUNCTION m2m.cleanup_stale_pending_event_bookings(p_event_id UUID DEFAULT NULL)
RETURNS TABLE(event_id UUID, booking_id UUID, user_id UUID)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH deleted_rows AS (
    DELETE FROM m2m.event_bookings eb
    WHERE status = 'pending'
      AND created_at < NOW() - INTERVAL '30 minutes'
      AND (p_event_id IS NULL OR eb.event_id = p_event_id)
    RETURNING eb.event_id, eb.id, eb.user_id
  )
  SELECT deleted_rows.event_id, deleted_rows.id, deleted_rows.user_id
  FROM deleted_rows;
END;
$function$;

-- Atomically reserve or waitlist an event booking while preserving waitlist priority.
CREATE OR REPLACE FUNCTION m2m.reserve_event_booking(p_event_id UUID, p_user_id UUID)
RETURNS TABLE(booking_id UUID, booking_status TEXT, already_booked BOOLEAN)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_event m2m.events%ROWTYPE;
  v_existing m2m.event_bookings%ROWTYPE;
  v_existing_found BOOLEAN := FALSE;
  v_gender TEXT;
  v_bucket TEXT;
  v_capacity INT := 0;
  v_reserved INT := 0;
  v_waitlisted INT := 0;
  v_queue_ahead INT := 0;
  v_existing_is_waitlisted BOOLEAN := FALSE;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('event-booking:' || p_event_id::TEXT));
  PERFORM 1
  FROM m2m.cleanup_stale_pending_event_bookings(p_event_id);

  SELECT * INTO v_event
  FROM m2m.events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  IF v_event.event_date <= NOW() THEN
    RAISE EXCEPTION 'This event has already started or ended';
  END IF;

  IF v_event.status IN ('draft', 'completed') THEN
    RAISE EXCEPTION 'This event is not open for booking';
  END IF;

  SELECT gender INTO v_gender
  FROM m2m.profiles
  WHERE id = p_user_id;

  v_bucket := LOWER(COALESCE(v_gender, ''));
  IF v_bucket NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'Please complete your gender on your profile before booking an event';
  END IF;

  IF COALESCE(v_event.is_public, TRUE) = FALSE AND NOT EXISTS (
    SELECT 1
    FROM m2m.event_qualifications eq
    WHERE eq.event_id = p_event_id
      AND eq.user_id = p_user_id
      AND COALESCE(eq.status, '') IN ('qualified', 'invited')
  ) THEN
    RAISE EXCEPTION 'You are not currently qualified to book this event';
  END IF;

  SELECT * INTO v_existing
  FROM m2m.event_bookings
  WHERE event_id = p_event_id
    AND user_id = p_user_id
  FOR UPDATE;

  v_existing_found := FOUND;
  v_existing_is_waitlisted := v_existing_found AND v_existing.status = 'waitlisted';

  IF v_existing_found AND v_existing.status IN ('confirmed', 'checked_in') THEN
    RETURN QUERY
    SELECT v_existing.id, v_existing.status::TEXT, TRUE;
    RETURN;
  END IF;

  IF v_bucket = 'female' THEN
    v_capacity := COALESCE(v_event.female_capacity, 0);
  ELSE
    v_capacity := COALESCE(v_event.male_capacity, 0);
  END IF;

  SELECT COUNT(*)
  INTO v_reserved
  FROM m2m.event_bookings eb
  JOIN m2m.profiles p ON p.id = eb.user_id
  WHERE eb.event_id = p_event_id
    AND eb.status IN ('pending', 'confirmed', 'checked_in')
    AND LOWER(COALESCE(p.gender, '')) = v_bucket;

  SELECT COUNT(*)
  INTO v_waitlisted
  FROM m2m.event_bookings eb
  JOIN m2m.profiles p ON p.id = eb.user_id
  WHERE eb.event_id = p_event_id
    AND eb.status = 'waitlisted'
    AND LOWER(COALESCE(p.gender, '')) = v_bucket;

  IF v_event.status = 'waitlist' AND v_waitlisted = 0 AND v_reserved < v_capacity THEN
    UPDATE m2m.events
    SET status = 'open'
    WHERE id = p_event_id;
    v_event.status := 'open';
  END IF;

  IF v_existing_is_waitlisted THEN
    SELECT COUNT(*)
    INTO v_queue_ahead
    FROM m2m.event_bookings eb
    JOIN m2m.profiles p ON p.id = eb.user_id
    WHERE eb.event_id = p_event_id
      AND eb.status = 'waitlisted'
      AND LOWER(COALESCE(p.gender, '')) = v_bucket
      AND (
        eb.created_at < v_existing.created_at
        OR (eb.created_at = v_existing.created_at AND eb.id::TEXT < v_existing.id::TEXT)
      );

    IF v_event.status <> 'sold_out' AND v_reserved < v_capacity AND v_queue_ahead = 0 THEN
      UPDATE m2m.event_bookings
      SET status = 'pending',
          created_at = NOW(),
          updated_at = NOW(),
          payment_id = NULL,
          checked_in_at = NULL,
          checked_in_by = NULL
      WHERE id = v_existing.id
      RETURNING * INTO v_existing;

      RETURN QUERY
      SELECT v_existing.id, v_existing.status::TEXT, FALSE;
      RETURN;
    END IF;
  END IF;

  IF v_event.status = 'sold_out'
     OR v_event.status = 'waitlist'
     OR v_reserved >= v_capacity
     OR (v_waitlisted > 0 AND NOT v_existing_is_waitlisted) THEN
    IF v_existing_found THEN
      UPDATE m2m.event_bookings
      SET status = 'waitlisted',
          created_at = NOW(),
          updated_at = NOW(),
          payment_id = NULL,
          checked_in_at = NULL,
          checked_in_by = NULL
      WHERE id = v_existing.id
      RETURNING * INTO v_existing;
    ELSE
      INSERT INTO m2m.event_bookings (event_id, user_id, status)
      VALUES (p_event_id, p_user_id, 'waitlisted')
      RETURNING * INTO v_existing;
    END IF;

    RETURN QUERY
    SELECT v_existing.id, v_existing.status::TEXT, FALSE;
    RETURN;
  END IF;

  IF v_existing_found THEN
    UPDATE m2m.event_bookings
    SET status = 'pending',
        created_at = NOW(),
        updated_at = NOW(),
        checked_in_at = NULL,
        checked_in_by = NULL
    WHERE id = v_existing.id
    RETURNING * INTO v_existing;
  ELSE
    INSERT INTO m2m.event_bookings (event_id, user_id, status)
    VALUES (p_event_id, p_user_id, 'pending')
    RETURNING * INTO v_existing;
  END IF;

  RETURN QUERY
  SELECT v_existing.id, v_existing.status::TEXT, FALSE;
END;
$function$;

-- Promote waitlisted users into pending spots, earliest first, bucket by bucket.
CREATE OR REPLACE FUNCTION m2m.promote_event_waitlist(p_event_id UUID DEFAULT NULL)
RETURNS TABLE(event_id UUID, booking_id UUID, user_id UUID)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_event RECORD;
  v_bucket TEXT;
  v_capacity INT;
  v_reserved INT;
  v_slots INT;
  v_waitlisted RECORD;
  v_remaining_waitlist INT;
BEGIN
  FOR v_event IN
    SELECT *
    FROM m2m.events
    WHERE (p_event_id IS NULL OR id = p_event_id)
      AND event_date > NOW()
      AND status IN ('open', 'waitlist')
    ORDER BY event_date ASC
  LOOP
    PERFORM pg_advisory_xact_lock(hashtext('event-booking:' || v_event.id::TEXT));
    PERFORM 1
    FROM m2m.cleanup_stale_pending_event_bookings(v_event.id);

    FOR v_bucket IN
      SELECT bucket
      FROM unnest(ARRAY['male'::TEXT, 'female'::TEXT]) AS bucket
    LOOP
      v_capacity := CASE WHEN v_bucket = 'female' THEN COALESCE(v_event.female_capacity, 0) ELSE COALESCE(v_event.male_capacity, 0) END;

      SELECT COUNT(*)
      INTO v_reserved
      FROM m2m.event_bookings eb
      JOIN m2m.profiles p ON p.id = eb.user_id
      WHERE eb.event_id = v_event.id
        AND eb.status IN ('pending', 'confirmed', 'checked_in')
        AND LOWER(COALESCE(p.gender, '')) = v_bucket;

      v_slots := GREATEST(v_capacity - v_reserved, 0);

      IF v_event.status <> 'sold_out' AND v_slots > 0 THEN
        FOR v_waitlisted IN
          SELECT eb.id, eb.user_id
          FROM m2m.event_bookings eb
          JOIN m2m.profiles p ON p.id = eb.user_id
          WHERE eb.event_id = v_event.id
            AND eb.status = 'waitlisted'
            AND LOWER(COALESCE(p.gender, '')) = v_bucket
          ORDER BY eb.created_at ASC, eb.id ASC
          LIMIT v_slots
        LOOP
          UPDATE m2m.event_bookings
          SET status = 'pending',
              created_at = NOW(),
              updated_at = NOW(),
              payment_id = NULL,
              checked_in_at = NULL,
              checked_in_by = NULL
          WHERE id = v_waitlisted.id;

          event_id := v_event.id;
          booking_id := v_waitlisted.id;
          user_id := v_waitlisted.user_id;
          RETURN NEXT;
        END LOOP;
      END IF;
    END LOOP;

    IF v_event.status = 'waitlist' THEN
      SELECT COUNT(*)
      INTO v_remaining_waitlist
      FROM m2m.event_bookings
      WHERE event_id = v_event.id
        AND status = 'waitlisted';

      SELECT COUNT(*)
      INTO v_reserved
      FROM m2m.event_bookings
      WHERE event_id = v_event.id
        AND status IN ('pending', 'confirmed', 'checked_in');

      IF v_remaining_waitlist = 0
         AND v_reserved < (COALESCE(v_event.male_capacity, 0) + COALESCE(v_event.female_capacity, 0)) THEN
        UPDATE m2m.events
        SET status = 'open'
        WHERE id = v_event.id;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

GRANT EXECUTE ON FUNCTION m2m.cleanup_stale_pending_event_bookings(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION m2m.reserve_event_booking(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION m2m.promote_event_waitlist(UUID) TO authenticated, service_role;
