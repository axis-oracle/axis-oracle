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
      
      // === CRYPTO/MEMECOIN/WEATHER/SOCIAL/MOVIES/STEAM: settle by resolution_date ===
      const { data: timeBasedFeeds, error: timeError } = await supabase
        .from('feeds')
        .select('*')
        .eq('status', 'pending')
        .in('module', ['crypto', 'memecoin', 'weather', 'social', 'movies', 'steam', 'cosmos', 'politics', 'economy', 'awards', 'legal', 'custom'])
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
      
      // === SPORTS: settle when matchStatus === 'finished' ===
      const { data: sportsFeeds, error: sportsError } = await supabase
        .from('feeds')
        .select('*')
        .eq('status', 'pending')
        .eq('module', 'sports');
      
      if (sportsError) {
        console.error('Error fetching sports feeds:', sportsError.message);
      }
      
      // Filter sports feeds where match has finished
      const finishedSports = (sportsFeeds || []).filter(
        (f: any) => f.config?.matchStatus === 'finished'
      );
      
      if (finishedSports.length > 0) {
        console.log(`Found ${finishedSports.length} finished sports matches to settle`);
      }
      
      // === LAUNCHPAD: settle when matchStatus === 'finished' (graduated) OR resolution_date passed ===
      const { data: launchpadFeeds, error: launchpadError } = await supabase
        .from('feeds')
        .select('*')
        .eq('status', 'pending')
        .eq('module', 'launchpad');
      
      if (launchpadError) {
        console.error('Error fetching launchpad feeds:', launchpadError.message);
      }
      
      // Filter launchpad feeds: either graduated OR resolution_date passed
      const readyLaunchpad = (launchpadFeeds || []).filter((f: any) => {
        const config = f.config || {};
        const isGraduated = config.matchStatus === 'finished' || config.isGraduated === true;
        const resolutionPassed = f.resolution_date && new Date(f.resolution_date) <= new Date(now);
        return isGraduated || resolutionPassed;
      });
      
      if (readyLaunchpad.length > 0) {
        console.log(`Found ${readyLaunchpad.length} launchpad feeds ready for settlement`);
      }
      
      feedsToSettle = [...(timeBasedFeeds || []), ...finishedEsports, ...finishedSports, ...readyLaunchpad];
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
        } else if (feed.module === 'sports') {
          // === SPORTS: Use match result from config (set by sports-match-watcher) ===
          const config = feed.config || {};
          if (config.winnerId) {
            // Determine result: 1 if home won, 2 if away won, 0 for draw
            if (config.winnerId === 'home') {
              settledValue = '1';
            } else if (config.winnerId === 'away') {
              settledValue = '2';
            } else {
              settledValue = '0'; // Draw
            }
            console.log(`Sports result: winner=${config.winnerId} => value=${settledValue}`);
          } else {
            console.log('Sports feed missing winner info in config');
          }
        } else if (feed.module === 'social') {
          // === SOCIAL: Fetch Twitter metrics at resolution time ===
          const config = feed.config || {};
          const tweetId = config.tweetId;
          const metric = config.metric as string; // 'likes' or 'retweets'
          
          if (tweetId && metric) {
            console.log(`Fetching Twitter metrics for tweet ${tweetId}, metric: ${metric}`);
            
            try {
              // Call our twitter-metrics edge function
              const twitterResponse = await fetch(`${supabaseUrl}/functions/v1/twitter-metrics`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({ tweetId }),
              });
              
              if (twitterResponse.ok) {
                const twitterData = await twitterResponse.json();
                console.log('Twitter API response:', JSON.stringify(twitterData));
                
                if (twitterData.success && twitterData.data) {
                  // Get the metric value
                  const metricValue = twitterData.data[metric] || 0;
                  settledValue = metricValue.toString();
                  console.log(`Social metric ${metric}: ${settledValue}`);
                } else {
                  console.log('Twitter API returned error:', twitterData.error);
                }
              } else {
                console.log(`Twitter API returned ${twitterResponse.status}`);
              }
            } catch (e: any) {
              console.log('Twitter API fetch error:', e.message);
            }
          } else {
            console.log('Social feed missing tweetId or metric in config');
          }
        } else if (feed.module === 'launchpad') {
          // === LAUNCHPAD: Determine graduation outcome ===
          const config = feed.config || {};
          const isGraduated = config.isGraduated === true || config.matchStatus === 'finished';
          const resolutionPassed = feed.resolution_date && new Date(feed.resolution_date) <= new Date();
          
          if (isGraduated) {
            // Token graduated before deadline = YES wins
            settledValue = '1';
            console.log(`Launchpad ${config.tokenSymbol}: GRADUATED => value=1 (YES)`);
          } else if (resolutionPassed) {
            // Deadline passed, not graduated = NO wins
            settledValue = '2';
            console.log(`Launchpad ${config.tokenSymbol}: NOT graduated, deadline passed => value=2 (NO)`);
          } else {
            console.log('Launchpad feed not ready for settlement yet');
          }
        } else if (feed.module === 'movies') {
          // === MOVIES: Fetch current movie data from TMDB ===
          const config = feed.config || {};
          const movieId = config.movieId;
          const metric = config.metric as string;
          
          if (movieId && metric) {
            console.log(`Fetching TMDB data for movie ${movieId}, metric: ${metric}`);
            
            try {
              const tmdbResponse = await fetch(`${supabaseUrl}/functions/v1/tmdb-movie-details`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({ movieId }),
              });
              
              if (tmdbResponse.ok) {
                const tmdbData = await tmdbResponse.json();
                console.log('TMDB API response:', JSON.stringify(tmdbData));
                
                if (tmdbData.success && tmdbData.data) {
                  const metricValue = tmdbData.data[metric];
                  if (metricValue !== undefined) {
                    settledValue = metricValue.toString();
                    console.log(`Movies metric ${metric}: ${settledValue}`);
                  }
                } else {
                  console.log('TMDB API returned error:', tmdbData.error);
                }
              } else {
                console.log(`TMDB API returned ${tmdbResponse.status}`);
              }
            } catch (e: any) {
              console.log('TMDB API fetch error:', e.message);
            }
          } else {
            console.log('Movies feed missing movieId or metric in config');
          }
        } else if (feed.module === 'steam') {
          // === STEAM: Fetch current player count and compare to target ===
          const config = feed.config || {};
          const appId = config.appId;
          const targetCcu = config.targetCcu;
          
          if (appId && targetCcu !== undefined) {
            console.log(`Fetching Steam player count for app ${appId}, target: ${targetCcu}`);
            
            try {
              const steamResponse = await fetch(`${supabaseUrl}/functions/v1/steam-players?appid=${appId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (steamResponse.ok) {
                const steamData = await steamResponse.json();
                console.log('Steam API response:', JSON.stringify(steamData));
                
                if (steamData.player_count !== undefined) {
                  const playerCount = steamData.player_count;
                  // Result: 1 if players > target, 0 otherwise
                  const conditionMet = playerCount > targetCcu;
                  settledValue = conditionMet ? '1' : '0';
                  console.log(`Steam ${config.gameName}: ${playerCount} players, target ${targetCcu} => ${conditionMet ? 'MET' : 'NOT MET'} (value=${settledValue})`);
                  
                  // Store final player count in config for display
                  await supabase.from('feeds').update({
                    config: { ...config, finalPlayerCount: playerCount }
                  }).eq('id', feed.id);
                } else {
                  console.log('Steam API returned no player count');
                }
              } else {
                console.log(`Steam API returned ${steamResponse.status}`);
              }
            } catch (e: any) {
              console.log('Steam API fetch error:', e.message);
            }
          } else {
            console.log('Steam feed missing appId or targetCcu in config');
          }
        } else if (feed.module === 'cosmos') {
          // === COSMOS: Check launch status from Launch Library 2 ===
          const config = feed.config || {};
          const launchId = config.launchId;
          const condition = config.condition; // 'success', 'scrubbed', 'booster_landed'
          
          if (launchId && condition) {
            console.log(`Fetching launch status for ${launchId}, condition: ${condition}`);
            
            try {
              // Fetch specific launch from Launch Library 2
              const launchResponse = await fetch(
                `https://ll.thespacedevs.com/2.2.0/launch/${launchId}/`,
                { headers: { 'Accept': 'application/json' } }
              );
              
              if (launchResponse.ok) {
                const launchData = await launchResponse.json();
                console.log('Launch Library response status:', launchData.status?.name);
                
                const statusId = launchData.status?.id;
                const statusName = launchData.status?.name || '';
                
                // Launch Library 2 status IDs:
                // 1 = Go, 2 = TBD, 3 = Success, 4 = Failure, 5 = Hold, 6 = In Flight, 7 = Partial Failure
                
                let conditionMet = false;
                
                if (condition === 'success') {
                  conditionMet = statusId === 3; // Success
                } else if (condition === 'scrubbed') {
                  // Check if launch was scrubbed/cancelled/held indefinitely
                  conditionMet = statusName.toLowerCase().includes('scrub') || 
                                 statusName.toLowerCase().includes('cancel') ||
                                 statusId === 5; // Hold
                } else if (condition === 'booster_landed') {
                  // Check rocket landing info if available
                  const landingSuccess = launchData.rocket?.launcher_stage?.[0]?.landing?.success;
                  conditionMet = landingSuccess === true;
                }
                
                settledValue = conditionMet ? '1' : '0';
                console.log(`Cosmos ${config.launchName}: status=${statusName} (${statusId}), condition=${condition} => ${conditionMet ? 'MET' : 'NOT MET'} (value=${settledValue})`);
                
                // Store final status in config
                await supabase.from('feeds').update({
                  config: { ...config, finalStatus: statusName, finalStatusId: statusId }
                }).eq('id', feed.id);
              } else {
                console.log(`Launch Library API returned ${launchResponse.status}`);
              }
            } catch (e: any) {
              console.log('Launch Library API fetch error:', e.message);
            }
          } else {
            console.log('Cosmos feed missing launchId or condition in config');
          }
        } else if (feed.module === 'politics' || feed.module === 'economy' || feed.module === 'awards' || feed.module === 'legal' || feed.module === 'custom') {
          // === AI-POWERED MODULES: Use Claude AI for resolution ===
          const config = feed.config || {};
          const question = config.question as string;
          
          if (question) {
            console.log(`AI Resolution for ${feed.module}: ${question}`);
            
            try {
              const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-resolution`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  feedId: feed.id,
                  module: feed.module,
                  question: question,
                  config: config,
                }),
              });
              
              if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                console.log('AI Resolution response:', JSON.stringify(aiData));
                
                if (aiData.success && aiData.outcome && aiData.outcome !== 'pending' && aiData.outcome !== 'error') {
                  // Map AI outcome to numeric value for on-chain storage
                  // Binary outcomes: '1' = YES/True, '0' = NO/False
                  // For named outcomes (like winners), store hash or specific value
                  if (aiData.outcome === '1' || aiData.outcome === '0') {
                    settledValue = aiData.outcome;
                  } else {
                    // For non-binary outcomes, store the outcome string
                    // Convert to a deterministic numeric representation
                    settledValue = aiData.outcome;
                  }
                  
                  console.log(`AI resolved ${feed.module}: outcome=${aiData.outcome}, confidence=${aiData.confidence}%`);
                  
                  // Store AI resolution details in config
                  await supabase.from('feeds').update({
                    config: { 
                      ...config, 
                      aiResolution: {
                        outcome: aiData.outcome,
                        confidence: aiData.confidence,
                        reasoning: aiData.reasoning,
                        sources: aiData.sources,
                        resolvedAt: new Date().toISOString(),
                      }
                    }
                  }).eq('id', feed.id);
                } else if (aiData.outcome === 'pending') {
                  console.log(`AI says event is still pending for ${feed.module}`);
                  // Don't settle yet - event hasn't happened
                  continue;
                } else {
                  console.log('AI Resolution returned error or invalid outcome:', aiData.error || 'unknown');
                }
              } else {
                console.log(`AI Resolution returned ${aiResponse.status}`);
              }
            } catch (e: any) {
              console.log('AI Resolution fetch error:', e.message);
            }
          } else {
            console.log(`${feed.module} feed missing question in config`);
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
          
        // For esports/sports/social/launchpad/movies/steam/cosmos/AI modules, pass pre-computed value and skip Switchboard fetchUpdateIx
        const aiModules = ['politics', 'economy', 'awards', 'legal', 'custom'];
        const preComputeModules = ['esports', 'sports', 'social', 'launchpad', 'movies', 'steam', 'cosmos', ...aiModules];
        if (preComputeModules.includes(feed.module) && settledValue) {
          requestBody.preComputedValue = settledValue;
          requestBody.skipFetchUpdate = true;
          console.log(`${feed.module}: using pre-computed value ${settledValue}, skipping fetchUpdateIx`);
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
