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
  -- Ensure the person calling this is an admin
  IF (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can create users';
  END IF;

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

  -- Create a matching identity in auth.identities to prevent the GoTrue "Database error querying schema"
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text, -- provider_id is the user_id for email/password auth
    format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}', new_user_id, email)::jsonb,
    'email',
    current_timestamp,
    current_timestamp
  );

  -- The trigger we created in 004_rbac_schema.sql will automatically
  -- add this user to the public.user_roles table as 'staff'.

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
