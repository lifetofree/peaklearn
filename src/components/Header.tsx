'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DuckLogo from '@/components/DuckLogo'
import HeaderActions from '@/components/HeaderActions'
import { Search } from 'lucide-react'
import { t } from '@/lib/i18n'

const NAV = [
  { href: '/dashboard', label: 'nav.dashboard' },
  { href: '/content',   label: 'nav.content' },
  { href: '/videos',    label: 'nav.videos' },
  { href: '/search',    label: 'nav.search' },
]

interface HeaderProps {
  showSearch?: boolean
  searchValue?: string
  /** Replaces the default HeaderActions on the right. Use on edit/form pages. */
  actions?: React.ReactNode
}

export default function Header({
  showSearch = false,
  searchValue = '',
  actions,
}: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 h-13 flex items-center gap-5">

        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <DuckLogo className="h-6 w-6" />
          <span className="text-sm font-semibold tracking-tight">{t('common.site_name')}</span>
        </Link>

        <div className="w-px h-4 bg-border shrink-0" />

        {/* Primary navigation — always visible */}
        <nav className="flex items-center gap-0.5">
          {NAV.map(({ href, label }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && href !== '/search' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'text-sm px-2.5 py-1.5 rounded-md transition-colors duration-100',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                ].join(' ')}
              >
                {t(label)}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />

        {/* Inline search bar (search page only) */}
        {showSearch && (
          <form action="/search" method="GET">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchValue}
                placeholder={t('common.search_placeholder')}
                className="pl-9 pr-3 h-8 rounded-lg border border-input bg-card text-sm
                           transition-all duration-150
                           focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20
                           w-52 focus:w-72"
              />
            </div>
          </form>
        )}

        {/* Actions (edit/form pages) or default user controls */}
        {actions !== undefined ? actions : <HeaderActions />}
      </div>
    </header>
  )
}