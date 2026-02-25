import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './components/dashboard/Dashboard'
import { GmailManagement } from './components/gmail/GmailManagement'
import { ChannelManagement } from './components/channels/ChannelManagement'
import { FilterManagement } from './components/filters/FilterManagement'
import { LogsPage } from './components/activity/LogsPage'
import { Settings } from './components/settings/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="gmail" element={<GmailManagement />} />
            <Route path="channels" element={<ChannelManagement />} />
            <Route path="filters" element={<FilterManagement />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          classNames: {
            success: '!bg-emerald-600 !text-white !border-emerald-500',
            error: '!bg-rose-600 !text-white !border-rose-500',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
