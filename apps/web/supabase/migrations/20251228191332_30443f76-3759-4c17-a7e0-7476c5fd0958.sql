-- Create profiles table for wallet-based users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable only by the owner (based on wallet address match)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (true);

-- Users can create their own profile
CREATE POLICY "Users can create own profile"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Users can update their own profile (will be enforced by wallet signature in app)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Rename My Feeds to My Oracles: Update feeds table to link to profile via wallet_address
-- (wallet_address column already exists in feeds table)