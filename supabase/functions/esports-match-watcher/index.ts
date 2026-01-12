import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Esports Match Watcher - Polls PandaScore for match status updates
 * 
 * This cron function:
 * 1. Finds esports feeds where matchStatus is not 'finished' or 'canceled'
 * 2. Only checks matches that have passed their scheduledAt time
 * 3. Fetches status from PandaScore API
 * 4. Updates matchStatus and winnerId in the feed config
 * 
 * When a match is finished, oracle-settler will pick it up for settlement
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting esports match watcher...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const pandascoreApiKey = Deno.env.get('PANDASCORE_API_KEY');
    
    if (!pandascoreApiKey) {
      console.error('PANDASCORE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'PandaScore API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();
    
    // Get all esports feeds that are pending and not yet finished
    const { data: esportsFeeds, error: fetchError } = await supabase
      .from('feeds')
      .select('*')
      .eq('module', 'esports')
      .eq('status', 'pending');
    
    if (fetchError) {
      console.error('Error fetching esports feeds:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${esportsFeeds?.length || 0} esports feeds to check`);
    
    if (!esportsFeeds || esportsFeeds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No esports feeds to check', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let updatedCount = 0;
    let finishedCount = 0;
    
    for (const feed of esportsFeeds) {
      const config = feed.config as Record<string, unknown>;
      const matchStatus = config?.matchStatus as string;
      const matchId = config?.matchId as string;
      const scheduledAt = config?.scheduledAt as string;
      
      // Skip if already finished or canceled
      if (matchStatus === 'finished' || matchStatus === 'canceled') {
        console.log(`Feed ${feed.id}: Already ${matchStatus}, skipping`);
        continue;
      }
      
      // Skip if match hasn't started yet (scheduledAt is in the future)
      if (scheduledAt) {
        const matchStart = new Date(scheduledAt);
        if (matchStart > now) {
          console.log(`Feed ${feed.id}: Match not started yet (starts ${scheduledAt}), skipping`);
          continue;
        }
      }
      
      if (!matchId) {
        console.log(`Feed ${feed.id}: No matchId in config, skipping`);
        continue;
      }
      
      console.log(`Feed ${feed.id}: Checking match ${matchId}...`);
      
      try {
        // Fetch match status from PandaScore
        const response = await fetch(
          `https://api.pandascore.co/matches/${matchId}`,
          {
            headers: {
              'Authorization': `Bearer ${pandascoreApiKey}`,
              'Accept': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          console.error(`PandaScore API error for match ${matchId}: ${response.status}`);
          continue;
        }
        
        const matchData = await response.json();
        const apiStatus = matchData.status; // not_started, running, finished, canceled
        const winnerId = matchData.winner?.id || null;
        
        console.log(`Feed ${feed.id}: PandaScore status=${apiStatus}, winner=${winnerId}`);
        
        // Map PandaScore status to our matchStatus
        let newMatchStatus: string;
        if (apiStatus === 'finished') {
          newMatchStatus = 'finished';
          finishedCount++;
        } else if (apiStatus === 'running') {
          newMatchStatus = 'running';
        } else if (apiStatus === 'canceled' || apiStatus === 'postponed') {
          newMatchStatus = 'canceled';
        } else {
          newMatchStatus = 'waiting';
        }
        
        // Only update if status changed
        if (newMatchStatus !== matchStatus || (newMatchStatus === 'finished' && winnerId)) {
          const updatedConfig = {
            ...config,
            matchStatus: newMatchStatus,
            winnerId: winnerId,
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
            console.log(`Feed ${feed.id}: Updated matchStatus to ${newMatchStatus}`);
            updatedCount++;
          }
        }
      } catch (error) {
        console.error(`Error checking match ${matchId}:`, error);
      }
    }
    
    console.log(`Esports watcher complete: ${updatedCount} feeds updated, ${finishedCount} matches finished`);
    
    return new Response(
      JSON.stringify({
        success: true,
        checked: esportsFeeds.length,
        updated: updatedCount,
        finished: finishedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Esports watcher error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
