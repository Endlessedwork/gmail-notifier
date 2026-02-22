import { useQuery } from '@tanstack/react-query'
import { notificationLogsApi } from '@/api'

interface UseNotificationLogsParams {
  limit?: number
  offset?: number
  status?: string
  account_id?: number
  channel_id?: number
}

export function useNotificationLogs(params?: UseNotificationLogsParams) {
  return useQuery({
    queryKey: ['notification-logs', params],
    queryFn: () => notificationLogsApi.list(params),
    staleTime: 3000,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  })
}

export function useNotificationLog(id: number) {
  return useQuery({
    queryKey: ['notification-logs', id],
    queryFn: () => notificationLogsApi.get(id),
    enabled: !!id,
  })
}
