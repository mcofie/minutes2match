-- Add min_age and max_age to events
ALTER TABLE m2m.events
ADD COLUMN min_age INTEGER DEFAULT NULL,
ADD COLUMN max_age INTEGER DEFAULT NULL;
