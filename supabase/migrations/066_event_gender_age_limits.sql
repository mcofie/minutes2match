ALTER TABLE m2m.events
  DROP COLUMN IF EXISTS min_age,
  DROP COLUMN IF EXISTS max_age,
  ADD COLUMN female_min_age integer,
  ADD COLUMN female_max_age integer,
  ADD COLUMN male_min_age integer,
  ADD COLUMN male_max_age integer;


