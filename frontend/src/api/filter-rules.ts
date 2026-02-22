import { apiClient } from './client'
import type {
  FilterRule,
  FilterRuleCreate,
  FilterRuleUpdate,
  FilterRuleList,
} from '@/types'

export const filterRulesApi = {
  list: () =>
    apiClient.get<FilterRuleList>('/filter-rules'),

  get: (id: number) =>
    apiClient.get<FilterRule>(`/filter-rules/${id}`),

  create: (data: FilterRuleCreate) =>
    apiClient.post<FilterRule>('/filter-rules', data),

  update: (id: number, data: FilterRuleUpdate) =>
    apiClient.put<FilterRule>(`/filter-rules/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/filter-rules/${id}`),

  toggle: (id: number, enabled: boolean) =>
    apiClient.patch<FilterRule>(`/filter-rules/${id}`, { enabled }),
}
