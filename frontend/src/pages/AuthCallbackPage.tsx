import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * หน้า callback หลัง Google OAuth สำเร็จ
 * อ่าน access_token, refresh_token จาก URL hash แล้ว redirect ไป /
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    const run = async () => {
      const hash = window.location.hash?.slice(1)
      if (!hash) {
        navigate('/login', { replace: true })
        return
      }

      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (!accessToken || !refreshToken) {
        navigate('/login', { replace: true })
        return
      }

      await handleOAuthCallback(accessToken, refreshToken)
      navigate('/', { replace: true })
    }
    run()
  }, [navigate, handleOAuthCallback])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">กำลังเข้าสู่ระบบ...</p>
    </div>
  )
}
