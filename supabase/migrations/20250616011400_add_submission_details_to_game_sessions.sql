-- supabase/migrations/YYYYMMDDHHMMSS_add_submission_details_to_game_sessions.sql
-- add these to table to allow calculation of stats for user
ALTER TABLE game_sessions
ADD COLUMN submitted_permalink text DEFAULT NULL;

ALTER TABLE game_sessions
ADD COLUMN completion_time decimal DEFAULT NULL;