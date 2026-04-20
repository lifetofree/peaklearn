# PeakLearn

A personal knowledge management system designed for writers, learners, and researchers. Users can write rich-text articles, organize YouTube videos into collections, and search everything effortlessly.

> **Status:** Alpha — personal use, single-user. Core CRUD is functional. Theme is finalized (light-mode glassmorphic teal).

---

## Technical Overview

### Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4, CSS custom properties |
| Auth + DB | Supabase (magic link OTP, PostgreSQL, RLS) |
| Editor | TipTap 3 (ProseMirror-based, JSONB storage) |
| Video | react-youtube (privacy-enhanced `youtube-nocookie.com`) |
| UI Components | Custom (CVA + Radix Slot pattern) |
| Icons | Lucide React |

### Features
**Authentication**
- Magic link email login (Supabase OTP)
- Built-in dev bypass

**Content (Articles)**
- Create, read, update, delete rich-text articles (stored as TipTap JSON format)
- Unlimited tags + tag filtering
- Content version snapshots (history and restore)

**Videos**
- Add YouTube videos natively via URL (oEmbed metadata fetch)
- Organize into Collections (playlists)
- Edit metadata (title, description, tags, collections)

**Search & Layout**
- Cross-entity search (articles + videos)
- Quick search bar, recent activity dashboard

---

## File Structure

```
src/
├── app/
│   ├── auth/callback/page.tsx          # Exchanges magic link code for session
│   ├── content/                        # Read, edit, list, and version history pages
│   ├── dashboard/                      # Recent items, quick search, nav
│   ├── search/                         # Cross-entity search
│   ├── settings/                       # Account settings, sign out
│   ├── videos/                         # Collections and video detail views
│   ├── layout.tsx                      # Root layout, fonts, CSS globals
│   └── page.tsx                        # Login page
├── components/
│   ├── ui/                             # Buttons, Cards, Inputs
│   ├── editor/                         # TipTap editor components
│   └── Header.tsx / HeaderActions.tsx  # Layout elements
├── lib/
│   ├── supabase/                       # Client & Server auth config
│   └── youtube.ts                      # Utilities for embed generation and tracking
└── types/
    └── database.ts                     # Schema typing
```

---

## Database Schema & Security

6 tables, all with Row Level Security (RLS) enabled. Users can strictly only access data matching their auth `id`.

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Extends auth.users | `id`, `email`, `role` |
| `collections` | Video playlists | `title`, `description`, `user_id` |
| `videos` | YouTube clips | `youtube_url`, `title`, `duration`, `tags[]`, `collection_id` |
| `content` | Knowledge articles | `title`, `body`, `tags[]`, `is_published`, `created_at` |
| `content_versions` | Revision history | `content_id`, `body`, `version_number` |
| `comments` | Article comments | `content_id`, `body`, `created_by` |

*Please review `REVIEWS.md` for current security gaps, like missing RLS policies on `content_versions`.*

---

## Code Architecture Patterns

- **Server Component First**: Data-fetching pages are fully Server Components. They use `Promise.all` parameterized queries for performance.
- **Client Components**: Only utilized for isolated forms, settings, and interactive interfaces (like TipTap).
- **Tailwind Native**: All global styles driven by `globals.css` with a responsive, glass-first UI philosophy.

---

## Development

```bash
npm run dev              # Dev server on http://localhost:3838
npm run build            # Production build
npm run lint             # ESLint (no separate typecheck script)
npm run test             # Run unit/integration tests (Vitest)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI mode
```

---

## Getting Started

1. Clone and install dependencies: `npm install`
2. Create a Supabase project and get your API keys.
3. Run `supabase/migrations/001_initial_schema.sql` via Supabase SQL Editor.
4. Set up `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3838
   NEXT_PUBLIC_ENABLE_DEV_BYPASS=true
   NEXT_PUBLIC_DEV_BYPASS_EMAIL=...
   NEXT_PUBLIC_DEV_BYPASS_PASSWORD=...
   ```
5. `npm run dev`

---

## License & Backlogs

See `BACKLOGS.md` for prioritized uncompleted features, and `AGENTS.md` for AI workflows.
Released under the MIT License.
