// ============================================
// SOCIAL ORACLE SERVICE - Mock Twitter/X Data
// ============================================

export interface TweetData {
  id: string;
  url: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
    followers: number;
  };
  content: string;
  metrics: {
    likes: number;
    retweets: number;
    views: number;
    replies: number;
  };
  createdAt: Date;
}

export interface SocialMarket {
  id: string;
  tweetUrl: string;
  tweetData: TweetData;
  metric: 'likes' | 'retweets' | 'views' | 'followers';
  targetValue: number;
  currentValue: number;
  deadline: Date;
  status: 'active' | 'resolved_yes' | 'resolved_no' | 'expired';
  createdAt: Date;
}

// Mock tweet database for demo purposes
const MOCK_TWEETS: Record<string, TweetData> = {
  'default': {
    id: '1234567890',
    url: 'https://x.com/elonmusk/status/1234567890',
    author: {
      username: 'elonmusk',
      displayName: 'Elon Musk',
      avatarUrl: 'https://pbs.twimg.com/profile_images/1815749056821346304/jS8I28PL_400x400.jpg',
      verified: true,
      followers: 195_000_000,
    },
    content: 'The future of decentralized oracles is here. $AXIS is building something incredible on Solana. 🚀',
    metrics: {
      likes: 45_320,
      retweets: 12_450,
      views: 2_340_000,
      replies: 3_210,
    },
    createdAt: new Date(Date.now() - 3600000),
  },
};

// Generate mock data from a tweet URL
function generateMockTweetFromUrl(url: string): TweetData {
  // Extract username and status id from URL
  const urlPattern = /https?:\/\/(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/;
  const match = url.match(urlPattern);
  
  const username = match?.[2] || 'unknown_user';
  const tweetId = match?.[3] || Math.random().toString(36).substring(7);
  
  // Generate random but plausible metrics
  const baseFollowers = Math.floor(Math.random() * 5_000_000) + 10_000;
  const baseLikes = Math.floor(Math.random() * 100_000) + 1000;
  const baseRetweets = Math.floor(baseLikes * 0.25);
  const baseViews = Math.floor(baseLikes * 50);
  
  return {
    id: tweetId,
    url: url,
    author: {
      username: username,
      displayName: username.charAt(0).toUpperCase() + username.slice(1).replace(/_/g, ' '),
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      verified: Math.random() > 0.7,
      followers: baseFollowers,
    },
    content: 'This is a simulated tweet preview. Connect your Twitter API for real data.',
    metrics: {
      likes: baseLikes,
      retweets: baseRetweets,
      views: baseViews,
      replies: Math.floor(baseLikes * 0.05),
    },
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 7),
  };
}

// Simulated tweet fetcher
export async function fetchTweetData(url: string): Promise<TweetData | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  // Validate URL format
  const urlPattern = /https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
  if (!urlPattern.test(url)) {
    return null;
  }
  
  // Return mock data
  return generateMockTweetFromUrl(url);
}

// Get current metric value with simulated live updates
export function getCurrentMetricValue(
  tweetData: TweetData,
  metric: 'likes' | 'retweets' | 'views' | 'followers'
): number {
  const baseValues = {
    likes: tweetData.metrics.likes,
    retweets: tweetData.metrics.retweets,
    views: tweetData.metrics.views,
    followers: tweetData.author.followers,
  };
  
  // Add some random variation to simulate live updates
  const variation = Math.random() * 0.02 - 0.005; // -0.5% to +1.5%
  return Math.floor(baseValues[metric] * (1 + variation));
}

// Simulate real-time metric updates
export function subscribeToMetricUpdates(
  tweetData: TweetData,
  metric: 'likes' | 'retweets' | 'views' | 'followers',
  callback: (newValue: number) => void,
  intervalMs: number = 3000
): () => void {
  let currentValue = getCurrentMetricValue(tweetData, metric);
  
  const interval = setInterval(() => {
    // Simulate organic growth with occasional spikes
    const growthFactor = Math.random() < 0.1 
      ? 1 + Math.random() * 0.05 // 10% chance of 0-5% spike
      : 1 + Math.random() * 0.005; // Normal 0-0.5% growth
    
    currentValue = Math.floor(currentValue * growthFactor);
    callback(currentValue);
  }, intervalMs);
  
  return () => clearInterval(interval);
}

// Format large numbers for display
export function formatMetricValue(value: number): string {
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

// Get metric display name
export function getMetricDisplayName(metric: 'likes' | 'retweets' | 'views' | 'followers'): string {
  const names = {
    likes: 'Likes',
    retweets: 'Retweets',
    views: 'Views',
    followers: 'Followers',
  };
  return names[metric];
}

// Validate if a URL is a valid Twitter/X URL
export function isValidTwitterUrl(url: string): boolean {
  const urlPattern = /https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
  return urlPattern.test(url);
}

// Calculate progress percentage
export function calculateProgress(currentValue: number, targetValue: number): number {
  return Math.min(100, (currentValue / targetValue) * 100);
}
