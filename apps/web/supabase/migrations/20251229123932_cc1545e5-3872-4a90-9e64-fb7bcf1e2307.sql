-- Drop the old status check constraint
ALTER TABLE public.feeds DROP CONSTRAINT IF EXISTS feeds_status_check;

-- Add new constraint with all required statuses
ALTER TABLE public.feeds ADD CONSTRAINT feeds_status_check 
CHECK (status IN ('pending', 'processing', 'settled', 'failed', 'permanently_failed', 'manual'));