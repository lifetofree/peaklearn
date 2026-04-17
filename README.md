# PeakLearn

A personal knowledge management system for writers, learners, and researchers. Write rich-text articles, organize YouTube videos into collections, and search everything in one place.

> **Status:** Alpha — single-user, personal use. Core CRUD functional. Not ready for public deployment without addressing the security items in [`REVIEWS.md`](./REVIEWS.md).

---

## Features

| Feature | Status |
|---------|--------|
| Magic link (passwordless) auth | ✅ Live |
| Rich-text article editor (TipTap) | ✅ Live |
| Draft / publish workflow | ✅ Live |
| Tags & tag filtering | ✅ Live |
| Content version history (view & restore) | ✅ Live |
| YouTube video collections | ✅ Live |
| Auto-fetch video metadata via oEmbed | ✅ Live |
| Cross-entity search (content + videos) | ✅ Live |
| Dark mode (CSS variables ready) | ⚠️ Toggle not wired |
| Comments on articles | 🔲 Schema ready, no UI |
| Video duration display | 🔲 Schema ready, not populated |
| Pagination | 🔲 Missing — will break at scale |
| Toast notifications | 🔲 Actions complete silently |
| `cmd+k` command palette | 🔲 Planned |
| Image support in editor | 🔲 Planned |
| Spaced repetition review mode | 🔲 Planned |
| Video watch progress | 🔲 Planned |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Auth + DB | Supabase (magic link OTP, PostgreSQL, RLS) |
| Editor | TipTap 3 (ProseMirror-based, JSONB storage) |
| Video | react-youtube (privacy-enhanced nocookie embed) |
| UI Components | Custom (CVA + Radix Slot pattern) |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) account (free tier works)

### 1. Clone and install

```bash
git clone <repository-url>
cd peaklearn
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Under **Settings → API**, copy:
   - Project URL
   - `anon` public key

### 3. Run the database migration

In the Supabase dashboard → **SQL Editor**, paste and run:

```
supabase/migrations/001_initial_schema.sql
```

This creates all 6 tables, RLS policies, GIN indexes, and auth triggers.

### 4. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3838

# Development only — enables email/password bypass for local testing
NEXT_PUBLIC_ENABLE_DEV_BYPASS=true
NEXT_PUBLIC_DEV_BYPASS_EMAIL=dev@example.com
NEXT_PUBLIC_DEV_BYPASS_PASSWORD=your-dev-password
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3838](http://localhost:3838).

---

## Project Structure

```
peaklearn/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── auth/callback/          # Magic link exchange handler
│   │   ├── content/                # Articles (list, new, view, edit, versions)
│   │   ├── videos/                 # Videos & collections (list, add, view, edit)
│   │   ├── search/                 # Cross-entity search
│   │   ├── dashboard/              # Main dashboard
│   │   ├── settings/               # Account settings + sign out
│   │   ├── layout.tsx              # Root layout (fonts, globals)
│   │   └── globals.css             # CSS variables (theme, dark mode)
│   ├── components/
│   │   ├── ui/                     # Button, Card, Input (shadcn/ui-style)
│   │   ├── editor/                 # TipTap editor + SSR-safe wrapper
│   │   ├── Header.tsx              # Sticky header with nav
│   │   ├── HeaderActions.tsx       # Settings + sign out buttons
│   │   ├── DuckLogo.tsx            # SVG duck mascot
│   │   ├── YouTubeEmbed.tsx        # Privacy-enhanced player
│   │   └── DevBanner.tsx / DevTabBar.tsx  # Dev-only helpers
│   ├── lib/
│   │   ├── supabase/client.ts      # Browser Supabase client
│   │   ├── supabase/server.ts      # Server Supabase client (cookie-based)
│   │   ├── utils.ts                # cn() helper (clsx + tailwind-merge)
│   │   └── youtube.ts              # ID extraction, embed URL, thumbnail, duration parsing
│   └── types/
│       └── database.ts             # TypeScript interfaces for all 6 tables
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full schema with RLS and triggers
├── AGENTS.md                       # Agent/LLM guide for this codebase
├── BACKLOGS.md                     # Prioritized feature backlog
├── CHANGELOGS.md                   # Change history
└── REVIEWS.md                      # Security and code quality review
```

---

## Database Schema

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Extends `auth.users` | `id`, `email`, `role` (owner / contributor / viewer) |
| `collections` | Video playlists | `title`, `description`, `user_id` |
| `videos` | YouTube clips | `youtube_url`, `title`, `thumbnail_url`, `duration` (seconds), `tags[]`, `collection_id` (nullable) |
| `content` | Knowledge articles | `title`, `body` (JSONB — TipTap state), `tags[]`, `is_published`, `created_by` |
| `content_versions` | Revision snapshots | `content_id`, `body` (JSONB), `version_number` |
| `comments` | Article annotations | `content_id`, `body`, `created_by` |

### Security

- Row Level Security (RLS) enabled on all 6 tables — users can only read/write their own rows.
- All auth managed server-side via `@supabase/ssr` — session cookies never exposed to JS.
- Magic link tokens expire after 15 minutes and are single-use.

---

## Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | Client | Login (magic link email form) |
| `/auth/callback` | Server | Exchanges magic link code for session |
| `/dashboard` | Server | Recent items, quick search, nav overview |
| `/content` | Server | Article list with tag filtering |
| `/content/new` | Client | Create article (TipTap editor) |
| `/content/[id]` | Server | View article (read-only render) |
| `/content/[id]/edit` | Client | Edit article, save version snapshot |
| `/content/[id]/versions` | Server | View and restore version history |
| `/videos` | Server | Collections + uncategorized videos |
| `/videos/add` | Client | Add video by YouTube URL |
| `/videos/new-collection` | Client | Create collection |
| `/videos/[collectionId]` | Server | View collection + video list |
| `/videos/[collectionId]/edit` | Client | Edit collection metadata, delete |
| `/videos/v/[id]` | Server | Video detail + YouTube embed |
| `/videos/v/[id]/edit` | Client | Edit metadata, move collection, delete |
| `/search` | Server | Cross-entity search (content + videos) |
| `/settings` | Client | Account info, sign out |

---

## Suggested New Features

These are not in the backlog yet but would significantly improve the product:

### Short-term (1–2 days each)
- **`cmd+k` command palette** — keyboard-first search without page navigation
- **Toast notifications** — lightweight feedback for save/delete/move actions
- **Pagination / infinite scroll** — required before the lists break at scale
- **Video duration on add** — `parseIsoDuration()` already exists in `src/lib/youtube.ts`; wire it up
- **Dark mode toggle** — CSS variables are ready; just needs a button + `document.documentElement.classList.toggle('dark')`
- **Content delete handler** — button UI exists on `/content/[id]` but has no `onClick`
- **Link URL validation in editor** — prevent `javascript:` URLs in `window.prompt()` link dialog

### Medium-term (3–7 days each)
- **Comments UI** — table and RLS exist; add list + form below article body on `/content/[id]`
- **Pin / favorites** — `is_pinned` boolean on content and videos; pinned items float to dashboard top
- **Full-text search** — replace `ILIKE` with PostgreSQL `tsvector` generated column + `@@` operator for ranked results
- **Video watch progress** — persist `watch_position` per user+video; resume on next visit
- **Reading time estimate** — calculate from TipTap JSON word count; display on article cards
- **Export** — content to Markdown (TipTap JSON → MD), video collections to CSV/text

### Longer-term
- **Spaced repetition review mode** — flashcard-style review surfacing content not visited recently (based on `updated_at`)
- **Image support in editor** — TipTap `@tiptap/extension-image` + Supabase Storage for uploads
- **Keyboard shortcuts panel** — discoverable `?` help modal listing all shortcuts
- **Contributor/viewer roles** — `role` field exists on `users` table; build shared workspace
- **Notion-style slash commands** — `/heading`, `/quote`, `/code` block insertion in editor
- **AI-assisted tagging** — auto-suggest tags based on article content (Claude API)
- **Weekly review digest** — email summary of items added/not reviewed this week

---

## Development

```bash
npm run dev      # Dev server on http://localhost:3838
npm run build    # Production build
npm run lint     # ESLint (TypeScript-aware)
```

No separate typecheck script — ESLint handles type checking via `@typescript-eslint`.

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

4. Set the Supabase **Site URL** and **Redirect URL** to your production domain under **Authentication → URL Configuration**.

### Pre-production checklist

- [ ] Remove or disable `NEXT_PUBLIC_ENABLE_DEV_BYPASS` in production env
- [ ] Add `UPDATE` and `DELETE` RLS policies for `content_versions` table (see [`REVIEWS.md`](./REVIEWS.md))
- [ ] Fix SQL injection in search (parameterize the `.or()` filter)
- [ ] Add `not-found.tsx` pages for missing content/video routes
- [ ] Set up error monitoring (Sentry, Axiom, or similar)
- [ ] Verify Supabase email provider is configured with a custom SMTP for reliability

---

## License

MIT

## Contributing

Issues and PRs welcome. For significant changes, open an issue first to discuss scope.
