// Switchboard On-Demand Service for deploying oracles on Solana
// Uses @switchboard-xyz/on-demand v2.17.6
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  VersionedTransaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import { 
  SOLANA_RPC_ENDPOINT, 
  SWITCHBOARD_QUEUE_PUBKEY,
  TREASURY_WALLET_PUBKEY,
  CREATION_FEE_LAMPORTS,
  FALLBACK_RPC_ENDPOINTS,
} from '@/config/constants';

// Types for the oracle deployment
export interface OracleParams {
  name: string;
  feedType: string;
  module: string;
  config: Record<string, unknown>;
}

export interface DeployResult {
  success: boolean;
  feedPubkey?: string;
  feedHash?: string;
  signature?: string;
  error?: string;
}

// Direct HTTP helper to store job in Crossbar API (bypasses SDK issues)
async function storeJobInCrossbar(
  queueAddress: string, 
  jobData: { tasks: unknown[] }
): Promise<{ cid: string; feedHash: string }> {
  console.log('Calling Crossbar API directly...');
  console.log('Queue address:', queueAddress);
  console.log('Job tasks:', JSON.stringify(jobData.tasks));
  
  const response = await fetch('https://crossbar.switchboard.xyz/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      queue: queueAddress,
      jobs: [jobData]
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Crossbar API error:', response.status, errorText);
    throw new Error(`Crossbar API error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  console.log('Crossbar API response:', result);
  return result;
}

// Wallet adapter interface to match what we receive from useWallet
interface WalletAdapter {
  publicKey: PublicKey | null;
  signTransaction?: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  signAllTransactions?: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>;
}

/**
 * Creates a Switchboard On-Demand Pull Feed on Solana Mainnet
 * 
 * Steps:
 * 1. Transfers 0.02 SOL fee to treasury
 * 2. Creates OracleJob using @switchboard-xyz/common
 * 3. Stores job in Crossbar FIRST to get feedHash
 * 4. Initializes a Switchboard PullFeed using feedHash (not jobs array)
 * 
 * The created feed is owned by the Switchboard On-Demand program.
 */
// Cached SDK and connection for performance
let cachedSb: typeof import('@switchboard-xyz/on-demand') | null = null;
let cachedConnection: Connection | null = null;

// Preload SDK in background when module loads
const sdkPreloadPromise = (async () => {
  try {
    cachedSb = await import('@switchboard-xyz/on-demand');
    console.log('Switchboard SDK preloaded');
  } catch (e) {
    console.warn('SDK preload failed, will retry on demand');
  }
})();

export async function deployOracle(
  wallet: WalletAdapter,
  params: OracleParams,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<DeployResult> {
  if (!wallet.publicKey) {
    return { success: false, error: 'Wallet not connected' };
  }

  // Use cached connection or create new one
  let connection = cachedConnection;
  if (!connection) {
    connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
    cachedConnection = connection;
  }

  try {
    // Validate treasury wallet
    const systemProgramId = '11111111111111111111111111111111';
    if (TREASURY_WALLET_PUBKEY.toBase58() === systemProgramId) {
      return { 
        success: false, 
        error: 'Treasury wallet not configured. Please set a valid treasury address in constants.ts' 
      };
    }

    console.log('Creating oracle with params:', params);

    // Use cached SDK or load it (should already be preloaded)
    let sb = cachedSb;
    if (!sb) {
      console.log('Loading Switchboard SDK (not preloaded)...');
      try {
        await sdkPreloadPromise; // Wait for preload if in progress
        sb = cachedSb;
        if (!sb) {
          sb = await import('@switchboard-xyz/on-demand');
          cachedSb = sb;
        }
      } catch (sdkError) {
        console.error('Failed to load Switchboard SDK:', sdkError);
        return { 
          success: false, 
          error: 'Failed to load Switchboard SDK. Please try again.' 
        };
      }
    }

    // Create a browser-compatible wallet adapter for Anchor
    const browserWallet = {
      publicKey: wallet.publicKey,
      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
        if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
        return wallet.signTransaction(tx);
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
        if (!wallet.signAllTransactions) throw new Error('Wallet does not support batch signing');
        return wallet.signAllTransactions(txs);
      },
    };

    // Load the Switchboard program from connection with wallet
    console.log('Loading Switchboard program...');
    const program = await sb.AnchorUtils.loadProgramFromConnection(
      connection,
      browserWallet as any
    );
    console.log('Program ID:', program.programId.toBase58());

    // Load the default queue for the network (mainnet/devnet auto-detected)
    console.log('Loading default queue...');
    const queue = await sb.Queue.loadDefault(program);
    console.log('Switchboard queue loaded:', queue.pubkey.toBase58());

    // Build the OracleJob definition
    const jobDefinition = buildOracleJobDefinition(params.module, params.config);
    console.log('Job definition:', JSON.stringify(jobDefinition));

    // IMPORTANT: Store job in Crossbar FIRST to get the feedHash
    // Using direct HTTP call to bypass SDK compatibility issues
    console.log('Storing job in Crossbar to get feedHash...');
    let feedHashBytes: Uint8Array;
    let feedHashHexString: string;
    
    try {
      const storeResult = await storeJobInCrossbar(
        queue.pubkey.toBase58(),
        { tasks: jobDefinition.tasks }
      );
      feedHashHexString = storeResult.feedHash;
      console.log('Crossbar feedHash:', feedHashHexString);
      console.log('Crossbar CID:', storeResult.cid);
      
      // Convert feedHash hex string to Uint8Array (remove 0x prefix)
      const feedHashHex = storeResult.feedHash.startsWith('0x') 
        ? storeResult.feedHash.slice(2) 
        : storeResult.feedHash;
      
      // Create Uint8Array from hex - this is more reliable than Buffer in browser
      feedHashBytes = new Uint8Array(feedHashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      console.log('feedHash bytes length:', feedHashBytes.length);
      console.log('feedHash bytes:', Array.from(feedHashBytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(''));
    } catch (crossbarError) {
      console.error('Failed to store job in Crossbar:', crossbarError);
      return {
        success: false,
        error: 'Failed to register job in Crossbar. Please try again.',
      };
    }

    // Generate a new PullFeed account
    const [pullFeed, feedKeypair] = sb.PullFeed.generate(queue.program);
    console.log('Feed Pubkey:', pullFeed.pubkey.toBase58());

    // Create the feed initialization instruction with feedHash (NOT jobs array!)
    // Using feedHash ensures on-chain data matches what Crossbar expects
    console.log('Creating PullFeed init instruction with feedHash...');
    const initIx = await pullFeed.initIx({
      name: params.name.slice(0, 32),
      queue: queue.pubkey,
      maxVariance: 1.0, // 1% max variance
      minResponses: 1, // minimum number of oracle responses
      minSampleSize: 1, // minimum sample size
      maxStaleness: 300, // 300 slots max staleness (~2 minutes)
      feedHash: Buffer.from(feedHashBytes), // Convert Uint8Array to Buffer for SDK
      payer: wallet.publicKey,
    });
    console.log('PullFeed init instruction created with feedHash');

    // Build the fee transfer instruction separately
    const feeTransferInstruction = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: TREASURY_WALLET_PUBKEY,
      lamports: CREATION_FEE_LAMPORTS,
    });
    console.log('Created fee transfer instruction');

    // Use Switchboard's asV0Tx helper to build the versioned transaction
    // IMPORTANT: Do NOT include feedKeypair in signers here - we'll sign in correct order
    // Phantom Lighthouse requires: wallet signs first, then additional signers partialSign
    console.log('Building versioned transaction with asV0Tx...');
    const tx = await sb.asV0Tx({
      connection,
      ixs: [feeTransferInstruction, initIx],
      payer: wallet.publicKey,
      signers: [], // Empty! We'll handle signing order manually for Phantom compatibility
      computeUnitPrice: 200_000,
      computeUnitLimitMultiple: 1.5,
    });
    console.log('Versioned transaction created');

    // Skip simulation - we use skipPreflight: false on send which does it automatically
    // This saves ~500ms per transaction

    // SIGNING ORDER (per Phantom Lighthouse requirements):
    // 1. User wallet signs FIRST
    // 2. Additional signers (feedKeypair) partialSign AFTER
    console.log('Requesting user signature...');
    if (!wallet.signTransaction) {
      return { success: false, error: 'Wallet does not support signing' };
    }
    const signedTx = await wallet.signTransaction(tx);

    // feedKeypair adds its partial signature
    signedTx.sign([feedKeypair]);

    // Send the signed transaction
    console.log('Sending transaction...');
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false, // Let RPC simulate - provides error feedback
      maxRetries: 3,
    });
    console.log('Transaction sent:', signature);

    // Use 'confirmed' instead of 'finalized' for faster response (~2s vs ~30s)
    // The transaction is safe at confirmed level for UI purposes
    console.log('Waiting for confirmation...');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('Transaction confirmed! Feed:', pullFeed.pubkey.toBase58());

    return {
      success: true,
      feedPubkey: pullFeed.pubkey.toBase58(),
      feedHash: feedHashHexString,
      signature,
    };
  } catch (error) {
    console.error('Oracle deployment error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('User rejected')) {
        return { success: false, error: 'Transaction cancelled by user' };
      }
      if (error.message.includes('insufficient funds') || error.message.includes('Insufficient')) {
        return { success: false, error: 'Insufficient SOL balance for transaction' };
      }
      if (error.message.includes('blockhash')) {
        return { success: false, error: 'Network timeout. Please try again.' };
      }
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to deploy oracle. Please try again.' };
  }
}

/**
 * Builds an OracleJob definition for different feed types
 * Returns a structure compatible with OracleJob.create()
 * 
 * Supports dynamic inputs based on module type:
 * - crypto: Uses Binance API with symbol (BTC, ETH, SOL, etc.)
 * - memecoin: Uses DexScreener API with contract address, supports price or market cap
 * - weather: Uses Open-Meteo API with location name (geocoded to lat/long)
 * - esports: Uses PandaScore API with matchId
 */
// GeckoTerminal network mapping for oracle job definitions
const GECKO_ORACLE_MAP: Record<string, { network: string; address: string }> = {
  'BTC': { network: 'eth', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  'ETH': { network: 'eth', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  'SOL': { network: 'solana', address: 'So11111111111111111111111111111111111111112' },
  'BNB': { network: 'bsc', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' },
  'XRP': { network: 'eth', address: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe' },
  'ADA': { network: 'bsc', address: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47' },
  'DOGE': { network: 'bsc', address: '0xba2ae424d960c26247dd6c32edc70b295c744c43' },
  'AVAX': { network: 'avax', address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' },
  'DOT': { network: 'bsc', address: '0x7083609fce4d1d8dc0c979aab8c869ea2c873402' },
  'MATIC': { network: 'polygon_pos', address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' },
  'LINK': { network: 'eth', address: '0x514910771af9ca656af840dff83e8264ecf986ca' },
  'SHIB': { network: 'eth', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' },
  'UNI': { network: 'eth', address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
  'ATOM': { network: 'eth', address: '0x8d983cb9388eac77af0474fa441c4815500cb7bb' },
  'LTC': { network: 'bsc', address: '0x4338665cbb7b2485a8855a139b75d5e34ab0db94' },
  'TRX': { network: 'bsc', address: '0xce7de646e7208a4ef112cb6ed5038fa6cc6b12e3' },
  'NEAR': { network: 'eth', address: '0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4' },
  'APT': { network: 'bsc', address: '0x1a8d7ac01d21991bf5249a3657c97b2b6d919222' },
  'ARB': { network: 'arbitrum', address: '0x912ce59144191c1204e64559fe8253a0e49e6548' },
  'OP': { network: 'optimism', address: '0x4200000000000000000000000000000000000042' },
  'PEPE': { network: 'eth', address: '0x6982508145454ce325ddbe47a25d4ec3d2311933' },
  'INJ': { network: 'eth', address: '0xe28b3b32b6c345a34ff64674606124dd5aceca30' },
  'FTM': { network: 'fantom', address: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83' },
  'AAVE': { network: 'eth', address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' },
  'MKR': { network: 'eth', address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2' },
  'GRT': { network: 'eth', address: '0xc944e90c64b2c07662a292be6244bdf05cda44a7' },
  'LDO': { network: 'eth', address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32' },
  'IMX': { network: 'eth', address: '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff' },
  'SNX': { network: 'eth', address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f' },
  'RUNE': { network: 'eth', address: '0x3155ba85d5f96b2d030a4966af206230e46849cb' },
};

/**
 * Builds an OracleJob definition for different feed types
 * Returns a structure compatible with OracleJob.create()
 * 
 * Now using GeckoTerminal API for crypto and memecoin data:
 * - crypto: Uses GeckoTerminal API with network/token address
 * - memecoin: Uses GeckoTerminal API for Solana tokens
 * - weather: Uses Open-Meteo API with location coordinates
 * - esports: Uses PandaScore API with matchId
 */
export function buildOracleJobDefinition(module: string, config: Record<string, unknown>): { tasks: object[] } {
  switch (module) {
    case 'crypto': {
      // GLOBAL CRYPTO (GeckoTerminal API)
      const symbol = String(config.symbol || '').toUpperCase();
      const mapping = GECKO_ORACLE_MAP[symbol];
      
      if (!mapping) {
        console.warn(`No GeckoTerminal mapping for ${symbol}`);
        return { tasks: [] };
      }
      
      return {
        tasks: [
          {
            httpTask: {
              url: `https://api.geckoterminal.com/api/v2/networks/${mapping.network}/tokens/${mapping.address}`,
            },
          },
          {
            jsonParseTask: {
              path: '$.data.attributes.price_usd',
            },
          },
        ],
      };
    }
    
    case 'memecoin': {
      // MEMECOINS (GeckoTerminal API - Solana)
      const contractAddress = String(config.contractAddress || '');
      const metric = String(config.metric || 'price').toLowerCase();
      const isMcap = metric.includes('cap') || metric === 'marketcap';
      const jsonPath = isMcap ? '$.data.attributes.fdv_usd' : '$.data.attributes.price_usd';
      
      return {
        tasks: [
          {
            httpTask: {
              url: `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${contractAddress}`,
            },
          },
          {
            jsonParseTask: {
              path: jsonPath,
            },
          },
        ],
      };
    }
    
    case 'weather': {
      // WEATHER (Open-Meteo Archive API for historical data)
      const lat = config.lat ?? 0;
      const lon = config.lon ?? 0;
      const targetDate = config.date as string; // "YYYY-MM-DD" format
      const metric = (config.metric as string) || 'temp_max';
      
      // Map our metric names to Archive API parameters
      const metricMap: Record<string, string> = {
        'temp_max': 'temperature_2m_max',
        'temp_min': 'temperature_2m_min',
        'precipitation': 'precipitation_sum',
      };
      const archiveMetric = metricMap[metric] || 'temperature_2m_max';
      
      return {
        tasks: [
          {
            httpTask: {
              // Archive API returns historical data for specific date
              url: `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${targetDate}&end_date=${targetDate}&daily=${archiveMetric}`,
            },
          },
          {
            jsonParseTask: {
              path: `$.daily.${archiveMetric}[0]`,
            },
          },
        ],
      };
    }
    
    case 'esports':
      return {
        tasks: [
          {
            httpTask: {
              url: `https://api.pandascore.co/matches/${config.matchId}`,
              headers: [{ key: 'Authorization', value: 'Bearer ${PANDASCORE_API_KEY}' }],
            },
          },
          {
            jsonParseTask: {
              path: '$.winner.id',
            },
          },
        ],
      };
    
    default:
      return { tasks: [] };
  }
}

/**
 * Updates an existing Switchboard oracle feed by fetching new data and submitting it on-chain.
 * This is used for manual settlement of feeds.
 * 
 * SDK v2.17.6: Uses pullFeed.fetchUpdateIx with gateway parameter
 * 
 * @param connection - Solana connection
 * @param wallet - Wallet adapter with signTransaction capability
 * @param feedPubkey - The public key of the feed to update
 * @returns Transaction signature
 */
// Result type for updateOracleFeed - includes fallback indicator
export interface UpdateOracleResult {
  success: boolean;
  signature?: string;
  fallbackRequired?: boolean; // True when oracles couldn't fetch data
  error?: string;
}

/**
 * Validates that fetchUpdateIx result contains real update instructions,
 * not just ComputeBudget instructions (which indicate oracles couldn't fetch data)
 */
function hasRealUpdateInstructions(instructions: any[]): boolean {
  if (!instructions || instructions.length === 0) return false;
  
  // ComputeBudget program ID
  const computeBudgetProgramId = ComputeBudgetProgram.programId.toBase58();
  
  // Check if there's at least one instruction that's NOT ComputeBudget
  const hasNonComputeBudget = instructions.some(ix => {
    const programId = ix.programId?.toBase58?.() || ix.programId?.toString?.() || '';
    return programId !== computeBudgetProgramId;
  });
  
  console.log('Instruction validation:', {
    totalInstructions: instructions.length,
    hasNonComputeBudget,
    programIds: instructions.map(ix => ix.programId?.toBase58?.() || 'unknown'),
  });
  
  return hasNonComputeBudget;
}

export async function updateOracleFeed(
  _connection: Connection, // Ignored - using Helius RPC
  wallet: {
    publicKey: PublicKey;
    signTransaction?: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  },
  feedAddress: string,
  onProgress?: (message: string) => void
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  console.log('Starting Hybrid Frontend Crank for:', feedAddress);
  onProgress?.('Connecting to Solana network...');

  // 1. Setup Connection (Using Helius for stability)
  // CRITICAL: Use 'processed' commitment to match oracle signature slots
  // Using 'confirmed' causes race conditions where oracles sign for a slot
  // that becomes confirmed before the transaction is sent, causing Secp256k1 failures
  const connection = new Connection(
    'https://mainnet.helius-rpc.com/?api-key=11dfef1f-a315-49f1-9380-5a4d9859306a',
    'processed'
  );

  // 2. Dynamically import Switchboard SDK
  onProgress?.('Loading Switchboard SDK...');
  const sb = await import('@switchboard-xyz/on-demand');
  const sbCommon = await import('@switchboard-xyz/common');
  console.log('Switchboard SDK loaded');

  // Create browser wallet adapter for AnchorUtils
  const browserWallet = {
    publicKey: wallet.publicKey,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
      if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
      return wallet.signTransaction(tx);
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
      return [await browserWallet.signTransaction(txs[0])] as T[];
    },
  };

  // 3. Initialize Program using AnchorUtils
  const program = await sb.AnchorUtils.loadProgramFromConnection(connection, browserWallet as any);
  console.log('Switchboard program initialized');

  // 4. Load the Feed
  const feed = new sb.PullFeed(program, new PublicKey(feedAddress));
  console.log('PullFeed loaded:', feed.pubkey.toBase58());

  // Pre-heat and get gateway
  onProgress?.('Connecting to oracle network...');
  // Use CrossbarClient from on-demand SDK to avoid version mismatch
  const crossbarClient = new (sb as any).CrossbarClient("https://crossbar.switchboard.xyz");
  await feed.preHeatFeed(crossbarClient as any);
  
  // Get primary gateway and prepare fallbacks
  const primaryGateway = await feed.fetchGatewayUrl(crossbarClient as any);
  const gatewayUrls = [
    primaryGateway,
    'https://crossbar.switchboard.xyz',
  ];
  console.log('Gateway URLs:', gatewayUrls);

  console.log('Fetching update instruction (waiting for oracle signatures)...');

  // 5. FETCH UPDATE with retry logic and exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;
  let updateIxs: any = null;
  let luts: any = null;
  let oraclesFailed = false; // Track if oracles couldn't fetch data

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Try each gateway
    for (const gatewayUrl of gatewayUrls) {
      try {
        const numSigs = attempt === 1 ? 3 : 1; // Reduce signatures on retry
        onProgress?.(`Attempt ${attempt}/${maxRetries}: Fetching oracle signatures...`);
        console.log(`Attempt ${attempt}/${maxRetries} with gateway ${gatewayUrl}, numSignatures: ${numSigs}`);

        const result = await feed.fetchUpdateIx({
          gateway: gatewayUrl,
          numSignatures: numSigs,
          crossbarClient: crossbarClient as any,
          network: 'mainnet',
        });

        // Validate that we got REAL update instructions, not just ComputeBudget
        if (result[0] && result[0].length > 0) {
          if (hasRealUpdateInstructions(result[0])) {
            updateIxs = result[0];
            luts = result[3];
            console.log('Got valid update instruction from gateway:', gatewayUrl);
            break;
          } else {
            console.warn('Gateway returned only ComputeBudget instructions (no oracle data)');
            oraclesFailed = true;
            lastError = new Error('ORACLE_DATA_UNAVAILABLE: Oracles could not fetch data from external API');
          }
        }
      } catch (err: any) {
        lastError = err;
        const errorMsg = err.response?.data || err.message || 'Unknown error';
        console.warn(`Gateway ${gatewayUrl} failed:`, errorMsg);
        
        // Check if it's a retryable error
        const isOracleUnavailable = 
          String(errorMsg).includes('ORACLE_UNAVAILABLE') ||
          String(errorMsg).includes('No oracle responses') ||
          String(errorMsg).includes('ORACLE_DATA_UNAVAILABLE');
        
        if (isOracleUnavailable) {
          oraclesFailed = true;
        } else if (!String(errorMsg).includes('User rejected')) {
          // Non-retryable, non-user-rejection error
          oraclesFailed = true;
        } else {
          throw err; // User rejected - don't retry
        }
      }
    }

    if (updateIxs) break; // Success

    if (attempt < maxRetries) {
      const delay = attempt * 2000; // 2s, 4s exponential backoff
      onProgress?.(`Oracle busy. Retrying in ${delay / 1000}s...`);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If oracles couldn't fetch data, throw specific error for fallback handling
  if (!updateIxs || updateIxs.length === 0 || oraclesFailed) {
    throw new Error(
      'ORACLE_UNAVAILABLE: ' + (lastError?.message || 'Oracles could not fetch data. Backend verification will be used.')
    );
  }

  console.log('Got update instruction, building transaction...');
  onProgress?.('Building transaction...');

  // 6. Build Transaction using SDK's asV0Tx for proper simulation & compute budget
  // This matches what Switchboard UI "Crank Feed" button does
  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support signing');
  }

  // Use SDK method for optimal transaction building with simulation
  console.log('Building transaction with sb.asV0Tx()...');
  const tx = await sb.asV0Tx({
    connection,
    ixs: updateIxs,
    payer: wallet.publicKey,
    lookupTables: luts,
    computeUnitPrice: 200_000,        // Priority fee in microlamports
    computeUnitLimitMultiple: 1.5,    // 50% buffer for compute units
    signers: [],                       // Empty - we'll sign with wallet adapter
  });

  console.log('Transaction built successfully, requesting signature...');
  onProgress?.('Please approve the transaction in your wallet...');
  
  const signedTx = await wallet.signTransaction(tx);

  // Send with skipPreflight per Switchboard documentation
  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: true,
    preflightCommitment: 'processed',
    maxRetries: 3,
  });
  
  console.log('Update Transaction Sent:', signature);
  onProgress?.('Confirming transaction...');

  // Wait for confirmation
  const confirmation = await connection.confirmTransaction(signature, 'confirmed');
  
  // Check if transaction actually succeeded (not just confirmed)
  if (confirmation.value.err) {
    const errorDetails = JSON.stringify(confirmation.value.err);
    console.error('Transaction confirmed but FAILED on-chain:', errorDetails);
    
    // Check for specific error types
    const isSecp256k1Error = 
      errorDetails.includes('3') || // Custom program error 0x3
      errorDetails.includes('Secp256k1') ||
      errorDetails.includes('InstructionError');
    
    if (isSecp256k1Error) {
      throw new Error('SIGNATURE_VERIFICATION_FAILED: On-chain signature verification failed. FeedHash mismatch - use Recreate button for on-chain proof.');
    }
    
    throw new Error(`Transaction failed on-chain: ${errorDetails}`);
  }
  
  // Double-check by fetching transaction status
  const txStatus = await connection.getTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });
  
  if (txStatus?.meta?.err) {
    const errorDetails = JSON.stringify(txStatus.meta.err);
    console.error('Transaction status shows failure:', errorDetails);
    throw new Error('SIGNATURE_VERIFICATION_FAILED: Transaction failed on-chain. Use backend verification or Recreate button.');
  }
  
  console.log('Feed updated successfully on-chain!');

  return signature;
}

/**
 * Settles a feed using Oracle Quotes API with Ed25519 signature verification
 * This provides on-chain cryptographic proofs for any custom feed.
 * 
 * Uses queue.fetchQuoteIx() which:
 * - Works directly with feed hashes (no on-chain feed account needed for quotes)
 * - Returns Ed25519 signature verification instruction
 * - Provides on-chain proof of oracle consensus
 * 
 * @param wallet - Wallet adapter with signTransaction capability
 * @param feedHash - The feed hash from Crossbar (0x prefixed hex string)
 * @param onProgress - Optional progress callback
 * @returns Transaction signature
 */
export async function settleWithOracleQuotes(
  wallet: {
    publicKey: PublicKey;
    signTransaction?: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  },
  feedHash: string,
  onProgress?: (message: string) => void
): Promise<{ signature: string; value: number; slot: number }> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  console.log('Starting Oracle Quotes settlement for feedHash:', feedHash);
  onProgress?.('Connecting to Solana network...');

  // 1. Setup Connection (Using Helius for stability)
  // Use 'processed' commitment to match oracle signature slots
  const connection = new Connection(
    'https://mainnet.helius-rpc.com/?api-key=11dfef1f-a315-49f1-9380-5a4d9859306a',
    'processed'
  );

  // 2. Dynamically import Switchboard SDK
  onProgress?.('Loading Switchboard SDK...');
  const sb = await import('@switchboard-xyz/on-demand');
  const sbCommon = await import('@switchboard-xyz/common');
  console.log('Switchboard SDK loaded');

  // Create browser wallet adapter for AnchorUtils
  const browserWallet = {
    publicKey: wallet.publicKey,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
      if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
      return wallet.signTransaction(tx);
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
      return [await browserWallet.signTransaction(txs[0])] as T[];
    },
  };

  // 3. Initialize Program and Queue
  onProgress?.('Connecting to oracle network...');
  const program = await sb.AnchorUtils.loadProgramFromConnection(connection, browserWallet as any);
  const queue = await sb.Queue.loadDefault(program);
  console.log('Switchboard queue loaded:', queue.pubkey.toBase58());

  // 4. Setup Crossbar client - use from on-demand SDK to avoid version mismatch
  const crossbarClient = new (sb as any).CrossbarClient("https://crossbar.switchboard.xyz");

  // 5. Fetch Oracle Quote with Ed25519 signatures
  onProgress?.('Fetching oracle signatures...');
  console.log('Calling queue.fetchQuoteIx with feedHash:', feedHash);

  const maxRetries = 3;
  let lastError: Error | null = null;
  let quoteResult: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}: Fetching Oracle Quote...`);
      onProgress?.(`Attempt ${attempt}/${maxRetries}: Fetching oracle signatures...`);

      // Use fetchQuoteIx with feed hash array
      // This returns an Ed25519 signature verification instruction
      quoteResult = await queue.fetchQuoteIx(
        crossbarClient,
        [feedHash], // Array of feed hashes
        {
          numSignatures: 1,
          variableOverrides: {},
        }
      );

      if (quoteResult) {
        console.log('Got Oracle Quote result:', quoteResult);
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Quote attempt ${attempt} failed:`, err.message || err);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000;
        onProgress?.(`Oracle busy. Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  if (!quoteResult) {
    throw new Error(
      lastError?.message || 
      'Oracle network unavailable. Could not fetch Oracle Quote after multiple retries.'
    );
  }

  // 6. Extract the instruction and value from the quote result
  // The result can be an instruction directly or a tuple [instruction, oracle responses]
  const sigVerifyIx = Array.isArray(quoteResult) ? quoteResult[0] : quoteResult;
  
  // Try to extract value from oracle responses if available
  let settledValue = 0;
  let settledSlot = 0;
  
  if (Array.isArray(quoteResult) && quoteResult[1]) {
    const responses = quoteResult[1];
    if (responses.length > 0 && responses[0].value !== undefined) {
      settledValue = responses[0].value;
      settledSlot = responses[0].slot || 0;
    }
  }

  console.log('Oracle Quote instruction ready, value:', settledValue, 'slot:', settledSlot);
  onProgress?.('Building transaction...');

  // 7. Build versioned transaction with Ed25519 signature verification
  const { blockhash } = await connection.getLatestBlockhash();

  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support signing');
  }

  // Build transaction with compute budget
  const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 200_000,
  });

  const message = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: [computeBudgetIx, sigVerifyIx],
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);
  
  onProgress?.('Please approve the transaction in your wallet...');
  const signedTx = await wallet.signTransaction(transaction);

  // 8. Send and confirm transaction
  onProgress?.('Sending transaction...');
  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  console.log('Oracle Quote Transaction Sent:', signature);
  onProgress?.('Confirming transaction...');

  await connection.confirmTransaction(signature, 'confirmed');
  console.log('Oracle Quote settlement successful!');

  return {
    signature,
    value: settledValue,
    slot: settledSlot,
  };
}

/**
 * Fetches the current value from a Switchboard feed
 * 
 * @param connection - Solana connection
 * @param feedPubkey - The public key of the feed
 * @returns The current value or null
 */
export async function fetchFeedValue(
  connection: Connection,
  feedPubkey: string
): Promise<{ value: number; slot: number } | null> {
  try {
    const sb = await import('@switchboard-xyz/on-demand');
    
    // Create a minimal wallet for reading (no signing needed)
    const minimalWallet = {
      publicKey: new PublicKey(feedPubkey),
      signTransaction: async () => { throw new Error('Not implemented'); },
      signAllTransactions: async () => { throw new Error('Not implemented'); },
    };

    const program = await sb.AnchorUtils.loadProgramFromConnection(
      connection,
      minimalWallet as any
    );

    const pullFeed = new sb.PullFeed(program, new PublicKey(feedPubkey));
    const data = await pullFeed.loadData();
    
    if (data && data.result) {
      // Value is stored as BN, convert to number
      const value = data.result.value.toNumber();
      const slot = data.result.slot.toNumber();
      return { value, slot };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching feed value:', error);
    return null;
  }
}

// Result type for recreateFeed
export interface RecreateFeedResult {
  success: boolean;
  newFeedPubkey?: string;
  newFeedHash?: string;
  signature?: string;
  error?: string;
}

/**
 * Recreates an on-chain feed with a new feedHash based on the current job definition.
 * This is needed when the job definition has changed (e.g., switched from DexScreener to GeckoTerminal)
 * and the old on-chain feedHash no longer matches Crossbar.
 * 
 * Steps:
 * 1. Build fresh job definition using current module config
 * 2. Store job in Crossbar to get NEW feedHash  
 * 3. Create NEW on-chain PullFeed with correct feedHash
 * 4. User can then use the new feed for settlement
 * 
 * @param wallet - Wallet adapter with signing capability
 * @param params - Oracle params (module, config, name)
 * @param sendTransaction - Function to send transactions
 * @returns New feed pubkey, feedHash, and signature
 */
export async function recreateFeed(
  wallet: WalletAdapter,
  params: OracleParams,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<RecreateFeedResult> {
  if (!wallet.publicKey) {
    return { success: false, error: 'Wallet not connected' };
  }

  console.log('=== RECREATING FEED WITH FRESH HASH ===');
  console.log('Module:', params.module);
  console.log('Config:', params.config);

  // Use Helius RPC with 'processed' commitment for oracle operations
  let connection = new Connection(SOLANA_RPC_ENDPOINT, 'processed');
  
  try {
    await connection.getLatestBlockhash();
    console.log('Connected to Helius RPC');
  } catch (primaryError) {
    console.warn('Primary RPC failed, trying fallbacks:', primaryError);
    for (const endpoint of FALLBACK_RPC_ENDPOINTS) {
      try {
        const fallbackConnection = new Connection(endpoint, 'processed');
        await fallbackConnection.getLatestBlockhash();
        connection = fallbackConnection;
        console.log('Using fallback RPC:', endpoint);
        break;
      } catch {
        continue;
      }
    }
  }

  try {
    // 1. Load Switchboard SDK (no common needed - using direct HTTP for Crossbar)
    console.log('Loading Switchboard SDK...');
    const sb = await import('@switchboard-xyz/on-demand');

    // 2. Create browser wallet adapter
    const browserWallet = {
      publicKey: wallet.publicKey,
      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
        if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
        return wallet.signTransaction(tx);
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
        if (!wallet.signAllTransactions) throw new Error('Wallet does not support batch signing');
        return wallet.signAllTransactions(txs);
      },
    };

    // 3. Load Switchboard program and queue
    const program = await sb.AnchorUtils.loadProgramFromConnection(connection, browserWallet as any);
    const queue = await sb.Queue.loadDefault(program);
    console.log('Queue loaded:', queue.pubkey.toBase58());

    // 4. Build FRESH job definition using current GeckoTerminal-based logic
    const jobDefinition = buildOracleJobDefinition(params.module, params.config);
    console.log('Fresh job definition:', JSON.stringify(jobDefinition));

    if (!jobDefinition.tasks || jobDefinition.tasks.length === 0) {
      return { success: false, error: 'Could not build job definition for this module' };
    }

    // 5. Store job in Crossbar using direct HTTP to get NEW feedHash
    console.log('Storing job in Crossbar...');
    let feedHashHexString: string;
    let feedHashBytes: Uint8Array;

    try {
      const storeResult = await storeJobInCrossbar(
        queue.pubkey.toBase58(),
        { tasks: jobDefinition.tasks }
      );
      feedHashHexString = storeResult.feedHash;
      console.log('NEW Crossbar feedHash:', feedHashHexString);
      console.log('Crossbar CID:', storeResult.cid);

      // Convert feedHash to Uint8Array
      const feedHashHex = feedHashHexString.startsWith('0x') 
        ? feedHashHexString.slice(2) 
        : feedHashHexString;
      feedHashBytes = new Uint8Array(feedHashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    } catch (crossbarError) {
      console.error('Crossbar store failed:', crossbarError);
      return { success: false, error: 'Failed to register job in Crossbar' };
    }

    // 6. Generate NEW PullFeed account
    const [pullFeed, feedKeypair] = sb.PullFeed.generate(queue.program);
    console.log('New Feed Pubkey:', pullFeed.pubkey.toBase58());

    // 7. Create init instruction with the NEW feedHash
    const initIx = await pullFeed.initIx({
      name: params.name.slice(0, 32),
      queue: queue.pubkey,
      maxVariance: 1.0,
      minResponses: 1,
      minSampleSize: 1,
      maxStaleness: 300,
      feedHash: Buffer.from(feedHashBytes),
      payer: wallet.publicKey,
    });

    // 8. Build versioned transaction (no fee transfer for recreate - user already paid)
    // IMPORTANT: Do NOT include feedKeypair in signers - we'll sign in correct order
    // Phantom Lighthouse requires: wallet signs first, then additional signers partialSign
    console.log('Building versioned transaction...');
    const tx = await sb.asV0Tx({
      connection,
      ixs: [initIx],
      payer: wallet.publicKey,
      signers: [], // Empty! We'll handle signing order manually for Phantom compatibility
      computeUnitPrice: 200_000,
      computeUnitLimitMultiple: 1.5,
    });

    // 9. Simulate with 'processed' commitment
    console.log('Simulating transaction...');
    const simulation = await connection.simulateTransaction(tx, { commitment: 'processed' });
    if (simulation.value.err) {
      console.error('Simulation failed:', simulation.value.err);
      console.error('Logs:', simulation.value.logs);
      return { 
        success: false, 
        error: `Simulation failed: ${simulation.value.logs?.join(' ') || JSON.stringify(simulation.value.err)}` 
      };
    }
    console.log('Simulation passed');

    // 10. SIGNING ORDER (per Phantom Lighthouse requirements):
    // 1. User wallet signs FIRST
    // 2. Additional signers (feedKeypair) partialSign AFTER
    console.log('Requesting user signature (wallet signs first)...');
    if (!wallet.signTransaction) {
      return { success: false, error: 'Wallet does not support signing' };
    }
    const signedTx = await wallet.signTransaction(tx);
    console.log('Transaction signed by user');

    // Now feedKeypair adds its partial signature
    signedTx.sign([feedKeypair]);
    console.log('feedKeypair partialSign added');

    console.log('Sending transaction...');
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: true,
      maxRetries: 3,
    });
    console.log('Transaction sent:', signature);

    // 11. Wait for FINALIZED confirmation
    console.log('Waiting for finalized confirmation...');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'finalized');

    if (confirmation.value.err) {
      const errorDetails = JSON.stringify(confirmation.value.err);
      console.error('Transaction failed on-chain:', errorDetails);
      return { success: false, error: `Transaction failed: ${errorDetails}` };
    }

    console.log('=== FEED RECREATED SUCCESSFULLY ===');
    console.log('New Feed Pubkey:', pullFeed.pubkey.toBase58());
    console.log('New Feed Hash:', feedHashHexString);

    return {
      success: true,
      newFeedPubkey: pullFeed.pubkey.toBase58(),
      newFeedHash: feedHashHexString,
      signature,
    };
  } catch (error) {
    console.error('Recreate feed error:', error);

    if (error instanceof Error) {
      if (error.message.includes('User rejected')) {
        return { success: false, error: 'Transaction cancelled by user' };
      }
      if (error.message.includes('insufficient funds') || error.message.includes('Insufficient')) {
        return { success: false, error: 'Insufficient SOL balance for transaction' };
      }
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to recreate feed. Please try again.' };
  }
}
