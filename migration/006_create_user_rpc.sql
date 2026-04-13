-- Run this in Supabase SQL Editor
-- (DEPRECATED: We are now using the standard Supabase Auth API instead of this RPC)
-- This file is kept for historical/rollback purposes.
-- The standard `supabase.auth.signUp()` handles GoTrue schema compliance and email confirmations much better.

DROP FUNCTION IF EXISTS public.create_staff_user(text, text);

-- If we ever need to re-implement an RPC, we should use a Supabase Edge Function with the Admin API
-- instead of raw SQL inserts to prevent GoTrue schema corruption.
