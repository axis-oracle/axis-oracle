import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SteamSpyGame {
  appid: number;
  name: string;
  developer: string;
  publisher: string;
  owners: string;
  ccu: number;
}

// Cache for popular games list
let cachedGames: { data: SteamSpyGame[]; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('query')?.toLowerCase() || '';

    const now = Date.now();

    // Check cache for popular games
    if (!cachedGames || (now - cachedGames.timestamp) > CACHE_DURATION) {
      console.log('Fetching popular games from SteamSpy...');
      
      // Fetch top games by current players
      const response = await fetch('https://steamspy.com/api.php?request=top100in2weeks', {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`SteamSpy API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform to array and sort by CCU
      const games: SteamSpyGame[] = Object.values(data).map((game: any) => ({
        appid: game.appid,
        name: game.name,
        developer: game.developer || 'Unknown',
        publisher: game.publisher || 'Unknown',
        owners: game.owners || '0',
        ccu: game.ccu || 0,
      }));

      // Sort by current players
      games.sort((a, b) => b.ccu - a.ccu);

      cachedGames = { data: games, timestamp: now };
      console.log(`Cached ${games.length} popular games`);
    }

    // Filter games by search query
    let results = cachedGames.data;
    if (searchQuery) {
      results = results.filter(game => 
        game.name.toLowerCase().includes(searchQuery)
      );
    }

    // Limit results
    results = results.slice(0, 50);

    return new Response(JSON.stringify({
      count: results.length,
      games: results,
      fetchedAt: new Date(cachedGames.timestamp).toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error searching games:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return cached data if available
    if (cachedGames) {
      console.log('Returning stale cached data due to error');
      return new Response(JSON.stringify({
        count: cachedGames.data.length,
        games: cachedGames.data.slice(0, 50),
        stale: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Failed to search games', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
