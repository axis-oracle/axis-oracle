import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TweetMetrics {
  likes: number;
  retweets: number;
  views: number; // Always 0 - not available in free Twitter API
  replies: number;
  isVerified: boolean;
  username: string;
  displayName: string;
  avatarUrl: string;
  tweetText: string;
  tweetId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tweetId } = await req.json();
    
    if (!tweetId) {
      return new Response(
        JSON.stringify({ success: false, error: 'tweetId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching metrics for tweet ID: ${tweetId}`);

    const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
    
    if (!bearerToken) {
      console.error('TWITTER_BEARER_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Twitter API not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Twitter API v2 endpoint with required fields
    const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics,text&expansions=author_id&user.fields=profile_image_url,verified,name,username`;
    
    console.log(`Calling Twitter API: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    console.log(`Twitter API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Twitter API error: ${response.status} - ${errorText}`);
      
      // Return specific error messages for common issues
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid Twitter API token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ success: false, error: 'Tweet not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Try again later.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: `Twitter API error: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();
    console.log('Twitter API response:', JSON.stringify(data));

    // Extract tweet and user data
    const tweet = data.data;
    const user = data.includes?.users?.[0];
    
    if (!tweet) {
      return new Response(
        JSON.stringify({ success: false, error: 'Tweet data not found in response' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const metrics: TweetMetrics = {
      likes: tweet.public_metrics?.like_count || 0,
      retweets: tweet.public_metrics?.retweet_count || 0,
      views: 0, // Not available in free Twitter API
      replies: tweet.public_metrics?.reply_count || 0,
      isVerified: user?.verified || false,
      username: user?.username || 'unknown',
      displayName: user?.name || 'Unknown User',
      avatarUrl: user?.profile_image_url || '',
      tweetText: tweet.text || '',
      tweetId: tweetId,
    };

    console.log('Returning metrics:', JSON.stringify(metrics));

    return new Response(
      JSON.stringify({ success: true, data: metrics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in twitter-metrics function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
