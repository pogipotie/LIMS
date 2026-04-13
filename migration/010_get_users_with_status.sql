-- 010_get_users_with_status.sql
-- Create an RPC to fetch user roles along with their auth email and confirmation status

CREATE OR REPLACE FUNCTION public.get_users_with_status()
RETURNS TABLE (
    user_id UUID,
    role VARCHAR,
    full_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    email VARCHAR,
    email_confirmed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- SECURITY DEFINER allows this function to read from auth.users
    -- while being called by any authenticated user (or restricted to admins if needed)
    RETURN QUERY
    SELECT 
        ur.user_id,
        ur.role,
        ur.full_name,
        ur.created_at,
        au.email::VARCHAR,
        au.email_confirmed_at
    FROM public.user_roles ur
    JOIN auth.users au ON ur.user_id = au.id
    ORDER BY ur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
