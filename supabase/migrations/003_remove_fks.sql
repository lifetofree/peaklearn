-- Remove foreign key constraints to allow demo data without auth users
-- This allows inserting data without requiring auth.users records

-- Drop and recreate users table without foreign key
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Drop and recreate collections user_id foreign key
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_user_id_fkey;

-- Drop and recreate videos user_id foreign key
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_user_id_fkey;

-- Drop and recreate content created_by foreign key
ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_created_by_fkey;

-- Drop and recreate content_versions foreign keys
ALTER TABLE public.content_versions DROP CONSTRAINT IF EXISTS content_versions_content_id_fkey;

-- Drop and recreate comments foreign keys
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_content_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_created_by_fkey;
