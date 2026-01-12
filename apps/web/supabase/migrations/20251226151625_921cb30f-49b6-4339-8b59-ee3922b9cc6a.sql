-- Create feeds table to store all created oracle feeds
CREATE TABLE public.feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  feed_pubkey TEXT NOT NULL,
  title TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  module TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all feeds (public showcase)
CREATE POLICY "Feeds are publicly viewable" 
ON public.feeds 
FOR SELECT 
USING (true);

-- Policy: Anyone can insert feeds (wallet-based auth, not Supabase auth)
CREATE POLICY "Anyone can create feeds" 
ON public.feeds 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feeds_updated_at
BEFORE UPDATE ON public.feeds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for feeds table
ALTER PUBLICATION supabase_realtime ADD TABLE public.feeds;