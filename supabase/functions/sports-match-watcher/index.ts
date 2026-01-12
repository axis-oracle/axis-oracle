import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Sports Match Watcher - Polls The Odds API for match status updates
 * 
 * This cron function (mirrors esports-match-watcher logic):
 * 1. Finds sports feeds where matchStatus is not 'finished' or 'canceled'
 * 2. Only checks matches that have passed their commenceTime
 * 3. Fetches scores from The Odds API
 * 4. Updates matchStatus and winnerId in the feed config
 * 
 * When a match is finished, oracle-settler will pick it up for settlement
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting sports match watcher...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const oddsApiKey = Deno.env.get('ODDS_API_KEY');
    
    if (!oddsApiKey) {
      console.error('ODDS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Odds API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();
    
    // Get all sports feeds that are pending and not yet finished
    const { data: sportsFeeds, error: fetchError } = await supabase
      .from('feeds')
      .select('*')
      .eq('module', 'sports')
      .eq('status', 'pending');
    
    if (fetchError) {
      console.error('Error fetching sports feeds:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${sportsFeeds?.length || 0} sports feeds to check`);
    
    if (!sportsFeeds || sportsFeeds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No sports feeds to check', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let updatedCount = 0;
    let finishedCount = 0;
    
    // Group feeds by sportKey for efficient API calls
    const feedsBySportKey: Record<string, any[]> = {};
    for (const feed of sportsFeeds) {
      const config = feed.config as Record<string, unknown>;
      const matchStatus = config?.matchStatus as string;
      const commenceTime = config?.commenceTime as string;
      
      // Skip if already finished or canceled
      if (matchStatus === 'finished' || matchStatus === 'canceled') {
        console.log(`Feed ${feed.id}: Already ${matchStatus}, skipping`);
        continue;
      }
      
      // Skip if match hasn't started yet
      if (commenceTime) {
        const matchStart = new Date(commenceTime);
        if (matchStart > now) {
          console.log(`Feed ${feed.id}: Match not started yet (starts ${commenceTime}), skipping`);
          continue;
        }
      }
      
      const sportKey = config?.sportKey as string;
      if (!sportKey) {
        console.log(`Feed ${feed.id}: No sportKey in config, skipping`);
        continue;
      }
      
      if (!feedsBySportKey[sportKey]) {
        feedsBySportKey[sportKey] = [];
      }
      feedsBySportKey[sportKey].push(feed);
    }
    
    // Check each sport key
    for (const [sportKey, sportFeeds] of Object.entries(feedsBySportKey)) {
      console.log(`Checking ${sportKey} for ${sportFeeds.length} feeds...`);
      
      try {
        // Fetch scores from The Odds API
        const response = await fetch(
          `https://api.the-odds-api.com/v4/sports/${sportKey}/scores?apiKey=${oddsApiKey}&daysFrom=3`,
          {
            headers: { 'Accept': 'application/json' },
          }
        );
        
        if (!response.ok) {
          console.error(`Odds API error for ${sportKey}: ${response.status}`);
          continue;
        }
        
        const scores = await response.json();
        console.log(`Got ${scores.length} score records for ${sportKey}`);
        
        // Create a map for quick lookup by event ID
        const scoreMap: Record<string, any> = {};
        for (const score of scores) {
          scoreMap[score.id] = score;
        }
        
        // Check each feed
        for (const feed of sportFeeds) {
          const config = feed.config as Record<string, unknown>;
          const eventId = config?.eventId as string;
          const matchStatus = config?.matchStatus as string;
          
          if (!eventId) {
            console.log(`Feed ${feed.id}: No eventId in config, skipping`);
            continue;
          }
          
          console.log(`Feed ${feed.id}: Checking event ${eventId}...`);
          
          const scoreData = scoreMap[eventId];
          if (!scoreData) {
            console.log(`Feed ${feed.id}: No score data found for event ${eventId}`);
            continue;
          }
          
          const apiCompleted = scoreData.completed;
          console.log(`Feed ${feed.id}: API completed=${apiCompleted}`);
          
          // Map API status to our matchStatus
          let newMatchStatus: string;
          let winnerId: string | null = null;
          
          if (apiCompleted) {
            newMatchStatus = 'finished';
            finishedCount++;
            
            // Determine winner from scores
            const homeTeam = config?.homeTeam as string;
            const awayTeam = config?.awayTeam as string;
            
            if (scoreData.scores && scoreData.scores.length >= 2) {
              const homeScoreData = scoreData.scores.find((s: any) => s.name === homeTeam);
              const awayScoreData = scoreData.scores.find((s: any) => s.name === awayTeam);
              
              if (homeScoreData && awayScoreData) {
                const homePoints = parseInt(homeScoreData.score);
                const awayPoints = parseInt(awayScoreData.score);
                
                if (homePoints > awayPoints) {
                  winnerId = 'home';
                } else if (awayPoints > homePoints) {
                  winnerId = 'away';
                } else {
                  winnerId = 'draw';
                }
                
                console.log(`Feed ${feed.id}: Score ${homeTeam} ${homePoints} - ${awayPoints} ${awayTeam}, Winner: ${winnerId}`);
              }
            }
          } else {
            // Check if match is in progress (has scores but not completed)
            if (scoreData.scores && scoreData.scores.length > 0) {
              newMatchStatus = 'running';
            } else {
              newMatchStatus = 'waiting';
            }
          }
          
          // Only update if status changed
          if (newMatchStatus !== matchStatus || (newMatchStatus === 'finished' && winnerId)) {
            const updatedConfig = {
              ...config,
              matchStatus: newMatchStatus,
              winnerId: winnerId,
              // Store scores for display
              homeScore: scoreData.scores?.find((s: any) => s.name === config?.homeTeam)?.score || null,
              awayScore: scoreData.scores?.find((s: any) => s.name === config?.awayTeam)?.score || null,
            };
            
            const { error: updateError } = await supabase
              .from('feeds')
              .update({ 
                config: updatedConfig,
                updated_at: new Date().toISOString(),
              })
              .eq('id', feed.id);
            
            if (updateError) {
              console.error(`Error updating feed ${feed.id}:`, updateError);
            } else {
              console.log(`Feed ${feed.id}: Updated matchStatus to ${newMatchStatus}${winnerId ? `, winner: ${winnerId}` : ''}`);
              updatedCount++;
            }
          }
        }
      } catch (error) {
        console.error(`Error checking ${sportKey}:`, error);
      }
    }
    
    console.log(`Sports watcher complete: ${updatedCount} feeds updated, ${finishedCount} matches finished`);
    
    return new Response(
      JSON.stringify({
        success: true,
        checked: sportsFeeds.length,
        updated: updatedCount,
        finished: finishedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sports watcher error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
