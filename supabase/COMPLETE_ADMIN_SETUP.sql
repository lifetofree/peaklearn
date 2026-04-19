-- ===================================================================
-- COMPLETE ADMIN SETUP SCRIPT
-- Run this in Supabase SQL Editor to set up admin functionality
-- ===================================================================

-- Step 1: Add admin fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Add disabled user support
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_is_super_admin ON public.users(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_users_is_disabled ON public.users(is_disabled);

-- Step 4: Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

-- Step 5: Create helper function to check if user is NOT disabled
CREATE OR REPLACE FUNCTION public.is_not_disabled()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN TRUE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_disabled = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update users" ON public.users;
DROP POLICY IF EXISTS "Enforce non-disabled on users" ON public.users;

-- Step 8: Create RESTRICTIVE policy to block disabled users
CREATE POLICY "Enforce non-disabled on users" ON public.users AS RESTRICTIVE FOR ALL USING (is_not_disabled());

-- Step 9: Create permissive policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Super admins can update users"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR public.is_super_admin())
  WITH CHECK (auth.uid() = id OR public.is_super_admin());

-- Step 10: Create function to ensure super admin status
CREATE OR REPLACE FUNCTION public.ensure_super_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.users (id, email, role, is_super_admin, is_admin)
  SELECT
    id,
    email,
    'owner' as role,
    TRUE as is_super_admin,
    TRUE as is_admin
  FROM auth.users
  WHERE email = user_email
  ON CONFLICT (id) DO UPDATE SET
    is_super_admin = TRUE,
    is_admin = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create function to set up predefined super admins
CREATE OR REPLACE FUNCTION public.setup_super_admins()
RETURNS TEXT AS $$
DECLARE
  result TEXT := '';
BEGIN
  -- Set phon@adduckivity.com as super admin
  PERFORM public.ensure_super_admin('phon@adduckivity.com');

  -- Set dev@peaklearn.local as super admin
  PERFORM public.ensure_super_admin('dev@peaklearn.local');

  result := 'Super admins setup completed';
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create function to add user to system
CREATE OR REPLACE FUNCTION public.add_user_to_system(
  add_email TEXT,
  add_role TEXT DEFAULT 'viewer',
  add_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  user_record RECORD;
  result JSONB := '{"success": false}';
BEGIN
  -- Find user in auth.users
  SELECT id, email INTO user_record
  FROM auth.users
  WHERE email = add_email;

  IF user_record IS NULL THEN
    result := jsonb_build_object(
      'success', false,
      'error', 'User not found in auth.users. User must log in first.'
    );
    RETURN result;
  END IF;

  -- Insert or update user in public.users
  INSERT INTO public.users (id, email, role, is_admin, is_super_admin)
  VALUES (
    user_record.id,
    user_record.email,
    add_role,
    add_is_admin,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin;

  result := jsonb_build_object(
    'success', true,
    'message', 'User added to system successfully'
  );
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Verify setup
SELECT
  'Setup Complete!' as status,
  'You can now access /admin/manage' as next_step;

SELECT
  id,
  email,
  is_admin,
  is_super_admin,
  is_disabled,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
