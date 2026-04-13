-- Run this in Supabase SQL Editor
-- We need RPC functions to securely delete users and update their roles

-- 1. Function to delete a user from auth.users (cascades to user_roles)
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Ensure the person calling this is an admin
  IF (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;

  -- Prevent deleting yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to update a user's role
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role varchar)
RETURNS void AS $$
BEGIN
  -- Ensure the person calling this is an admin
  IF (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can change roles';
  END IF;

  -- Prevent changing your own role (to prevent accidental lockout)
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;

  UPDATE public.user_roles SET role = new_role WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
