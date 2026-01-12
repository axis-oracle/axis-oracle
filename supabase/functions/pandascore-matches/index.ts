import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('PANDASCORE_API_KEY');
    
    if (!apiKey) {
      console.error('PANDASCORE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'PandaScore API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching upcoming matches from PandaScore...');
    
    const response = await fetch(
      'https://api.pandascore.co/matches/upcoming?sort=begin_at&page[size]=50',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PandaScore API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `PandaScore API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allMatches = await response.json();
    console.log('PandaScore raw response count:', allMatches.length);

    // Filter for CS2 (cs-go) and Dota 2 only, and only matches with both teams defined
    const filteredMatches = allMatches.filter((match: any) => {
      const gameSlug = match.videogame?.slug;
      const isValidGame = gameSlug === 'cs-go' || gameSlug === 'dota-2';
      
      // Check that both teams are defined (not TBD)
      const hasTeam1 = match.opponents?.[0]?.opponent?.name;
      const hasTeam2 = match.opponents?.[1]?.opponent?.name;
      const hasBothTeams = hasTeam1 && hasTeam2;
      
      return isValidGame && hasBothTeams;
    });

    const tbdFilteredCount = allMatches.filter((m: any) => 
      (m.videogame?.slug === 'cs-go' || m.videogame?.slug === 'dota-2') && 
      (!m.opponents?.[0]?.opponent?.name || !m.opponents?.[1]?.opponent?.name)
    ).length;
    
    console.log('Filtered matches (CS2 + Dota 2 with both teams):', filteredMatches.length);
    console.log('Excluded TBD matches:', tbdFilteredCount);

    // Transform to a cleaner format for the frontend
    const matches = filteredMatches.map((match: any) => ({
      id: String(match.id),
      game: match.videogame?.slug === 'cs-go' ? 'cs2' : 'dota2',
      team1: match.opponents?.[0]?.opponent?.name || 'TBD',
      team1Short: match.opponents?.[0]?.opponent?.acronym || match.opponents?.[0]?.opponent?.name?.slice(0, 4) || 'TBD',
      team1Id: match.opponents?.[0]?.opponent?.id,
      team2: match.opponents?.[1]?.opponent?.name || 'TBD',
      team2Short: match.opponents?.[1]?.opponent?.acronym || match.opponents?.[1]?.opponent?.name?.slice(0, 4) || 'TBD',
      team2Id: match.opponents?.[1]?.opponent?.id,
      tournament: match.league?.name || match.tournament?.name || 'Unknown Tournament',
      scheduledAt: match.begin_at || match.scheduled_at,
      status: match.status,
      numberOfGames: match.number_of_games || 3, // BO1=1, BO3=3, BO5=5
    }));

    console.log('Transformed matches:', matches.length);

    return new Response(
      JSON.stringify({ matches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in pandascore-matches function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
