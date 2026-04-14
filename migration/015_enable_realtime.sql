-- 015_enable_realtime.sql
-- Enable Supabase Realtime for LIMS core tables so the Dashboard updates instantly without refreshing.

BEGIN;

-- Add the core tables to the 'supabase_realtime' publication
-- If a table is already in the publication, this will just gracefully ignore or succeed depending on Postgres version.
-- For safety, we drop and recreate if needed, but standard ALTER is best:

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'livestock') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.livestock;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'transactions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'logbooks') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.logbooks;
    END IF;
END $$;

COMMIT;
