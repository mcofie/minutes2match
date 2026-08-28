-- ================================================================
-- COMPREHENSIVE FIX: Find and fix ALL restrictive foreign keys
-- in the m2m schema that would block user deletion.
-- ================================================================
-- This script dynamically discovers every FK in m2m.* that references
-- either auth.users(id) or m2m.profiles(id) and currently uses
-- RESTRICT / NO ACTION, then recreates them with ON DELETE CASCADE
-- (or SET NULL for nullable columns that aren't the main user_id).
-- ================================================================

DO $$
DECLARE
    r RECORD;
    new_action TEXT;
    col_nullable BOOLEAN;
BEGIN
    RAISE NOTICE '=== Scanning m2m schema for restrictive foreign keys ===';

    FOR r IN (
        SELECT
            tc.table_schema,
            tc.table_name,
            tc.constraint_name,
            kcu.column_name,
            ccu.table_schema AS ref_schema,
            ccu.table_name   AS ref_table,
            ccu.column_name  AS ref_column,
            rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
          AND tc.table_schema = ccu.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
          AND tc.constraint_schema = rc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'm2m'
          AND rc.delete_rule IN ('NO ACTION', 'RESTRICT')
          AND (
              (ccu.table_schema = 'auth' AND ccu.table_name = 'users')
              OR
              (ccu.table_schema = 'm2m' AND ccu.table_name = 'profiles')
          )
        ORDER BY tc.table_name, kcu.column_name
    )
    LOOP
        -- Determine if the column is nullable
        SELECT (is_nullable = 'YES') INTO col_nullable
        FROM information_schema.columns
        WHERE table_schema = r.table_schema
          AND table_name = r.table_name
          AND column_name = r.column_name;

        -- Use SET NULL for nullable non-primary user reference columns
        -- Use CASCADE for required (NOT NULL) user reference columns
        IF col_nullable THEN
            new_action := 'SET NULL';
        ELSE
            new_action := 'CASCADE';
        END IF;

        RAISE NOTICE 'Fixing: %.% (%) -> %.%(%) — % → ON DELETE %',
            r.table_schema, r.table_name, r.column_name,
            r.ref_schema, r.ref_table, r.ref_column,
            r.delete_rule, new_action;

        -- Drop old constraint
        EXECUTE format(
            'ALTER TABLE %I.%I DROP CONSTRAINT %I',
            r.table_schema, r.table_name, r.constraint_name
        );

        -- Recreate with proper ON DELETE action
        EXECUTE format(
            'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE %s',
            r.table_schema, r.table_name, r.constraint_name,
            r.column_name,
            r.ref_schema, r.ref_table, r.ref_column,
            new_action
        );
    END LOOP;

    RAISE NOTICE '=== Done! All restrictive FKs in m2m schema have been fixed. ===';
END $$;
