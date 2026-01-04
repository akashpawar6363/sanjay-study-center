import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Settings, Users, UserCircle, Tag } from 'lucide-react'

export default function SettingsPage() {
  const settingsPages = [
    {
      title: 'General Settings',
      description: 'Manage library seats and receipt numbers',
      icon: Settings,
      href: '/settings/general',
    },
    {
      title: 'Categories',
      description: 'Manage admission categories and rates',
      icon: Tag,
      href: '/settings/categories',
    },
    {
      title: 'Users',
      description: 'Add or remove coordinators',
      icon: Users,
      href: '/settings/users',
    },
    {
      title: 'Profile',
      description: 'Update your profile and digital signature',
      icon: UserCircle,
      href: '/settings/profile',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your library settings and configurations</p>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        {settingsPages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <page.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{page.title}</CardTitle>
                    <CardDescription className="mt-1">{page.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
