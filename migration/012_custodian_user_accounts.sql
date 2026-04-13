-- 012_custodian_user_accounts.sql
-- Transition Custodians from a standalone table to actual User Accounts (RBAC)

-- 0. Update the check constraint on the user_roles table to allow 'custodian'
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'staff', 'custodian'));

-- 1. Modify the handle_new_user trigger to accept a role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
  assigned_role VARCHAR(50);
  user_name VARCHAR(255);
  requested_role VARCHAR(50);
BEGIN
  -- Extract full_name from metadata if provided during signup
  user_name := NEW.raw_user_meta_data->>'full_name';
  requested_role := NEW.raw_user_meta_data->>'role';

  -- Check how many users exist
  SELECT count(*) INTO user_count FROM auth.users;
  
  -- If it's the first user, make them an admin.
  IF user_count = 1 THEN
    assigned_role := 'admin';
  ELSE
    -- If a specific role was requested (e.g., 'custodian' or 'staff'), assign it. Otherwise default to 'staff'
    IF requested_role IN ('admin', 'staff', 'custodian') THEN
      assigned_role := requested_role;
    ELSE
      assigned_role := 'staff';
    END IF;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role, full_name) 
  VALUES (NEW.id, assigned_role, user_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the old foreign key constraint on livestock.custodian_id
ALTER TABLE public.livestock DROP CONSTRAINT IF EXISTS livestock_custodian_id_fkey;

-- 3. Add a new foreign key pointing to public.user_roles(user_id)
-- Note: existing custodian UUIDs that don't exist in user_roles will violate this if not handled.
-- For a clean dev transition, we can nullify old custodians:
UPDATE public.livestock SET custodian_id = NULL WHERE custodian_id NOT IN (SELECT user_id FROM public.user_roles);

ALTER TABLE public.livestock
  ADD CONSTRAINT livestock_custodian_user_fkey 
  FOREIGN KEY (custodian_id) REFERENCES public.user_roles(user_id) ON DELETE SET NULL;
