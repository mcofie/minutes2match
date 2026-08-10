-- Drop strict profile foreign key constraint on processed_by column in m2m.account_deletion_requests
-- Admin accounts exist in m2m.admins / auth.users and may not have a row in m2m.profiles.

ALTER TABLE IF EXISTS m2m.account_deletion_requests
  DROP CONSTRAINT IF EXISTS account_deletion_requests_processed_by_fkey;
