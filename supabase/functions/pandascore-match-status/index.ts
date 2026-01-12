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
    const { matchId } = await req.json();

    if (!matchId) {
      return new Response(
        JSON.stringify({ error: 'Match ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('PANDASCORE_API_KEY');
    if (!apiKey) {
      console.error('PANDASCORE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching status for match ID: ${matchId}`);

    // Fetch specific match details from PandaScore
    const response = await fetch(
      `https://api.pandascore.co/matches/${matchId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PandaScore API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch match status from PandaScore' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const match = await response.json();

    console.log(`Match ${matchId} status: ${match.status}`);

    // Return relevant match status data
    const statusData = {
      id: match.id,
      status: match.status, // not_started, running, finished, canceled
      winner: match.winner ? {
        id: match.winner.id,
        name: match.winner.name,
        acronym: match.winner.acronym,
      } : null,
      results: match.results?.map((r: { team_id: number; score: number }) => ({
        team_id: r.team_id,
        score: r.score,
      })) || [],
      opponents: match.opponents?.map((o: { opponent: { id: number; name: string; acronym: string } }) => ({
        id: o.opponent?.id,
        name: o.opponent?.name,
        acronym: o.opponent?.acronym,
      })) || [],
    };

    return new Response(
      JSON.stringify(statusData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pandascore-match-status function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
