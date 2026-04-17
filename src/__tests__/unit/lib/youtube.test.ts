import { describe, it, expect } from 'vitest'
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  formatDuration,
  parseYouTubeDuration,
} from '@/lib/youtube'

describe('extractYouTubeId', () => {
  it('extracts ID from standard watch URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts ID from short youtu.be URL', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts ID from embed URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts ID from URL with extra query params', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')).toBe('dQw4w9WgXcQ')
  })

  it('returns null for invalid URL', () => {
    expect(extractYouTubeId('https://vimeo.com/123456')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractYouTubeId('')).toBeNull()
  })

  it('returns null for non-URL string', () => {
    expect(extractYouTubeId('not a url')).toBeNull()
  })
})

describe('getYouTubeEmbedUrl', () => {
  it('returns nocookie embed URL', () => {
    const url = getYouTubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('includes modestbranding and rel=0 params', () => {
    const url = getYouTubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toContain('modestbranding=1')
    expect(url).toContain('rel=0')
  })

  it('includes enablejsapi param', () => {
    const url = getYouTubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toContain('enablejsapi=1')
  })

  it('appends start time when provided', () => {
    const url = getYouTubeEmbedUrl('dQw4w9WgXcQ', 120)
    expect(url).toContain('start=120')
  })

  it('omits start param when not provided', () => {
    const url = getYouTubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).not.toContain('start=')
  })
})

describe('getYouTubeThumbnail', () => {
  it('returns high quality thumbnail by default', () => {
    const url = getYouTubeThumbnail('dQw4w9WgXcQ')
    expect(url).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
  })

  it('returns maxres thumbnail', () => {
    const url = getYouTubeThumbnail('dQw4w9WgXcQ', 'maxres')
    expect(url).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg')
  })

  it('returns medium quality thumbnail', () => {
    const url = getYouTubeThumbnail('dQw4w9WgXcQ', 'medium')
    expect(url).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg')
  })

  it('returns default quality thumbnail', () => {
    const url = getYouTubeThumbnail('dQw4w9WgXcQ', 'default')
    expect(url).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg')
  })
})

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('0:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(185)).toBe('3:05')
  })

  it('formats hours minutes and seconds', () => {
    expect(formatDuration(3661)).toBe('1:01:01')
  })

  it('pads seconds with leading zero', () => {
    expect(formatDuration(65)).toBe('1:05')
  })

  it('handles zero duration', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('handles exactly one hour', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
  })
})

describe('parseYouTubeDuration', () => {
  it('parses hours minutes and seconds', () => {
    expect(parseYouTubeDuration('PT1H2M3S')).toBe(3723)
  })

  it('parses minutes and seconds only', () => {
    expect(parseYouTubeDuration('PT4M30S')).toBe(270)
  })

  it('parses seconds only', () => {
    expect(parseYouTubeDuration('PT45S')).toBe(45)
  })

  it('parses hours only', () => {
    expect(parseYouTubeDuration('PT2H')).toBe(7200)
  })

  it('returns 0 for invalid string', () => {
    expect(parseYouTubeDuration('invalid')).toBe(0)
  })

  it('returns 0 for empty string', () => {
    expect(parseYouTubeDuration('')).toBe(0)
  })
})
