import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider, useTheme } from './components/theme/ThemeProvider'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './components/dashboard/Dashboard'
import { GmailManagement } from './components/gmail/GmailManagement'
import { ChannelManagement } from './components/channels/ChannelManagement'
import { FilterManagement } from './components/filters/FilterManagement'
import { LogsPage } from './components/activity/LogsPage'
import { WebhookGuidePage } from './components/guide/WebhookGuidePage'
import { Settings } from './components/settings/Settings'
import { WorkerStatus } from './components/debug/WorkerStatus'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppContent() {
  const { theme } = useTheme()
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="gmail" element={<GmailManagement />} />
          <Route path="channels" element={<ChannelManagement />} />
          <Route path="filters" element={<FilterManagement />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="webhook-guide" element={<WebhookGuidePage />} />
          <Route path="worker-status" element={<WorkerStatus />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        theme={theme}
        richColors
        toastOptions={{
          classNames: {
            success: '!bg-emerald-600 !text-white !border-emerald-500',
            error: '!bg-rose-600 !text-white !border-rose-500',
          },
        }}
      />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
