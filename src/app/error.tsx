'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
