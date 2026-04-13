-- LIMS Project Supabase SQL Schema
-- Full Migration Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better data integrity
CREATE TYPE livestock_category AS ENUM ('Mature (Ram)', 'Mature (Ewe)', 'Lamb (Male)', 'Lamb (Female)', 'Weaner', 'Grower');
CREATE TYPE livestock_gender AS ENUM ('male', 'female');
CREATE TYPE transaction_type AS ENUM ('birth', 'purchase', 'sale', 'death', 'transfer_in', 'transfer_out');
CREATE TYPE livestock_status AS ENUM ('active', 'deceased', 'sold', 'transferred_out');

-- 1. Create Livestock Table
CREATE TABLE IF NOT EXISTS public.livestock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_number TEXT UNIQUE, -- Optional identifier, very common in LIMS
  name TEXT,
  category livestock_category NOT NULL,
  gender livestock_gender NOT NULL,
  birth_date DATE NOT NULL,
  status livestock_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestock_id UUID NOT NULL REFERENCES public.livestock(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10, 2), -- Useful for tracking purchases and sales value
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS)
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Livestock
CREATE POLICY "Allow authenticated users full access to livestock"
  ON public.livestock
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for Transactions
CREATE POLICY "Allow authenticated users full access to transactions"
  ON public.transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Set up Auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_livestock_updated_at
  BEFORE UPDATE ON public.livestock
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- 5. Enable Real-Time
-- (Drops and recreates publication to ensure tables are added properly without error)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.livestock;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- 6. Trigger to auto-update Livestock Status based on Transactions
-- (E.g. If an animal dies, it automatically updates its status to 'deceased')
CREATE OR REPLACE FUNCTION update_livestock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'death' THEN
    UPDATE public.livestock SET status = 'deceased' WHERE id = NEW.livestock_id;
  ELSIF NEW.type = 'sale' THEN
    UPDATE public.livestock SET status = 'sold' WHERE id = NEW.livestock_id;
  ELSIF NEW.type = 'transfer_out' THEN
    UPDATE public.livestock SET status = 'transferred_out' WHERE id = NEW.livestock_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE update_livestock_status();
