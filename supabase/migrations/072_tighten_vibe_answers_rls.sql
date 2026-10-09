-- Migration: 072_tighten_vibe_answers_rls.sql
-- Remove an over-broad policy that let any signed-in member read, change or delete
-- every other member's Vibe Check answers. Members keep access to their own answers
-- (insert / update / select own policies) and admins keep read access to all.
-- Server code uses the service role and is unaffected.
-- Applied to production on 2026-10-09.

DROP POLICY IF EXISTS "Allow all vibe answers for authenticated" ON m2m.vibe_answers;
