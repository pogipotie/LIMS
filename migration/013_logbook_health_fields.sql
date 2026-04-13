-- 013_logbook_health_fields.sql
-- Enhance the Health Logbook schema to support detailed medical tracking (vaccines, treatments, weight)

-- 1. Add new columns to the logbooks table
ALTER TABLE public.logbooks 
ADD COLUMN IF NOT EXISTS record_type VARCHAR(50) DEFAULT 'Routine Check',
ADD COLUMN IF NOT EXISTS treatment VARCHAR(255),
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2);

-- 2. Add check constraint for valid record types to ensure data consistency
ALTER TABLE public.logbooks DROP CONSTRAINT IF EXISTS logbooks_record_type_check;
ALTER TABLE public.logbooks ADD CONSTRAINT logbooks_record_type_check 
CHECK (record_type IN ('Routine Check', 'Vaccination', 'Treatment', 'Deworming', 'Other'));
