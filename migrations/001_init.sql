-- Gmail Notifier Database Schema
-- SQLite3 Database Initialization

-- Gmail Accounts
CREATE TABLE gmail_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- Encrypted
    imap_server TEXT DEFAULT 'imap.gmail.com',
    imap_port INTEGER DEFAULT 993,
    enabled BOOLEAN DEFAULT 1,
    last_checked_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notification Channels (Telegram, LINE, Webhook)
CREATE TABLE notification_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('telegram', 'line', 'webhook')),
    name TEXT NOT NULL,
    config TEXT NOT NULL,  -- JSON: {"bot_token": "...", "chat_id": "..."}
    enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

-- Filter Rules (แต่ละ account มี rules แยกกัน)
CREATE TABLE filter_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gmail_account_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    field TEXT NOT NULL CHECK(field IN ('from', 'subject', 'body')),
    match_type TEXT DEFAULT 'contains' CHECK(match_type IN ('contains', 'regex', 'equals')),
    match_value TEXT NOT NULL,
    channel_id INTEGER NOT NULL,
    priority INTEGER DEFAULT 50,  -- Lower = higher priority
    enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gmail_account_id) REFERENCES gmail_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES notification_channels(id) ON DELETE CASCADE
);

-- Notification Logs
CREATE TABLE notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gmail_account_id INTEGER NOT NULL,
    filter_rule_id INTEGER,  -- NULL if no rule matched (default channel)
    channel_id INTEGER NOT NULL,
    email_subject TEXT,
    email_from TEXT,
    email_date TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gmail_account_id) REFERENCES gmail_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (filter_rule_id) REFERENCES filter_rules(id) ON DELETE SET NULL,
    FOREIGN KEY (channel_id) REFERENCES notification_channels(id) ON DELETE CASCADE
);

-- Config Settings (key-value store)
CREATE TABLE config_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX idx_logs_gmail_account ON notification_logs(gmail_account_id);
CREATE INDEX idx_logs_status ON notification_logs(status);
CREATE INDEX idx_rules_gmail_account ON filter_rules(gmail_account_id);
CREATE INDEX idx_rules_priority ON filter_rules(priority ASC);

-- Insert default config settings
INSERT INTO config_settings (key, value) VALUES
    ('check_interval', '60'),
    ('max_body_length', '300'),
    ('log_level', 'INFO');
