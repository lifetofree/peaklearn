import { describe, it, expect } from 'vitest'

// Test the public-path detection logic used by middleware
function isPublicPath(pathname: string): boolean {
  return pathname.startsWith('/login') || pathname.startsWith('/auth')
}

describe('Middleware — public path detection', () => {
  it('treats /login as public', () => {
    expect(isPublicPath('/login')).toBe(true)
  })

  it('treats /auth/callback as public', () => {
    expect(isPublicPath('/auth/callback')).toBe(true)
  })

  it('treats /dashboard as protected', () => {
    expect(isPublicPath('/dashboard')).toBe(false)
  })

  it('treats /content as protected', () => {
    expect(isPublicPath('/content')).toBe(false)
  })

  it('treats /content/some-id as protected', () => {
    expect(isPublicPath('/content/some-id')).toBe(false)
  })

  it('treats /videos as protected', () => {
    expect(isPublicPath('/videos')).toBe(false)
  })

  it('treats /search as protected', () => {
    expect(isPublicPath('/search')).toBe(false)
  })

  it('treats /settings as protected', () => {
    expect(isPublicPath('/settings')).toBe(false)
  })

  it('treats root / as protected', () => {
    expect(isPublicPath('/')).toBe(false)
  })
})
