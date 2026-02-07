-- ================================================
-- Migration: Allow User Feedback
-- Allows users to update match status and feedback
-- ================================================

-- 1. Relax the feedback_updated_by constraint to allow any user (admins or regular users)
ALTER TABLE m2m.matches DROP CONSTRAINT IF EXISTS matches_feedback_updated_by_fkey;
ALTER TABLE m2m.matches ADD CONSTRAINT matches_feedback_updated_by_fkey FOREIGN KEY (feedback_updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add a column for user-specific notes to avoid overwriting admin notes
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- 3. Enable users to update their own matches (specifically to provide feedback)
-- Note: We rely on the application layer to ensure users only update feedback fields
CREATE POLICY "Users can update own matches" ON m2m.matches 
FOR UPDATE 
USING (auth.uid() = user_1_id OR auth.uid() = user_2_id)
WITH CHECK (auth.uid() = user_1_id OR auth.uid() = user_2_id);
