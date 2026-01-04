'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Profile } from '@/types/database.types'

interface DashboardLayoutClientProps {
  profile: Profile
  children: React.ReactNode
}

export function DashboardLayoutClient({ profile, children }: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile, shown on desktop */}
      <aside className="w-64 flex-shrink-0 hidden md:block">
        <Sidebar userRole={profile.role} />
      </aside>

      {/* Mobile Sidebar with overlay */}
      <Sidebar
        userRole={profile.role}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={profile}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
