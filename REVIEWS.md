# PeakLearn Project Review

## Summary
PeakLearn is a personal knowledge management system built with Next.js 16, Supabase, and TipTap. The architecture follows Next.js App Router conventions with server components for data fetching and client components for interactivity. The codebase implements magic link authentication, rich-text content management with TipTap, YouTube video collections, and full-text search. RLS policies secure data access at the database level.

---

## Project Structure Review

| Category | Assessment |
|----------|------------|
| **Architecture** | ✅ Well-structured with clear separation between server/client components |
| **File Organization** | ✅ Logical grouping by feature (auth, content, videos, components, lib) |
| **Type Safety** | ⚠️ Heavy use of `any` types undermines TypeScript benefits |
| **Code Duplication** | ❌ Header/nav duplicated in every page instead of shared layout |
| **Component Reuse** | ✅ Good use of shadcn/ui-style components (Button, Card, Input) |

---

## Security Review

| Severity | File:Line | Issue |
|----------|-----------|-------|
| CRITICAL | `src/app/search/page.tsx:32` | SQL injection via unsanitized `searchParams.q` in `.or()` filter - user input directly interpolated into SQL |
| CRITICAL | `src/app/search/page.tsx:38` | Same SQL injection vulnerability in video search query |
| WARNING | `supabase/migrations/001_initial_schema.sql:147-153` | `content_versions` table missing UPDATE and DELETE RLS policies |
| WARNING | `src/lib/supabase/server.ts:21` | Silent error swallowing in `setAll()` - errors are caught and ignored |
| WARNING | `src/components/editor/Editor.tsx:98` | `window.prompt()` for URL input has no validation - could accept javascript: URLs |

---

## Functional Issues

| Severity | File:Line | Issue |
|----------|-----------|-------|
| CRITICAL | `src/app/dashboard/page.tsx:58-59` | LogOut button has no `onClick` handler - sign out is non-functional |
| WARNING | `src/app/content/[id]/page.tsx:65-67` | Trash icon button has no click handler - delete is non-functional |
| WARNING | `src/app/content/[id]/page.tsx:24-28` | Content detail doesn't verify ownership - only checks `getUser()`, not if `created_by` matches |
| WARNING | `src/app/videos/add/page.tsx:59-62` | YouTube oembed response used without checking `response.ok` - could set stale data |
| WARNING | `src/app/content/new/page.tsx:66` | Tag duplicate check passes for empty strings - `''.trim()` is falsy but passes |

---

## Database Schema Review

| Aspect | Status |
|--------|--------|
| **Tables** | ✅ 6 tables properly defined (users, collections, videos, content, content_versions, comments) |
| **Indexes** | ✅ GIN indexes on `tags[]` columns, B-tree on FKs |
| **RLS Policies** | ⚠️ `content_versions` missing UPDATE/DELETE policies |
| **Triggers** | ✅ Auto-create user on signup, auto-delete on auth.user deletion |
| **Foreign Keys** | ✅ Proper CASCADE/SET NULL behaviors |

---

## Component Quality

| Component | Assessment |
|-----------|------------|
| **UI Components** | ✅ Clean shadcn/ui-style implementations with CVA |
| **Editor** | ✅ TipTap with basic formatting, but missing image/link validation |
| **YouTubeEmbed** | ✅ Privacy-enhanced (`youtube-nocookie.com`), no autoplay |
| **DuckLogo** | ✅ SVG mascot with amber theme |

---

## Incomplete Features (documented in AGENTS.md)

| Feature | Status |
|---------|--------|
| Content versioning UI | ❌ Table exists, no UI to view/restore |
| Comments UI | ❌ Table exists, no UI to add/view |
| Sign out | ❌ Button exists, no handler |
| Settings page | ⚠️ Minimal placeholder |
| Search | ⚠️ Uses `ilike` not full-text search |

---

## Code Quality Observations

| Issue | Location |
|-------|----------|
| **No 404 pages** | Missing content/video redirects to homepage |
| **No loading states** | Some async operations lack loading indicators |
| **Duplicate header/nav** | Every page re-implements header instead of using layout |
| **Manual `updated_at`** | Content `updated_at` set manually instead of using trigger |
| **DevTabBar always applies padding** | Even in production if component is rendered |

---

## Recommendation

**NEEDS CHANGES** - Multiple critical security and functional issues must be addressed before production use.

### Priority Fixes:
1. **Fix SQL injection** in `src/app/search/page.tsx` - use parameterized queries or Supabase filters
2. **Add UPDATE/DELETE RLS policies** for `content_versions` table
3. **Implement sign out handler** in `src/app/dashboard/page.tsx`
4. **Add content ownership check** in `src/app/content/[id]/page.tsx`
5. **Implement delete functionality** for content and videos

### Suggested Improvements:
1. Extract shared header into a layout component
2. Add `updated_at` trigger instead of manual assignment
3. Add input validation for link URLs in editor
4. Implement proper error boundaries and loading states
