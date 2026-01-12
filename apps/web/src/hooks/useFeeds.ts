import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Feed {
  id: string;
  wallet_address: string;
  feed_pubkey: string;
  feed_hash: string | null;
  title: string;
  feed_type: string;
  module: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  resolution_date: string | null;
  status: string | null;
  settled_at: string | null;
  settled_value: string | null;
  settlement_tx: string | null;
  retry_count: number | null;
}

export const useFeeds = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['feeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feed[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('feeds-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feeds',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['feeds'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useMyFeeds = () => {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  return useQuery({
    queryKey: ['my-feeds', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];

      const { data, error } = await supabase
        .from('feeds')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feed[];
    },
    enabled: !!walletAddress,
  });
};
