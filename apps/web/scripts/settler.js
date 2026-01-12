/**
 * Railway Settler - On-Chain Settlement with Switchboard
 * Version: 1.0.1 - Fixed duplicate exports
 * 
 * This script runs as an HTTP server that:
 * 1. Receives settlement requests from Edge Function
 * 2. Performs on-chain settlement via Switchboard SDK
 * 3. Returns transaction signature to Edge Function
 * 
 * Also runs as cron job to process pending feeds automatically.
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as sb from '@switchboard-xyz/on-demand';
import { CrossbarClient } from '@switchboard-xyz/common';
import bs58 from 'bs58';
import http from 'http';

// Crossbar client for fetching oracle signatures
const crossbarClient = new CrossbarClient("https://crossbar.switchboard.xyz");

// Configuration
const SETTLER_PRIVATE_KEY = process.env.SETTLER_PRIVATE_KEY;
const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=your-key';
const SETTLER_API_KEY = process.env.SETTLER_API_KEY;
const PORT = process.env.PORT || 3000;

// Edge Function URL (public, no auth needed for get-pending)
const EDGE_FUNCTION_URL = 'https://zryeulucckdgaiboxntn.supabase.co/functions/v1/oracle-settler';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeWV1bHVjY2tkZ2FpYm94bnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTI5MTMsImV4cCI6MjA4MjMyODkxM30.zl1aSzXWEsJZfghzW5QT7OoR4mGBIl6c30YOS7rMnwY';

// Cached Switchboard program and connection
let cachedConnection = null;
let cachedProgram = null;
let cachedSettler = null;

/**
 * Initialize Switchboard connection (cached for reuse)
 */
async function initializeSwitchboard() {
  if (cachedProgram) return { connection: cachedConnection, program: cachedProgram, settler: cachedSettler };
  
  if (!SETTLER_PRIVATE_KEY) {
    throw new Error('SETTLER_PRIVATE_KEY not configured');
  }
  
  console.log('Initializing Switchboard connection...');
  
  cachedConnection = new Connection(HELIUS_RPC_URL, 'processed');
  cachedSettler = Keypair.fromSecretKey(bs58.decode(SETTLER_PRIVATE_KEY));
  
  console.log(`Settler wallet: ${cachedSettler.publicKey.toBase58()}`);
  
  // Check balance
  const balance = await cachedConnection.getBalance(cachedSettler.publicKey);
  console.log(`Settler balance: ${balance / 1e9} SOL`);
  
  cachedProgram = await sb.AnchorUtils.loadProgramFromConnection(cachedConnection, {
    publicKey: cachedSettler.publicKey,
    signTransaction: async (tx) => { tx.sign([cachedSettler]); return tx; },
    signAllTransactions: async (txs) => { txs.forEach(tx => tx.sign([cachedSettler])); return txs; },
  });
  
  console.log('Switchboard initialized!');
  
  return { connection: cachedConnection, program: cachedProgram, settler: cachedSettler };
}

/**
 * Fetch pending feeds from Edge Function
 */
async function fetchPendingFeeds() {
  console.log('Fetching pending feeds from Edge Function...');
  
  const response = await fetch(`${EDGE_FUNCTION_URL}?action=get-pending`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pending feeds: ${response.status}`);
  }
  
  const data = await response.json();
  return data.feeds || [];
}

/**
 * Record settlement result to Edge Function
 */
async function recordSettlement(feedId, txSignature, settledValue) {
  console.log(`Recording settlement: feed=${feedId}, tx=${txSignature}, value=${settledValue}`);
  
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'record',
      feedId,
      txSignature,
      settledValue,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to record settlement: ${error}`);
  }
  
  return await response.json();
}

/**
 * Settle a single feed on-chain using Switchboard SDK v3
 */
async function settleFeedOnChain(feed, connection, settler, program) {
  console.log(`\n=== Settling feed: ${feed.id || feed.feedPubkey} ===`);
  
  const feedPubkey = feed.feed_pubkey || feed.feedPubkey;
  const feedHash = feed.feed_hash || feed.feedHash;
  
  console.log(`Feed pubkey: ${feedPubkey}`);
  console.log(`Feed hash: ${feedHash}`);
  console.log(`Module: ${feed.module}`);
  
  // Load the Switchboard Pull Feed
  const pullFeed = new sb.PullFeed(program, new PublicKey(feedPubkey));
  
  // SDK v3: fetchUpdateIx with CrossbarClient
  console.log('Fetching oracle signatures via Crossbar...');
  const [pullIx, responses, _ok, luts] = await pullFeed.fetchUpdateIx({
    crossbarClient: crossbarClient,
    chain: "solana",
    network: "mainnet",
  });
  
  if (!pullIx) {
    throw new Error('No update instruction returned from oracles');
  }
  
  // pullIx from fetchUpdateIx() returns an array [secpIx, submitIx], not a single instruction
  const ixArray = Array.isArray(pullIx) ? pullIx : [pullIx];
  console.log(`Got oracle response, instructions count: ${ixArray.length}, LUTs: ${luts ? luts.length : 'null'}`);
  
  // Filter out undefined/null lookup tables to prevent toBase58() errors
  const validLuts = luts?.filter((lut) => lut !== undefined && lut !== null) || [];
  
  // SDK v3: Use sb.asV0Tx helper for transaction creation
  const tx = await sb.asV0Tx({
    connection,
    ixs: ixArray,
    signers: [settler],
    computeUnitPrice: 200_000,
    computeUnitLimitMultiple: 1.3,
    lookupTables: validLuts,
  });
  
  // Send transaction
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
    maxRetries: 3,
  });
  
  console.log(`Transaction sent: ${signature}`);
  
  // Confirm transaction
  const confirmation = await connection.confirmTransaction(signature, 'confirmed');
  
  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }
  
  console.log('Transaction confirmed!');
  
  // Get settled value from oracle responses
  let settledValue = 'N/A';
  
  if (responses && responses.length > 0) {
    const firstResponse = responses[0];
    if (firstResponse?.result !== undefined) {
      settledValue = firstResponse.result.toString();
    } else if (firstResponse?.value !== undefined) {
      settledValue = firstResponse.value.toString();
    }
  }
  
  // Fallback: load from on-chain feed account
  if (settledValue === 'N/A') {
    try {
      const feedAccount = await pullFeed.loadData();
      if (feedAccount?.result?.value) {
        settledValue = feedAccount.result.value.toString();
      }
    } catch (e) {
      console.log('Could not load feed account data:', e.message);
    }
  }
  
  console.log(`Settled value: ${settledValue}`);
  
  return { signature, settledValue };
}

/**
 * Main settler function (for cron job)
 */
async function runSettler() {
  console.log(`\n[${new Date().toISOString()}] Starting on-chain settler...`);
  
  if (!SETTLER_PRIVATE_KEY) {
    console.error('❌ Missing SETTLER_PRIVATE_KEY environment variable');
    return { settled: 0, failed: 0, error: 'Missing SETTLER_PRIVATE_KEY' };
  }
  
  const { connection, program, settler } = await initializeSwitchboard();
  
  // Fetch pending feeds
  const feeds = await fetchPendingFeeds();
  
  if (feeds.length === 0) {
    console.log('No feeds to settle');
    return { settled: 0, failed: 0 };
  }
  
  console.log(`Found ${feeds.length} feeds to settle`);
  
  let settledCount = 0;
  let failedCount = 0;
  
  for (const feed of feeds) {
    try {
      const { signature, settledValue } = await settleFeedOnChain(
        feed, connection, settler, program
      );
      
      await recordSettlement(feed.id, signature, settledValue);
      
      console.log(`✅ Feed ${feed.id} settled on-chain: tx=${signature}`);
      settledCount++;
      
    } catch (error) {
      console.error(`❌ Failed to settle feed ${feed.id}:`, error.message);
      failedCount++;
    }
  }
  
  console.log(`\n[${new Date().toISOString()}] Settlement complete: ${settledCount} settled, ${failedCount} failed`);
  
  return { settled: settledCount, failed: failedCount };
}

/**
 * HTTP Server for receiving settlement requests
 */
function startServer() {
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        settler: cachedSettler?.publicKey?.toBase58() || 'not initialized'
      }));
      return;
    }
    
    // Settle endpoint (supports both /settle and /settle-feed for compatibility)
    if ((url.pathname === '/settle' || url.pathname === '/settle-feed') && req.method === 'POST') {
      // Validate API key - support both header formats
      const authHeader = req.headers['authorization'];
      const xApiKey = req.headers['x-api-key'];
      const providedKey = xApiKey || authHeader?.replace('Bearer ', '');
      
      if (SETTLER_API_KEY && providedKey !== SETTLER_API_KEY) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or missing API key' }));
        return;
      }
      
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          console.log(`\n[${new Date().toISOString()}] Raw request body: ${body}`);
          
          const parsed = JSON.parse(body);
          const { feedPubkey, feedHash, feedId, module, config } = parsed;
          
          console.log(`Parsed - feedPubkey: ${feedPubkey}, feedHash: ${feedHash}, feedId: ${feedId}`);
          
          if (!feedPubkey) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'feedPubkey is required' }));
            return;
          }
          
          if (!feedHash) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'feedHash is required for on-chain settlement' }));
            return;
          }
          
          console.log(`\n[${new Date().toISOString()}] Settlement request for: ${feedPubkey}`);
          console.log(`Feed hash: ${feedHash}`);
          
          const { connection, program, settler } = await initializeSwitchboard();
          
          const feed = { feedPubkey, feedHash, id: feedId, module, config };
          const { signature, settledValue } = await settleFeedOnChain(
            feed, connection, settler, program
          );
          
          console.log(`✅ On-chain settlement successful: ${signature}`);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            txSignature: signature,
            settledValue,
            solscanUrl: `https://solscan.io/tx/${signature}`,
          }));
          
        } catch (error) {
          console.error('Settlement error:', error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: error.message 
          }));
        }
      });
      return;
    }
    
    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
  
  server.listen(PORT, () => {
    console.log(`\n🚀 Railway Settler HTTP Server running on port ${PORT}`);
    console.log(`   POST /settle - Submit settlement request`);
    console.log(`   GET /health - Health check`);
    
    if (SETTLER_API_KEY) {
      console.log(`   🔐 API key authentication enabled`);
    } else {
      console.log(`   ⚠️  No API key configured (SETTLER_API_KEY)`);
    }
  });
  
  return server;
}

/**
 * Settle a single feed (convenience wrapper for server.js)
 */
async function settleSingleFeed({ feedPubkey, feedId, module, config, feedHash }) {
  const { connection, program, settler } = await initializeSwitchboard();
  
  const feed = { 
    feedPubkey, 
    feedHash, 
    id: feedId, 
    module, 
    config 
  };
  
  return await settleFeedOnChain(feed, connection, settler, program);
}

// Export all functions for use by server.js
export { initializeSwitchboard, settleFeedOnChain, settleSingleFeed, startServer, runSettler };

// Only auto-start if this file is run directly (not imported as module)
// Check if running as main module by comparing with process.argv
const scriptPath = process.argv[1];
const isMainModule = scriptPath && (
  scriptPath.endsWith('settler.js') || 
  scriptPath.includes('/settler.js')
);

if (isMainModule) {
  console.log('=== Railway Settler Starting (HTTP-only mode) ===');
  
  // Pre-initialize Switchboard connection
  initializeSwitchboard()
    .then(() => console.log('Switchboard ready'))
    .catch(err => console.error('Switchboard init failed:', err.message));
  
  // Start HTTP server only - no cron job
  // Edge Function will call /settle-feed directly with all required data
  startServer();
}
