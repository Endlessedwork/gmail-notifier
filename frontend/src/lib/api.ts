import type { Config, FilterRule, LogEntry, Metrics, HealthStatus, Credentials } from '@/types'

const API_BASE = '/api'

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('access_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new APIError(
      error.detail || 'API request failed',
      response.status,
      error
    )
  }

  return response.json()
}

export const api = {
  // Config endpoints
  getConfig: () => fetchAPI<Config>('/config'),

  updateConfig: (config: Config) =>
    fetchAPI<{ message: string; config: Config }>('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  // Filter rules endpoints
  getRules: () => fetchAPI<{ rules: FilterRule[] }>('/rules'),

  createRule: (rule: Omit<FilterRule, 'id' | 'created_at' | 'updated_at'>) =>
    fetchAPI<{ message: string; rule: FilterRule }>('/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    }),

  updateRule: (id: string, rule: Partial<FilterRule>) =>
    fetchAPI<{ message: string; rule: FilterRule }>(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    }),

  deleteRule: (id: string) =>
    fetchAPI<{ message: string }>(`/rules/${id}`, {
      method: 'DELETE',
    }),

  // Logs endpoints
  getLogs: (params?: { limit?: number; offset?: number; level?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    if (params?.level) query.append('level', params.level)

    return fetchAPI<{ logs: LogEntry[]; total: number }>(
      `/logs?${query.toString()}`
    )
  },

  // Metrics endpoints
  getMetrics: () => fetchAPI<Metrics>('/metrics'),

  // Health check
  healthCheck: () => fetchAPI<HealthStatus>('/health'),

  // Credentials endpoints
  getCredentials: () =>
    fetchAPI<{ telegram: any; gmail: any }>('/credentials'),

  updateCredentials: (credentials: Credentials) =>
    fetchAPI<{ message: string }>('/credentials', {
      method: 'PUT',
      body: JSON.stringify(credentials),
    }),
}

export { APIError }
