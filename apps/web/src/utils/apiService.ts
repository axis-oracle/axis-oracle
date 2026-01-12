// API Service for fetching live data previews
// Now using GeckoTerminal API for both crypto and memecoin data

export interface MemeTokenData {
  symbol: string;
  name: string;
  priceUsd: string;
  marketCap: string;
  chain: string;
  imageUrl?: string;
}

export interface CryptoPriceData {
  symbol: string;
  price: string;
}

export interface WeatherData {
  location: string;
  lat: number;
  lon: number;
  temperature: number;
  precipitation: number;
}

// GeckoTerminal network mapping for major cryptos
const GECKO_NETWORK_MAP: Record<string, { network: string; address: string }> = {
  'BTC': { network: 'eth', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' }, // WBTC on ETH
  'ETH': { network: 'eth', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' }, // WETH
  'SOL': { network: 'solana', address: 'So11111111111111111111111111111111111111112' }, // Native SOL
  'BNB': { network: 'bsc', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' }, // WBNB
  'USDT': { network: 'eth', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
  'USDC': { network: 'eth', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  'XRP': { network: 'eth', address: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe' },
  'ADA': { network: 'bsc', address: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47' },
  'DOGE': { network: 'bsc', address: '0xba2ae424d960c26247dd6c32edc70b295c744c43' },
  'AVAX': { network: 'avax', address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' }, // WAVAX
  'DOT': { network: 'bsc', address: '0x7083609fce4d1d8dc0c979aab8c869ea2c873402' },
  'MATIC': { network: 'polygon_pos', address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' }, // WMATIC
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
  'SUI': { network: 'bsc', address: '0xb7b5e68ad0c5e79a6b0e4b1a0c0b0c0d0e0f0a0b' },
  'SEI': { network: 'eth', address: '0x70c4c16d6a2c90cd3caaf5a856d5c19b7c9f0e8e' },
  'PEPE': { network: 'eth', address: '0x6982508145454ce325ddbe47a25d4ec3d2311933' },
  'INJ': { network: 'eth', address: '0xe28b3b32b6c345a34ff64674606124dd5aceca30' },
  'FTM': { network: 'fantom', address: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83' }, // WFTM
  'AAVE': { network: 'eth', address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' },
  'MKR': { network: 'eth', address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2' },
  'GRT': { network: 'eth', address: '0xc944e90c64b2c07662a292be6244bdf05cda44a7' },
  'LDO': { network: 'eth', address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32' },
  'IMX': { network: 'eth', address: '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff' },
  'SNX': { network: 'eth', address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f' },
  'RUNE': { network: 'eth', address: '0x3155ba85d5f96b2d030a4966af206230e46849cb' },
};

// Fetch memecoin data from GeckoTerminal (Solana tokens)
export async function fetchMemeData(tokenAddress: string): Promise<MemeTokenData | null> {
  try {
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error('GeckoTerminal memecoin fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.data?.attributes) {
      return null;
    }

    const attrs = data.data.attributes;
    
    return {
      symbol: attrs.symbol || 'Unknown',
      name: attrs.name || 'Unknown Token',
      priceUsd: attrs.price_usd || '0',
      marketCap: attrs.fdv_usd || attrs.market_cap_usd || '0',
      chain: 'solana',
      imageUrl: attrs.image_url || undefined,
    };
  } catch (error) {
    console.error('Error fetching meme data from GeckoTerminal:', error);
    return null;
  }
}

// Fetch crypto price from GeckoTerminal
export async function fetchCryptoPrice(symbol: string): Promise<CryptoPriceData | null> {
  try {
    const upperSymbol = symbol.toUpperCase();
    const mapping = GECKO_NETWORK_MAP[upperSymbol];
    
    if (!mapping) {
      console.warn(`No GeckoTerminal mapping for ${upperSymbol}, trying Solana...`);
      // Try as Solana token as fallback
      return null;
    }

    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${mapping.network}/tokens/${mapping.address}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error('GeckoTerminal crypto fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.data?.attributes?.price_usd) {
      return null;
    }

    return {
      symbol: upperSymbol,
      price: data.data.attributes.price_usd,
    };
  } catch (error) {
    console.error('Error fetching crypto price from GeckoTerminal:', error);
    return null;
  }
}

// Fetch weather data from Open-Meteo
export async function fetchWeatherData(city: string): Promise<WeatherData | null> {
  try {
    // Step 1: Geocoding to get lat/lon
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    
    if (!geoResponse.ok) {
      throw new Error('Geocoding failed');
    }

    const geoData = await geoResponse.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      return null;
    }

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;

    // Step 2: Fetch weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`
    );

    if (!weatherResponse.ok) {
      throw new Error('Weather fetch failed');
    }

    const weatherData = await weatherResponse.json();

    return {
      location: location.name,
      lat,
      lon,
      temperature: weatherData.current?.temperature_2m || 0,
      precipitation: weatherData.current?.precipitation || 0,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Fetch weather data directly with known coordinates (for capitals list)
export async function fetchWeatherDataDirect(lat: number, lon: number, cityName: string): Promise<WeatherData | null> {
  try {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`
    );

    if (!weatherResponse.ok) {
      throw new Error('Weather fetch failed');
    }

    const weatherData = await weatherResponse.json();

    return {
      location: cityName,
      lat,
      lon,
      temperature: weatherData.current?.temperature_2m || 0,
      precipitation: weatherData.current?.precipitation || 0,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Format price with appropriate precision
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (numPrice >= 1000) {
    return numPrice.toLocaleString('en-US', { maximumFractionDigits: 2 });
  } else if (numPrice >= 1) {
    return numPrice.toFixed(2);
  } else if (numPrice >= 0.0001) {
    return numPrice.toFixed(6);
  } else {
    return numPrice.toExponential(4);
  }
}

// Format market cap
export function formatMarketCap(marketCap: string | number): string {
  const num = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap;
  
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}

// Get GeckoTerminal URL for oracle job definitions
export function getGeckoTerminalUrl(module: string, config: Record<string, unknown>): { url: string; jsonPath: string } {
  if (module === 'memecoin') {
    const contractAddress = String(config.contractAddress || '');
    const metric = String(config.metric || 'price').toLowerCase();
    const isMcap = metric.includes('cap') || metric === 'marketcap';
    
    return {
      url: `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${contractAddress}`,
      jsonPath: isMcap ? '$.data.attributes.fdv_usd' : '$.data.attributes.price_usd',
    };
  }
  
  if (module === 'crypto') {
    const symbol = String(config.symbol || '').toUpperCase();
    const mapping = GECKO_NETWORK_MAP[symbol];
    
    if (mapping) {
      return {
        url: `https://api.geckoterminal.com/api/v2/networks/${mapping.network}/tokens/${mapping.address}`,
        jsonPath: '$.data.attributes.price_usd',
      };
    }
  }
  
  return { url: '', jsonPath: '' };
}