# PeakLearn — Database Preparation

Full schema reference for all tables, indexes, RLS policies, and triggers.
Source of truth: `supabase/migrations/001_initial_schema.sql`

---

## Tables Overview

| # | Table | Purpose | RLS |
|---|-------|---------|-----|
| 1 | `users` | Extends `auth.users` with profile fields | ✅ |
| 2 | `collections` | Video playlists / groupings | ✅ |
| 3 | `videos` | YouTube video clips with metadata | ✅ |
| 4 | `content` | Rich-text knowledge articles | ✅ |
| 5 | `content_versions` | Revision snapshots of articles | ✅ |
| 6 | `comments` | Annotations on articles | ✅ |

---

## Table 1 — `users`

Extends `auth.users`. Created automatically via trigger on signup.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | NO | — | PK, FK → `auth.users(id)` |
| `email` | `TEXT` | NO | — | |
| `role` | `TEXT` | NO | `'owner'` | CHECK: `owner`, `contributor`, `viewer` |
| `created_at` | `TIMESTAMPTZ` | YES | `NOW()` | |

**RLS Policies**

| Operation | Policy |
|-----------|--------|
| SELECT | `auth.uid() = id` |

---

## Table 2 — `collections`

Video playlists. Each collection belongs to one user.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | NO | `uuid_generate_v4()` | PK |
| `title` | `TEXT` | NO | — | |
| `description` | `TEXT` | YES | — | |
| `user_id` | `UUID` | YES | — | FK → `users(id)` ON DELETE CASCADE |
| `created_at` | `TIMESTAMPTZ` | YES | `NOW()` | |

**Indexes**

| Index | Type | Column |
|-------|------|--------|
| `idx_collections_user_id` | B-tree | `user_id` |

**RLS Policies**

| Operation | Policy |
|-----------|--------|
| SELECT | `auth.uid() = user_id` |
| INSERT | `auth.uid() = user_id` |
| UPDATE | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` |

---

## Table 3 — `videos`

YouTube video clips with metadata and optional collection assignment.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | NO | `uuid_generate_v4()` | PK |
| `youtube_url` | `TEXT` | NO | — | Full YouTube URL |
| `title` | `TEXT` | NO | — | |
| `description` | `TEXT` | YES | — | |
| `thumbnail_url` | `TEXT` | YES | — | YouTube CDN URL |
| `duration` | `INTEGER` | YES | — | Seconds — not yet populated on add |
| `tags` | `TEXT[]` | YES | `'{}'` | |
| `collection_id` | `UUID` | YES | — | FK → `collections(id)` ON DELETE SET NULL |
| `user_id` | `UUID` | YES | — | FK → `users(id)` ON DELETE CASCADE |
| `created_at` | `TIMESTAMPTZ` | YES | `NOW()` | |

**Indexes**

| Index | Type | Column |
|-------|------|--------|
| `idx_videos_user_id` | B-tree | `user_id` |
| `idx_videos_collection_id` | B-tree | `collection_id` |
| `idx_videos_tags` | GIN | `tags` |

**RLS Policies**

| Operation | Policy |
|-----------|--------|
| SELECT | `auth.uid() = user_id` |
| INSERT | `auth.uid() = user_id` |
| UPDATE | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` |

---

## Table 4 — `content`

Rich-text knowledge articles. Body stored as TipTap JSONB.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | NO | `uuid_generate_v4()` | PK |
| `title` | `TEXT` | NO | — | |
| `body` | `JSONB` | NO | `'{}'` | TipTap editor state |
| `tags` | `TEXT[]` | YES | `'{}'` | |
| `is_published` | `BOOLEAN` | YES | `FALSE` | Draft / published toggle |
| `created_by` | `UUID` | YES | — | FK → `users(id)` ON DELETE CASCADE |
| `updated_at` | `TIMESTAMPTZ` | YES | `NOW()` | Updated manually in app code |

**Indexes**

| Index | Type | Column |
|-------|------|--------|
| `idx_content_created_by` | B-tree | `created_by` |
| `idx_content_tags` | GIN | `tags` |

**RLS Policies**

| Operation | Policy |
|-----------|--------|
| SELECT | `auth.uid() = created_by` |
| INSERT | `auth.uid() = created_by` |
| UPDATE | `auth.uid() = created_by` |
| DELETE | `auth.uid() = created_by` |

---

## Table 5 — `content_versions`

Revision snapshots saved on every article edit. Used by the version history UI at `/content/[id]/versions`.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | NO | `uuid_generate_v4()` | PK |
| `content_id` | `UUID` | YES | — | FK → `content(id)` ON DELETE CASCADE |
| `body` | `JSONB` | NO | — | TipTap snapshot |
| `version_number` | `INTEGER` | NO | — | Incremented per save |
| `created_at` | `TIMESTAMPTZ` | YES | `NOW()` | |

**Indexes**

| Index | Type | Column |
|-------|------|--------|
| `idx_content_versions_content_id` | B-tree | `content_id` |

**RLS Policies**

All policies check ownership via the parent `content` row (`content.created_by = auth.uid()`).

| Operation | Policy |
|-----------|--------|
| SELECT | `EXISTS (SELECT 1 FROM content WHERE id = content_id AND created_by = auth.uid())` |
| INSERT | `EXISTS (SELECT 1 FROM content WHERE id = content_id AND created_by = auth.uid())` |
| UPDATE | `EXISTS (SELECT 1 FROM content WHERE id = content_id AND created_by = auth.uid())` |
| DELETE | `EXISTS (SELECT 1 FROM content WHERE id = content_id AND created_by = auth.uid())` |

---

## Table 6 — `comments`

Annotations on articles. Schema ready — no UI implemented yet.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | NO | `uuid_generate_v4()` | PK |
| `content_id` | `UUID` | YES | — | FK → `content(id)` ON DELETE CASCADE |
| `body` | `TEXT` | NO | — | Plain text comment |
| `created_by` | `UUID` | YES | — | FK → `users(id)` ON DELETE CASCADE |
| `created_at` | `TIMESTAMPTZ` | YES | `NOW()` | |

**Indexes**

| Index | Type | Column |
|-------|------|--------|
| `idx_comments_content_id` | B-tree | `content_id` |

**RLS Policies**

| Operation | Policy |
|-----------|--------|
| SELECT | `auth.uid() = created_by` |
| INSERT | `auth.uid() = created_by` |
| UPDATE | `auth.uid() = created_by` |
| DELETE | `auth.uid() = created_by` |

---

## Triggers & Functions

### `on_auth_user_created`

Fires after a new row is inserted into `auth.users`. Automatically creates the corresponding `public.users` row with role `'owner'`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'owner');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### `on_auth_user_deleted`

Fires after a row is deleted from `auth.users`. Removes the corresponding `public.users` row (cascades to all owned data).

```sql
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_deletion();
```

---

## Foreign Key Relationships

```
auth.users
  └── public.users (id)
        ├── collections (user_id)  CASCADE delete
        │     └── videos (collection_id)  SET NULL on collection delete
        ├── videos (user_id)  CASCADE delete
        ├── content (created_by)  CASCADE delete
        │     ├── content_versions (content_id)  CASCADE delete
        │     └── comments (content_id)  CASCADE delete
        └── comments (created_by)  CASCADE delete
```

---

## Setup Instructions

Run the full schema in the Supabase SQL Editor:

```
supabase/migrations/001_initial_schema.sql
```

For existing deployments that need only the missing `content_versions` UPDATE/DELETE RLS policies added after the initial migration, run:

```sql
CREATE POLICY "Users can update own content versions"
  ON public.content_versions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.content
    WHERE content.id = content_versions.content_id
    AND content.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete own content versions"
  ON public.content_versions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.content
    WHERE content.id = content_versions.content_id
    AND content.created_by = auth.uid()
  ));
```
