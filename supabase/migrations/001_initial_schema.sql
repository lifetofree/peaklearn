-- Enable UUID extension (for older PostgreSQL versions)
-- Note: PostgreSQL 13+ has gen_random_uuid() built-in
-- We'll use gen_random_uuid() by default for better compatibility

-- Create users table (extends auth.users with additional fields)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'contributor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  tags TEXT[] DEFAULT '{}',
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content table
CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_versions table (for versioning)
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  body JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table (optional)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_collection_id ON public.videos(collection_id);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON public.videos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_created_by ON public.content(created_by);
CREATE INDEX IF NOT EXISTS idx_content_tags ON public.content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON public.content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_content_id ON public.comments(content_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policies for collections
CREATE POLICY "Users can view own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for videos
CREATE POLICY "Users can view own videos"
  ON public.videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for content
CREATE POLICY "Users can view own content"
  ON public.content FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create own content"
  ON public.content FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own content"
  ON public.content FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own content"
  ON public.content FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for content_versions
CREATE POLICY "Users can view own content versions"
  ON public.content_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.content
    WHERE content.id = content_versions.content_id
    AND content.created_by = auth.uid()
  ));

CREATE POLICY "Users can create own content versions"
  ON public.content_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.content
    WHERE content.id = content_versions.content_id
    AND content.created_by = auth.uid()
  ));

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

-- RLS Policies for comments
CREATE POLICY "Users can view own comments"
  ON public.comments FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = created_by);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'owner');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user deletion
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_deletion();
