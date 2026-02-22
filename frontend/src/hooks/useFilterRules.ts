import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { filterRulesApi } from '@/api'
import type { FilterRuleCreate, FilterRuleUpdate } from '@/types'
import { toast } from 'sonner'

export function useFilterRules() {
  return useQuery({
    queryKey: ['filter-rules'],
    queryFn: filterRulesApi.list,
    staleTime: 5000,
  })
}

export function useFilterRule(id: number) {
  return useQuery({
    queryKey: ['filter-rules', id],
    queryFn: () => filterRulesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateFilterRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FilterRuleCreate) =>
      filterRulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-rules'] })
      toast.success('เพิ่ม Filter Rule เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useUpdateFilterRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FilterRuleUpdate }) =>
      filterRulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-rules'] })
      toast.success('อัปเดต Filter Rule เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useDeleteFilterRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => filterRulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-rules'] })
      toast.success('ลบ Filter Rule เรียบร้อยค่ะ')
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}

export function useToggleFilterRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      filterRulesApi.toggle(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter-rules'] })
    },
    onError: (error: Error) => {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`)
    },
  })
}
