-- Add retry_count column to track settlement attempts
ALTER TABLE public.feeds 
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0;

-- Add index for efficient querying of feeds to process
CREATE INDEX IF NOT EXISTS idx_feeds_status_resolution 
ON public.feeds (status, resolution_date) 
WHERE status IN ('pending', 'processing', 'failed');