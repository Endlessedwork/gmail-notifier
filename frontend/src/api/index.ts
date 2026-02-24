export { apiClient, APIError } from './client'
export { gmailAccountsApi } from './gmail-accounts'
export { notificationChannelsApi } from './notification-channels'
export { filterRulesApi } from './filter-rules'
export { notificationLogsApi } from './notification-logs'

// Health check (ใช้ relative path เหมือน client)
export const healthApi = {
  check: () => fetch('/api/health').then((res) => res.json()),
}
