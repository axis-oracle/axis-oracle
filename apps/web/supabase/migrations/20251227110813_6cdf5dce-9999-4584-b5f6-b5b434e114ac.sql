-- Add columns for oracle automation tracking
ALTER TABLE public.feeds 
ADD COLUMN IF NOT EXISTS resolution_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'failed', 'manual')),
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS settled_value TEXT;

-- Create index for efficient querying of pending feeds
CREATE INDEX IF NOT EXISTS idx_feeds_pending_resolution 
ON public.feeds (resolution_date) 
WHERE status = 'pending';

-- Update existing feeds to have 'pending' status
UPDATE public.feeds SET status = 'pending' WHERE status IS NULL;