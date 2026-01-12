import { useState, useCallback, useEffect, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_RPC_ENDPOINT, SOLANA_COMMITMENT, FALLBACK_RPC_ENDPOINTS, MIN_BALANCE_SOL } from '@/config/constants';

const VERIFICATION_STORAGE_KEY = 'axis_wallet_verified';

export interface WalletVerificationState {
  isVerified: boolean;
  balance: number | null;
  hasMinBalance: boolean;
  isRefreshingBalance: boolean;
}

// Get stored verification for a wallet address
const getStoredVerification = (walletAddress: string): boolean => {
  try {
    const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
    if (stored) {
      const verifications = JSON.parse(stored);
      return verifications[walletAddress] === true;
    }
  } catch (e) {
    console.warn('Failed to read verification state:', e);
  }
  return false;
};

// Store verification for a wallet address
const setStoredVerification = (walletAddress: string, verified: boolean) => {
  try {
    const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
    const verifications = stored ? JSON.parse(stored) : {};
    if (verified) {
      verifications[walletAddress] = true;
    } else {
      delete verifications[walletAddress];
    }
    localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));
  } catch (e) {
    console.warn('Failed to store verification state:', e);
  }
};

export const useWalletVerification = () => {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  
  const [isVerified, setIsVerified] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [hasMinBalance, setHasMinBalance] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  
  // Use a ref to track the current verified state for synchronous access
  const isVerifiedRef = useRef(false);

  // Fetch balance using Helius RPC with fallbacks
  const fetchBalanceWithFallback = useCallback(async (): Promise<number | null> => {
    if (!publicKey) return null;

    // Try Helius RPC first
    try {
      const heliusConnection = new Connection(SOLANA_RPC_ENDPOINT, SOLANA_COMMITMENT);
      const lamports = await heliusConnection.getBalance(publicKey);
      return lamports / LAMPORTS_PER_SOL;
    } catch (heliusError) {
      console.warn('Helius RPC failed:', heliusError);
    }

    // Try context connection
    try {
      const lamports = await connection.getBalance(publicKey);
      return lamports / LAMPORTS_PER_SOL;
    } catch (primaryError) {
      console.warn('Context RPC failed:', primaryError);
    }

    // Try fallback endpoints
    for (const endpoint of FALLBACK_RPC_ENDPOINTS) {
      try {
        const fallbackConnection = new Connection(endpoint, SOLANA_COMMITMENT);
        const lamports = await fallbackConnection.getBalance(publicKey);
        return lamports / LAMPORTS_PER_SOL;
      } catch (fallbackError) {
        console.warn(`Fallback RPC ${endpoint} failed:`, fallbackError);
      }
    }

    return null;
  }, [publicKey, connection]);

  // Refresh balance
  const refreshBalance = useCallback(async (): Promise<boolean> => {
    if (!publicKey || !connected) {
      setBalance(null);
      setHasMinBalance(false);
      return false;
    }

    setIsRefreshingBalance(true);
    
    try {
      const solBalance = await fetchBalanceWithFallback();
      
      if (solBalance !== null) {
        setBalance(solBalance);
        const meetsMinimum = solBalance >= MIN_BALANCE_SOL;
        setHasMinBalance(meetsMinimum);
        return meetsMinimum;
      } else {
        // Silent fail - assume balance is ok
        setHasMinBalance(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setHasMinBalance(true);
      return true;
    } finally {
      setIsRefreshingBalance(false);
    }
  }, [publicKey, connected, fetchBalanceWithFallback]);

  // Set verified from external sign (called by WalletButton after successful signature)
  const setVerifiedFromExternalSign = useCallback((walletAddress: string) => {
    console.log('[Verification] Setting verified state for:', walletAddress);
    isVerifiedRef.current = true;
    setIsVerified(true);
    setStoredVerification(walletAddress, true);
    // Fetch balance after verification
    refreshBalance();
  }, [refreshBalance]);

  // Clear verification state
  const clearVerification = useCallback(() => {
    if (publicKey) {
      setStoredVerification(publicKey.toBase58(), false);
    }
    isVerifiedRef.current = false;
    setIsVerified(false);
  }, [publicKey]);

  // Full reset - clear everything
  const resetState = useCallback(() => {
    if (publicKey) {
      setStoredVerification(publicKey.toBase58(), false);
    }
    isVerifiedRef.current = false;
    setIsVerified(false);
    setBalance(null);
    setHasMinBalance(false);
  }, [publicKey]);

  // Check for persisted verification on reconnect
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      
      // Fetch balance on connection
      refreshBalance();
      
      // Restore verified state if previously verified
      const wasVerified = getStoredVerification(walletAddress);
      if (wasVerified) {
        console.log('[Verification] Restoring verified state from storage for:', walletAddress);
        isVerifiedRef.current = true;
        setIsVerified(true);
      }
    }
  }, [connected, publicKey, refreshBalance]);

  // Reset state ONLY on explicit disconnect (wallet disconnected completely)
  // Do NOT reset on reconnect or page refresh - let localStorage persist the state
  useEffect(() => {
    if (!connected && !publicKey) {
      // Only clear in-memory state, NOT localStorage
      // User must explicitly call resetState() or clearVerification() to clear localStorage
      isVerifiedRef.current = false;
      setIsVerified(false);
      setBalance(null);
      setHasMinBalance(false);
    }
  }, [connected, publicKey]);

  // Periodic balance refresh (every 30 seconds) when verified
  useEffect(() => {
    if (!connected || !publicKey || !isVerified) return;
    
    const interval = setInterval(() => {
      refreshBalance();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [connected, publicKey, isVerified, refreshBalance]);

  // Check if wallet can create oracles
  const canCreateOracle = connected && isVerified && hasMinBalance;

  // Get status message for UI
  const getStatusMessage = useCallback((): string => {
    if (!connected) return "Connect wallet to continue";
    if (!isVerified) return "Verify wallet to continue";
    if (!hasMinBalance) return `Insufficient balance (min ${MIN_BALANCE_SOL} SOL)`;
    return "Ready to create oracle";
  }, [connected, isVerified, hasMinBalance]);

  return {
    isVerified,
    balance,
    hasMinBalance,
    isRefreshingBalance,
    canCreateOracle,
    refreshBalance,
    getStatusMessage,
    clearVerification,
    resetState,
    setVerifiedFromExternalSign,
  };
};
