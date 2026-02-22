import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationChannelsApi } from '@/api'
import type { NotificationChannelCreate, NotificationChannelUpdate } from '@/types'
import { toast } from 'sonner'

export function useNotificationChannels() {
  return useQuery({
    queryKey: ['notification-channels'],
    queryFn: notificationChannelsApi.list,
    staleTime: 5000,
  })
}

export function useNotificationChannel(id: number) {
  return useQuery({
    queryKey: ['notification-channels', id],
    queryFn: () => notificationChannelsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateNotificationChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NotificationChannelCreate) =>
      notificationChannelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
      toast.success('เพิ่ม Notification Channel เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useUpdateNotificationChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NotificationChannelUpdate }) =>
      notificationChannelsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
      toast.success('อัปเดต Notification Channel เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useDeleteNotificationChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificationChannelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
      toast.success('ลบ Notification Channel เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useToggleNotificationChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      notificationChannelsApi.toggle(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}
