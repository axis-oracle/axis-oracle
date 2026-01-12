// Edge function to securely update feed after recreate
// This bypasses RLS using SERVICE_ROLE_KEY and verifies wallet ownership

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { verify } from 'https://esm.sh/@noble/ed25519@2.0.0';
import { decode as decodeBase58 } from 'https://esm.sh/bs58@5.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateFeedRequest {
  feedId: string;
  walletAddress: string;
  newFeedPubkey: string;
  newFeedHash: string;
  signature: string;       // Base58 encoded Ed25519 signature
  message: string;         // Original message that was signed
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Create admin client that bypasses RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body: UpdateFeedRequest = await req.json();
    const { feedId, walletAddress, newFeedPubkey, newFeedHash, signature, message } = body;

    console.log('Update feed request:', { feedId, walletAddress, newFeedPubkey: newFeedPubkey?.slice(0, 8) });

    // Validate required fields
    if (!feedId || !walletAddress || !newFeedPubkey || !newFeedHash || !signature || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verify the signature matches the wallet address
    console.log('Verifying wallet signature...');
    let isValidSignature = false;
    
    try {
      const signatureBytes = decodeBase58(signature);
      const messageBytes = new TextEncoder().encode(message);
      const publicKeyBytes = decodeBase58(walletAddress);
      
      isValidSignature = await verify(signatureBytes, messageBytes, publicKeyBytes);
    } catch (sigError) {
      console.error('Signature verification error:', sigError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid signature format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidSignature) {
      console.error('Signature verification failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid signature - wallet ownership not verified' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('Signature verified successfully');

    // 2. Verify the message contains the expected data (prevents replay attacks)
    const expectedMessagePart = `recreate:${feedId}:${newFeedPubkey}`;
    if (!message.includes(expectedMessagePart)) {
      console.error('Message mismatch:', { message, expectedMessagePart });
      return new Response(
        JSON.stringify({ success: false, error: 'Message does not match expected format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Fetch the feed and verify ownership
    const { data: feed, error: fetchError } = await supabaseAdmin
      .from('feeds')
      .select('id, wallet_address')
      .eq('id', feedId)
      .maybeSingle();

    if (fetchError) {
      console.error('Failed to fetch feed:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch feed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!feed) {
      return new Response(
        JSON.stringify({ success: false, error: 'Feed not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Verify the caller is the owner of the feed
    if (feed.wallet_address !== walletAddress) {
      console.error('Ownership mismatch:', { feedOwner: feed.wallet_address, caller: walletAddress });
      return new Response(
        JSON.stringify({ success: false, error: 'You are not the owner of this feed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Update the feed with new data (using admin client that bypasses RLS)
    const { error: updateError } = await supabaseAdmin
      .from('feeds')
      .update({
        feed_pubkey: newFeedPubkey,
        feed_hash: newFeedHash,
        status: 'pending',
        settled_at: null,
        settled_value: null,
        settlement_tx: null,
      })
      .eq('id', feedId);

    if (updateError) {
      console.error('Failed to update feed:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update feed in database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Feed updated successfully:', feedId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update feed error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
