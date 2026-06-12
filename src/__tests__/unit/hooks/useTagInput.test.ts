import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTagInput } from '@/hooks/useTagInput'

describe('useTagInput', () => {
  it('initialises with empty tags by default', () => {
    const { result } = renderHook(() => useTagInput())
    expect(result.current.tags).toEqual([])
    expect(result.current.tagInput).toBe('')
  })

  it('initialises with provided tags', () => {
    const { result } = renderHook(() => useTagInput(['react', 'vue']))
    expect(result.current.tags).toEqual(['react', 'vue'])
  })

  it('adds a tag when addTag is called with non-empty input', () => {
    const { result } = renderHook(() => useTagInput())
    act(() => result.current.setTagInput('javascript'))
    act(() => result.current.addTag())
    expect(result.current.tags).toEqual(['javascript'])
    expect(result.current.tagInput).toBe('')
  })

  it('trims whitespace before adding', () => {
    const { result } = renderHook(() => useTagInput())
    act(() => result.current.setTagInput('  react  '))
    act(() => result.current.addTag())
    expect(result.current.tags).toEqual(['react'])
  })

  it('does not add duplicate tags', () => {
    const { result } = renderHook(() => useTagInput(['react']))
    act(() => result.current.setTagInput('react'))
    act(() => result.current.addTag())
    expect(result.current.tags).toEqual(['react'])
  })

  it('does not add empty string', () => {
    const { result } = renderHook(() => useTagInput())
    act(() => result.current.setTagInput(''))
    act(() => result.current.addTag())
    expect(result.current.tags).toEqual([])
  })

  it('does not add whitespace-only string', () => {
    const { result } = renderHook(() => useTagInput())
    act(() => result.current.setTagInput('   '))
    act(() => result.current.addTag())
    expect(result.current.tags).toEqual([])
  })

  it('removes an existing tag', () => {
    const { result } = renderHook(() => useTagInput(['react', 'vue', 'angular']))
    act(() => result.current.removeTag('vue'))
    expect(result.current.tags).toEqual(['react', 'angular'])
  })

  it('does nothing when removing a non-existent tag', () => {
    const { result } = renderHook(() => useTagInput(['react']))
    act(() => result.current.removeTag('svelte'))
    expect(result.current.tags).toEqual(['react'])
  })

  it('clears all tags when each is removed', () => {
    const { result } = renderHook(() => useTagInput(['a', 'b']))
    act(() => result.current.removeTag('a'))
    act(() => result.current.removeTag('b'))
    expect(result.current.tags).toEqual([])
  })

  it('setTags replaces tags wholesale', () => {
    const { result } = renderHook(() => useTagInput(['old']))
    act(() => result.current.setTags(['new1', 'new2']))
    expect(result.current.tags).toEqual(['new1', 'new2'])
  })

  it('clears tagInput after successful add', () => {
    const { result } = renderHook(() => useTagInput())
    act(() => result.current.setTagInput('typescript'))
    act(() => result.current.addTag())
    expect(result.current.tagInput).toBe('')
  })

  it('preserves tagInput when add is rejected (duplicate)', () => {
    const { result } = renderHook(() => useTagInput(['react']))
    act(() => result.current.setTagInput('react'))
    act(() => result.current.addTag())
    expect(result.current.tagInput).toBe('react')
  })
})
