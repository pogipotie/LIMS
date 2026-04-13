-- 011_livestock_auto_derecognition.sql
-- Add status to livestock table and create a trigger to auto-update it when transactions are approved

-- 1. Add status column to livestock table (if it doesn't exist)
ALTER TABLE public.livestock 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Update any existing null statuses to active
UPDATE public.livestock SET status = 'active' WHERE status IS NULL;

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION public.update_livestock_status_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the transaction validation status was just updated to 'approved'
    IF NEW.validation_status = 'approved' AND (OLD.validation_status IS NULL OR OLD.validation_status != 'approved') THEN
        
        -- Derecognize if mortality/death
        IF NEW.type = 'death' THEN
            UPDATE public.livestock SET status = 'deceased' WHERE id = NEW.livestock_id;
        
        -- Derecognize if sale
        ELSIF NEW.type = 'sale' THEN
            UPDATE public.livestock SET status = 'sold' WHERE id = NEW.livestock_id;
            
        -- Derecognize if transfer_out
        ELSIF NEW.type = 'transfer_out' THEN
            UPDATE public.livestock SET status = 'transferred' WHERE id = NEW.livestock_id;
            
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind the trigger to the transactions table
DROP TRIGGER IF EXISTS on_transaction_approved ON public.transactions;
CREATE TRIGGER on_transaction_approved
    AFTER UPDATE ON public.transactions
    FOR EACH ROW EXECUTE PROCEDURE public.update_livestock_status_on_approval();
