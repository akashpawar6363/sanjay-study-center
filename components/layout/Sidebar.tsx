'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BookOpen,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface SidebarProps {
  userRole?: 'admin' | 'coordinator'
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'coordinator'] },
  { name: 'Admissions', href: '/admissions', icon: Users, roles: ['admin', 'coordinator'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
]

export function Sidebar({ userRole = 'admin', isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  )

  // Determine if this is the mobile version based on presence of onMobileClose
  const isMobileVersion = !!onMobileClose

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && isMobileVersion && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          isMobileVersion
            ? 'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:hidden'
            : 'relative w-64',
          isMobileVersion && (isMobileOpen ? 'translate-x-0' : '-translate-x-full'),
          'flex flex-col h-full bg-card border-r'
        )}
      >
      {/* Logo */}
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Sanjay Study Center</h1>
            <p className="text-xs text-muted-foreground">Library Management</p>
          </div>
        </div>
        {/* Close button for mobile */}
        {onMobileClose && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileClose}
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
      </div>
    </>
  )
}
