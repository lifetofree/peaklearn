import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'SET' : 'MISSING')

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing required environment variables. NEXT_PUBLIC_SUPABASE_URL: ${!!supabaseUrl}, NEXT_PUBLIC_SUPABASE_ANON_KEY: ${!!supabaseAnonKey}`)
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          console.error('Error setting cookie:', error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          console.error('Error removing cookie:', error)
        }
      },
    },
  })
}
