-- University / College LIMS Compliance Schema Update
-- Run this script in the Supabase SQL Editor

-- 1. Create Custodians / End-Users Table
CREATE TABLE IF NOT EXISTS custodians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  contact_info VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add Custodian Reference to Livestock Table
ALTER TABLE livestock
ADD COLUMN custodian_id UUID REFERENCES custodians(id) ON DELETE SET NULL;

-- 3. Create Daily/Weekly Logbook Table (Health & Monitoring)
CREATE TABLE IF NOT EXISTS logbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestock_id UUID NOT NULL REFERENCES livestock(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  health_status VARCHAR(50) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'sick', 'injured', 'under_observation')),
  remarks TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Assuming logged in user records this
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Update Transactions Table for COA/Property Office Rules
ALTER TABLE transactions
ADD COLUMN validation_status VARCHAR(50) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN document_url TEXT, -- For storing Notice of Loss, Veterinary Certificate, or ICS/PAR links
ADD COLUMN validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN validation_date TIMESTAMP WITH TIME ZONE;

-- 5. Set up RLS for new tables (Assuming authenticated users have access)
ALTER TABLE custodians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON custodians FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON custodians FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON custodians FOR UPDATE TO authenticated USING (true);

ALTER TABLE logbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON logbooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON logbooks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON logbooks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for authenticated users" ON logbooks FOR DELETE TO authenticated USING (true);
