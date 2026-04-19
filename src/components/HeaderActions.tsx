'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function HeaderActions() {
  const router = useRouter()
  const supabase = createClient()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
    requestAnimationFrame(() => {
      setIsDark(isDarkMode)
    })
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <a href="/settings">
          <Settings className="h-5 w-5" />
        </a>
      </Button>
      <Button variant="ghost" size="icon" onClick={handleSignOut}>
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  )
}