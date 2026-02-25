import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar (hidden on mobile/tablet) */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile/Tablet Drawer */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 lg:hidden">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Menu Button */}
          <div className="lg:hidden px-4 py-3 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <Header />

          <main className="flex-1 overflow-y-auto bg-muted/30">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
