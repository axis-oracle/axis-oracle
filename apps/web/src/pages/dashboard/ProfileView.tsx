import { FC, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, User, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedCard } from '@/components/feeds/FeedCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Feed } from '@/hooks/useFeeds';

interface Profile {
  id: string;
  wallet_address: string;
  username: string | null;
  created_at: string;
}

const ProfileView: FC = () => {
  const { walletAddress: paramWallet } = useParams<{ walletAddress?: string }>();
  const { connected, publicKey } = useWallet();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [oracles, setOracles] = useState<Feed[]>([]);
  const [isLoadingOracles, setIsLoadingOracles] = useState(false);

  const currentUserWallet = publicKey?.toBase58() || '';
  // If viewing a specific profile via URL param, use that; otherwise show current user's profile
  const viewingWallet = paramWallet || currentUserWallet;
  const isOwnProfile = viewingWallet === currentUserWallet && connected;

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!viewingWallet) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', viewingWallet)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setProfile(data);
          setUsername(data.username || '');
        } else if (isOwnProfile) {
          // Create new profile for current user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ wallet_address: viewingWallet })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }

          setProfile(newProfile);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [viewingWallet, isOwnProfile]);

  // Fetch oracles for this wallet
  useEffect(() => {
    const fetchOracles = async () => {
      if (!viewingWallet) return;
      
      setIsLoadingOracles(true);
      try {
        const { data, error } = await supabase
          .from('feeds')
          .select('*')
          .eq('wallet_address', viewingWallet)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching oracles:', error);
          return;
        }

        setOracles((data || []) as Feed[]);
      } finally {
        setIsLoadingOracles(false);
      }
    };

    fetchOracles();
  }, [viewingWallet]);

  const handleSaveUsername = async () => {
    if (!profile || !isOwnProfile) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() || null })
        .eq('wallet_address', viewingWallet);

      if (error) {
        toast.error('Failed to save username');
        console.error('Error saving username:', error);
        return;
      }

      setProfile({ ...profile, username: username.trim() || null });
      toast.success('Username saved!');
    } finally {
      setIsSaving(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(viewingWallet);
    setCopied(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // No wallet connected and no URL param
  if (!viewingWallet) {
    return (
      <div className="py-8 px-4 md:px-6">
        <section className="mb-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight"
            >
              Your <span className="text-gradient-gold">Profile</span>
            </motion.h1>
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your Solana wallet to view and edit your profile.
          </p>
        </motion.div>
      </div>
    );
  }

  const displayName = profile?.username || viewingWallet.slice(0, 5);

  return (
    <div className="py-8 px-4 md:px-6">
      {/* Header */}
      <section className="mb-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight"
          >
            {isOwnProfile ? 'Your' : ''} <span className="text-gradient-gold">Profile</span>
          </motion.h1>
          {!isOwnProfile && profile?.username && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              Viewing {profile.username}'s profile
            </motion.p>
          )}
        </div>
      </section>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-10"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">
                  {displayName}
                </CardTitle>
                <CardDescription>
                  {profile ? `Member since ${new Date(profile.created_at).toLocaleDateString()}` : 'Loading...'}
                </CardDescription>
              </div>
              {!isOwnProfile && (
                <a
                  href={`https://solscan.io/account/${viewingWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Wallet Address</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    <a
                      href={`https://solscan.io/account/${viewingWallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground font-mono flex-1 hover:text-primary transition-colors"
                    >
                      {truncateAddress(viewingWallet)}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyAddress}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a
                        href={`https://solscan.io/account/${viewingWallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Username - Editable only for own profile */}
                {isOwnProfile ? (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <div className="flex gap-2">
                      <Input
                        id="username"
                        placeholder="Enter your username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex-1"
                        maxLength={32}
                      />
                      <Button
                        onClick={handleSaveUsername}
                        disabled={isSaving || username === (profile?.username || '')}
                        variant="gold"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your username will be displayed publicly on your oracles.
                    </p>
                  </div>
                ) : profile?.username && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Username</Label>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <span className="text-sm font-medium">{profile.username}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Oracles Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          {isOwnProfile ? 'My' : ''} <span className="text-gradient-gold">Oracles</span>
          <span className="ml-2 text-base font-normal text-muted-foreground">({oracles.length})</span>
        </h2>

        {isLoadingOracles ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : oracles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isOwnProfile ? "You haven't created any oracles yet." : "This user hasn't created any oracles yet."}
            </p>
            {isOwnProfile && (
              <Button asChild variant="gold" className="mt-4">
                <Link to="/app">Create Your First Oracle</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oracles.map((oracle, index) => (
              <FeedCard
                key={oracle.id}
                feed={oracle}
                index={index}
                showIntegration={isOwnProfile}
                showSettle={false}
                showRefresh={false}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileView;
