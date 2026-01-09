'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/theme/theme-provider'
import {
  LayoutDashboard,
  Users,
  Home,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Heart,
  Settings,
  Wheat,
  TrendingUp,
  Egg,
  ClipboardList,
  Palette,
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Manajemen Pengguna', href: '/users' },
  { icon: Home, label: 'Manajemen Kandang', href: '/kandang' },
  { icon: Package, label: 'Manajemen Stok', href: '/stok' },
  { icon: ClipboardList, label: 'Input Data Harian', href: '/data-harian' },
  { icon: Wheat, label: 'Nutrisi Pakan', href: '/nutrisi' },
  { icon: Egg, label: 'Manajemen Telur', href: '/telur' },
  { icon: Heart, label: 'Kesehatan', href: '/kesehatan' },
  { icon: ShoppingCart, label: 'Penjualan', href: '/penjualan' },
  { icon: DollarSign, label: 'Keuangan', href: '/keuangan' },
  { icon: FileText, label: 'Laporan', href: '/laporan' },
  { icon: TrendingUp, label: 'AI Analysis', href: '/ai-analysis' },
  { icon: Settings, label: 'Pengaturan', href: '/pengaturan' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Egg className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">SI Peternakan</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Appearance Link */}
          <Link
            href="/appearance"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mt-2 mx-2',
              pathname === '/appearance'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Palette className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Customisasi Tampilan</span>}
          </Link>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          {!collapsed && (
            <div className="text-xs text-muted-foreground">
              <p>© 2024 SI Peternakan</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
