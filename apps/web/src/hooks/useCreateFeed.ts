import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ModuleType, MIN_BALANCE_SOL } from '@/config/constants';
import { toast } from 'sonner';
import { deployOracle, OracleParams } from '@/services/switchboardService';
import type { Json } from '@/integrations/supabase/types';
import { useWalletVerification } from './useWalletVerification';

interface FeedConfig {
  title: string;
  module: ModuleType;
  feedType: string;
  config: Json;
  resolutionDate?: Date;
  moduleId?: string; // Track which module is creating
}

export type DeploymentState = 'idle' | 'checking' | 'signing' | 'deploying' | 'success' | 'error';

export const useCreateFeed = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction, connected } = wallet;
  const navigate = useNavigate();
  const { 
    isVerified, 
    hasMinBalance, 
    canCreateOracle, 
    getStatusMessage,
    refreshBalance,
    isRefreshingBalance,
  } = useWalletVerification();
  
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentState, setDeploymentState] = useState<DeploymentState>('idle');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Manual retry balance check with toast
  const retryBalanceCheck = useCallback(async () => {
    const result = await refreshBalance();
    if (result) {
      toast.success('Balance updated successfully!');
    } else {
      toast.error('Failed to refresh balance', {
        description: 'Please try again or check your network connection.',
      });
    }
    return result;
  }, [refreshBalance]);

  const createFeed = useCallback(
    async (feedConfig: FeedConfig) => {
      console.log('[CreateFeed] Starting, isVerified:', isVerified, 'connected:', connected);
      
      // Pre-flight checks
      if (!connected) {
        toast.error('Please connect your wallet first');
        return null;
      }

      if (!publicKey) {
        toast.error('Wallet not ready');
        return null;
      }

      // Check verification status - also check localStorage directly as a fallback
      const storedVerified = localStorage.getItem('axis_wallet_verified');
      const isStoredVerified = storedVerified ? JSON.parse(storedVerified)[publicKey.toBase58()] === true : false;
      
      console.log('[CreateFeed] isVerified state:', isVerified, 'localStorage:', isStoredVerified);
      
      if (!isVerified && !isStoredVerified) {
        toast.error('Wallet verification required', {
          description: 'Please reconnect your wallet and sign the verification message.',
        });
        return null;
      }

      setActiveModuleId(feedConfig.moduleId || feedConfig.module);
      setIsLoading(true);
      setDeploymentState('checking');

      // Show checking network status
      toast.loading('Checking network status...', {
        id: 'check-network',
      });

      // Always refresh balance before creating
      const hasBalance = await refreshBalance();
      toast.dismiss('check-network');

      // Check balance after refresh
      if (!hasBalance) {
        setDeploymentState('error');
        setIsLoading(false);
        toast.error('Insufficient Balance', {
          description: `You need at least ${MIN_BALANCE_SOL} SOL to create an oracle.`,
          action: {
            label: 'Retry',
            onClick: () => retryBalanceCheck(),
          },
        });
        return null;
      }

      setDeploymentState('signing');

      try {
        // Prepare oracle params for Switchboard
        const oracleParams: OracleParams = {
          name: feedConfig.title,
          feedType: feedConfig.feedType,
          module: feedConfig.module,
          config: feedConfig.config as Record<string, unknown>,
        };

        // Show deploying toast
        toast.loading('Creating Oracle...', {
          id: 'deploy-oracle',
          description: 'Broadcasting transaction to Solana network',
        });

        setDeploymentState('deploying');

        // Deploy oracle using Switchboard service
        const result = await deployOracle(
          { publicKey, signTransaction: wallet.signTransaction },
          oracleParams,
          sendTransaction
        );

        if (!result.success) {
          setDeploymentState('error');
          toast.dismiss('deploy-oracle');
          
          // Handle specific error types
          if (result.error?.includes('cancelled') || result.error?.includes('rejected')) {
            toast.error('Transaction Cancelled', {
              description: 'You cancelled the transaction in your wallet.',
            });
          } else if (result.error?.includes('Insufficient')) {
            toast.error('Insufficient Balance', {
              description: 'You need at least 0.03 SOL to create an oracle.',
            });
          } else if (result.error?.includes('Network') || result.error?.includes('timeout')) {
            toast.error('Network Error', {
              description: 'Failed to connect to Solana. Please try again.',
            });
          } else {
            toast.error('Failed to create oracle', {
              description: result.error || 'Unknown error occurred',
            });
          }
          return null;
        }

        setDeploymentState('success');
        setLastSignature(result.signature || null);
        setShowConfetti(true);

        toast.dismiss('deploy-oracle');
        toast.success('Transaction confirmed on Solana!', {
          description: `Signature: ${result.signature?.slice(0, 8)}...`,
          action: {
            label: 'View on Solscan',
            onClick: () => window.open(`https://solscan.io/tx/${result.signature}`, '_blank'),
          },
        });

        // Save feed to database with resolution date, status, and feed_hash
        const isManualSettle = feedConfig.module === 'esports';
        const { data: feed, error: dbError } = await supabase
          .from('feeds')
          .insert([{
            wallet_address: publicKey.toBase58(),
            feed_pubkey: result.feedPubkey!,
            feed_hash: result.feedHash || null,
            title: feedConfig.title,
            feed_type: feedConfig.feedType,
            module: feedConfig.module,
            config: feedConfig.config,
            resolution_date: feedConfig.resolutionDate?.toISOString() || null,
            status: isManualSettle ? 'manual' : 'pending',
          }])
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          toast.error('Oracle created on-chain but failed to save to database', {
            description: 'Your oracle is live but may not appear in your feeds list.',
          });
          return null;
        }

        toast.success(`Oracle "${feedConfig.title}" created successfully!`, {
          description: `Feed: ${result.feedPubkey?.slice(0, 8)}...${result.feedPubkey?.slice(-4)}`,
          action: {
            label: 'View your Oracle',
            onClick: () => navigate(`/app/explore?feed=${result.feedPubkey}`),
          },
        });

        // Reset state after success
        setTimeout(() => {
          setDeploymentState('idle');
          setShowConfetti(false);
          setActiveModuleId(null);
        }, 5000);

        return feed;
      } catch (error) {
        console.error('Error creating feed:', error);
        setDeploymentState('error');
        toast.dismiss('deploy-oracle');
        toast.error(error instanceof Error ? error.message : 'Failed to create feed');
        return null;
      } finally {
        setIsLoading(false);
        if (deploymentState === 'error') {
          setActiveModuleId(null);
        }
      }
    },
    [connection, publicKey, sendTransaction, wallet.signTransaction, connected, isVerified, hasMinBalance, refreshBalance, retryBalanceCheck]
  );

  // Get button text based on state for specific module
  const getButtonText = useCallback((defaultText: string = 'Create Oracle', moduleId?: string): string => {
    // Only show loading state for the active module
    if (moduleId && activeModuleId && moduleId !== activeModuleId) {
      return defaultText;
    }
    
    switch (deploymentState) {
      case 'checking':
        return 'Checking network...';
      case 'signing':
        return 'Signing...';
      case 'deploying':
        return 'Deploying on Solana...';
      case 'success':
        return 'Created!';
      case 'error':
        return 'Try Again';
      default:
        return defaultText;
    }
  }, [deploymentState, activeModuleId]);

  // Check if specific module is loading
  const isModuleLoading = useCallback((moduleId: string): boolean => {
    return isLoading && activeModuleId === moduleId;
  }, [isLoading, activeModuleId]);

  // Get deployment state for specific module
  const getModuleDeploymentState = useCallback((moduleId: string): DeploymentState => {
    if (activeModuleId === moduleId) {
      return deploymentState;
    }
    return 'idle';
  }, [deploymentState, activeModuleId]);

  return { 
    createFeed, 
    isLoading, 
    deploymentState,
    activeModuleId,
    lastSignature,
    showConfetti,
    setShowConfetti,
    canCreateOracle,
    getButtonText,
    isModuleLoading,
    getModuleDeploymentState,
    getStatusMessage,
    retryBalanceCheck,
    isRefreshingBalance,
  };
};
