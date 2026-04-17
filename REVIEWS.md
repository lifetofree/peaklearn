# PeakLearn — Project Review

**Last reviewed:** 2026-04-17
**Reviewed by:** Claude (automated)
**Branch:** develop

---

## Executive Summary

PeakLearn is a well-structured Next.js 16 App Router app with Supabase. Architecture is clean, server/client component split is correct, and the data layer uses RLS appropriately. The codebase has real security gaps (SQL injection in search, missing RLS policies) and several non-functional UI elements that must be addressed before any production exposure. Documentation is excellent.

**Verdict: NEEDS FIXES before production. Safe for personal local use.**

---

## 1. Architecture Review

| Category | Rating | Notes |
|----------|--------|-------|
| Server/client component split | ✅ Good | Data-fetching pages are server, interactive pages are client |
| File organization | ✅ Good | Feature-grouped, logical hierarchy |
| No API routes | ✅ Intentional | All DB calls inline — acceptable for single-user app |
| Shared layouts | ⚠️ Partial | `Header` component exists but each page renders it independently instead of using Next.js layout nesting |
| Type safety | ⚠️ Weak | Heavy `any` usage on TipTap content and Supabase query results |
| Code duplication | ⚠️ Low | Tag input pattern repeated across 4 pages; intentional per AGENTS.md |
| Error handling | ❌ Missing | No error boundaries, no 404 pages, no toast feedback |

---

## 2. Security Audit

### Critical

| ID | File | Line | Issue | Fix |
|----|------|------|-------|-----|
| SEC-001 | `src/app/search/page.tsx` | ~54 | User input interpolated into `.or()` filter string: `` `.or(`title.ilike.%${safeQuery}%,tags.cs.{${safeQuery}}`)` `` — malformed input can produce unexpected Supabase behavior | Replace with separate chained `.ilike()` and `.contains()` calls. Never interpolate user input into PostgREST filter strings. |
| SEC-002 | `supabase/migrations/001_initial_schema.sql` | 147–153 | `content_versions` table has no `UPDATE` or `DELETE` RLS policies. SELECT and INSERT are present, but authenticated users could modify or delete any version row. | Add `USING (content_id IN (SELECT id FROM content WHERE created_by = auth.uid()))` policies for UPDATE and DELETE. |

### Warnings

| ID | File | Line | Issue | Fix |
|----|------|------|-------|-----|
| SEC-003 | `src/components/editor/Editor.tsx` | ~98 | `window.prompt()` link dialog accepts any URL including `javascript:` scheme | Validate URL with `new URL(href)` and check `['http:', 'https:'].includes(url.protocol)` before calling `editor.commands.setLink()` |
| SEC-004 | `src/lib/supabase/server.ts` | ~20 | `setAll()` cookie handler silently swallows errors with empty catch | Add `console.error` at minimum; consider rethrowing non-`NEXT_REDIRECT` errors |
| SEC-005 | `src/app/content/[id]/page.tsx` | ~24–30 | Page checks `getUser()` but not `created_by === user.id` before rendering — RLS handles it at DB level, but client has no explicit ownership check | Add explicit redirect if `content.created_by !== user.id` after data fetch |

### Info / Low Risk

| ID | Note |
|----|------|
| SEC-006 | Dev bypass credentials in `.env.development` — acceptable for local dev, ensure these are never committed to production env or CI secrets |
| SEC-007 | Supabase `anon` key is public (by design) — all access control via RLS; ensure RLS is never disabled on any table |
| SEC-008 | YouTube oEmbed fetch in `src/app/videos/add/page.tsx` does not check `response.ok` before using data — could silently set stale metadata on fetch failure |

---

## 3. Functional Issues

### Broken / Non-functional

| ID | File | Line | Issue | Fix |
|----|------|------|-------|-----|
| FUNC-001 | `src/app/content/[id]/page.tsx` | ~65–67 | Trash icon button renders with no `onClick` handler — delete is completely non-functional | Add `supabase.from('content').delete().eq('id', id)` handler with `router.push('/content')` on success |
| FUNC-002 | `src/app/videos/add/page.tsx` | ~59–62 | oEmbed response used without checking `response.ok` — silently sets empty/stale metadata if fetch fails | Add `if (!response.ok) throw new Error(...)` guard before parsing JSON |

### Incomplete but Functional Enough

| ID | File | Issue |
|----|------|-------|
| FUNC-003 | `src/app/content/[id]/edit/page.tsx` | Version snapshots saved on every edit but no pruning — will accumulate indefinitely |
| FUNC-004 | `src/app/content/new/page.tsx` | Empty string tag guard works (`''.trim()` is falsy) but single-space input silently fails — acceptable |

---

## 4. Database Review

| Aspect | Status | Notes |
|--------|--------|-------|
| Schema completeness | ✅ | All 6 tables properly defined |
| RLS on all tables | ✅ | All tables have RLS enabled |
| RLS policy completeness | ❌ | `content_versions` missing UPDATE/DELETE policies (see SEC-002) |
| GIN indexes on tags | ✅ | Present on all `tags[]` columns |
| B-tree indexes on FKs | ✅ | Present on all foreign key columns |
| Auth triggers | ✅ | `on_auth_user_created` and `on_auth_user_deleted` both present |
| Cascade behavior | ✅ | Videos → NULL collection on collection delete; content_versions cascade on content delete |
| `updated_at` trigger | ❌ | `content.updated_at` set manually in application code — should use PostgreSQL trigger for reliability |

### Recommended SQL additions

```sql
-- Fix SEC-002: content_versions RLS
CREATE POLICY "Users can update their own content versions" ON content_versions
  FOR UPDATE USING (
    content_id IN (SELECT id FROM content WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can delete their own content versions" ON content_versions
  FOR DELETE USING (
    content_id IN (SELECT id FROM content WHERE created_by = auth.uid())
  );

-- Fix manual updated_at: add trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 5. Code Quality

| Issue | Severity | Location | Recommendation |
|-------|----------|----------|---------------|
| No error boundaries | High | All pages | Add `error.tsx` per route segment at minimum |
| No 404 pages | High | All dynamic routes | Add `not-found.tsx` for `/content/[id]` and `/videos/v/[id]` |
| `any` types on core data | Medium | Editor, Supabase results | Define `TipTapContent` type; use Supabase generated types |
| No pagination | Medium | Content, video, collections lists | Add limit/offset or cursor pagination before launch |
| No toast feedback | Medium | All mutation pages | Successful saves/deletes complete silently |
| No loading skeletons | Low | Dashboard, search | Replace blank screens with skeleton placeholders |
| `window.prompt()` for links | Medium | `Editor.tsx:98` | Use a modal/popover instead |

---

## 6. Performance

| Observation | Impact | Recommendation |
|-------------|--------|---------------|
| All rows fetched (no pagination) | High at scale | Add `.limit()` + "Load more" or cursor-based pagination |
| No query caching | Medium | Consider SWR or React Query for client components |
| YouTube thumbnails: raw CDN URLs | Low | Use `next/image` with `remotePatterns` for optimization |
| `select('*')` replaced with column selects | ✅ Fixed | Dashboard now uses scoped selects |
| `Promise.all` for parallel fetches | ✅ Good | Dashboard fetches content, videos, and collections in parallel |

---

## 7. Accessibility

| Item | Status | Notes |
|------|--------|-------|
| Semantic HTML | ✅ | Proper heading hierarchy, buttons, links |
| Focus-visible rings | ✅ | Input and button focus styles present |
| Icon-only buttons | ❌ | Several icon-only buttons lack `aria-label` |
| Editor toolbar | ❌ | Toolbar buttons have no `aria-label` or `title` |
| Color contrast | ✅ | Teal primary passes WCAG AA on white |
| Keyboard navigation | ⚠️ | Editor accessible but custom components not fully tested |

---

## 8. Suggested New Features (not in backlog)

These would meaningfully improve the product:

| Feature | Effort | Value |
|---------|--------|-------|
| `cmd+k` command palette | Medium | High — keyboard-first navigation |
| AI-assisted tag suggestions | Medium | High — auto-tag on publish using Claude API |
| Spaced repetition review mode | High | High — core learning differentiator |
| Reading time estimate | Low | Medium — word count from TipTap JSON |
| Pin / favorites | Low | Medium — `is_pinned` boolean, already mentioned in schema notes |
| Export to Markdown | Medium | Medium — TipTap JSON → MD, useful for backup |
| Video watch progress | Medium | Medium — resume position per user+video |
| Keyboard shortcuts help modal | Low | Low — `?` key opens shortcuts list |
| Weekly digest email | High | Low — Supabase Edge Functions + email |

---

## 9. Pre-production Checklist

- [ ] Fix SEC-001: parameterize search filters
- [ ] Fix SEC-002: add UPDATE/DELETE RLS for `content_versions`
- [ ] Fix SEC-003: validate link URLs in editor
- [ ] Fix FUNC-001: implement content delete handler
- [ ] Fix FUNC-002: check `response.ok` in oEmbed fetch
- [ ] Add `not-found.tsx` for content and video detail routes
- [ ] Disable `NEXT_PUBLIC_ENABLE_DEV_BYPASS` in production env
- [ ] Add `aria-label` to icon-only buttons
- [ ] Add pagination to content, video, and collection lists
- [ ] Set up error monitoring (Sentry or Axiom)
- [ ] Configure production Supabase site URL and redirect URLs
- [ ] Verify custom SMTP configured for magic link emails

---

## 10. Changelog of Reviewed Fixes

| Date | Item | Status |
|------|------|--------|
| 2026-04-17 | Dashboard nav duplication eliminated (`navLinks` + `NavLinks` component) | ✅ Fixed |
| 2026-04-17 | Dashboard queries parallelized with `Promise.all` | ✅ Fixed |
| 2026-04-17 | `select('*')` replaced with scoped column selects in dashboard | ✅ Fixed |
| 2026-04-17 | `focus:outline-none` → `focus-visible:outline-none` in `button.tsx` | ✅ Fixed |
| 2026-04-17 | Raw `<input>` / `<button>` replaced with `<Input>` / `<Button>` on login page | ✅ Fixed |
| 2026-04-17 | Footer now displays project version from `package.json` via `process.env.npm_package_version` | ✅ Fixed |
| 2026-04-17 | SEC-001: search queries rewritten with `.ilike()` + `.contains()` — no string interpolation | ✅ Fixed |
| 2026-04-17 | SEC-002: added UPDATE and DELETE RLS policies for `content_versions` | ✅ Fixed |
| 2026-04-17 | SEC-003: editor link validated with `new URL()` + protocol allowlist before `setLink` | ✅ Fixed |
| 2026-04-17 | FUNC-001: content delete implemented as server action (`deleteContent`) on `/content/[id]` | ✅ Fixed |
| 2026-04-17 | FUNC-002: `response.ok` guard already present in `videos/add/page.tsx` — was a false positive | ✅ Already fixed |
