import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const appId = url.searchParams.get('appid');

    if (!appId) {
      return new Response(
        JSON.stringify({ error: 'Missing appid parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const STEAM_API_KEY = Deno.env.get('STEAM_API_KEY');
    if (!STEAM_API_KEY) {
      console.error('STEAM_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Steam API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching player count for app ${appId}...`);

    // Fetch current player count from Steam API
    const response = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}&key=${STEAM_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.response?.result !== 1) {
      console.error('Steam API returned error response:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to get player count', details: data }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const playerCount = data.response.player_count || 0;

    console.log(`App ${appId} has ${playerCount} current players`);

    return new Response(JSON.stringify({
      appid: parseInt(appId),
      player_count: playerCount,
      fetchedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching player count:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to fetch player count', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
