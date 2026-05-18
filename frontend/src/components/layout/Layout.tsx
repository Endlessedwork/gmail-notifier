import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#0e0e0c] [font-family:'IBM_Plex_Sans_Thai','IBM_Plex_Sans',ui-sans-serif,system-ui,sans-serif]">
      <div className="flex h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[260px] border-[#1b1b1726] bg-[#fbfaf3] p-0 lg:hidden">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-14 items-center border-b border-[#1b1b1726] bg-[#fbfaf3] px-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-[#6b675c] hover:bg-[#1b1b170d] hover:text-[#0e0e0c]"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <Header />

          <main className="flex-1 overflow-y-auto bg-[#f7f5ef]">
            <div className="w-full max-w-[1280px] p-4 sm:p-6 lg:p-7">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
