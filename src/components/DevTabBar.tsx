'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Video,
  Search,
  Plus,
} from 'lucide-react'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/content', label: 'Content', icon: FileText },
  { href: '/content/new', label: 'New', icon: Plus },
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

  useEffect(() => {
    if (isLocalOrDev()) {
      document.body.classList.add('has-dev-tabbar')
    }
    return () => {
      document.body.classList.remove('has-dev-tabbar')
      document.body.classList.remove('has-dev-tabbar-landing')
    }
  }, [])

  useEffect(() => {
    if (isLocalOrDev()) {
      if (pathname === '/') {
        document.body.classList.add('has-dev-tabbar-landing')
        document.body.classList.remove('has-dev-tabbar')
      } else {
        document.body.classList.add('has-dev-tabbar')
        document.body.classList.remove('has-dev-tabbar-landing')
      }
    }
  }, [pathname])

  if (!isLocalOrDev()) return null

  const isLanding = pathname === '/'

  return (
    <>
      {!isLanding && (
        <div className="fixed top-0 inset-x-0 z-50 h-9 border-b bg-background/90 backdrop-blur">
          <div className="flex items-center justify-center h-full max-w-md mx-auto gap-1">
            {tabs.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== '/dashboard' && pathname.startsWith(href + '/')) ||
                (href === '/content/new' && pathname === '/content/new') ||
                (href === '/content' &&
                  pathname.startsWith('/content') &&
                  pathname !== '/content/new')

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
      )}
    </>
  )
}
