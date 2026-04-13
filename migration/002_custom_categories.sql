-- LIMS Project Supabase SQL Schema
-- 002_custom_categories.sql

-- 1. Create a new table to store dynamic categories
CREATE TABLE IF NOT EXISTS public.livestock_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert the existing hardcoded categories so we don't break existing data
INSERT INTO public.livestock_categories (name) VALUES 
  ('Mature (Ram)'), 
  ('Mature (Ewe)'), 
  ('Lamb (Male)'), 
  ('Lamb (Female)'), 
  ('Weaner'), 
  ('Grower')
ON CONFLICT (name) DO NOTHING;

-- 3. We have to change the `livestock` table to drop the ENUM restriction and convert it to standard TEXT
ALTER TABLE public.livestock ALTER COLUMN category TYPE TEXT USING category::text;

-- 4. Set up Row Level Security (RLS) for the new table
ALTER TABLE public.livestock_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users full access to categories"
  ON public.livestock_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestock_categories;
