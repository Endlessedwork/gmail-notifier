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

  create: (data: GmailAccountCreate) =>
    apiClient.post<GmailAccount>('/gmail-accounts', data),

  update: (id: number, data: GmailAccountUpdate) =>
    apiClient.put<GmailAccount>(`/gmail-accounts/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/gmail-accounts/${id}`),

  toggle: (id: number, enabled: boolean) =>
    apiClient.patch<GmailAccount>(`/gmail-accounts/${id}`, { enabled }),
}
