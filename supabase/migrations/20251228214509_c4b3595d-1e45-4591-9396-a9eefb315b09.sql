-- Remove the dangerous UPDATE policy that allows anyone to update any feed
DROP POLICY IF EXISTS "Anyone can update feeds" ON public.feeds;

-- Note: oracle-settler edge function uses SERVICE_ROLE_KEY which bypasses RLS
-- Client-side updates now go through the secure edge function update-feed-after-recreate
-- which verifies wallet ownership via Ed25519 signature before updating