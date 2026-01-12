import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * PandaScore Match Result - Returns simple result for Switchboard oracle
 * 
 * This function is called by the Switchboard oracle job to get the match result.
 * Returns:
 *   { result: 1 } if team1 won
 *   { result: 2 } if team2 won
 *   { result: 0 } if draw, canceled, or match not finished
 * 
 * Query params:
 *   - matchId: PandaScore match ID
 *   - team1Id: ID of team 1
 *   - team2Id: ID of team 2
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const matchId = url.searchParams.get('matchId');
    const team1Id = url.searchParams.get('team1Id');
    const team2Id = url.searchParams.get('team2Id');

    if (!matchId || !team1Id || !team2Id) {
      return new Response(
        JSON.stringify({ error: 'Missing required params: matchId, team1Id, team2Id', result: 0 }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('PANDASCORE_API_KEY');
    if (!apiKey) {
      console.error('PANDASCORE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured', result: 0 }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching result for match ${matchId}, team1=${team1Id}, team2=${team2Id}`);

    // Fetch match details from PandaScore
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
        JSON.stringify({ error: 'Failed to fetch match from PandaScore', result: 0 }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const match = await response.json();

    console.log(`Match ${matchId} status: ${match.status}, winner: ${match.winner?.id}`);

    // Check if match is finished
    if (match.status !== 'finished') {
      console.log(`Match not finished yet, status: ${match.status}`);
      return new Response(
        JSON.stringify({ result: 0, status: match.status, message: 'Match not finished' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there's a winner
    if (!match.winner?.id) {
      console.log('Match finished but no winner (draw or canceled)');
      return new Response(
        JSON.stringify({ result: 0, status: 'no_winner', message: 'Match has no winner' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which team won
    const winnerId = match.winner.id;
    const team1IdNum = parseInt(team1Id, 10);
    const team2IdNum = parseInt(team2Id, 10);

    let result: number;
    if (winnerId === team1IdNum) {
      result = 1;
      console.log(`Team 1 (${team1Id}) won - returning result: 1`);
    } else if (winnerId === team2IdNum) {
      result = 2;
      console.log(`Team 2 (${team2Id}) won - returning result: 2`);
    } else {
      result = 0;
      console.log(`Winner ID ${winnerId} doesn't match either team`);
    }

    return new Response(
      JSON.stringify({ 
        result,
        winnerId,
        winnerName: match.winner.name,
        matchStatus: match.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in pandascore-match-result:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, result: 0 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
