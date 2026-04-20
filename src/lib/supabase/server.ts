import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getRequestContext } from '@cloudflare/next-on-pages'

function getSupabaseEnv() {
  // Prefer Cloudflare runtime bindings so the correct values are always used
  // regardless of what was baked into the bundle at build time.
  try {
    const env = getRequestContext().env as Record<string, string | undefined>
    const url = env.NEXT_PUBLIC_SUPABASE_URL
    const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) return { url, key }
  } catch {
    // getRequestContext throws outside of a Cloudflare Workers request context
    // (e.g. local dev with `next dev`). Fall through to process.env.
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseEnv()

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Cloudflare Pages project settings.`
    )
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Cannot set cookies in a Server Component — expected.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // Cannot remove cookies in a Server Component — expected.
        }
      },
    },
  })
}
