export interface FilterRule {
  id: string
  name: string
  enabled: boolean
  field: 'from' | 'subject'
  match: string
  chat_id: string
  priority: number
  created_at?: string
  updated_at?: string
}

export interface Settings {
  check_interval: number
  max_body_length: number
  imap_server: string
  imap_port: number
  default_chat_id: string
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'
}

export interface Config {
  version: string
  settings: Settings
  filter_rules: FilterRule[]
  metadata?: {
    last_modified: string
    last_modified_by: string
  }
}

export interface Credentials {
  telegram_bot_token: string
  gmail_email: string
  gmail_password: string
}

export interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'
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
  timestamp: string
  config_exists: boolean
  logs_exists: boolean
}

export interface GmailAccount {
  id: string
  email: string
  password: string
  enabled: boolean
  last_check?: string
}

export interface TelegramChannel {
  id: string
  name: string
  bot_token: string
  chat_id: string
  enabled: boolean
}
