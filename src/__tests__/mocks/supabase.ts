import { vi } from 'vitest'

// Builder mock — each method returns `this` so chains work.
// Override `.mockResolvedValueOnce` on the terminal call to control data.
export function createSupabaseMock(resolvedValue: { data?: any; error?: any; count?: number } = { data: null, error: null }) {
  const mock: any = {
    data: resolvedValue.data,
    error: resolvedValue.error,
    count: resolvedValue.count ?? null,
  }

  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(mock),
    // Awaiting the builder itself resolves
    then: (resolve: (v: any) => void) => resolve(mock),
  }

  return {
    from: vi.fn().mockReturnValue(builder),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'test@test.com' } } }),
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    _builder: builder,
    _mock: mock,
  }
}

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'owner',
  created_at: '2026-01-01T00:00:00Z',
}

export const mockContent = {
  id: 'content-1',
  title: 'Test Article',
  body: { type: 'doc', content: [] },
  tags: ['javascript', 'react'],
  is_published: false,
  created_by: 'user-1',
  updated_at: '2026-04-17T00:00:00Z',
  created_at: '2026-04-17T00:00:00Z',
}

export const mockVideo = {
  id: 'video-1',
  title: 'Test Video',
  youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  description: 'A test video',
  tags: ['music'],
  duration: null,
  collection_id: null,
  user_id: 'user-1',
  created_at: '2026-04-17T00:00:00Z',
}

export const mockCollection = {
  id: 'collection-1',
  title: 'Test Collection',
  description: 'A test collection',
  user_id: 'user-1',
  created_at: '2026-04-17T00:00:00Z',
}
