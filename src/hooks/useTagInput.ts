import { useState, useCallback } from 'react'

export function useTagInput(initial: string[] = []) {
  const [tags, setTags] = useState<string[]>(initial)
  const [tagInput, setTagInput] = useState('')

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
      setTagInput('')
    }
  }, [tagInput, tags])

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }, [])

  return { tags, setTags, tagInput, setTagInput, addTag, removeTag }
}
