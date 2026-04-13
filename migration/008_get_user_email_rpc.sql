-- Run this in Supabase SQL Editor

-- We need a secure way for Admins to lookup a staff member's email
-- since the frontend cannot query auth.users directly.

CREATE OR REPLACE FUNCTION public.get_user_email_by_id(p_user_id uuid)
RETURNS text AS $$
DECLARE
  found_email text;
BEGIN
  -- Ensure the person calling this is an admin
  IF (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can retrieve user emails';
  END IF;

  SELECT email INTO found_email FROM auth.users WHERE id = p_user_id LIMIT 1;
  
  RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;