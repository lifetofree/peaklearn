'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DuckLogo from '@/components/DuckLogo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

  const handleGithubOAuth = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to sign in with GitHub',
      })
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
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-4"
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

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Sending…' : 'Continue with Email'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGithubOAuth}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </Button>
        </form>

        {isDev && process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS === 'true' && (
          <div className="mt-8 pt-8 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDevBypass}
              disabled={loading}
              className="w-full text-xs"
            >
              Dev Bypass
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
