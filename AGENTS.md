<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PeakLearn — Agent Guide

## Project Stage

**Alpha — personal use, single-user.**
Core CRUD is functional. Theme is finalized (teal, minimal). No collaboration, no public sharing. Active backlog tracked in `BACKLOGS.md`. Changelog in `CHANGELOGS.md`.

## Project Overview

Personal knowledge management system. Users write rich-text articles (TipTap editor), organize YouTube videos into collections, and search across everything. Magic link auth via Supabase. Teal brand color (`#158C78`), duck mascot logo.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, CSS custom properties for theming |
| Auth + DB | Supabase (magic link OTP, PostgreSQL, RLS) |
| Editor | TipTap 3 (ProseMirror-based) |
| Video | react-youtube |
| UI Components | Custom (CVA + Radix Slot pattern) |
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
│   │   ├── [id]/
│   │   │   ├── page.tsx               # Server: view article (read-only)
│   │   │   └── edit/page.tsx          # Client: edit article with TipTap editor
│   │   ├── new/page.tsx               # Client: create article
│   │   └── page.tsx                   # Server: list all articles with tag filter
│   ├── dashboard/page.tsx             # Server: recent items, quick search, nav
│   ├── search/page.tsx                # Server: cross-entity search (content + videos)
│   ├── settings/page.tsx              # Client: account settings (email, sign out)
│   ├── videos/
│   │   ├── [collectionId]/
│   │   │   ├── page.tsx              # Server: view collection with video list
│   │   │   └── edit/page.tsx         # Client: edit collection metadata, delete
│   │   ├── v/[id]/
│   │   │   ├── page.tsx              # Server: video detail with YouTube embed
│   │   │   └── edit/page.tsx         # Client: edit video metadata, move collection, delete
│   │   ├── add/page.tsx              # Client: add video from YouTube URL (oEmbed fetch)
│   │   ├── new-collection/page.tsx   # Client: create collection
│   │   └── page.tsx                  # Server: list all collections + uncategorized videos
│   ├── layout.tsx                     # Root layout (Inter + Space Grotesk fonts, globals.css)
│   ├── page.tsx                       # Login page (magic link email form)
│   └── globals.css                    # CSS variables (light/dark themes, teal primary)
├── components/
│   ├── ui/
│   │   ├── button.tsx                 # Button: variants (default, destructive, outline, secondary, ghost, link), sizes (default, sm, lg, icon)
│   │   ├── card.tsx                   # Card, CardHeader, CardTitle, CardDescription, CardContent
│   │   └── input.tsx                  # Styled input with focus-visible ring
│   ├── editor/
│   │   ├── Editor.tsx                 # TipTap editor with toolbar (bold, italic, lists, links, undo/redo)
│   │   └── EditorWrapper.tsx          # Dynamic import wrapper (SSR disabled)
│   ├── DevTabBar.tsx                  # Dev-only floating nav bar (only in development)
│   ├── DuckLogo.tsx                   # SVG duck mascot
│   ├── HeaderActions.tsx              # Header right-side actions (settings link, sign out)
│   └── YouTubeEmbed.tsx               # react-youtube wrapper (no autoplay, nocookie embed)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser client (createBrowserClient from @supabase/ssr)
│   │   └── server.ts                  # Server client (createServerClient with cookies)
│   ├── utils.ts                       # cn() utility (clsx + tailwind-merge)
│   └── youtube.ts                     # extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail, formatDuration, parseIsoDuration
└── types/
    └── database.ts                    # TypeScript interfaces for all 6 tables + Database type
```

## Features

### Authentication
- Magic link email login (Supabase OTP, 15-min expiry)
- Dev bypass via email/password (enabled by `NEXT_PUBLIC_ENABLE_DEV_BYPASS=true`)
- All protected pages guard with `supabase.auth.getUser()` + `redirect('/')`

### Content (Articles)
- Create, read, update, delete rich-text articles
- TipTap editor: bold, italic, bullet/ordered lists, links, undo/redo
- Tags (unlimited per article, multi-select filter on list page)
- Publish / draft status (`is_published` boolean)

### Videos
- Add YouTube videos by URL — title and description auto-fetched via oEmbed
- Thumbnails extracted from YouTube CDN
- Organize into collections (playlists)
- Move videos between collections or leave uncategorized
- Edit metadata (title, description, tags, collection)
- Delete videos and collections

### Search
- Cross-entity search across content titles and video titles/descriptions
- Tag matching (GIN index, exact array containment)
- Input sanitized before use in `.or()` Supabase filter

### Dashboard
- Recent content (5), recent videos (5), all collections
- Quick search bar
- Sticky header with inline desktop nav + collapsible mobile sub-bar

## Database Schema

6 tables, all with RLS enabled. Users can only access their own rows.

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Extends auth.users | `id` (FK → auth.users), `email`, `role` (owner/contributor/viewer) |
| `collections` | Video playlists | `title`, `description`, `user_id` |
| `videos` | YouTube clips | `youtube_url`, `title`, `description`, `thumbnail_url`, `duration` (int, seconds), `tags[]`, `collection_id` (nullable) |
| `content` | Knowledge articles | `title`, `body` (JSONB — TipTap state), `tags[]`, `is_published`, `created_by` |
| `content_versions` | Revision history | `content_id`, `body` (JSONB), `version_number` — **schema only, no UI yet** |
| `comments` | Article comments | `content_id`, `body`, `created_by` — **schema only, no UI yet** |

**Indexes:** GIN on all `tags[]` columns. B-tree on all foreign keys.

**Triggers:**
- `on_auth_user_created` → auto-inserts into `public.users` with role `'owner'`
- `on_auth_user_deleted` → cascade-deletes from `public.users`

## Auth Flow

1. User enters email on `/`
2. Supabase sends magic link (OTP)
3. User clicks link → `/auth/callback?code=...`
4. Server calls `supabase.auth.exchangeCodeForSession(code)`
5. Redirects to `/dashboard`

**Client selection:**
- Server components: `import { createClient } from '@/lib/supabase/server'`
- Client components: `import { createClient } from '@/lib/supabase/client'`

## Code Conventions

- **Server components by default** — pages that only fetch data (dashboard, search, content list, video detail, collections)
- **`'use client'`** — pages with forms or interactivity (content/new, content/edit, videos/add, videos/new-collection, settings, page.tsx login)
- **No API routes** — all DB calls happen in server or client components directly
- **Tailwind inline** — all styling via utility classes; theme via CSS variables in `globals.css`
- **No shared page layout** — each page renders its own header rather than using a layout wrapper
- **`any` types** — used for TipTap body content and Supabase query results
- **No comments in code**

## Key Patterns

### Parallel data fetching (server components)
```typescript
const [
  { data: recentContent },
  { data: recentVideos },
] = await Promise.all([
  supabase.from('content').select('id,title,updated_at').order('updated_at', { ascending: false }).limit(5),
  supabase.from('videos').select('id,title,created_at').order('created_at', { ascending: false }).limit(5),
])
```
Always use `Promise.all` for independent queries. Always specify columns — never `select('*')`.

### Tag input (repeated pattern)
Present in `content/new`, `content/[id]/edit`, `videos/add`, `videos/v/[id]/edit`:
- `tags: string[]` state + `tagInput: string` state
- `addTag()` — appends trimmed value if not duplicate
- `removeTag(tag)` — filters it out
- Enter key triggers `addTag`

### YouTube utilities (`src/lib/youtube.ts`)
- `extractYouTubeId(url)` — handles youtube.com/watch, youtu.be, youtube.com/embed
- `getYouTubeEmbedUrl(id)` — returns `youtube-nocookie.com` embed URL
- `getYouTubeThumbnail(id, quality)` — `'hq'` or `'maxres'`
- `formatDuration(seconds)` — `HH:MM:SS`
- `parseIsoDuration(iso)` — converts YouTube ISO 8601 duration to seconds

### Navigation links (dashboard)
`NavLinks` component in `dashboard/page.tsx` renders from a shared `navLinks` array — used for both desktop inline nav and mobile collapsible sub-bar. Reference this pattern when adding nav to other pages.

## Theme

- **Primary:** teal `hsl(170 74% 32%)` ≈ `#158C78`
- **Radius:** `0.5rem` (`--radius`)
- **Fonts:** Inter (body, `--font-body`), Space Grotesk (headings, `--font-heading`)
- **Dark mode:** `.dark` class on `<html>`, toggled manually (no system preference auto-detection yet)
- All colors referenced via CSS custom properties — change `globals.css` to retheme globally

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Dev only
NEXT_PUBLIC_ENABLE_DEV_BYPASS=true
NEXT_PUBLIC_DEV_BYPASS_EMAIL=
NEXT_PUBLIC_DEV_BYPASS_PASSWORD=
```

Store in `.env.local`.

## Incomplete / Backlog

See `BACKLOGS.md` for the full prioritized list. Key gaps:

- `content_versions` and `comments` tables exist but have no UI
- Video `duration` field is never populated on add
- No pagination anywhere — all rows fetched
- No toast/feedback on successful mutations
- No `cmd+k` search
- No full-text search (currently `ILIKE`)
- Dark mode toggle not wired up
