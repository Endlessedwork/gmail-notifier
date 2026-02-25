import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '@/api/auth'
import { setStoredToken, removeStoredToken, getStoredToken } from '@/api/client'
import { AuthContext, type AuthContextType } from '@/hooks/useAuth'
import type { AuthUser } from '@/types'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const userData = await authApi.me()
      setUser(userData)
    } catch {
      removeStoredToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login({ username, password })
    setStoredToken(response.access_token)
    setUser(response.user)
  }, [])

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const response = await authApi.register({ username, email, password })
      setStoredToken(response.access_token)
      setUser(response.user)
    },
    []
  )

  const logout = useCallback(() => {
    removeStoredToken()
    setUser(null)
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
