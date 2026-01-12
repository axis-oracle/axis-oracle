import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Sports Matches Edge Function
 * 
 * Fetches upcoming sports matches from The Odds API
 * Supports: Basketball (NBA), Hockey (NHL), Soccer (EPL, La Liga, UCL), Tennis
 * 
 * Query params:
 * - sport: basketball | hockey | soccer | tennis
 * - league: specific league key (optional, defaults based on sport)
 */

// Sport key mappings for The Odds API
const SPORT_KEYS: Record<string, string[]> = {
  basketball: ['basketball_nba'],
  hockey: ['icehockey_nhl'],
  soccer: ['soccer_epl', 'soccer_spain_la_liga', 'soccer_uefa_champs_league'],
  tennis: [], // Will be fetched dynamically
};

const LEAGUE_NAMES: Record<string, string> = {
  'basketball_nba': 'NBA',
  'icehockey_nhl': 'NHL',
  'soccer_epl': 'Premier League',
  'soccer_spain_la_liga': 'La Liga',
  'soccer_uefa_champs_league': 'Champions League',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ODDS_API_KEY');
    if (!apiKey) {
      throw new Error('ODDS_API_KEY not configured');
    }

    const url = new URL(req.url);
    const sport = url.searchParams.get('sport') || 'basketball';
    const specificLeague = url.searchParams.get('league');

    console.log(`Fetching ${sport} matches${specificLeague ? ` for ${specificLeague}` : ''}...`);

    let sportKeys: string[] = [];

    // Handle tennis specially - fetch active tournaments
    if (sport === 'tennis') {
      const sportsRes = await fetch(
        `https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`
      );
      if (!sportsRes.ok) {
        throw new Error(`Failed to fetch sports list: ${sportsRes.status}`);
      }
      const allSports = await sportsRes.json();
      // Filter for active tennis tournaments
      sportKeys = allSports
        .filter((s: any) => s.key.startsWith('tennis_') && s.active)
        .map((s: any) => s.key)
        .slice(0, 5); // Limit to 5 tournaments
      
      console.log('Active tennis tournaments:', sportKeys);
    } else {
      sportKeys = specificLeague ? [specificLeague] : (SPORT_KEYS[sport] || []);
    }

    if (sportKeys.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: 'No leagues found for this sport' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range: now to 7 days from now
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const allMatches: any[] = [];

    // Fetch matches for each sport key
    for (const sportKey of sportKeys) {
      try {
        console.log(`Fetching from sport key: ${sportKey}`);
        
        const oddsRes = await fetch(
          `https://api.the-odds-api.com/v4/sports/${sportKey}/odds?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=decimal`
        );

        if (!oddsRes.ok) {
          console.log(`Failed to fetch ${sportKey}: ${oddsRes.status}`);
          continue;
        }

        const events = await oddsRes.json();
        console.log(`Got ${events.length} events for ${sportKey}`);

        // Filter and transform events
        for (const event of events) {
          const commenceTime = new Date(event.commence_time);
          
          // Only include matches within the next 7 days
          if (commenceTime < now || commenceTime > weekFromNow) {
            continue;
          }

          // Determine league name
          let leagueName = LEAGUE_NAMES[sportKey] || sportKey;
          if (sport === 'tennis') {
            // Extract tournament name from sport key
            leagueName = sportKey
              .replace('tennis_', '')
              .split('_')
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
          }

          allMatches.push({
            id: event.id,
            sport,
            sportKey,
            homeTeam: event.home_team,
            awayTeam: event.away_team,
            commenceTime: event.commence_time,
            league: leagueName,
          });
        }
      } catch (err) {
        console.error(`Error fetching ${sportKey}:`, err);
      }
    }

    // Sort by commence time
    allMatches.sort((a, b) => 
      new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()
    );

    console.log(`Returning ${allMatches.length} matches total`);

    return new Response(
      JSON.stringify({ matches: allMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sports matches error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
