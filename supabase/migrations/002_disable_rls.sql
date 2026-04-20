-- Disable RLS for all tables to allow public access
-- This removes authentication requirement for demo purposes

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
