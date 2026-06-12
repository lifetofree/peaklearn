# PeakLearn — Improvement Plan

> Audited: 2026-06-12 | Branch: develop  
> Cross-referenced against ISSUESTOFIX.md and current working-tree state.

---

## What's Already Done (in working tree, not yet committed)

These items from ISSUESTOFIX.md are resolved in the current unstaged changes:

| ID | Fix |
|----|-----|
| BUG-1 | YouTube duration regex now uses digit-only capture groups |
| BUG-2 | Delete content server action has auth + ownership check |
| SEC-1 | `src/middleware.ts` added — redirects unauthenticated users |
| SEC-2 | Collection edit/delete filters by `user_id` |
| SEC-3 | Video edit/delete filters by `user_id` |
| SEC-4 | Content edit loads/saves with `.eq('created_by', user.id)` |
| SEC-6 | Editor link input validates against allowlist `['http:', 'https:', 'mailto:']` |
| PERF-2 | Search query no longer selects `body` column |
| PERF-3 | Dashboard collections query has `.limit(5)` |
| PERF-4 | Add-video page uses `.select('id, title')` for collections dropdown |
| RED-1 | `useTagInput` hook extracted and used across all edit pages |
| RED-3 | Toast replaces `alert()` in most pages |
| REF-2 | `toErrorMessage` utility in `src/lib/errors.ts` |
| REF-4 | Page size and search constants in `src/lib/constants.ts` |
| REF-5 | `error.tsx` and `global-error.tsx` error boundaries added |

**Next action**: commit all of the above as a single "fix: apply ISSUESTOFIX audit items" commit.

---

## Remaining Work

Items are ordered by **Priority × Effort** — do the high-severity, low-effort ones first.

---

### Phase 1 — Security (do first)

#### SEC-5 · Strip `NEXT_PUBLIC_` from dev bypass credentials
**File**: `.env.local`  
**Issue**: `NEXT_PUBLIC_DEV_BYPASS_EMAIL`, `NEXT_PUBLIC_DEV_BYPASS_PASSWORD`, and `NEXT_PUBLIC_ENABLE_DEV_BYPASS` are exposed to the browser bundle.  
**Fix**:
1. Rename to `DEV_BYPASS_EMAIL`, `DEV_BYPASS_PASSWORD`, `ENABLE_DEV_BYPASS` in `.env.local`.
2. Update `src/app/login/page.tsx` to read server-side env vars (move bypass logic into a Server Action).
3. Add a hard `process.env.NODE_ENV !== 'production'` guard inside the handler.
4. Verify `.env.local` is in `.gitignore`.

**Effort**: Small

---

#### SEC-7 · Sanitize rich-text before rendering
**File**: `src/app/content/[id]/versions/page.tsx`  
**Issue**: Content body is rendered directly from the database. A crafted paste with `<script>` or `javascript:` can cause stored XSS.  
**Fix**: Use TipTap's read-only `EditorWrapper` (which already exists in the project) instead of rendering raw HTML. The editor's output is a JSON document, not raw HTML — so no sanitization library is needed; just always pass through the editor renderer.  
**Effort**: Small

---

### Phase 2 — Type Safety (quick wins)

#### N4 · Add `created_at` to `Content` type
**File**: `src/types/database.ts:31`  
**Issue**: `Content` interface is missing `created_at`, but `src/app/content/[id]/page.tsx:113` accesses `content.created_at` — TypeScript is currently silently accepting this on an untyped property.  
**Fix**: Add `created_at: string` to the `Content` interface.  
**Effort**: Trivial

---

#### RED-4 · Remove `any` type annotations on DB rows
**Files**: `src/app/content/page.tsx`, `src/app/videos/page.tsx`  
**Issue**: `.map((item: any) => ...)` discards TypeScript safety on rendered content.  
**Fix**: Import and use the `Content` and `Video` types from `src/types/database.ts`.  
**Effort**: Small

---

#### N6 · Type the Editor `content` prop
**File**: `src/components/editor/Editor.tsx:20`, `src/app/content/[id]/edit/page.tsx:23`  
**Issue**: `content?: any` and `useState<any>(null)` hide malformed data bugs at the seam between Supabase and TipTap.  
**Fix**: Create a `TipTapContent` type (or import from `@tiptap/core`) and use it. Acceptable minimal fix: `type TipTapContent = Record<string, unknown> | null`.  
**Effort**: Small

---

### Phase 3 — UI Consistency

#### N1 · Replace duplicated inline headers with `<Header />`
**Files**: 6 pages each contain their own `<header>` block with `<DuckLogo />` + `<h1>PeakLearn</h1>`:
- `src/app/content/[id]/page.tsx:51-57`
- `src/app/content/new/page.tsx:64-79`
- `src/app/content/[id]/edit/page.tsx:127-153`
- `src/app/videos/add/page.tsx:123-139`
- `src/app/videos/[collectionId]/edit/page.tsx:117-140`
- `src/app/videos/v/[id]/edit/page.tsx:130-152`

**Issue**: Six copies of the same header structure. Adding a nav link or dark mode toggle requires 6 edits.  
**Fix**: Extend `<Header>` to accept an optional `actions` slot (right side buttons like Save/Cancel). Replace all inline headers with `<Header actions={<>...</>} />`.  
**Effort**: Medium (touch 6 files, extend one component)

---

#### N3 · Replace `confirm()` with a consistent confirmation UI
**Files**:
- `src/app/videos/[collectionId]/edit/page.tsx:82` — `confirm('Delete this collection?...')`
- `src/app/videos/v/[id]/edit/page.tsx:95` — `confirm('Delete this video?')`

**Issue**: Native `confirm()` blocks the thread, looks inconsistent with the Toast design, and can't be styled or tested.  
**Fix**: Replace with a local `deleting` confirmation state: show an inline "Are you sure? [Confirm] [Cancel]" button group where the Delete button was. No modal component needed.  
**Effort**: Small

---

#### N5 · Gate `DevTabBar` behind `NODE_ENV`
**File**: `src/app/layout.tsx:31`  
**Issue**: `DevBanner` is correctly gated with `{process.env.NODE_ENV === 'development' && <DevBanner />}` but `<DevTabBar />` renders unconditionally in production.  
**Fix**: Apply the same guard to `DevTabBar`.  
**Effort**: Trivial

---

### Phase 4 — Code Quality

#### REF-7 · Audit and complete i18n coverage
**Files**: Multiple edit/detail pages  
**Issue**: Many UI strings bypass `t()` and are hardcoded in English:
- "Back to Content" / "Back to Videos" / "Cancel" / "Save" in edit pages
- "Created:" / "Last updated:" in `content/[id]/page.tsx`
- "Loading..." / "Saving..." / "Deleting..." states  

**Fix**: Search for quoted strings not inside `t()` calls: `grep -rn '"[A-Z][a-z]' src/app`. For each match, check if a key already exists in `src/lib/i18n.ts`; if so, use it; if not, add the key.  
**Effort**: Medium

---

#### RED-2 · Extract `useCollections` hook
**Files**: `src/app/videos/add/page.tsx:39-46`, `src/app/videos/v/[id]/edit/page.tsx:44-45`  
**Issue**: The Supabase query to load a user's collections for a dropdown is duplicated in two pages.  
**Fix**:
```ts
// src/hooks/useCollections.ts
export function useCollections() {
  const [collections, setCollections] = useState<CollectionOption[]>([])
  const supabase = createClient()
  useEffect(() => {
    supabase.from('collections').select('id, title').order('title')
      .then(({ data }) => { if (data) setCollections(data) })
  }, [])
  return collections
}
```
**Effort**: Small

---

#### REF-1 · Add unsaved-changes guard to edit pages
**Files**: `src/app/content/[id]/edit/page.tsx`, `src/app/videos/v/[id]/edit/page.tsx`, `src/app/videos/[collectionId]/edit/page.tsx`  
**Issue**: Navigating away discards unsaved edits with no warning.  
**Fix**: Track a `isDirty` flag (true after any field change, false after save). Add a `useEffect` that registers a `beforeunload` handler when `isDirty` is true:
```ts
useEffect(() => {
  if (!isDirty) return
  const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}, [isDirty])
```
**Effort**: Small (add to 3 pages)

---

#### PERF-5 · Simplify search dedup function
**File**: `src/app/search/page.tsx:7-19`  
**Issue**: The custom `dedup` loop works but is unnecessary complexity.  
**Fix**:
```ts
function dedup<T extends { id: string }>(arrays: (T[] | null)[]): T[] {
  return Array.from(
    new Map(arrays.flatMap(a => a ?? []).map(i => [i.id, i])).values()
  )
}
```
**Effort**: Trivial

---

### Phase 5 — Performance

#### PERF-1 · Replace 5-query search with full-text search
**File**: `src/app/search/page.tsx:36-51`  
**Issue**: Every search fires 5 parallel Supabase queries (content by title, content by tag, video by title, video by description, video by tag). Slow and costs 5× the DB reads.  
**Fix (two options)**:

**Option A — Postgres FTS (recommended)**: Create a Supabase database function `search_all(query text)` using `to_tsvector` on relevant columns and return a unified result set. Call via `supabase.rpc('search_all', { query: rawQuery })`.

**Option B — UNION via raw SQL**: Use `supabase.from('...').select('...').textSearch('fts', rawQuery)` after adding a generated `fts` column.

Both require a Supabase migration. Start with Option A.  
**Effort**: Large (requires DB migration + RPC)

---

#### REF-6 · Fix race condition in content version restore
**File**: `src/app/content/[id]/versions/page.tsx`  
**Issue**: The restore flow reads current content, then saves a new version in two separate queries with no transaction. A concurrent save could corrupt version history.  
**Fix**: Create a Supabase RPC `restore_content_version(content_id uuid, version_id uuid)` that performs both steps in a single PL/pgSQL transaction.  
**Effort**: Large (requires Supabase migration)

---

### Phase 6 — Refactoring

#### REF-3 · Extract form hooks from large page components
**Files**:
- `src/app/content/[id]/edit/page.tsx` (240 lines)
- `src/app/videos/add/page.tsx` (260 lines)

**Issue**: Form state, API calls, version saving, and UI rendering are all in one component.  
**Fix**: Extract `useContentForm(id?)` and `useVideoForm()` hooks that return `{ title, setTitle, tags, ..., handleSave, saving }`. Pages become thin wrappers.  
**Effort**: Medium

---

## Priority Matrix

| ID | Phase | Severity | Effort |
|----|-------|----------|--------|
| SEC-5 | 1 | High | Small |
| SEC-7 | 1 | Medium | Small |
| N4 | 2 | Low | Trivial |
| RED-4 | 2 | Low | Small |
| N6 | 2 | Low | Small |
| N1 | 3 | Medium | Medium |
| N3 | 3 | Low | Small |
| N5 | 3 | Low | Trivial |
| REF-7 | 4 | Medium | Medium |
| RED-2 | 4 | Low | Small |
| REF-1 | 4 | Medium | Small |
| PERF-5 | 4 | Low | Trivial |
| PERF-1 | 5 | Medium | Large |
| REF-6 | 5 | Low | Large |
| REF-3 | 6 | Low | Medium |

---

## Suggested Execution Order

1. **Commit what's done** — stage and commit all current working-tree fixes.
2. **Phase 1–2** — security + type safety (all small/trivial; one PR).
3. **Phase 3** — UI consistency: header component, confirm → inline state, DevTabBar guard.
4. **Phase 4** — code quality: i18n audit, useCollections, unsaved-changes guard.
5. **Phase 5** — write the Supabase migrations (search FTS, version-restore RPC) together.
6. **Phase 6** — page component refactoring (lowest priority, highest disruption).
