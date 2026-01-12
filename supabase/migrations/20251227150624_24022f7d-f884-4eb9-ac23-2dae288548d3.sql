-- Add feed_hash column to store Crossbar feedHash for Oracle Quotes settlement
ALTER TABLE public.feeds ADD COLUMN feed_hash text;

-- Add index for faster lookups by feed_hash
CREATE INDEX idx_feeds_feed_hash ON public.feeds(feed_hash);