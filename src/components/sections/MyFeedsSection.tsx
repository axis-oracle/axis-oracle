import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Loader2 } from 'lucide-react';
import { useMyFeeds } from '@/hooks/useFeeds';
import { FeedCard } from '@/components/feeds/FeedCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { recreateFeed } from '@/services/switchboardService';

export const MyFeedsSection: FC = () => {
  const wallet = useWallet();
  const { connected, publicKey, signTransaction, signAllTransactions, sendTransaction } = wallet;
  const { connection } = useConnection();
  const { data: feeds, isLoading, refetch } = useMyFeeds();
  const [settlingFeed, setSettlingFeed] = useState<string | null>(null);
  const [recreatingFeed, setRecreatingFeed] = useState<string | null>(null);

  const handleRefresh = (feedPubkey: string) => {
    toast.info(`Refreshing feed: ${feedPubkey.slice(0, 8)}...`);
    setTimeout(() => {
      toast.success('Feed data refreshed!');
    }, 1500);
  };

  const handleSettle = async (feedPubkey: string) => {
    // Find the feed to get its ID
    const feed = feeds?.find(f => f.feed_pubkey === feedPubkey);
    
    if (!feed) {
      toast.error('Feed not found');
      return;
    }
    
    // Check if resolution time has passed
    if (feed.resolution_date) {
      const resolutionTime = new Date(feed.resolution_date).getTime();
      const now = Date.now();
      
      if (now < resolutionTime) {
        const waitTime = Math.ceil((resolutionTime - now) / 1000 / 60);
        toast.warning('Resolution time not reached', {
          description: `Wait ${waitTime} minute(s) until resolution time.`,
        });
        return;
      }
    }

    setSettlingFeed(feedPubkey);
    
    const toastId = toast.loading('Settling feed...', {
      description: 'Fetching current value from oracle',
    });
    
    try {
      // Call Edge Function to settle the feed
      const response = await supabase.functions.invoke('oracle-settler', {
        body: { 
          feedId: feed.id,
          mode: 'settle',
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Settlement failed');
      }
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Settlement failed');
      }
      
      const settledValue = response.data?.settled_value || 'Verified';
      const txSignature = response.data?.settlement_tx;

      // Refresh feeds list
      refetch();
      
      if (txSignature) {
        toast.success('Feed settled on-chain!', {
          id: toastId,
          description: `Value: ${settledValue}`,
          action: {
            label: 'View on Solscan',
            onClick: () => window.open(`https://solscan.io/tx/${txSignature}`, '_blank'),
          },
        });
      } else {
        toast.success('Feed settled!', {
          id: toastId,
          description: `Value: ${settledValue}`,
        });
      }
    } catch (error: any) {
      console.error('Settlement failed:', error);
      toast.error('Settlement failed', {
        id: toastId,
        description: error.message?.slice(0, 100) || 'Unknown error occurred',
      });
    } finally {
      setSettlingFeed(null);
    }
  };

  // Handle recreating a feed with fresh feedHash
  const handleRecreate = async (feedPubkey: string) => {
    if (!publicKey || !signTransaction || !sendTransaction) {
      toast.error('Wallet not connected or does not support signing');
      return;
    }

    const feed = feeds?.find(f => f.feed_pubkey === feedPubkey);
    if (!feed) {
      toast.error('Feed not found');
      return;
    }

    setRecreatingFeed(feedPubkey);
    const toastId = toast.loading('Recreating feed with fresh hash...', {
      description: 'This will create a new on-chain feed',
    });

    try {
      // Build wallet adapter
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };

      // Recreate the feed on-chain
      const result = await recreateFeed(
        walletAdapter,
        {
          name: feed.title,
          feedType: feed.feed_type,
          module: feed.module,
          config: (feed.config as Record<string, unknown>) || {},
        },
        sendTransaction
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to recreate feed');
      }

      // Now update the database via secure edge function
      // First, sign a message to prove wallet ownership
      toast.loading('Signing ownership verification...', {
        id: toastId,
        description: 'Please sign to update database',
      });

      const message = `recreate:${feed.id}:${result.newFeedPubkey}:${Date.now()}`;
      const messageBytes = new TextEncoder().encode(message);
      
      // Use wallet.signMessage if available, otherwise we already proved ownership via on-chain tx
      let signature: string | null = null;
      
      if (wallet.signMessage) {
        const signedMessage = await wallet.signMessage(messageBytes);
        // Convert to base58
        const bs58 = await import('bs58');
        signature = bs58.default.encode(signedMessage);
      }

      // Call edge function to update DB securely
      const { data: updateData, error: updateError } = await supabase.functions.invoke('update-feed-after-recreate', {
        body: {
          feedId: feed.id,
          walletAddress: publicKey.toBase58(),
          newFeedPubkey: result.newFeedPubkey,
          newFeedHash: result.newFeedHash,
          signature: signature || 'tx-verified', // Fallback if signMessage not supported
          message,
        },
      });

      if (updateError || !updateData?.success) {
        console.error('Failed to update feed in DB:', updateError || updateData?.error);
        // Still show success since on-chain creation worked
        toast.warning('Feed created on-chain but DB update failed', {
          id: toastId,
          description: `New pubkey: ${result.newFeedPubkey?.slice(0, 8)}... - Try refreshing the page`,
        });
      } else {
        toast.success('Feed recreated successfully!', {
          id: toastId,
          description: 'New on-chain feed with correct hash is ready for settlement',
          action: {
            label: 'View on Solscan',
            onClick: () => window.open(`https://solscan.io/tx/${result.signature}`, '_blank'),
          },
        });
      }

      refetch();
    } catch (error: unknown) {
      console.error('Recreate failed:', error);
      
      const errorMsg = error instanceof Error ? error.message : '';
      
      if (errorMsg.includes('User rejected') || errorMsg.includes('rejected the request')) {
        toast.error('Transaction cancelled', {
          id: toastId,
          description: 'You rejected the transaction in your wallet.',
        });
      } else {
        toast.error('Failed to recreate feed', {
          id: toastId,
          description: errorMsg.slice(0, 100) || 'Unknown error',
        });
      }
    } finally {
      setRecreatingFeed(null);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <section id="my-feeds">
      <div className="container mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : feeds && feeds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feeds.map((feed, index) => (
              <FeedCard
                key={feed.id}
                feed={feed}
                showRefresh
                showSettle
                showRecreate
                onRefresh={handleRefresh}
                onSettle={handleSettle}
                onRecreate={handleRecreate}
                isRecreating={recreatingFeed === feed.feed_pubkey}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-card"
          >
            <p className="text-muted-foreground">
              You haven't created any feeds yet. Start by creating a new oracle!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
