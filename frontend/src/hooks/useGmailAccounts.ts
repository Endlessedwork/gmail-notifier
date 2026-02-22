import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gmailAccountsApi } from '@/api'
import type { GmailAccountCreate, GmailAccountUpdate } from '@/types'
import { toast } from 'sonner'

export function useGmailAccounts() {
  return useQuery({
    queryKey: ['gmail-accounts'],
    queryFn: gmailAccountsApi.list,
    staleTime: 5000,
  })
}

export function useGmailAccount(id: number) {
  return useQuery({
    queryKey: ['gmail-accounts', id],
    queryFn: () => gmailAccountsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateGmailAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GmailAccountCreate) =>
      gmailAccountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail-accounts'] })
      toast.success('เพิ่ม Gmail Account เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useUpdateGmailAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GmailAccountUpdate }) =>
      gmailAccountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail-accounts'] })
      toast.success('อัปเดต Gmail Account เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useDeleteGmailAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => gmailAccountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail-accounts'] })
      toast.success('ลบ Gmail Account เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useToggleGmailAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      gmailAccountsApi.toggle(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail-accounts'] })
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}
