'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DuckLogo from '@/components/DuckLogo'

const isDev = process.env.NODE_ENV === 'development'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Check your email for the magic link',
      })
      setEmail('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send magic link',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDevBypass = async () => {
    const bypassEmail = process.env.NEXT_PUBLIC_DEV_BYPASS_EMAIL
    const bypassPassword = process.env.NEXT_PUBLIC_DEV_BYPASS_PASSWORD
    if (!bypassEmail || !bypassPassword) {
      setMessage({
        type: 'error',
        text: 'Dev bypass credentials not configured',
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: bypassEmail,
        password: bypassPassword,
      })

      if (error) throw error

      window.location.href = '/dashboard'
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Dev bypass failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="flex flex-col items-center mb-10">
          <DuckLogo className="h-9 w-9 mb-5" />
          <h1 className="text-2xl font-semibold tracking-tight">PeakLearn</h1>
          <p className="text-muted-foreground text-sm mt-2">Your knowledge base, sharpened.</p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors duration-150"
            required
          />

          {message && (
            <div
              className={`text-sm text-center p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-medium tracking-tight hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Continue with Email'}
          </button>
        </form>

        {isDev && process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS === 'true' && (
          <div className="mt-8 pt-8 border-t border-border">
            <button
              type="button"
              onClick={handleDevBypass}
              disabled={loading}
              className="w-full h-9 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/70 transition-colors duration-150 disabled:opacity-50"
            >
              Dev Bypass
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
