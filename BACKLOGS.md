# Backlogs

## Quick Wins

- [x] **Fix content delete** — Implemented as a server action (`deleteContent`) on `/content/[id]`. Deletes row and redirects to `/content`.
- [x] **Toast notifications** — `Toast` component at `src/components/ui/toast.tsx` + `useToast` hook at `src/hooks/use-toast.ts`. Wired into content edit (success + error) and video add (error). Auto-dismisses after 3.5s.
- [x] **Pagination** — Content list (`/content`) and uncategorized videos (`/videos`) paginated with `page` query param. Content: 20 per page. Videos: 12 per page. Prev/Next controls + page count shown.
- [ ] **Populate video duration** — `parseYouTubeDuration()` in `src/lib/youtube.ts` is ready, but YouTube's oEmbed API does not return duration. Requires YouTube Data API v3 with an API key (`YOUTUBE_API_KEY`). Wire up when API key is available.

---

## Already Scaffolded — Needs UI

- [x] **Content version history** — `content_versions` table exists. Snapshot saved on every edit. Version list and restore UI at `/content/[id]/versions`.
- [ ] **Comments on content** — `comments` table exists with `content_id`, `body`, `created_by`. Add a comment list and form below the article body on `/content/[id]`.

---

## High-Value Features

- [ ] **`cmd+k` quick search** — Keyboard-first command palette that searches content and videos inline without page navigation. Fits the minimal tone of the app.
- [ ] **Full-text search** — Current search uses `ILIKE '%query%'` on title only. Add a `tsvector` generated column on `content.body` (extracted from JSONB) and use Postgres `@@` operator for ranked full-text results.
- [ ] **Video watch progress** — Store `watch_position` (seconds) in a `video_progress` table keyed by `user_id + video_id`. `YouTubeEmbed` already tracks play/pause/end state — just persist it and resume on next visit.
- [ ] **Pin / favorites** — Add `is_pinned` boolean to `content` and `videos`. Pinned items surface at the top of the dashboard. One column migration + one toggle button per card.
- [ ] **Dark mode toggle** — CSS variables and `.dark` class are ready in `globals.css`. Add a toggle button to `HeaderActions.tsx`.

---

## Longer Term

- [ ] **Image support in editor** — TipTap has `@tiptap/extension-image`. Pair with Supabase Storage for uploads. Articles are currently text-only.
- [ ] **Spaced repetition review mode** — Flashcard-style review that surfaces content not visited in a while (based on `updated_at`). A natural differentiator for a learning-focused app.
- [ ] **Export** — Content to Markdown (TipTap JSON → MD) and video collections to a plain list. Useful for backup and sharing.
- [ ] **Video duration display** — Once YouTube Data API v3 key is configured, call `https://www.googleapis.com/youtube/v3/videos?id={videoId}&part=contentDetails` on video add, parse `contentDetails.duration` with `parseYouTubeDuration()`, store in `videos.duration`.
