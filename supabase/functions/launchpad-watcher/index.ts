import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Launchpad Watcher Edge Function
 * 
 * Runs on cron schedule to check pending launchpad feeds for early graduation.
 * If a token graduates before the resolution_date, marks it ready for settlement.
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Launchpad watcher starting...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const moralisApiKey = Deno.env.get('MORALIS_API_KEY');

    if (!moralisApiKey) {
      throw new Error('MORALIS_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch pending launchpad feeds
    const { data: feeds, error } = await supabase
      .from('feeds')
      .select('*')
      .eq('status', 'pending')
      .eq('module', 'launchpad');

    if (error) {
      throw new Error(`DB error: ${error.message}`);
    }

    if (!feeds || feeds.length === 0) {
      console.log('No pending launchpad feeds to check');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending launchpad feeds', checked: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking ${feeds.length} pending launchpad feeds`);

    const results: Array<{ feedId: string; graduated: boolean; progress?: number }> = [];

    for (const feed of feeds) {
      const config = feed.config || {};
      const tokenAddress = config.tokenAddress;

      if (!tokenAddress) {
        console.log(`Feed ${feed.id} missing tokenAddress`);
        continue;
      }

      console.log(`Checking token: ${tokenAddress}`);

      try {
        // Fetch current bonding status
        const bondingResponse = await fetch(
          `https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/bonding-status`,
          {
            headers: {
              'Accept': 'application/json',
              'X-API-Key': moralisApiKey,
            },
          }
        );

        if (!bondingResponse.ok) {
          console.log(`Failed to fetch status for ${tokenAddress}: ${bondingResponse.status}`);
          continue;
        }

        const bondingData = await bondingResponse.json();
        const bondingProgress = bondingData.bondingProgress || bondingData.progress || 0;
        const isGraduated = bondingData.isGraduated || bondingData.graduated || bondingProgress >= 100;

        console.log(`Token ${config.tokenSymbol || tokenAddress}: progress=${bondingProgress}%, graduated=${isGraduated}`);

        // Update feed config with current progress
        const updatedConfig = {
          ...config,
          currentProgress: bondingProgress,
          lastChecked: new Date().toISOString(),
        };

        // If graduated, mark for settlement
        if (isGraduated) {
          updatedConfig.isGraduated = true;
          updatedConfig.graduatedAt = new Date().toISOString();
          updatedConfig.matchStatus = 'finished'; // Use same pattern as esports/sports for settlement trigger

          console.log(`🎓 Token ${config.tokenSymbol || tokenAddress} GRADUATED!`);
        }

        // Update feed in DB
        const { error: updateError } = await supabase
          .from('feeds')
          .update({ config: updatedConfig })
          .eq('id', feed.id);

        if (updateError) {
          console.log(`Failed to update feed ${feed.id}: ${updateError.message}`);
        }

        results.push({
          feedId: feed.id,
          graduated: isGraduated,
          progress: bondingProgress,
        });

      } catch (e: any) {
        console.log(`Error checking ${tokenAddress}: ${e.message}`);
      }
    }

    const graduatedCount = results.filter(r => r.graduated).length;

    return new Response(
      JSON.stringify({
        success: true,
        checked: results.length,
        graduated: graduatedCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Launchpad watcher error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
