-- Run this in Supabase SQL Editor
-- We need a secure way to create users without needing the Service Role Key on the frontend.
-- Supabase exposes an auth.admin function, but only to service roles.
-- Let's create a Postgres function that the frontend can call via RPC to create a new user.

-- Note: This is an advanced technique using a security definer function to bypass the normal signup flow
-- and auto-assign the staff role.

CREATE OR REPLACE FUNCTION public.create_staff_user(
  email text,
  password text
) RETURNS void AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into auth.users manually. 
  -- (In Supabase, this is normally handled by their GoTrue server, so we must mock the necessary fields)
  -- This approach uses the built-in crypt function for the password.
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  ) RETURNING id INTO new_user_id;

  -- The trigger we created in 004_rbac_schema.sql will automatically
  -- add this user to the public.user_roles table as 'staff'.

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
