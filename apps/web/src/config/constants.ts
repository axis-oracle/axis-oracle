import { PublicKey } from '@solana/web3.js';

// ============================================
// TREASURY WALLET CONFIGURATION
// ============================================
// This wallet receives 0.02 SOL for each feed creation
export const TREASURY_WALLET_PUBKEY = new PublicKey(
  "5aQjw32kxCTDhEdXritusCAnNyGmrzy1nGGuaCz27uaX"
);

// ============================================
// FEE CONFIGURATION
// ============================================
export const CREATION_FEE_SOL = 0.02;
export const CREATION_FEE_LAMPORTS = CREATION_FEE_SOL * 1_000_000_000; // 0.02 SOL = 20,000,000 lamports

// ============================================
// NETWORK CONFIGURATION
// ============================================
export const SOLANA_NETWORK = 'mainnet-beta';
// High-performance Helius RPC (secured via domain restrictions in Helius Dashboard)
export const SOLANA_RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=11dfef1f-a315-49f1-9380-5a4d9859306a';
// Commitment level for faster UI updates
export const SOLANA_COMMITMENT = 'confirmed' as const;
// Fallback RPCs for redundancy
export const FALLBACK_RPC_ENDPOINTS = [
  'https://rpc.ankr.com/solana',
  'https://solana.public-rpc.com',
];

// ============================================
// BALANCE CONFIGURATION
// ============================================
// Minimum balance required (0.03 SOL + buffer for gas fees)
export const MIN_BALANCE_SOL = 0.031;

// ============================================
// SWITCHBOARD ON-DEMAND CONFIGURATION
// ============================================
// Mainnet Queue Public Key for Switchboard On-Demand
export const SWITCHBOARD_QUEUE_PUBKEY = new PublicKey(
  "A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w"
);

// Switchboard On-Demand Program ID (Mainnet)
// This is the correct SBond... program ID from the SDK
export const SWITCHBOARD_PROGRAM_ID = new PublicKey(
  "SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv"
);

// ============================================
// API ENDPOINTS
// ============================================
export const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
export const DEXSCREENER_API_BASE = 'https://api.dexscreener.com/latest/dex';
export const OPEN_METEO_API_BASE = 'https://api.open-meteo.com/v1';

// PandaScore API - Placeholder key for esports data
// TODO: Replace with actual API key for production
export const PANDASCORE_API_KEY = 'YOUR_PANDASCORE_API_KEY';
export const PANDASCORE_API_BASE = 'https://api.pandascore.co';

// ============================================
// MODULE TYPES
// ============================================
export const MODULE_TYPES = {
  CRYPTO: 'crypto',
  MEMECOIN: 'memecoin',
  WEATHER: 'weather',
  ESPORTS: 'esports',
  SPORTS: 'sports',
} as const;

export type ModuleType = typeof MODULE_TYPES[keyof typeof MODULE_TYPES];

// ============================================
// SUPPORTED ASSETS
// ============================================
export const CRYPTO_ASSETS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: 'BNB' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: 'XRP' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
] as const;

// ============================================
// WEATHER CITIES
// ============================================
export const WEATHER_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
] as const;
