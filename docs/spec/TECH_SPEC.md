# PeakLearn — Technical Specification

> **Stage:** Alpha (Core CRUD complete, pre-production)
> **Last Updated:** 2026-05-15
> **Branch:** develop
> **Authors:** Tech Lead · Architect

---

## 1. Project Overview

PeakLearn is a personal knowledge management system for writers, learners, and researchers. Users create and manage rich-text articles and YouTube video collections, organize content with tags, and search across everything.

**Current status:** Single-user, local/cloud Supabase backend, all core CRUD flows operational. Not yet production-ready — see §11 for open issues.

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16 |
| Language | TypeScript (strict) | 5 |
| Runtime | React | 19 |
| Styling | Tailwind CSS | 4 |
| Component variants | CVA (Class Variance Authority) | 0.7.1 |
| Icons | Lucide React | 1.8.0 |
| Rich-text editor | TipTap 3 (ProseMirror) | 3.x |
| Auth + Database | Supabase (PostgreSQL, RLS) | 2.103.0 |
| SSR session | @supabase/ssr | 0.10.2 |
| YouTube embed | react-youtube | 10.1.0 |
| Unit tests | Vitest + @testing-library/react | 4.1.4 |
| E2E tests | Playwright | 1.59.1 |
| Test DOM | JSDOM | 29 |
| Linting | ESLint | 9 |
| Deployment | Vercel | — |

**Fonts:** Inter (body), Space Grotesk (headings) via Google Fonts.

---

## 3. Architecture

### 3.1 Pattern: Server-First with Selective Client Components

All data-fetching pages are async React Server Components. Only interactive pages (forms, editors) are Client Components.

```
Browser
  └── Next.js App Router
        ├── Server Components  ──→  Supabase PostgREST (direct DB queries)
        │   (dashboard, list, detail, search, versions)
        └── Client Components  ──→  Supabase JS SDK (form saves, auth)
            (new, edit, add pages; header; editor; toast)
```

### 3.2 Middleware

`src/middleware.ts` intercepts every request before rendering:

- **Public routes:** `/login`, `/auth/*`
- **All other routes:** require valid Supabase session cookie → redirect to `/login` if missing

### 3.3 Authentication Flow

```
/login  →  signInWithOtp({ email })         (magic link email sent)
        →  signInWithPassword({ email, password })  (dev bypass only)
  ↓
/auth/callback  →  exchanges OTP code for session cookie
  ↓
/dashboard  (middleware validates cookie on every subsequent request)
```

Dev bypass (`NEXT_PUBLIC_ENABLE_DEV_BYPASS=true`) is active only in local development. See SEC-5 for the security issue with the current implementation.

---

## 4. Database Schema

All tables have **Row Level Security (RLS)** enabled. All user-owned tables enforce `user_id = auth.uid()` policies.

### 4.1 `users`
Extends Supabase `auth.users`.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | text | |
| role | enum | `owner` \| `contributor` \| `viewer` |
| created_at | timestamptz | |

### 4.2 `collections`
YouTube video playlists.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | text NOT NULL | |
| description | text | nullable |
| user_id | UUID FK → users | RLS: `= auth.uid()` |
| created_at | timestamptz | |

### 4.3 `videos`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| youtube_url | text NOT NULL | Full YouTube URL |
| title | text NOT NULL | |
| description | text | nullable |
| thumbnail_url | text | Cached `hqdefault` URL |
| duration | int | Seconds; BUG-1 breaks parsing |
| tags | text[] | PostgreSQL array |
| collection_id | UUID FK → collections | nullable (uncategorized) |
| user_id | UUID FK → users | RLS: `= auth.uid()` |
| created_at | timestamptz | |

### 4.4 `content`
Rich-text articles.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | text NOT NULL | |
| body | jsonb | TipTap JSON format |
| tags | text[] | PostgreSQL array |
| is_published | boolean | default `false` |
| created_by | UUID FK → users | RLS: `= auth.uid()` |
| created_at | timestamptz | |
| updated_at | timestamptz | Updated on every save |

### 4.5 `content_versions`
Immutable snapshots for version history.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| content_id | UUID FK → content | |
| body | jsonb | Snapshot at time of save |
| version_number | int | Incremental counter |
| created_at | timestamptz | |

> **Note:** No direct RLS on this table — access is only safe if all access goes through authenticated queries that join on `content`. REF-6 notes a race condition on restore.

### 4.6 `comments`
Schema created; UI not yet implemented.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| content_id | UUID FK → content | |
| body | text | |
| created_by | UUID FK → users | |
| created_at | timestamptz | |

---

## 5. Route Map

### Public
| Route | Component type | Description |
|-------|---------------|-------------|
| `/login` | Client | Magic link + dev bypass form |
| `/auth/callback` | Server | OTP → session exchange |

### Protected (all redirect to `/login` if unauthenticated)
| Route | Component type | Description |
|-------|---------------|-------------|
| `/dashboard` | Server | Recent content, videos, collections |
| `/content` | Server | Paginated article list (20/page) |
| `/content/new` | Client | Create article |
| `/content/[id]` | Server | Article detail + delete action |
| `/content/[id]/edit` | Client | Edit article |
| `/content/[id]/versions` | Server | Version history + restore |
| `/videos` | Server | Collections grid + uncategorized list (12/page) |
| `/videos/add` | Client | Add YouTube video |
| `/videos/new-collection` | Client | Create collection |
| `/videos/[collectionId]` | Server | Videos in a collection |
| `/videos/[collectionId]/edit` | Client | Edit collection |
| `/videos/v/[id]` | Server | Video detail + player |
| `/videos/v/[id]/edit` | Client | Edit video metadata |
| `/search` | Server | Full-text search results |
| `/settings` | Client | User profile + sign out |

### Error routes
| File | Purpose |
|------|---------|
| `src/app/error.tsx` | Client error boundary (runtime errors) |
| `src/app/global-error.tsx` | Root-level error fallback |

---

## 6. Key Feature Details

### 6.1 Rich-Text Editor (TipTap)

- **Storage format:** JSONB (`content.body` column)
- **Toolbar actions:** Bold, Italic, Bullet list, Ordered list, Link insert
- **Link validation:** Whitelist `http:`, `https:`, `mailto:` — SEC-6 exists for remaining gap
- **Read-only mode:** `EditorWrapper` component renders content without toolbar
- **Versioning:** On every save, the current body is snapshotted to `content_versions` before the update

### 6.2 YouTube Integration

**URL parsing** (`src/lib/youtube.ts`): Regex accepts:
- `youtube.com/watch?v=ID`
- `youtu.be/ID`
- `youtube.com/embed/ID`

**Metadata fetch:**
```
GET https://www.youtube.com/oembed?url={url}&format=json
→ { title, description, thumbnail_url, author_name }
```

**Embed player:** `youtube-nocookie.com` CDN, no autoplay, modular branding off.

**Known bug (BUG-1):** `parseDuration()` passes strings like `"1H"` to `parseInt`, yielding `NaN`. Fix: strip non-digits before parsing.

### 6.3 Search

5 parallel Supabase queries per search request:
1. `content` by title (`ilike`)
2. `content` by tags (`contains`)
3. `videos` by title (`ilike`)
4. `videos` by description (`ilike`)
5. `videos` by tags (`contains`)

Results are deduplicated by ID and displayed in separate Content / Videos sections. Max query length: 100 characters.

**Performance issue (PERF-1, PERF-2):** Should be replaced with PostgreSQL full-text search + `UNION`. Also fetches unused `body` column — wastes bandwidth.

### 6.4 Internationalization

`src/lib/i18n.ts` provides a simple `t(key, params?)` function:
- 170+ translation keys organized by domain
- Parameter interpolation via `{key}` syntax
- Falls back to key string if translation missing
- **Coverage gap (REF-7):** Some UI strings are hardcoded and not passed through `t()`

---

## 7. Component Inventory

### Custom Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useTagInput` | `src/hooks/useTagInput.ts` | Tag add/remove state — partially extracted, still duplicated in 4 pages (RED-1) |
| `useToast` | `src/hooks/use-toast.ts` | Temporary notification state |

### Reusable Components
| Component | Purpose |
|-----------|---------|
| `Editor` | TipTap editor with toolbar |
| `EditorWrapper` | Read-only TipTap viewer |
| `Header` | Sticky nav with logo + search + user actions |
| `HeaderActions` | Sign-out button, user info |
| `YouTubeEmbed` | Privacy-enhanced iframe player |
| `DuckLogo` | SVG mascot |
| `DevBanner` | "Development Mode" notice bar |
| `DevTabBar` | Quick-nav links for local testing |
| `Button`, `Card`, `Input`, `Toast` | shadcn-style UI primitives |

---

## 8. Data Flow

### Create Article
```
/content/new (Client)
  → validate title (required)
  → supabase.auth.getUser()
  → INSERT INTO content (title, body, tags, is_published, created_by)
  → redirect /content/{id}
```

### Edit Article (with Versioning)
```
/content/[id]/edit (Client)
  → validate title
  → SELECT MAX(version_number) FROM content_versions WHERE content_id = id
  → INSERT INTO content_versions (body snapshot, version_number + 1)   ← REF-6: not atomic
  → UPDATE content SET title, body, tags, updated_at
  → show success toast
```

### Add YouTube Video
```
/videos/add (Client)
  → user enters URL → click "Fetch Info"
  → extractVideoId(url) via regex
  → GET youtube.com/oembed → populate title, description
  → user clicks Save
  → validate URL + title
  → derive thumbnail_url from video ID
  → INSERT INTO videos
  → redirect /videos or /videos/{collectionId}
```

### Search
```
/search (Server)
  → receive ?q= param
  → 5 parallel supabase queries (content × 2, videos × 3)
  → merge + deduplicate by ID
  → render results page
```

---

## 9. State Management

All state is local React state (no global store). Key patterns:

- **Form pages:** `useState` for each field + `isSaving` flag
- **Tag management:** `useTagInput` hook (partially extracted)
- **Editor content:** passed via `onUpdate` callback from TipTap
- **Toast:** `useToast` hook, displayed via `<Toast>` component
- **Server data:** fetched once in Server Component, passed as props

---

## 10. Environment Variables

### Required (all environments)
```
NEXT_PUBLIC_SUPABASE_URL       Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase anon key
NEXT_PUBLIC_SITE_URL           Site origin (used in magic link redirect)
```

### Development only (`.env.local`)
```
NEXT_PUBLIC_DEV_BYPASS_EMAIL      Dev login email
NEXT_PUBLIC_DEV_BYPASS_PASSWORD   Dev login password
NEXT_PUBLIC_ENABLE_DEV_BYPASS     true
```

> **SEC-5:** The `NEXT_PUBLIC_` prefix exposes dev credentials to the browser bundle. These must be renamed to server-only variables before any public or staging deployment.

---

## 11. Open Issues

All issues are tracked in `ISSUESTOFIX.md`. Summary:

### Critical Bugs
| ID | Location | Description |
|----|----------|-------------|
| BUG-1 | `src/lib/youtube.ts:52–61` | `parseInt("1H")` → NaN; all video durations broken |
| BUG-2 | `src/app/content/[id]/page.tsx:9–15` | `deleteContent` server action has no auth/ownership check |

### Security (High)
| ID | Location | Description |
|----|----------|-------------|
| SEC-1 | `src/middleware.ts` | Middleware exists but may have coverage gaps |
| SEC-2 | `src/app/videos/[collectionId]/edit/page.tsx` | No ownership check on collection edit/delete |
| SEC-3 | `src/app/videos/v/[id]/edit/page.tsx` | No ownership check on video edit |
| SEC-4 | `src/app/content/[id]/edit/page.tsx` | No ownership check on content edit |
| SEC-5 | `.env.local` | Dev credentials exposed via `NEXT_PUBLIC_` |

### Security (Medium)
| ID | Location | Description |
|----|----------|-------------|
| SEC-6 | `src/components/editor/Editor.tsx:97–107` | Link input may allow non-whitelisted protocols |
| SEC-7 | `src/app/content/[id]/versions/page.tsx` | Rich-text rendered without DOMPurify sanitization |

### Performance
| ID | Location | Description |
|----|----------|-------------|
| PERF-1 | `src/app/search/page.tsx` | 5 separate queries per search; use PostgreSQL FTS |
| PERF-2 | `src/app/search/page.tsx:30` | `body` column fetched but not displayed |
| PERF-3 | `src/app/dashboard/page.tsx` | Collections query missing `.limit(5)` |
| PERF-4 | `src/app/videos/add/page.tsx` | Fetches all collection fields; needs `.select('id, title')` |

### Code Quality
| ID | Description |
|----|-------------|
| RED-1 | `addTag`/`removeTag` duplicated in 4 pages — extract to `useTagInput` |
| RED-2 | Collection fetch duplicated in add + edit video pages — extract to `useCollections` |
| RED-3 | `alert()` used in some pages instead of Toast component |
| RED-4 | `any` types on DB row maps — use typed interfaces from `src/types/database.ts` |
| REF-1 | No unsaved-changes guard on edit pages |
| REF-2 | `catch (error: any)` — use `toErrorMessage(error, fallback)` utility |
| REF-3 | Edit pages too large (235–270 lines) — extract `useContentForm`, `useVideoForm` hooks |
| REF-4 | Magic number page sizes scattered — consolidate into `src/lib/constants.ts` |
| REF-6 | Version restore is non-atomic (race condition) — use a Postgres RPC call |
| REF-7 | i18n coverage incomplete — audit all `t()` calls and hardcoded strings |

---

## 12. Testing

### Test Commands
```bash
npm run test              # Vitest single pass
npm run test:watch        # Vitest watch mode
npm run test:coverage     # Coverage report (v8)
npm run test:e2e          # Playwright E2E
npm run test:e2e:ui       # Playwright UI mode
```

### Current Coverage
- `src/__tests__/unit/middleware.test.ts` — middleware auth logic
- `src/__tests__/unit/hooks/useTagInput.test.ts` — tag input hook
- `src/__tests__/unit/lib/constants.test.ts` — constants
- `src/__tests__/unit/lib/errors.test.ts` — error utilities

E2E tests cover core flows via Playwright (see `test-results/` for last run).

---

## 13. Build & Deployment

### Local Development
```bash
npm install
cp .env.local.example .env.local   # fill in Supabase credentials
npm run dev                         # http://localhost:3838
```

### Production Build
```bash
npm run build   # outputs .next/ (Vercel-compatible)
npm run start   # starts production server
```

### Vercel Deployment
1. Connect GitHub repo to Vercel project
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
3. Do **not** set dev bypass variables in production
4. Automatic deployment on push to `main`

---

## 14. Pre-Production Checklist

Before promoting to production, the following must be resolved:

- [ ] **BUG-1** — Fix YouTube duration parsing
- [ ] **BUG-2** — Add auth check to `deleteContent`
- [ ] **SEC-2–4** — Add ownership checks to collection/video/content edit pages
- [ ] **SEC-5** — Remove `NEXT_PUBLIC_` prefix from dev bypass vars
- [ ] **SEC-7** — Add DOMPurify sanitization to rich-text rendering
- [ ] **PERF-2** — Remove `body` from search query select list
- [ ] **PERF-3** — Add `.limit(5)` to dashboard collections query
- [ ] Verify middleware covers all protected routes (SEC-1)
- [ ] Smoke-test magic link flow on production Supabase project
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain in Vercel env

---

## 15. Future Work (Post-Alpha)

- PostgreSQL full-text search with `UNION` to replace 5-query search (PERF-1)
- Comments UI (schema already exists)
- Version history restore UI (schema already exists)
- Multi-user collaboration + sharing
- Export / backup features
- Mobile-optimized layout
- `useContentForm` / `useVideoForm` hook extraction (REF-3)
- Atomic version restore via Postgres RPC (REF-6)
