'use client'

import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Video,
  Search,
} from 'lucide-react'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/content', label: 'Content', icon: FileText },
  { href: '/videos', label: 'Videos', icon: Video },
  { href: '/search', label: 'Search', icon: Search },
]

export default function TabBar() {
  const pathname = usePathname()

  if (pathname === '/') return null

  return (
    <div className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-center h-14 max-w-md mx-auto gap-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href + '/'))

          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
