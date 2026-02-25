-- Add google_id and refresh_token columns to users table
-- Migration: 003_add_oauth_refresh_token

ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN refresh_token TEXT;

-- Create index for google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
