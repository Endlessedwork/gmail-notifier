export { apiClient, APIError } from './client'
export { gmailAccountsApi } from './gmail-accounts'
export { notificationChannelsApi } from './notification-channels'
export { filterRulesApi } from './filter-rules'
export { notificationLogsApi } from './notification-logs'

// Health check
export const healthApi = {
  check: () =>
    fetch('http://localhost:8000/health').then(res => res.json())
}
