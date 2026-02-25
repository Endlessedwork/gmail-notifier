// Production: ใช้ relative path ให้ request ไปที่ same origin (nginx proxy /api → backend)
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

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

const AUTH_TOKEN_KEY = 'access_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem('refresh_token')
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const token = getStoredToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
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
