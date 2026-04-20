'use client'

import Link from 'next/link'
import DuckLogo from '@/components/DuckLogo'
import HeaderActions from '@/components/HeaderActions'
import { Search } from 'lucide-react'
import { t } from '@/lib/i18n'

interface HeaderProps {
  showSearch?: boolean
  searchValue?: string
}

export default function Header({ showSearch = false, searchValue = '' }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <DuckLogo />
          <span className="text-base font-semibold tracking-tight">{t('common.site_name')}</span>
        </Link>
        {showSearch && (
          <form action="/search" method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={searchValue}
              placeholder={t('common.search_placeholder')}
              className="pl-10 pr-10 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring w-64 md:w-96"
            />
          </form>
        )}
        <HeaderActions />
      </div>
    </header>
  )
}
