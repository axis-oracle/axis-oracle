import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Launchpad Status Edge Function
 * 
 * Fetches bonding curve status for Pump.fun tokens using Moralis API.
 * Returns: bondingProgress, isGraduated, tokenName, tokenSymbol, tokenImage
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokenAddress, launchpad } = await req.json();
    
    if (!tokenAddress) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching ${launchpad || 'pumpfun'} status for token: ${tokenAddress}`);

    const moralisApiKey = Deno.env.get('MORALIS_API_KEY');
    if (!moralisApiKey) {
      throw new Error('MORALIS_API_KEY not configured');
    }

    // Try Moralis first for Pump.fun tokens
    let bondingData: any = null;
    let tokenMetadata: any = {};
    let isGraduated = false;
    let bondingProgress = 0;

    // Fetch token bonding status from Moralis Pump.fun API
    const bondingResponse = await fetch(
      `https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/bonding-status`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': moralisApiKey,
        },
      }
    );

    if (bondingResponse.ok) {
      bondingData = await bondingResponse.json();
      console.log('Moralis bonding data:', JSON.stringify(bondingData));
      bondingProgress = bondingData.bondingProgress || bondingData.progress || 0;
      isGraduated = bondingData.isGraduated || bondingData.graduated || bondingProgress >= 100;
    }

    // Fetch token metadata from Moralis
    const metadataResponse = await fetch(
      `https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/metadata`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': moralisApiKey,
        },
      }
    );

    if (metadataResponse.ok) {
      tokenMetadata = await metadataResponse.json();
      console.log('Token metadata:', JSON.stringify(tokenMetadata));
    }

    // If Moralis didn't return data, try DexScreener as fallback
    if (!bondingData && !tokenMetadata.name) {
      console.log('Moralis returned no data, trying DexScreener...');
      const dexResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      );
      
      if (dexResponse.ok) {
        const dexData = await dexResponse.json();
        if (dexData.pairs && dexData.pairs.length > 0) {
          const pair = dexData.pairs[0];
          tokenMetadata = {
            name: pair.baseToken?.name || 'Unknown',
            symbol: pair.baseToken?.symbol || 'UNKNOWN',
            logo: pair.info?.imageUrl || null,
          };
          // If we can find data on DEX, it likely graduated
          isGraduated = true;
          bondingProgress = 100;
          console.log('DexScreener data found - token likely graduated');
        }
      }
    }

    // If still no data found
    if (!tokenMetadata.name && !bondingData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Token not found. Make sure this is a valid ${launchpad === 'letsbonk' ? 'LetsBonk.fun' : 'Pump.fun'} token address.` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tokenAddress,
          launchpad: launchpad || 'pumpfun',
          tokenName: tokenMetadata.name || 'Unknown',
          tokenSymbol: tokenMetadata.symbol || 'UNKNOWN',
          tokenImage: tokenMetadata.logo || tokenMetadata.image || null,
          bondingProgress: Math.min(100, Math.max(0, bondingProgress)),
          isGraduated,
          rawData: bondingData,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Launchpad status error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
