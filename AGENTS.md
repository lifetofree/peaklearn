<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PeakLearn — Agent Guide

## Project Overview

Personal knowledge management system. Users create rich-text articles (TipTap editor), organize YouTube videos into collections, and search across everything. Duck mascot branding, amber/orange theme.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, CSS variables for theming |
| Auth + DB | Supabase (magic link auth, PostgreSQL, RLS) |
| Editor | TipTap 3 (ProseMirror) |
| Video | react-youtube |
| UI Components | shadcn/ui pattern (CVA, Radix Slot) |
| Icons | Lucide React |

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint (no separate typecheck script)

## File Structure

```
src/
├── app/
│   ├── auth/callback/page.tsx          # Server: exchanges magic link code for session
│   ├── content/
│   │   ├── [id]/edit/page.tsx          # Client: edit existing article
│   │   ├── [id]/page.tsx               # Server: view article
│   │   ├── new/page.tsx                # Client: create article with TipTap editor
│   │   └── page.tsx                    # Server: list all articles
│   ├── dashboard/page.tsx              # Server: main dashboard with recent items + quick search
│   ├── layout.tsx                      # Root layout (Inter font, globals.css)
│   ├── page.tsx                        # Login page (magic link email form)
│   ├── search/page.tsx                 # Server: full-text search (content + videos)
│   ├── settings/page.tsx               # Client: user settings
│   ├── videos/
│   │   ├── [collectionId]/page.tsx     # Server: view collection + its videos
│   │   ├── [id]/page.tsx               # Server: video detail with embed
│   │   ├── add/page.tsx                # Client: add video (YouTube URL → oembed fetch)
│   │   ├── new-collection/page.tsx     # Client: create collection
│   │   └── page.tsx                    # Server: list collections
│   └── globals.css                     # CSS variables (light/dark themes, amber primary)
├── components/
│   ├── ui/
│   │   ├── button.tsx                  # CVA button (default, destructive, outline, secondary, ghost, link)
│   │   ├── card.tsx                    # Card, CardHeader, CardTitle, CardDescription, CardContent
│   │   └── input.tsx                   # Styled input
│   ├── editor/
│   │   └── Editor.tsx                  # TipTap editor with toolbar (bold, italic, lists, links, undo/redo)
│   ├── DuckLogo.tsx                    # SVG duck mascot (amber circle + eye + beak)
│   └── YouTubeEmbed.tsx                # react-youtube wrapper (no autoplay, modest branding)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client (createBrowserClient from @supabase/ssr)
│   │   └── server.ts                   # Server client (createServerClient with cookies)
│   ├── utils.ts                        # cn() utility (clsx + tailwind-merge)
│   └── youtube.ts                      # extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail, formatDuration
└── types/
    └── database.ts                     # TypeScript interfaces for all 6 tables + Database type
```

## Database Schema

6 tables, all with RLS enabled:

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Extends auth.users | `id` (FK → auth.users), `email`, `role` (owner/contributor/viewer) |
| `collections` | Video playlists | `title`, `description`, `user_id` (CASCADE) |
| `videos` | YouTube video clips | `youtube_url`, `title`, `thumbnail_url`, `duration`, `tags[]`, `collection_id` (SET NULL) |
| `content` | Knowledge articles | `title`, `body` (JSONB), `tags[]`, `is_published`, `created_by` |
| `content_versions` | Article revision history | `content_id`, `body` (JSONB), `version_number` |
| `comments` | Article comments | `content_id`, `body`, `created_by` |

**RLS:** Every table restricts access to `auth.uid() = user_id` (or `created_by`). `content_versions` and `comments` use subqueries to verify ownership through the `content` table.

**Triggers:**
- `on_auth_user_created` → auto-inserts into `public.users` with role 'owner'
- `on_auth_user_deleted` → cascade-deletes from `public.users`

**Indexes:** GIN indexes on `tags[]` columns for array containment queries. B-tree indexes on all foreign keys.

## Auth Flow

1. User enters email on `/` (login page)
2. Supabase sends magic link email (15-min expiry, single-use token)
3. User clicks link → lands on `/auth/callback?code=...`
4. Server component calls `supabase.auth.exchangeCodeForSession(code)`
5. Redirects to `/dashboard`
6. All protected pages call `supabase.auth.getUser()` server-side and `redirect('/')` if null

**Supabase clients:**
- **Server pages:** `import { createClient } from '@/lib/supabase/server'` — uses `cookies()` from `next/headers`
- **Client pages:** `import { createClient } from '@/lib/supabase/client'` — uses `createBrowserClient` from `@supabase/ssr`

## Code Conventions

- **Server components by default** — pages that only fetch data are server components (dashboard, search, content list, video detail, collections)
- **`'use client'`** — pages with interactivity (forms, editor, tag inputs): content/new, content/[id]/edit, videos/add, videos/new-collection, settings
- **No comments** in code
- **`any` types** used liberally — `body: any` for TipTap content, query results cast as `any[]`
- **Tailwind inline** — all styling via utility classes, theme via CSS variables in globals.css
- **No API routes** — all database operations happen directly in client components or server components
- **Page structure** — each page renders its own full-page layout (header + main) rather than using a shared layout wrapper

## Key Patterns

### Tag Input
Repeated across content/new, content/[id]/edit, videos/add:
- `tags: string[]` state + `tagInput: string` state
- `addTag()` — appends trimmed input if not duplicate
- `removeTag()` — filters out tag
- Enter key triggers addTag

### Supabase CRUD
```typescript
// Server component (read)
const supabase = await createClient()
const { data } = await supabase.from('content').select('*').order('updated_at', { ascending: false })

// Client component (write)
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
const { data, error } = await supabase.from('content').insert({ ... }).select().single()
```

### YouTube Integration
- `extractYouTubeId(url)` — parses youtube.com/watch, youtu.be, youtube.com/embed URLs
- `getYouTubeEmbedUrl(videoId)` — returns youtube-nocookie.com embed URL (modestbranding, rel=0)
- `getYouTubeThumbnail(videoId, quality)` — returns img.youtube.com URL
- Metadata fetched client-side via YouTube oembed API

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Store in `.env.local`.

## Incomplete / TODO

- **Content versioning** — `content_versions` table exists, no UI to view/restore versions
- **Comments** — `comments` table exists, no UI to add/view comments
- **Sign out** — Dashboard has LogOut icon button with no click handler
- **Settings page** — exists at `/settings` but functionality minimal
- **Search** — uses `ilike` pattern matching (not PostgreSQL full-text search); potential SQL injection via unsanitized `searchParams.q` in `.or()` filters
- **No shared layout** — each page duplicates the header/footer structure instead of using a layout component
