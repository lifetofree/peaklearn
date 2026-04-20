import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build or SSR, if env vars are missing, we return a mock or just let it be handled later.
    // createBrowserClient might still need a string, so we provide a placeholder if missing to avoid immediate crash.
    return createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
