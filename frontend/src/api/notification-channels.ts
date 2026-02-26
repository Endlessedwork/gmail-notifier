import { apiClient } from './client'
import type {
  NotificationChannel,
  NotificationChannelCreate,
  NotificationChannelUpdate,
  NotificationChannelList,
} from '@/types'

export const notificationChannelsApi = {
  list: () =>
    apiClient.get<NotificationChannelList>('/notification-channels'),

  get: (id: number) =>
    apiClient.get<NotificationChannel>(`/notification-channels/${id}`),

  create: (data: NotificationChannelCreate) =>
    apiClient.post<NotificationChannel>('/notification-channels', data),

  update: (id: number, data: NotificationChannelUpdate) =>
    apiClient.put<NotificationChannel>(`/notification-channels/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/notification-channels/${id}`),

  toggle: (id: number, enabled: boolean) =>
    apiClient.patch<NotificationChannel>(`/notification-channels/${id}`, { enabled }),

  testWebhook: (data: { url: string; headers?: Record<string, string> }) =>
    apiClient.post<{
      success: boolean
      status_code: number
      response_text: string
      message: string
    }>('/notification-channels/test/webhook', data),
}
