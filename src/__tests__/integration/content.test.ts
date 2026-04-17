import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockContent, mockUser } from '../mocks/supabase'

// Tag management logic — extracted from page components for testing

function addTag(tags: string[], input: string): string[] {
  const trimmed = input.trim()
  if (!trimmed || tags.includes(trimmed)) return tags
  return [...tags, trimmed]
}

function removeTag(tags: string[], tag: string): string[] {
  return tags.filter(t => t !== tag)
}

// Pagination helpers
function getRange(page: number, pageSize: number): { from: number; to: number } {
  const from = (page - 1) * pageSize
  return { from, to: from + pageSize - 1 }
}

function getTotalPages(count: number, pageSize: number): number {
  return Math.ceil(count / pageSize)
}

// Content URL helpers
function pageUrl(page: number, selectedTags: string[]): string {
  const params = new URLSearchParams()
  if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/content?${qs}` : '/content'
}

describe('Tag management', () => {
  it('adds a new tag', () => {
    expect(addTag([], 'javascript')).toEqual(['javascript'])
  })

  it('does not add duplicate tag', () => {
    expect(addTag(['javascript'], 'javascript')).toEqual(['javascript'])
  })

  it('trims whitespace before adding', () => {
    expect(addTag([], '  react  ')).toEqual(['react'])
  })

  it('does not add empty string', () => {
    expect(addTag(['a'], '')).toEqual(['a'])
  })

  it('does not add whitespace-only string', () => {
    expect(addTag(['a'], '   ')).toEqual(['a'])
  })

  it('preserves existing tags when adding new one', () => {
    expect(addTag(['react', 'vue'], 'angular')).toEqual(['react', 'vue', 'angular'])
  })

  it('removes existing tag', () => {
    expect(removeTag(['react', 'vue', 'angular'], 'vue')).toEqual(['react', 'angular'])
  })

  it('does nothing when removing non-existent tag', () => {
    expect(removeTag(['react'], 'svelte')).toEqual(['react'])
  })

  it('returns empty array when removing last tag', () => {
    expect(removeTag(['react'], 'react')).toEqual([])
  })
})

describe('Pagination', () => {
  it('returns correct range for page 1', () => {
    expect(getRange(1, 20)).toEqual({ from: 0, to: 19 })
  })

  it('returns correct range for page 2', () => {
    expect(getRange(2, 20)).toEqual({ from: 20, to: 39 })
  })

  it('returns correct range for page 3 with size 12', () => {
    expect(getRange(3, 12)).toEqual({ from: 24, to: 35 })
  })

  it('calculates total pages correctly', () => {
    expect(getTotalPages(100, 20)).toBe(5)
  })

  it('rounds up for partial last page', () => {
    expect(getTotalPages(21, 20)).toBe(2)
  })

  it('returns 1 page for count equal to page size', () => {
    expect(getTotalPages(20, 20)).toBe(1)
  })

  it('returns 0 pages for zero count', () => {
    expect(getTotalPages(0, 20)).toBe(0)
  })
})

describe('Content page URL builder', () => {
  it('returns /content for page 1 with no tags', () => {
    expect(pageUrl(1, [])).toBe('/content')
  })

  it('includes page param for page 2+', () => {
    expect(pageUrl(2, [])).toBe('/content?page=2')
  })

  it('includes tags param', () => {
    expect(pageUrl(1, ['react'])).toBe('/content?tags=react')
  })

  it('includes both tags and page params', () => {
    expect(pageUrl(3, ['react', 'vue'])).toBe('/content?tags=react%2Cvue&page=3')
  })

  it('omits page param for page 1', () => {
    expect(pageUrl(1, ['js'])).not.toContain('page=')
  })
})
