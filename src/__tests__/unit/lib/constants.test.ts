import { describe, it, expect } from 'vitest'
import { PAGE_SIZE, SEARCH_MAX_QUERY_LENGTH } from '@/lib/constants'

describe('Constants', () => {
  it('CONTENT page size is 20', () => {
    expect(PAGE_SIZE.CONTENT).toBe(20)
  })

  it('VIDEOS page size is 12', () => {
    expect(PAGE_SIZE.VIDEOS).toBe(12)
  })

  it('COLLECTIONS page size is 5', () => {
    expect(PAGE_SIZE.COLLECTIONS).toBe(5)
  })

  it('SEARCH_MAX_QUERY_LENGTH is 100', () => {
    expect(SEARCH_MAX_QUERY_LENGTH).toBe(100)
  })
})
