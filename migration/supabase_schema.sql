-- LIMS Project Supabase SQL Schema

-- 1. Create the livestock table
CREATE TABLE IF NOT EXISTS public.livestock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT NOT NULL, -- e.g. 'Mature (Ram)', 'Mature (Ewe)', 'Lamb (Male)', 'Lamb (Female)', 'Weaner', 'Grower'
  gender TEXT CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestock_id UUID NOT NULL REFERENCES public.livestock(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('birth', 'purchase', 'sale', 'death', 'transfer_in', 'transfer_out')),
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT
);

-- 3. Set up Row Level Security (RLS) policies
-- Note: These policies currently allow all authenticated users to read/write.
-- You can restrict this later based on specific user roles.

ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access on livestock" 
  ON public.livestock 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on transactions" 
  ON public.transactions 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- 4. Enable real-time for both tables
alter publication supabase_realtime add table public.livestock;
alter publication supabase_realtime add table public.transactions;

-- 5. Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_livestock_updated_at
  before update on public.livestock
  for each row
  execute procedure public.handle_updated_at();
