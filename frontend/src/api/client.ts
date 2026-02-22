const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export class APIError extends Error {
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
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP ${response.status}: ${response.statusText}`
    }))

    throw new APIError(
      error.detail || 'API request failed',
      response.status,
      error
    )
  }

  return response.json()
}

export const apiClient = {
  get: <T>(endpoint: string) =>
    fetchAPI<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: any) =>
    fetchAPI<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any) =>
    fetchAPI<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any) =>
    fetchAPI<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    fetchAPI<T>(endpoint, { method: 'DELETE' }),
}
