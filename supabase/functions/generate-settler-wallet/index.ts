import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Keypair } from "https://esm.sh/@solana/web3.js@1.98.4";
import { encode as encodeBase58 } from "https://deno.land/std@0.208.0/encoding/base58.ts";

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
    console.log('Generating new settler wallet keypair...');
    
    // Generate a new random keypair
    const keypair = Keypair.generate();
    
    // Get the public key (address for funding)
    const publicKey = keypair.publicKey.toBase58();
    
    // Get the private key (secret key encoded in base58)
    const privateKey = encodeBase58(keypair.secretKey);
    
    console.log('Generated wallet with public key:', publicKey);
    
    return new Response(
      JSON.stringify({
        success: true,
        publicKey,
        privateKey,
        message: 'Wallet generated successfully. Save the private key as SETTLER_PRIVATE_KEY secret and fund the public key with SOL.',
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error generating wallet:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate wallet',
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
