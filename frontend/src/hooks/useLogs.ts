import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useLogs(params?: {
  limit?: number
  offset?: number
  level?: string
}) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => api.getLogs(params),
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: api.getMetrics,
    refetchInterval: 10000,
  })
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.healthCheck,
    refetchInterval: 5000, // Check health every 5 seconds
    retry: 3,
  })
}
