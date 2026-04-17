import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-sm')).toBe('text-sm')
  })

  it('joins multiple classes', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold')
  })

  it('merges conflicting Tailwind classes (last wins)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles conditional classes with false', () => {
    expect(cn('text-sm', false && 'font-bold')).toBe('text-sm')
  })

  it('handles conditional classes with undefined', () => {
    expect(cn('text-sm', undefined)).toBe('text-sm')
  })

  it('handles object syntax', () => {
    expect(cn({ 'font-bold': true, 'text-red-500': false })).toBe('font-bold')
  })

  it('handles array syntax', () => {
    expect(cn(['text-sm', 'font-bold'])).toBe('text-sm font-bold')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })

  it('deduplicates padding utilities', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('merges class with extra whitespace', () => {
    expect(cn('  text-sm  ', 'font-bold')).toBe('text-sm font-bold')
  })
})
