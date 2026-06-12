# Issues To Fix — PeakLearn

> Reviewed: 2026-05-09 | Branch: develop

---

## 1. Critical Bugs

### BUG-1: YouTube Duration Parsing Returns NaN
**File:** `src/lib/youtube.ts` ~L52–61  
**Issue:** Regex captures digits + unit suffix (e.g. `"1H"`, `"2M"`, `"3S"`), then `parseInt("1H", 10)` returns `NaN`. All video durations will display as `NaN`.  
**Fix:**
```ts
const hours   = parseInt((match[1] || '0').replace(/[^\d]/g, ''), 10)
const minutes = parseInt((match[2] || '0').replace(/[^\d]/g, ''), 10)
const seconds = parseInt((match[3] || '0').replace(/[^\d]/g, ''), 10)
```

### BUG-2: Delete Content Server Action Has No Auth/Ownership Check
**File:** `src/app/content/[id]/page.tsx` ~L9–15  
**Issue:** The `deleteContent` server action reads the ID from `formData` and deletes directly. No check that the caller is authenticated or owns the content. Any request with a valid content ID can delete it.  
**Fix:** Verify `supabase.auth.getUser()` and validate `content.created_by === user.id` before deleting.

---

## 2. Security Issues

### SEC-1: No Auth Guard on Protected Routes (Missing Middleware)
**File:** `middleware.ts` — does not exist  
**Issue:** No route-level middleware redirects unauthenticated users. All authenticated pages (dashboard, content, videos, settings) are reachable by URL without a session.  
**Fix:** Create `src/middleware.ts` to check Supabase session on all non-`/login` routes and redirect to `/login` if unauthenticated.

### SEC-2: No Ownership Check on Collection Edit/Delete
**File:** `src/app/videos/[collectionId]/edit/page.tsx` ~L23–84  
**Issue:** `loadCollection`, `handleSave`, and `handleDelete` do not verify the collection belongs to the current user. Any authenticated user can modify or delete any collection.  
**Fix:** Add `.eq('user_id', user.id)` filter on every query; return 404 or redirect if mismatch.

### SEC-3: No Ownership Check on Video Edit
**File:** `src/app/videos/v/[id]/edit/page.tsx` ~L27–48  
**Issue:** No validation that the video belongs to the current user before allowing edit or delete.  
**Fix:** Same pattern as SEC-2 — filter by `user_id` and validate ownership.

### SEC-4: No Ownership Check on Content Edit Page
**File:** `src/app/content/[id]/edit/page.tsx` ~L34–44  
**Issue:** Content is loaded and saved without verifying `created_by === user.id`.  
**Fix:** Same pattern — validate ownership on load and before save.

### SEC-5: `NEXT_PUBLIC_` Dev Bypass Credentials in `.env.local`
**File:** `.env.local`  
**Issue:** `NEXT_PUBLIC_DEV_BYPASS_EMAIL`, `NEXT_PUBLIC_DEV_BYPASS_PASSWORD`, and `NEXT_PUBLIC_ENABLE_DEV_BYPASS` are prefixed with `NEXT_PUBLIC_`, making them visible to the browser bundle.  
**Fix:**
- Remove `NEXT_PUBLIC_` prefix (keep server-only).
- Verify `process.env.NODE_ENV !== 'production'` inside `handleDevBypass` as a hard guard.
- Add `.env.local` to `.gitignore` if not already there.

### SEC-6: Link Input Accepts Arbitrary Protocols (XSS Risk)
**File:** `src/components/editor/Editor.tsx` ~L97–107  
**Issue:** URL validation only checks `http:`/`https:` via `URL` constructor but a crafted input could slip through depending on browser quirks. `javascript:` URLs can cause XSS.  
**Fix:**
```ts
const allowedProtocols = ['http:', 'https:', 'mailto:']
if (!allowedProtocols.includes(new URL(href).protocol)) return
```

### SEC-7: Unsanitized Rich-Text Content Rendered as HTML
**File:** `src/app/content/[id]/versions/page.tsx` ~L221–250  
**Issue:** Content body rendered directly without sanitization. If the editor allows pasting HTML with scripts, this is a stored XSS vector.  
**Fix:** Run content through `DOMPurify.sanitize()` before rendering, or use the editor's built-in read-only mode.

---

## 3. Performance Issues

### PERF-1: Search Runs 5 Separate DB Queries Per Request
**File:** `src/app/search/page.tsx` ~L23–35  
**Issue:** Five parallel Supabase queries for every search (content by title, content by tag, video by title, video by description, video by tag). Slow and expensive.  
**Fix:** Use Postgres full-text search with a single query and `UNION`, or a dedicated search function/view.

### PERF-2: Search Fetches Full `body` Column
**File:** `src/app/search/page.tsx` ~L30  
**Issue:** `body` (full rich-text editor content) is fetched in search results but never displayed there. Wastes significant bandwidth.  
**Fix:** Remove `body` from the search select list; fetch it only on the detail/edit page.

### PERF-3: Dashboard Collections Query Has No `limit()`
**File:** `src/app/dashboard/page.tsx` ~L53–75  
**Issue:** Recent-content queries cap at 5 rows, but the collections query has no limit. Could return hundreds of rows as the user's library grows.  
**Fix:** Add `.limit(5)` to the collections query.

### PERF-4: Add-Video Page Fetches Full Collection Rows
**File:** `src/app/videos/add/page.tsx` ~L36–45  
**Issue:** Fetches all fields on collections when only `id` and `title` are needed for the dropdown.  
**Fix:** Use `.select('id, title')`.

### PERF-5: Confusing Set-Based Deduplication in Search
**File:** `src/app/search/page.tsx` ~L37–45  
**Issue:** `.filter(item => !seen.has(item.id) && !!seen.add(item.id))` relies on `Set.add()` returning the Set (truthy). Works, but fragile and confusing.  
**Fix:**
```ts
const deduplicated = Array.from(new Map(items.map(i => [i.id, i])).values())
```

---

## 4. Redundant / Dead Code

### RED-1: Tag Add/Remove Logic Duplicated in 4 Pages
**Files:**
- `src/app/content/new/page.tsx` ~L59–68
- `src/app/content/[id]/edit/page.tsx` ~L101–110
- `src/app/videos/add/page.tsx` ~L120–129
- `src/app/videos/v/[id]/edit/page.tsx` ~L98–107

**Issue:** Identical `addTag` / `removeTag` logic copy-pasted across all four pages.  
**Fix:** Extract to `src/hooks/useTagInput.ts`:
```ts
export function useTagInput(initial: string[] = []) {
  const [tags, setTags] = useState(initial)
  const [input, setInput] = useState('')
  const add = () => { if (input.trim()) { setTags(t => [...t, input.trim()]); setInput('') } }
  const remove = (tag: string) => setTags(t => t.filter(x => x !== tag))
  return { tags, input, setInput, add, remove }
}
```

### RED-2: Collection Fetch Duplicated Across Add and Edit Video Pages
**Files:** `src/app/videos/add/page.tsx`, `src/app/videos/v/[id]/edit/page.tsx`  
**Issue:** Same Supabase query to fetch user's collections repeated verbatim.  
**Fix:** Extract to `src/hooks/useCollections.ts`.

### RED-3: `alert()` Used Instead of Toast in Several Pages
**Files:** `src/app/videos/v/[id]/edit/page.tsx` and others  
**Issue:** Inconsistent error feedback — some pages use the Toast component, others use native `alert()`.  
**Fix:** Replace all `alert()` calls with the Toast/notification system already in the project.

### RED-4: `any` Types on Database Row Maps
**Files:** `src/app/content/page.tsx` ~L119, `src/app/videos/page.tsx` ~L64  
**Issue:** `{content.map((item: any) => ...)}` discards TypeScript safety.  
**Fix:** Use the typed interfaces from `src/types/database.ts`.

---

## 5. Refactoring Opportunities

### REF-1: Unsaved-Changes Guard Missing in Edit Pages
**Files:** All edit pages with the Editor component  
**Issue:** Navigating away discards unsaved changes with no warning.  
**Fix:** Add a `beforeunload` listener in `useEffect` that fires when `isDirty` is true.

### REF-2: Error Catch Blocks Use `error: any`
**Files:** `src/app/login/page.tsx` ~L37` and many others  
**Issue:** `catch (error: any)` loses type safety and may miss non-Error thrown values.  
**Fix:** Create a shared utility:
```ts
export function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return fallback
}
```

### REF-3: Page Components Are Too Large — Extract Hooks
**Files:** `src/app/content/[id]/edit/page.tsx` (235 lines), `src/app/videos/add/page.tsx` (270 lines)  
**Issue:** Form state, API calls, and tag management all inline in page components.  
**Fix:** Extract `useContentForm()` and `useVideoForm()` hooks; keep page components as thin wrappers.

### REF-4: Scattered Page Size / Limit Constants
**Files:** `src/app/content/page.tsx` (`PAGE_SIZE = 20`), `src/app/videos/page.tsx` (`PAGE_SIZE = 12`), `src/app/search/page.tsx` (`.slice(0, 100)`)  
**Issue:** Magic numbers spread across files; inconsistent values.  
**Fix:** Consolidate into `src/lib/constants.ts`:
```ts
export const PAGE_SIZE = { CONTENT: 20, VIDEOS: 12, COLLECTIONS: 5 }
export const SEARCH_MAX_QUERY_LENGTH = 100
```

### REF-5: No Error Boundary for Client Components
**Issue:** Unhandled runtime errors in client components show a blank page.  
**Fix:** Add `src/app/error.tsx` and `src/app/global-error.tsx` Next.js error boundary files.

### REF-6: Race Condition in Content Version Restore
**File:** `src/app/content/[id]/versions/page.tsx` ~L63–111  
**Issue:** Fetch current version → save as new version is two separate queries with no transaction. Content could change between the two steps.  
**Fix:** Wrap in a Postgres function/RPC call that performs both steps atomically, or use optimistic locking with a `version` counter column.

### REF-7: i18n Coverage Incomplete
**File:** `src/app/dashboard/page.tsx` ~L183` references `t('videos.no_videos')` — key may be missing.  
**Issue:** Some strings are passed through `t()` but the key is absent from translation files; others are hardcoded and never translated.  
**Fix:** Audit all `t()` calls against translation files; add missing keys; search for hardcoded UI strings not going through `t()`.

---

## Priority Matrix

| ID | Severity | Effort |
|----|----------|--------|
| BUG-1 | Critical | Low |
| BUG-2 | Critical | Low |
| SEC-1 | High | Low |
| SEC-2 | High | Low |
| SEC-3 | High | Low |
| SEC-4 | High | Low |
| SEC-5 | High | Low |
| SEC-6 | Medium | Low |
| SEC-7 | Medium | Medium |
| PERF-1 | Medium | High |
| PERF-2 | Medium | Low |
| PERF-3 | Low | Low |
| PERF-4 | Low | Low |
| PERF-5 | Low | Low |
| RED-1 | Medium | Low |
| RED-2 | Low | Low |
| RED-3 | Low | Low |
| RED-4 | Low | Low |
| REF-1 | Medium | Low |
| REF-2 | Medium | Low |
| REF-3 | Low | Medium |
| REF-4 | Low | Low |
| REF-5 | Low | Low |
| REF-6 | Low | Medium |
| REF-7 | Low | Medium |
