'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Settings, LogOut } from 'lucide-react'

export default function HeaderActions() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex items-center gap-4">
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