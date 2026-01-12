// ============================================
// SOCIAL DATA SERVICE - Adapter for Twitter/X Metrics
// ============================================
// This service abstracts the data fetching layer so we can easily
// swap between mock data, RapidAPI proxy, or official Twitter API.

import { supabase } from "@/integrations/supabase/client";

export interface TweetMetrics {
  likes: number;
  retweets: number;
  views: number;
  replies: number;
  isVerified: boolean;
  username: string;
  displayName: string;
  avatarUrl: string;
  tweetText: string;
  tweetId: string;
}

export interface FetchResult {
  success: boolean;
  data: TweetMetrics | null;
  error: string | null;
}

// Parse tweet URL to extract username and tweet ID
export function parseTweetUrl(url: string): { username: string; tweetId: string } | null {
  const patterns = [
    /https?:\/\/(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/,
    /https?:\/\/(www\.)?(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      // Handle both patterns - the username/tweetId positions differ
      if (match[3] && match[4]) {
        return { username: match[3], tweetId: match[4] };
      } else if (match[2] && match[3]) {
        return { username: match[2], tweetId: match[3] };
      }
    }
  }
  return null;
}

// Validate if URL is a valid Twitter/X tweet URL
export function isValidTweetUrl(url: string): boolean {
  return parseTweetUrl(url) !== null;
}

/**
 * Fetch tweet metrics from the RapidAPI proxy edge function.
 */
export async function fetchTweetMetrics(url: string): Promise<FetchResult> {
  const parsed = parseTweetUrl(url);
  
  if (!parsed) {
    return {
      success: false,
      data: null,
      error: 'Invalid tweet URL format. Use: x.com/username/status/ID',
    };
  }

  try {
    console.log(`Fetching metrics for tweet ID: ${parsed.tweetId}`);
    
    const { data, error } = await supabase.functions.invoke('twitter-metrics', {
      body: { tweetId: parsed.tweetId },
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to fetch tweet metrics',
      };
    }

    if (!data.success) {
      return {
        success: false,
        data: null,
        error: data.error || 'Unknown error from Twitter API',
      };
    }

    // Ensure username from URL is preserved if API doesn't return it
    const metrics: TweetMetrics = {
      ...data.data,
      username: data.data.username || parsed.username,
    };

    return {
      success: true,
      data: metrics,
      error: null,
    };
  } catch (err) {
    console.error('Error calling twitter-metrics:', err);
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Format large numbers for display (e.g., 1.2M, 45.3K)
export function formatMetricNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

// Get metric display label
export function getMetricLabel(metric: 'likes' | 'retweets'): string {
  const labels = {
    likes: 'Likes',
    retweets: 'Retweets',
  };
  return labels[metric];
}

// Simulated live update (adds small random variation)
export function simulateLiveUpdate(currentValue: number): number {
  const change = Math.random() < 0.7 
    ? Math.floor(Math.random() * 50) // Small increase
    : Math.floor(Math.random() * 10); // Tiny increase
  return currentValue + change;
}
