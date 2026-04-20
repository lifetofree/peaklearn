<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PeakLearn — Agent Guide

## Project Stage

**Alpha — personal use, single-user.**
Core CRUD is functional. Theme is finalized (light-mode glassmorphic teal). No collaboration, no public sharing. Active backlog tracked in `BACKLOGS.md`. Changelog in `CHANGELOGS.md`. Open security issues tracked in `REVIEWS.md` — read that before touching auth or search.

## Project Overview

Personal knowledge management system. Users write rich-text articles (TipTap editor), organize YouTube videos into collections, and search across everything. Magic link auth via Supabase. Teal brand color (`#158C78`), duck mascot logo. Dev server runs on port **3838**.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4, CSS custom properties for theming |
| Auth + DB | Supabase (magic link OTP, PostgreSQL, RLS) |
| Editor | TipTap 3 (ProseMirror-based, body stored as JSONB) |
| Video | react-youtube (privacy-enhanced `youtube-nocookie.com`) |
| UI Components | Custom (CVA + Radix Slot pattern, shadcn/ui-style) |
| Icons | Lucide React |

## Commands

```bash
npm run dev      # Dev server on http://localhost:3838
npm run build    # Production build
npm run lint     # ESLint (no separate typecheck script)
```

## File Structure

```
src/
├── app/
│   ├── auth/callback/page.tsx          # Server: exchanges magic link code for session
│   ├── login/page.tsx                  # Client: login page (magic link email form)
│   ├── page.tsx                        # Server: redirects to dashboard (auth) or login (unauth)
│   ├── content/
│   │   ├── [id]/
│   │   │   ├── page.tsx               # Server: view article (read-only)
│   │   │   ├── edit/page.tsx          # Client: edit article with TipTap editor
│   │   │   └── versions/page.tsx      # Server: view/restore content version history
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
│   └── globals.css                    # CSS variables (light/dark themes, teal primary)
├── components/
│   ├── ui/
│   │   ├── button.tsx                 # Button: variants (default, destructive, outline, secondary, ghost, link), sizes (default, sm, lg, icon)
│   │   ├── card.tsx                   # Card, CardHeader, CardTitle, CardDescription, CardContent
│   │   └── input.tsx                  # Styled input with focus-visible ring
│   ├── editor/
│   │   ├── Editor.tsx                 # TipTap editor with toolbar (bold, italic, lists, links, undo/redo)
│   │   └── EditorWrapper.tsx          # Dynamic import wrapper (SSR disabled — required for TipTap)
│   ├── DevBanner.tsx                  # Dev-only top banner (rendered only in development)
│   ├── DevTabBar.tsx                  # Dev-only floating nav bar (only in development)
│   ├── DuckLogo.tsx                   # SVG duck mascot (amber fill)
│   ├── Header.tsx                     # Sticky site header with nav links
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
- Magic link email login (Supabase OTP, 15-min expiry, single-use)
- Dev bypass via email/password (enabled by `NEXT_PUBLIC_ENABLE_DEV_BYPASS=true`)
- All protected pages guard with `supabase.auth.getUser()` + `redirect('/')`
- **Never disable dev bypass in production** — check env var before deploying

### Content (Articles)
- Create, read, update, delete rich-text articles
- TipTap editor: bold, italic, bullet/ordered lists, links, undo/redo
- Body stored as JSONB (`content.body`) — TipTap JSON format, not HTML
- Tags (unlimited per article, multi-select filter on list page)
- Publish / draft status (`is_published` boolean)
- Version snapshots created on every save (stored in `content_versions`)
- Version history UI at `/content/[id]/versions` — view and restore any snapshot
- **Known gap**: Delete button on `/content/[id]` renders but has no `onClick` handler

### Videos
- Add YouTube videos by URL — title and description auto-fetched via oEmbed
- Thumbnails extracted from YouTube CDN (`hq` or `maxres` quality)
- Organize into collections (playlists)
- Move videos between collections or leave uncategorized
- Edit metadata (title, description, tags, collection)
- Delete videos and collections
- **Known gap**: `duration` field in schema is never populated — `parseIsoDuration()` in `youtube.ts` exists but is unused

### Search
- Cross-entity search across content titles and video titles/descriptions
- Tag matching via GIN index + array containment operator (`cs`)
- Input sanitized with `sanitizeForJson()` before use in `.or()` Supabase filter
- **Known security issue**: string interpolation in `.or()` filter is fragile; see `REVIEWS.md`

### Dashboard
- Recent content (5), recent videos (5), all collections
- Quick search bar
- Fully mobile-first, responsive layouts integrating glassmorphic styling
- Sticky responsive header (search collapses to toggle down on mobile)

## Database Schema

6 tables, all with RLS enabled. Users can only access their own rows.

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Extends auth.users | `id` (FK → auth.users), `email`, `role` (owner/contributor/viewer) |
| `collections` | Video playlists | `title`, `description`, `user_id` |
| `videos` | YouTube clips | `youtube_url`, `title`, `description`, `thumbnail_url`, `duration` (int, seconds), `tags[]`, `collection_id` (nullable) |
| `content` | Knowledge articles | `title`, `body` (JSONB — TipTap state), `tags[]`, `is_published`, `created_by`, `updated_at` |
| `content_versions` | Revision history | `content_id`, `body` (JSONB), `version_number`, `created_at` |
| `comments` | Article comments | `content_id`, `body`, `created_by`, `created_at` — **schema only, no UI** |

**Indexes:** GIN on all `tags[]` columns. B-tree on all foreign keys.

**Triggers:**
- `on_auth_user_created` → auto-inserts into `public.users` with role `'owner'`
- `on_auth_user_deleted` → cascade-deletes from `public.users`

**RLS gap:** `content_versions` is missing UPDATE and DELETE policies. SELECT and INSERT are present.

## Auth Flow

1. User enters email on `/`
2. Supabase sends magic link (OTP email)
3. User clicks link → `/auth/callback?code=...`
4. Server calls `supabase.auth.exchangeCodeForSession(code)`
5. Redirects to `/dashboard`

**Client selection:**
- Server components: `import { createClient } from '@/lib/supabase/server'`
- Client components: `import { createClient } from '@/lib/supabase/client'`

## Security Notes

Read `REVIEWS.md` for the full audit. Key items:

1. **Search SQL injection** (`src/app/search/page.tsx`) — user input interpolated into `.or()` string. Use separate `.ilike()` and `.contains()` chained calls instead of a single `.or()` with string interpolation.
2. **`content_versions` RLS gap** (`supabase/migrations/001_initial_schema.sql:147-153`) — missing UPDATE/DELETE policies.
3. **Editor link validation** (`src/components/editor/Editor.tsx:98`) — `window.prompt()` accepts any URL including `javascript:`. Validate with URL constructor before calling `editor.commands.setLink()`.
4. **Dev bypass must be production-off** — `NEXT_PUBLIC_ENABLE_DEV_BYPASS` must not be set in production `.env`.

## Code Conventions

- **Server components by default** — pages that only fetch data (dashboard, search, content list, video detail, collections)
- **`'use client'`** — pages with forms or interactivity (content/new, content/edit, videos/add, videos/new-collection, settings, login)
- **No API routes** — all DB calls happen directly in server or client components
- **Tailwind inline** — all styling via utility classes; theme via CSS variables in `globals.css`
- **No shared page layout** — each page renders its own header (Header component used, but no Next.js layout nesting for the header)
- **`any` types** — used for TipTap body content and Supabase query results (acknowledged technical debt)
- **No comments in code** — code is expected to be self-documenting

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

Do not abstract this — it's intentionally inline per page.

### YouTube utilities (`src/lib/youtube.ts`)
- `extractYouTubeId(url)` — handles youtube.com/watch, youtu.be, youtube.com/embed
- `getYouTubeEmbedUrl(id)` — returns `youtube-nocookie.com` embed URL
- `getYouTubeThumbnail(id, quality)` — `'hq'` or `'maxres'`
- `formatDuration(seconds)` — `HH:MM:SS`
- `parseIsoDuration(iso)` — converts YouTube ISO 8601 duration to seconds

### Parameterized search (preferred pattern, not yet implemented)
```typescript
// Instead of:
.or(`title.ilike.%${safeQuery}%,tags.cs.{${safeQuery}}`)

// Use separate chained filters:
let query = supabase.from('content').select('id,title,tags')
if (safeQuery) {
  query = query.ilike('title', `%${safeQuery}%`)
}
if (tagQuery) {
  query = query.contains('tags', [tagQuery])
}
```

## Theme

- **Primary:** teal `hsl(170 74% 32%)` ≈ `#158C78`
- **Radius:** `0.75rem` (`--radius`)
- **Fonts:** Inter (body, `--font-body`), Space Grotesk (headings, `--font-heading`)
- **Styling Specs:** Pure light-mode focused. Built with premium utility classes (`.glass`, `.glass-card`) for backdrop blur, unified CSS variable colors (`globals.css`), and smooth micro-animations.
- All colors referenced via CSS custom properties — change `globals.css` to retheme globally

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3838

# Dev only — NEVER set in production
NEXT_PUBLIC_ENABLE_DEV_BYPASS=true
NEXT_PUBLIC_DEV_BYPASS_EMAIL=
NEXT_PUBLIC_DEV_BYPASS_PASSWORD=
```

Store in `.env.local` (gitignored).

## Incomplete / Backlog

See `BACKLOGS.md` for the full prioritized list.

### Implemented but has issues
| Item | File | Issue |
|------|------|-------|
| Search | `src/app/search/page.tsx` | SQL injection via string interpolation in `.or()` |
| Content delete | `src/app/content/[id]/page.tsx` | Button rendered but no `onClick` handler |

### Schema exists, UI missing
| Feature | Table | Notes |
|---------|-------|-------|
| Comments | `comments` | Add list + form on `/content/[id]` |

### Infrastructure exists, not wired
| Feature | Where | Notes |
|---------|-------|-------|
| Video duration | `videos.duration`, `src/lib/youtube.ts` | `parseIsoDuration()` ready — call during oEmbed fetch |

### Not started
- Pagination (will break at scale — all rows fetched today)
- Toast notifications (actions complete silently)
- `cmd+k` command palette
- Full-text search (`tsvector` + `@@` operator)
- Image support in editor
- Spaced repetition review mode
- Video watch progress tracking
- Pin / favorites
- Export (Markdown / CSV)
