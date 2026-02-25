import { apiClient } from './client'
import type {
  GmailAccount,
  GmailAccountCreate,
  GmailAccountUpdate,
  GmailAccountList,
} from '@/types'

export const gmailAccountsApi = {
  list: () =>
    apiClient.get<GmailAccountList>('/gmail-accounts'),

  get: (id: number) =>
    apiClient.get<GmailAccount>(`/gmail-accounts/${id}`),

  testConnection: (data: { email: string; password: string; imap_server?: string; imap_port?: number }) =>
    apiClient.post<{ success: boolean; message: string }>('/gmail-accounts/test-connection', data),

  testExistingConnection: (id: number) =>
    apiClient.post<{ success: boolean; message: string }>(`/gmail-accounts/${id}/test-connection`),

  create: (data: GmailAccountCreate) =>
    apiClient.post<GmailAccount>('/gmail-accounts', data),

  update: (id: number, data: GmailAccountUpdate) =>
    apiClient.put<GmailAccount>(`/gmail-accounts/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/gmail-accounts/${id}`),

  toggle: (id: number, enabled: boolean) =>
    apiClient.patch<GmailAccount>(`/gmail-accounts/${id}`, { enabled }),
}
