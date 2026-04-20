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

function isLocalOrDev() {
  if (process.env.NODE_ENV === 'development') return true
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  return host === 'localhost' || host === '127.0.0.1'
}

export default function DevTabBar() {
  const pathname = usePathname()

  if (!isLocalOrDev() || pathname === '/') return null

  return (
    <div className="sticky top-6 z-50 h-9 border-b bg-background/90 backdrop-blur">
      <div className="flex items-center justify-center h-full max-w-md mx-auto gap-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href + '/'))

          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
