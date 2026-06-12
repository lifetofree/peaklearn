'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type CollectionOption = { id: string; title: string }

export function useCollections() {
  const [collections, setCollections] = useState<CollectionOption[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('collections')
      .select('id, title')
      .order('title')
      .then(({ data }) => {
        if (data) setCollections(data)
      })
  }, [])

  return collections
}
