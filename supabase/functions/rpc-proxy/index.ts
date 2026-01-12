import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, solana-client',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log(`RPC Proxy received: ${req.method} request`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  const HELIUS_RPC_URL = Deno.env.get('HELIUS_RPC_URL');
  
  if (!HELIUS_RPC_URL) {
    console.error('HELIUS_RPC_URL not configured in secrets');
    return new Response(
      JSON.stringify({ error: 'RPC endpoint not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('HELIUS_RPC_URL is configured, length:', HELIUS_RPC_URL.length);

  try {
    const body = await req.text();
    console.log('Request body:', body.substring(0, 200));

    // Forward request to Helius
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    console.log('Helius response status:', response.status);

    const data = await response.text();
    console.log('Helius response:', data.substring(0, 200));

    return new Response(data, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('RPC Proxy error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
