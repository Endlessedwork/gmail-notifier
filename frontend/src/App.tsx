import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './components/dashboard/Dashboard'
import { GmailManagement } from './components/gmail/GmailManagement'
import { ChannelManagement } from './components/channels/ChannelManagement'
import { FilterManagement } from './components/filters/FilterManagement'
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
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
