/**
 * Railway Settler Cron Service
 * 
 * Runs the on-chain settler at regular intervals.
 * Requires: SETTLER_PRIVATE_KEY, HELIUS_RPC_URL
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Configuration
const PORT = process.env.PORT || 3000;
const SETTLER_INTERVAL_MS = parseInt(process.env.SETTLER_INTERVAL_MS || '60000', 10);
const SETTLER_API_KEY = process.env.SETTLER_API_KEY;

// State
let lastSettleResult = null;
let lastSettleTime = null;
let isSettling = false;
let settlerModule = null;
let settlerError = null;

// Load settler module with error handling
async function loadSettlerModule() {
  try {
    settlerModule = await import('./settler.js');
    console.log('✅ Settler module loaded successfully');
    return true;
  } catch (error) {
    settlerError = error.message;
    console.error('❌ Failed to load settler module:', error.message);
    return false;
  }
}

// API Key authentication middleware
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!SETTLER_API_KEY) {
    // No API key configured - allow all requests (for development)
    return next();
  }
  
  if (apiKey !== SETTLER_API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  
  next();
}

// ============================================================================
// Routes
// ============================================================================

// Root endpoint - health check and status (public)
app.get('/', (req, res) => {
  res.json({
    service: 'TruthForge Oracle Settler',
    status: settlerModule ? 'running' : 'degraded',
    version: '1.0.0',
    lastSettleTime,
    lastSettleResult,
    isSettling,
    uptime: process.uptime(),
    config: {
      settlerKey: process.env.SETTLER_PRIVATE_KEY ? 'configured' : 'MISSING',
      heliusRpc: process.env.HELIUS_RPC_URL ? 'configured' : 'default',
      apiKey: SETTLER_API_KEY ? 'configured' : 'not required'
    },
    error: settlerError
  });
});

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({
    status: settlerModule ? 'ok' : 'degraded',
    lastSettleTime,
    lastSettleResult,
    isSettling,
    uptime: process.uptime(),
    error: settlerError
  });
});

// Manual trigger for batch settlement (protected)
app.post('/settle', requireApiKey, async (req, res) => {
  if (!settlerModule) {
    return res.status(503).json({ 
      success: false, 
      error: 'Settler module not loaded',
      details: settlerError 
    });
  }
  
  if (isSettling) {
    return res.json({ success: false, error: 'Settlement already in progress' });
  }
  
  console.log('Manual settle triggered via API');
  const result = await triggerSettle();
  res.json(result);
});

// Single feed settlement endpoint (protected)
app.post('/settle-feed', requireApiKey, async (req, res) => {
  if (!settlerModule) {
    return res.status(503).json({ 
      success: false, 
      error: 'Settler module not loaded',
      details: settlerError 
    });
  }
  
  console.log(`\n[${new Date().toISOString()}] Raw request body:`, JSON.stringify(req.body));
  
  const { feedPubkey, feedHash, feedId, module, config } = req.body;
  
  console.log(`Parsed - feedPubkey: ${feedPubkey}, feedHash: ${feedHash}, feedId: ${feedId}`);
  
  if (!feedPubkey) {
    return res.status(400).json({ success: false, error: 'feedPubkey is required' });
  }
  
  if (!feedHash) {
    return res.status(400).json({ success: false, error: 'feedHash is required for on-chain settlement' });
  }
  
  console.log(`Single feed settlement requested: ${feedPubkey} with hash: ${feedHash}`);
  
  try {
    const result = await settlerModule.settleSingleFeed({ feedPubkey, feedHash, feedId, module, config });
    res.json({ 
      success: true, 
      signature: result.signature,
      settledValue: result.settledValue 
    });
  } catch (error) {
    console.error('Single feed settlement error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================================================
// Settlement Logic
// ============================================================================

async function triggerSettle() {
  if (isSettling) {
    console.log('Settlement already in progress, skipping...');
    return { success: false, error: 'Already settling' };
  }
  
  if (!settlerModule) {
    console.log('Settler module not loaded, skipping...');
    return { success: false, error: 'Settler module not loaded', details: settlerError };
  }
  
  isSettling = true;
  console.log(`\n[${new Date().toISOString()}] Triggering on-chain settlement...`);
  
  try {
    const result = await settlerModule.runSettler();
    
    lastSettleTime = new Date().toISOString();
    lastSettleResult = {
      success: !result.error,
      ...result,
    };
    
    console.log(`[${lastSettleTime}] Settlement complete:`, lastSettleResult);
    return lastSettleResult;
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Settlement error:`, error.message);
    
    lastSettleTime = new Date().toISOString();
    lastSettleResult = {
      success: false,
      error: error.message,
    };
    
    return lastSettleResult;
    
  } finally {
    isSettling = false;
  }
}

// ============================================================================
// Server Startup
// ============================================================================

async function startServer() {
  // Load settler module first
  await loadSettlerModule();
  
  // Start Express server - bind to 0.0.0.0 for Railway
  const HOST = '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`\n========================================`);
    console.log(`TruthForge Oracle Settler Service`);
    console.log(`========================================`);
    console.log(`Listening: http://${HOST}:${PORT}`);
    console.log(`Interval: ${SETTLER_INTERVAL_MS}ms`);
    console.log(`Settler wallet: ${process.env.SETTLER_PRIVATE_KEY ? 'configured' : 'MISSING!'}`);
    console.log(`Helius RPC: ${process.env.HELIUS_RPC_URL ? 'configured' : 'using default'}`);
    console.log(`API Key: ${SETTLER_API_KEY ? 'required' : 'not required'}`);
    console.log(`Settler Module: ${settlerModule ? 'loaded' : 'FAILED - ' + settlerError}`);
    console.log(`========================================\n`);
    
    // NOTE: Cron job disabled - Edge Function now calls /settle-feed directly
    // with all required data including feedHash
    if (!settlerModule) {
      console.log('⚠️ Settler module not loaded - settlement endpoint will fail');
      console.log('   Fix the module errors and restart the service');
    } else {
      console.log('✅ Ready to receive settlement requests from Edge Function');
    }
  });
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
