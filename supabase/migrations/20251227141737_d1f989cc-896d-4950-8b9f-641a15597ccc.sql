-- Add settlement_tx column to store on-chain transaction signature
ALTER TABLE public.feeds ADD COLUMN IF NOT EXISTS settlement_tx TEXT;

-- Add UPDATE policy for feeds (currently missing - needed for saving settlement_tx)
CREATE POLICY "Anyone can update feeds" 
ON public.feeds 
FOR UPDATE 
USING (true) 
WITH CHECK (true);