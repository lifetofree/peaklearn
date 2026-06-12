'use client'

import { useEffect } from 'react'

export function useUnsavedChangesGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}

export function confirmDiscardChanges(): boolean {
  return window.confirm('You have unsaved changes. Discard and leave?')
}
