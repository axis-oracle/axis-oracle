import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Oracle Settler Edge Function - HTTP-based Settlement
 * 
 * This function settles feeds using direct HTTP calls (no Switchboard SDK):
 * 1. Queries pending feeds from Supabase
 * 2. Fetches oracle value via Crossbar HTTP API
 * 3. Calls Railway settler for on-chain transaction
 * 4. Records settlement in database
 * 
 * Avoids Switchboard SDK which doesn't work in Deno due to ESM issues.
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting HTTP-based oracle settler...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const railwaySettlerUrl = Deno.env.get('RAILWAY_SETTLER_URL');
    const settlerApiKey = Deno.env.get('SETTLER_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body for single feed mode
    let requestedFeedId: string | null = null;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        requestedFeedId = body.feedId || null;
      } catch {
        // No body, proceed with batch mode
      }
    }
    
    // Get feeds to settle
    let feedsToSettle: any[] = [];
    
    if (requestedFeedId) {
      // Single feed mode
      const { data, error } = await supabase
        .from('feeds')
        .select('*')
        .eq('id', requestedFeedId)
        .maybeSingle();
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Feed not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      feedsToSettle = [data];
    } else {
      // Batch mode - different logic per module type
      const now = new Date().toISOString();
      
      // === CRYPTO/MEMECOIN/WEATHER: settle by resolution_date ===
      const { data: timeBasedFeeds, error: timeError } = await supabase
        .from('feeds')
        .select('*')
        .eq('status', 'pending')
        .in('module', ['crypto', 'memecoin', 'weather'])
        .lte('resolution_date', now);
      
      if (timeError) {
        console.error('Error fetching time-based feeds:', timeError.message);
      }
      
      // === ESPORTS: settle when matchStatus === 'finished' ===
      const { data: esportsFeeds, error: esportsError } = await supabase
        .from('feeds')
        .select('*')
        .eq('status', 'pending')
        .eq('module', 'esports');
      
      if (esportsError) {
        console.error('Error fetching esports feeds:', esportsError.message);
      }
      
      // Filter esports feeds where match has finished
      const finishedEsports = (esportsFeeds || []).filter(
        (f: any) => f.config?.matchStatus === 'finished'
      );
      
      if (finishedEsports.length > 0) {
        console.log(`Found ${finishedEsports.length} finished esports matches to settle`);
      }
      
      feedsToSettle = [...(timeBasedFeeds || []), ...finishedEsports];
    }
    
    if (feedsToSettle.length === 0) {
      console.log('No feeds to settle');
      return new Response(
        JSON.stringify({ success: true, message: 'No feeds to settle', settled: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${feedsToSettle.length} feeds to settle`);
    
    const results: Array<{ feedId: string; success: boolean; error?: string; value?: string; tx?: string }> = [];
    
    for (const feed of feedsToSettle) {
      console.log(`\n=== Processing feed: ${feed.id} ===`);
      console.log(`Feed pubkey: ${feed.feed_pubkey}`);
      console.log(`Feed hash: ${feed.feed_hash}`);
      console.log(`Module: ${feed.module}`);
      
      try {
        let settledValue: string | null = null;
        let settlementTx: string | null = null;
        
        // === ESPORTS: Use match result from config (set by match-watcher) ===
        if (feed.module === 'esports') {
          const config = feed.config || {};
          if (config.winnerId && config.team1Id && config.team2Id) {
            // Determine result: 1 if team1 won, 2 if team2 won, 0 otherwise
            if (config.winnerId === config.team1Id) {
              settledValue = '1';
            } else if (config.winnerId === config.team2Id) {
              settledValue = '2';
            } else {
              settledValue = '0'; // Draw or cancelled
            }
            console.log(`Esports result: winner=${config.winnerId}, team1=${config.team1Id}, team2=${config.team2Id} => value=${settledValue}`);
          } else {
            console.log('Esports feed missing winner info in config');
          }
        } else {
          // Step 1: Get oracle value from Crossbar simulation (for crypto/memecoin/weather)
          if (feed.feed_hash) {
            console.log('Fetching value from Crossbar...');
            try {
              const simResponse = await fetch(`https://crossbar.switchboard.xyz/simulate/${feed.feed_hash}`);
              if (simResponse.ok) {
                const simData = await simResponse.json();
                console.log('Crossbar response:', JSON.stringify(simData));
                
                // Extract value from response - Crossbar returns array format:
                // [{"feedHash":"...", "results":["0.1244790962"], "receipts":null}]
                if (Array.isArray(simData) && simData.length > 0 && simData[0].results?.length > 0) {
                  settledValue = simData[0].results[0]?.toString() || null;
                } else if (simData.results && simData.results.length > 0) {
                  // Fallback format: { results: ["123.45"] }
                  settledValue = simData.results[0]?.toString() || null;
                } else if (simData.result !== undefined) {
                  // Fallback format: { result: "123.45" }
                  settledValue = simData.result?.toString() || null;
                }
                
                console.log(`Crossbar value: ${settledValue}`);
              } else {
                console.log(`Crossbar returned ${simResponse.status}`);
              }
            } catch (e: any) {
              console.log('Crossbar fetch error:', e.message);
            }
          }
        }
        
        // Step 2: Try on-chain settlement via Railway settler
        if (railwaySettlerUrl && settlerApiKey && feed.feed_pubkey && feed.feed_hash) {
          console.log('Attempting on-chain settlement via Railway...');
          
          const requestBody: Record<string, any> = {
            feedPubkey: feed.feed_pubkey,
            feedHash: feed.feed_hash,
            feedId: feed.id,
            module: feed.module,
          };
          
          // For esports, pass winner info to Railway settler
          if (feed.module === 'esports' && feed.config) {
            requestBody.winnerId = feed.config.winnerId;
            requestBody.team1Id = feed.config.team1Id;
            requestBody.team2Id = feed.config.team2Id;
          }
          console.log('Railway request body:', JSON.stringify(requestBody));
          
          try {
            const settleResponse = await fetch(`${railwaySettlerUrl}/settle-feed`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': settlerApiKey,
              },
              body: JSON.stringify(requestBody),
            });
            
            const settleData = await settleResponse.json();
            console.log('Railway response:', JSON.stringify(settleData));
            
            if (settleResponse.ok && settleData.success) {
              // Railway returns txSignature, not signature
              settlementTx = settleData.txSignature || settleData.signature || null;
              // Use Railway's settled value if available
              if (settleData.settledValue) {
                settledValue = settleData.settledValue.toString();
              }
              console.log(`On-chain tx: ${settlementTx}`);
            } else if (settleData.error) {
              console.log(`Railway error: ${settleData.error}`);
            } else {
              console.log(`Railway returned ${settleResponse.status}`);
            }
          } catch (e: any) {
            console.log('Railway fetch error:', e.message);
            // Continue - we can still settle with just the Crossbar value
          }
        } else {
          console.log('Railway settler not configured, using Crossbar value only');
        }
        
        // Step 3: Update feed in database
        if (settledValue) {
          const { error: updateError } = await supabase.from('feeds').update({
            status: 'settled',
            settled_at: new Date().toISOString(),
            settled_value: settledValue,
            settlement_tx: settlementTx, // May be null if Railway failed
          }).eq('id', feed.id);
          
          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`);
          }
          
          results.push({
            feedId: feed.id,
            success: true,
            value: settledValue,
            tx: settlementTx || undefined,
          });
          
          console.log(`✅ Feed ${feed.id} settled: value=${settledValue}, tx=${settlementTx || 'N/A'}`);
        } else {
          throw new Error('Could not fetch value from Crossbar');
        }
        
      } catch (error: any) {
        console.error(`❌ Error settling feed ${feed.id}:`, error.message);
        
        // Mark as failed in database
        await supabase.from('feeds').update({ status: 'failed' }).eq('id', feed.id);
        
        results.push({
          feedId: feed.id,
          success: false,
          error: error.message,
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const onChainCount = results.filter(r => r.tx).length;
    
    // Single feed mode response
    if (requestedFeedId && results.length === 1) {
      const result = results[0];
      return new Response(
        JSON.stringify({
          success: result.success,
          settled_value: result.value || null,
          settlement_tx: result.tx || null,
          on_chain: !!result.tx,
          solscan_url: result.tx ? `https://solscan.io/tx/${result.tx}` : null,
          error: result.error || null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        settled: successCount,
        on_chain: onChainCount,
        failed: results.length - successCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Settler error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
