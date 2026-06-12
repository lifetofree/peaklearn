-- Full-Text Search: add tsvector columns, triggers, indexes, and search RPCs
-- Run with: supabase db push  (or apply via Supabase Studio SQL editor)

-- 1. Add generated search columns
ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Backfill existing rows
UPDATE public.content
SET search_vector = to_tsvector('english',
  coalesce(title, '') || ' ' || array_to_string(tags, ' ')
);

UPDATE public.videos
SET search_vector = to_tsvector('english',
  coalesce(title, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  array_to_string(tags, ' ')
);

-- 3. Triggers to keep vectors current on INSERT / UPDATE
CREATE OR REPLACE FUNCTION public.content_search_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.search_vector := to_tsvector('english',
    coalesce(new.title, '') || ' ' || array_to_string(new.tags, ' ')
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.video_search_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  new.search_vector := to_tsvector('english',
    coalesce(new.title, '') || ' ' ||
    coalesce(new.description, '') || ' ' ||
    array_to_string(new.tags, ' ')
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS content_search_update ON public.content;
CREATE TRIGGER content_search_update
  BEFORE INSERT OR UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.content_search_update();

DROP TRIGGER IF EXISTS video_search_update ON public.videos;
CREATE TRIGGER video_search_update
  BEFORE INSERT OR UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.video_search_update();

-- 4. GIN indexes for fast FTS queries
CREATE INDEX IF NOT EXISTS idx_content_fts ON public.content USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_videos_fts  ON public.videos  USING GIN(search_vector);

-- 5. Search RPCs (return only columns needed by the UI — no body column)
CREATE OR REPLACE FUNCTION public.search_content(query text)
RETURNS TABLE (
  id          uuid,
  title       text,
  tags        text[],
  updated_at  timestamptz,
  is_published boolean,
  created_by  uuid
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, title, tags, updated_at, is_published, created_by
  FROM public.content
  WHERE search_vector @@ plainto_tsquery('english', query)
    AND created_by = auth.uid()
  ORDER BY ts_rank(search_vector, plainto_tsquery('english', query)) DESC;
$$;

CREATE OR REPLACE FUNCTION public.search_videos(query text)
RETURNS TABLE (
  id            uuid,
  title         text,
  description   text,
  tags          text[],
  thumbnail_url text,
  youtube_url   text,
  collection_id uuid,
  user_id       uuid,
  created_at    timestamptz,
  duration      integer
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, title, description, tags, thumbnail_url, youtube_url,
         collection_id, user_id, created_at, duration
  FROM public.videos
  WHERE search_vector @@ plainto_tsquery('english', query)
    AND user_id = auth.uid()
  ORDER BY ts_rank(search_vector, plainto_tsquery('english', query)) DESC;
$$;
