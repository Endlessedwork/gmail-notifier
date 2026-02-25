import { apiClient } from './client'
import type { LoginRequest, RegisterRequest, TokenResponse, AuthUser } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<TokenResponse>('/auth/register', data),

  me: () =>
    apiClient.get<AuthUser>('/auth/me'),
}
