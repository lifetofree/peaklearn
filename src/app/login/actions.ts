'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function devBypassLogin(): Promise<{ error: string }> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Dev bypass not available in production' }
  }

  const email = process.env.DEV_BYPASS_EMAIL
  const password = process.env.DEV_BYPASS_PASSWORD

  if (!email || !password) {
    return { error: 'Dev bypass credentials not configured' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  redirect('/dashboard')
}
