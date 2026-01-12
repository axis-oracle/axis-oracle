// Pre-flight safety check service for feed settlement
import { supabase } from '@/integrations/supabase/client';
import { fetchMemeData, fetchCryptoPrice } from './apiService';

export interface PreflightResult {
  canSettle: boolean;
  status: 'running' | 'not_started' | 'finished' | 'unknown';
  message: string;
  details?: string;
}

interface EsportsMatchStatus {
  id: string;
  status: string;
  winner?: {
    name: string;
  };
  results?: Array<{
    team_id: number;
    score: number;
  }>;
}

// Check esports match status via edge function
export async function checkEsportsMatchStatus(matchId: string): Promise<PreflightResult> {
  try {
    const { data, error } = await supabase.functions.invoke('pandascore-match-status', {
      body: { matchId }
    });

    if (error) {
      console.error('Error fetching match status:', error);
      return {
        canSettle: false,
        status: 'unknown',
        message: 'Could not verify match status. Please try again.',
      };
    }

    const match = data as EsportsMatchStatus;
    
    // PandaScore status values: not_started, running, finished, canceled
    if (match.status === 'finished') {
      const winnerInfo = match.winner ? `Winner: ${match.winner.name}` : '';
      return {
        canSettle: true,
        status: 'finished',
        message: 'Match finished. Ready to settle.',
        details: winnerInfo,
      };
    }

    if (match.status === 'running') {
      // Build score string if available
      let scoreInfo = '';
      if (match.results && match.results.length >= 2) {
        scoreInfo = `Current Score: ${match.results[0]?.score || 0} - ${match.results[1]?.score || 0}`;
      }
      return {
        canSettle: false,
        status: 'running',
        message: '⚠️ Match is still in progress. Cannot settle yet.',
        details: scoreInfo,
      };
    }

    if (match.status === 'not_started') {
      return {
        canSettle: false,
        status: 'not_started',
        message: '⚠️ Match has not started yet. Cannot settle.',
      };
    }

    // Handle canceled or other statuses
    return {
      canSettle: false,
      status: 'unknown',
      message: `Match status: ${match.status}. Cannot settle.`,
    };
  } catch (error) {
    console.error('Preflight check error (esports):', error);
    return {
      canSettle: false,
      status: 'unknown',
      message: 'Failed to verify match status. Please try again.',
    };
  }
}

// Check crypto/memecoin data availability (these are price-based, always settleable if data exists)
export async function checkCryptoStatus(symbol: string): Promise<PreflightResult> {
  try {
    const data = await fetchCryptoPrice(symbol);
    
    if (data) {
      return {
        canSettle: true,
        status: 'finished',
        message: 'Price data available. Ready to settle.',
        details: `Current Price: $${parseFloat(data.price).toLocaleString()}`,
      };
    }

    return {
      canSettle: false,
      status: 'unknown',
      message: 'Could not fetch price data. Please try again.',
    };
  } catch (error) {
    console.error('Preflight check error (crypto):', error);
    return {
      canSettle: false,
      status: 'unknown',
      message: 'Failed to verify price data. Please try again.',
    };
  }
}

// Check memecoin data availability
export async function checkMemecoinStatus(contractAddress: string): Promise<PreflightResult> {
  try {
    const data = await fetchMemeData(contractAddress);
    
    if (data) {
      return {
        canSettle: true,
        status: 'finished',
        message: 'Token data available. Ready to settle.',
        details: `${data.symbol}: $${parseFloat(data.priceUsd).toLocaleString()}`,
      };
    }

    return {
      canSettle: false,
      status: 'unknown',
      message: 'Could not fetch token data. Please try again.',
    };
  } catch (error) {
    console.error('Preflight check error (memecoin):', error);
    return {
      canSettle: false,
      status: 'unknown',
      message: 'Failed to verify token data. Please try again.',
    };
  }
}

// Main preflight check function - routes to appropriate checker based on module type
export async function runPreflightCheck(
  module: string,
  config: Record<string, unknown>
): Promise<PreflightResult> {
  switch (module) {
    case 'esports':
      const matchId = config.matchId as string;
      if (!matchId) {
        return {
          canSettle: false,
          status: 'unknown',
          message: 'No match ID found in feed config.',
        };
      }
      return checkEsportsMatchStatus(matchId);

    case 'crypto':
      const symbol = config.symbol as string;
      if (!symbol) {
        return {
          canSettle: false,
          status: 'unknown',
          message: 'No symbol found in feed config.',
        };
      }
      return checkCryptoStatus(symbol);

    case 'memecoin':
      const contractAddress = config.contractAddress as string;
      if (!contractAddress) {
        return {
          canSettle: false,
          status: 'unknown',
          message: 'No contract address found in feed config.',
        };
      }
      return checkMemecoinStatus(contractAddress);

    case 'weather':
      // Weather feeds are always settleable (based on current conditions)
      return {
        canSettle: true,
        status: 'finished',
        message: 'Weather data available. Ready to settle.',
      };

    default:
      return {
        canSettle: true,
        status: 'finished',
        message: 'Ready to settle.',
      };
  }
}
