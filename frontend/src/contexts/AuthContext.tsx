import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '@/api/client'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  handleOAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await apiClient.get<User>('/auth/me')
        setUser(userData)
      } catch (error) {
        // Token invalid, try refresh
        try {
          await refreshToken()
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (username: string, password: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      username,
      password,
    })

    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    setUser(response.user)
  }

  const register = async (username: string, email: string, password: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      username,
      email,
      password,
    })

    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    setUser(response.user)
  }

  const handleOAuthCallback = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    const userData = await apiClient.get<User>('/auth/me')
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) throw new Error('No refresh token')

    const response = await apiClient.post<{ access_token: string; token_type: string }>(
      '/auth/refresh',
      { refresh_token: refresh }
    )

    localStorage.setItem('access_token', response.access_token)

    // Load user info with new token
    const userData = await apiClient.get<User>('/auth/me')
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        handleOAuthCallback,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
