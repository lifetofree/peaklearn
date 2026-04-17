# Backlogs

## Quick Wins

- [ ] **Fix content delete** — Delete button exists on `/content/[id]` but has no handler. Add `supabase.from('content').delete()` call and redirect on success.
- [ ] **Populate video duration** — `src/lib/youtube.ts` already has `formatDuration()` and `parseIsoDuration()`. Wire the oEmbed response into the `duration` field when saving a video.
- [ ] **Pagination** — Collections load all rows with no limit. Content and video lists will break at scale. Add offset pagination or a "Load more" button.
- [ ] **Toast notifications** — Successful actions (save, delete, move) complete silently. Add a lightweight toast component using local state + CSS transition for feedback.

---

## Already Scaffolded — Needs UI

- [ ] **Content version history** — `content_versions` table exists with `version_number`, `body`, `content_id`. Write a snapshot on every save. Add a version list panel on the edit page with a restore button.
- [ ] **Comments on content** — `comments` table exists with `content_id`, `body`, `created_by`. Add a comment list and form below the article body on `/content/[id]`.

---

## High-Value Features

- [ ] **`cmd+k` quick search** — Keyboard-first command palette that searches content and videos inline without page navigation. Fits the minimal tone of the app.
- [ ] **Full-text search** — Current search uses `ILIKE '%query%'` on title only. Add a `tsvector` generated column on `content.body` (extracted from JSONB) and use Postgres `@@` operator for ranked full-text results.
- [ ] **Video watch progress** — Store `watch_position` (seconds) in a `video_progress` table keyed by `user_id + video_id`. `YouTubeEmbed` already tracks play/pause/end state — just persist it and resume on next visit.
- [ ] **Pin / favorites** — Add `is_pinned` boolean to `content` and `videos`. Pinned items surface at the top of the dashboard. One column migration + one toggle button per card.

---

## Longer Term

- [ ] **Image support in editor** — TipTap has `@tiptap/extension-image`. Pair with Supabase Storage for uploads. Articles are currently text-only.
- [ ] **Spaced repetition review mode** — Flashcard-style review that surfaces content not visited in a while (based on `updated_at`). A natural differentiator for a learning-focused app.
- [ ] **Export** — Content to Markdown (TipTap JSON → MD) and video collections to a plain list. Useful for backup and sharing.
