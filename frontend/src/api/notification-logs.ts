import { apiClient } from './client'
import type { NotificationLog, NotificationLogList } from '@/types'

interface LogQueryParams {
  limit?: number
  offset?: number
  status?: string
  account_id?: number
  channel_id?: number
}

export const notificationLogsApi = {
  list: (params?: LogQueryParams) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    if (params?.status) query.append('status', params.status)
    if (params?.account_id) query.append('account_id', params.account_id.toString())
    if (params?.channel_id) query.append('channel_id', params.channel_id.toString())

    const queryString = query.toString()
    return apiClient.get<NotificationLogList>(
      `/notification-logs${queryString ? `?${queryString}` : ''}`
    )
  },

  get: (id: number) =>
    apiClient.get<NotificationLog>(`/notification-logs/${id}`),
}
