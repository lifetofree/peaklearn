import { describe, it, expect } from 'vitest'
import { toErrorMessage } from '@/lib/errors'

describe('toErrorMessage', () => {
  it('returns message from Error instance', () => {
    expect(toErrorMessage(new Error('oops'), 'fallback')).toBe('oops')
  })

  it('returns string error directly', () => {
    expect(toErrorMessage('network failure', 'fallback')).toBe('network failure')
  })

  it('returns fallback for null', () => {
    expect(toErrorMessage(null, 'fallback')).toBe('fallback')
  })

  it('returns fallback for undefined', () => {
    expect(toErrorMessage(undefined, 'fallback')).toBe('fallback')
  })

  it('returns fallback for object without message', () => {
    expect(toErrorMessage({ code: 42 }, 'fallback')).toBe('fallback')
  })

  it('returns fallback for number', () => {
    expect(toErrorMessage(404, 'fallback')).toBe('fallback')
  })

  it('returns empty string when Error message is empty', () => {
    expect(toErrorMessage(new Error(''), 'fallback')).toBe('')
  })

  it('uses the provided fallback text verbatim', () => {
    expect(toErrorMessage({}, 'Something went wrong')).toBe('Something went wrong')
  })
})
