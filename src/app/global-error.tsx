'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html>
      <body>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Application Error
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {error.message || 'A critical error occurred.'}
            </p>
            <button
              onClick={reset}
              style={{ padding: '0.5rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
