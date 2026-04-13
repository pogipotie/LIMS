-- 1. Add full_name column to user_roles table
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- 2. Update the trigger function to capture full_name from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
  assigned_role VARCHAR(50);
  user_name VARCHAR(255);
BEGIN
  -- Extract full_name from metadata if provided during signup
  user_name := NEW.raw_user_meta_data->>'full_name';

  -- Check how many users exist
  SELECT count(*) INTO user_count FROM auth.users;
  
  -- If it's the first user, make them an admin. Otherwise, staff.
  IF user_count = 1 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'staff';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role, full_name) 
  VALUES (NEW.id, assigned_role, user_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
