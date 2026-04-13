-- Role-Based Access Control (RBAC) Setup
-- Run this script in the Supabase SQL Editor

-- 1. Create a User Roles table linked to auth.users
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Setup Row Level Security for Roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read roles (so the app knows who is who)
CREATE POLICY "Enable read access for all authenticated users" 
ON user_roles FOR SELECT TO authenticated USING (true);

-- 3. Create a Trigger to automatically assign the 'admin' role to the first user
-- and 'staff' to everyone else upon sign up. (You can manually change roles in Supabase later).
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  -- Check how many users exist
  SELECT count(*) INTO user_count FROM auth.users;
  
  -- If it's the first user, make them an admin. Otherwise, staff.
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- IMPORTANT: To assign roles to your EXISTING users, run this manually once:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
