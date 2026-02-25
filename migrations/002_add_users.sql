-- Multi-user Authentication
-- Add users table and link existing resources to users

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to gmail_accounts
ALTER TABLE gmail_accounts ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id to notification_channels
ALTER TABLE notification_channels ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id to filter_rules (already linked via gmail_account, but direct link for easier queries)
ALTER TABLE filter_rules ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Indexes for user-scoped queries
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_gmail_accounts_user ON gmail_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_user ON notification_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_user ON filter_rules(user_id);
