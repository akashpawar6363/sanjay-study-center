'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { User } from '@/types/user.types'
import { Menu, LogOut, Settings, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface HeaderProps {
  user?: User
  title?: string
  onMenuClick?: () => void
}

export function Header({ user, title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {title && <h2 className="text-xl md:text-2xl font-bold truncate">{title}</h2>}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />

          {user && <UserDropdown user={user} />}
        </div>
      </div>
    </header>
  )
}

function UserDropdown({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleSettings = () => {
    setIsOpen(false)
    router.push('/settings/profile')
  }

  return (
    <div className="relative pl-2 md:pl-4 border-l" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium">{user.full_name || user.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
        
        {/* Profile Photo */}
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {user.profile_photo_url ? (
            <Image
              src={user.profile_photo_url}
              alt={user.full_name || 'Profile'}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs md:text-sm font-semibold text-primary">
              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={handleSettings}
            className="w-full px-4 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
