import { describe, it, expect } from 'vitest'

// Search deduplication logic extracted for unit testing.
// This mirrors the logic in src/app/search/page.tsx.

function dedup<T extends { id: string }>(arrays: (T[] | null)[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const arr of arrays) {
    for (const item of arr || []) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        result.push(item)
      }
    }
  }
  return result
}

// Query trimming/limit logic
function normalizeQuery(raw: string): string {
  return raw.trim().slice(0, 100)
}

describe('Search — query normalization', () => {
  it('trims whitespace', () => {
    expect(normalizeQuery('  hello  ')).toBe('hello')
  })

  it('truncates to 100 characters', () => {
    const long = 'a'.repeat(150)
    expect(normalizeQuery(long)).toHaveLength(100)
  })

  it('handles empty string', () => {
    expect(normalizeQuery('')).toBe('')
  })

  it('preserves normal query unchanged', () => {
    expect(normalizeQuery('react hooks')).toBe('react hooks')
  })
})

describe('Search — result deduplication', () => {
  const item1 = { id: '1', title: 'First' }
  const item2 = { id: '2', title: 'Second' }
  const item3 = { id: '3', title: 'Third' }

  it('returns empty array for empty inputs', () => {
    expect(dedup([[], []])).toEqual([])
  })

  it('returns items from single array', () => {
    expect(dedup([[item1, item2]])).toEqual([item1, item2])
  })

  it('deduplicates items appearing in multiple arrays', () => {
    const result = dedup([[item1, item2], [item2, item3]])
    expect(result).toHaveLength(3)
    expect(result.map(i => i.id)).toEqual(['1', '2', '3'])
  })

  it('preserves first-seen order', () => {
    const result = dedup([[item2, item1], [item1, item3]])
    expect(result.map(i => i.id)).toEqual(['2', '1', '3'])
  })

  it('handles null arrays gracefully', () => {
    expect(dedup([null, [item1]])).toEqual([item1])
  })

  it('handles all null arrays', () => {
    expect(dedup([null, null])).toEqual([])
  })

  it('deduplicates items across three arrays', () => {
    const result = dedup([[item1], [item1, item2], [item2, item3]])
    expect(result).toHaveLength(3)
  })
})
