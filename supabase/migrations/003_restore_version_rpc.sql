-- Atomic content version restore RPC
-- Saves current body as a new version, then restores the target version — all in one transaction.
-- Run with: supabase db push  (or apply via Supabase Studio SQL editor)

CREATE OR REPLACE FUNCTION public.restore_content_version(
  p_content_id uuid,
  p_version_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current_body  jsonb;
  v_restore_body  jsonb;
  v_next_version  integer;
BEGIN
  -- Verify the caller owns this content
  IF NOT EXISTS (
    SELECT 1 FROM public.content
    WHERE id = p_content_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Read current body (will become the new version snapshot)
  SELECT body INTO v_current_body
  FROM public.content
  WHERE id = p_content_id;

  -- Compute next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
  FROM public.content_versions
  WHERE content_id = p_content_id;

  -- Save current state as a new version (preserves history)
  INSERT INTO public.content_versions (content_id, body, version_number)
  VALUES (p_content_id, v_current_body, v_next_version);

  -- Get the body from the requested version
  SELECT body INTO v_restore_body
  FROM public.content_versions
  WHERE id = p_version_id AND content_id = p_content_id;

  IF v_restore_body IS NULL THEN
    RAISE EXCEPTION 'Version not found';
  END IF;

  -- Restore
  UPDATE public.content
  SET body = v_restore_body, updated_at = NOW()
  WHERE id = p_content_id;
END;
$$;
