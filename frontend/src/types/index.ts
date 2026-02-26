// Auth Types
export interface AuthUser {
  id: number
  username: string
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

// Alias for convenience
export type User = AuthUser

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

// Gmail Account Types
export interface GmailAccount {
  id: number
  email: string
  imap_server: string
  imap_port: number
  enabled: boolean
  sync_all_unseen: boolean
  last_checked_at: string | null
  created_at: string
  updated_at: string
}

export interface GmailAccountCreate {
  email: string
  password: string
  imap_server?: string
  imap_port?: number
  enabled?: boolean
  sync_all_unseen?: boolean
}

export interface GmailAccountUpdate {
  email?: string
  password?: string
  imap_server?: string
  imap_port?: number
  enabled?: boolean
  sync_all_unseen?: boolean
}

// Notification Channel Types
export type ChannelType = 'telegram' | 'line' | 'webhook'

export interface TelegramConfig {
  bot_token: string
  chat_id: string
}

export interface LineConfig {
  access_token: string
}

export interface WebhookConfig {
  url: string
  headers?: Record<string, string>
}

export type ChannelConfig = TelegramConfig | LineConfig | WebhookConfig

export interface NotificationChannel {
  id: number
  type: ChannelType
  name: string
  config: Record<string, any>
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface NotificationChannelCreate {
  type: ChannelType
  name: string
  config: ChannelConfig
  enabled?: boolean
}

export interface NotificationChannelUpdate {
  type?: ChannelType
  name?: string
  config?: ChannelConfig
  enabled?: boolean
}

// Filter Rule Types
export type FilterField = 'from' | 'subject' | 'body'
export type MatchType = 'contains' | 'regex' | 'equals'

export interface FilterRule {
  id: number
  gmail_account_id: number
  name: string
  field: FilterField
  match_type: MatchType
  match_value: string
  channel_id: number
  priority: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface FilterRuleCreate {
  gmail_account_id: number
  name: string
  field: FilterField
  match_type?: MatchType
  match_value: string
  channel_id: number
  priority?: number
  enabled?: boolean
}

export interface FilterRuleUpdate {
  name?: string
  field?: FilterField
  match_type?: MatchType
  match_value?: string
  channel_id?: number
  priority?: number
  enabled?: boolean
}

// Notification Log Types
export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface NotificationLog {
  id: number
  gmail_account_id: number
  filter_rule_id: number | null
  channel_id: number
  email_subject: string | null
  email_from: string | null
  email_date: string | null
  status: NotificationStatus
  error_message: string | null
  sent_at: string | null
  created_at: string
}

// Config Setting Types
export interface ConfigSetting {
  id: number
  key: string
  value: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ConfigSettingUpdate {
  value: string
}

// API Response Types
export interface GmailAccountList {
  total: number
  accounts: GmailAccount[]
}

export interface NotificationChannelList {
  total: number
  channels: NotificationChannel[]
}

export interface FilterRuleList {
  total: number
  rules: FilterRule[]
}

export interface NotificationLogList {
  total: number
  logs: NotificationLog[]
}

export interface ConfigSettingList {
  total: number
  settings: ConfigSetting[]
}

// Legacy Config/Credentials Types (used by legacy dashboard hooks/components)
export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'

export interface Config {
  settings: {
    imap_server: string
    imap_port: number
    check_interval: number
    max_body_length: number
    default_chat_id: string
    log_level: LogLevel
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface Credentials {
  telegram?: Record<string, unknown>
  gmail?: Record<string, unknown>
  [key: string]: unknown
}

// Legacy Types (for backward compatibility - will be removed)
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  subject?: string
  sender?: string
  chat_id?: string
  rule?: string
  error?: string
}

export interface Metrics {
  total_emails_processed: number
  total_notifications_sent: number
  errors_count: number
  rules_triggered: Record<string, number>
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  timestamp?: string
  database?: string
}
