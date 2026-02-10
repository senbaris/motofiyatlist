import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Database, Settings, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Scrapers', href: '/admin/scrapers', icon: Database },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout() {
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="flex h-16 items-center px-6 gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ana Siteye Dön
            </Button>
          </Link>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">
            Admin Panel
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background min-h-[calc(100vh-4rem)] p-6">
          <div className="space-y-1">
            {navigation.map(item => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link key={item.href} to={item.href}>
                  <div
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                      transition-colors
                      ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
