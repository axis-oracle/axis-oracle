import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { TrendingUp, Database, Clock, CheckCircle2, Zap } from 'lucide-react';

const CryptoModulePage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Data Modules</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Global Crypto Module</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Aggregated DEX liquidity data and price feeds for any SPL token on Solana, 
          supporting both high-cap assets and long-tail tokens via on-chain pool data.
        </p>
      </div>

      {/* Supported Assets */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Supported Trading Pairs</h2>
        <p className="text-muted-foreground">
          Axis supports all tokens with sufficient DEX liquidity on Solana. Popular examples:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['SOL/USD', 'ETH/USD', 'BTC/USD', 'USDC/USD', 'JUP/USD', 'BONK/USD', 'WIF/USD', 'RAY/USD'].map((pair) => (
            <div key={pair} className="p-3 rounded-lg border border-border bg-muted/20 text-center">
              <span className="font-mono font-medium">{pair}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Source */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          Data Source: GeckoTerminal
        </h2>
        <p className="text-muted-foreground">
          All crypto price data is sourced from the <a href="https://www.geckoterminal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GeckoTerminal API</a>, 
          which aggregates real-time DEX data across all major Solana liquidity pools.
        </p>
        
        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-2">API Endpoint</h4>
          <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">
            GET https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/{'{address}'}
          </code>
          <p className="text-sm text-muted-foreground mt-2">
            Returns aggregated price data from all DEX pools for the specified token.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-green-500" />
            <h4 className="font-semibold text-green-600 dark:text-green-400">Why GeckoTerminal?</h4>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Aggregated Liquidity:</strong> Combines data from Raydium, Orca, Jupiter, and more</li>
            <li>• <strong>Any Token:</strong> Supports high-cap assets AND long-tail meme tokens</li>
            <li>• <strong>On-Chain Data:</strong> Prices derived directly from DEX pool states</li>
            <li>• <strong>No CEX Dependency:</strong> Works for tokens not listed on centralized exchanges</li>
          </ul>
        </div>
      </div>

      {/* Methodology */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-500" />
          Price Methodology
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">Volume-Weighted Average</h4>
            <p className="text-sm text-muted-foreground">
              GeckoTerminal calculates a volume-weighted average price across all active liquidity pools, 
              ensuring the reported price reflects actual market depth.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">Price Format</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Prices are stored as integers with 8 decimal places of precision:
            </p>
            <CodeBlock
              language="typescript"
              code={`// Oracle returns: 4523167890000 (raw value)
// Actual price: $45,231.67890000

const rawValue = 4523167890000n;
const scale = 8;
const humanPrice = Number(rawValue) / Math.pow(10, scale);
// humanPrice = 45231.6789`}
            />
          </div>
        </div>
      </div>

      {/* Resolution Rules */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="h-6 w-6 text-amber-500" />
          Resolution Rules
        </h2>
        
        <div className="grid gap-4">
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">Time-Based Resolution</h4>
            <p className="text-sm text-muted-foreground">
              Crypto oracles resolve at a specific timestamp. The oracle fetches the price at (or as close as possible to) the specified time.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">Minimum Future Time</h4>
            <p className="text-sm text-muted-foreground">
              Resolution time must be at least <strong>1 hour</strong> in the future when creating the oracle.
              This prevents gaming and ensures sufficient time for participants to interact with the oracle.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Important: Timing Precision</h4>
            <p className="text-sm text-muted-foreground">
              Due to network latency and Solana slot timing, the actual fetch time may differ by a few seconds from the target time.
              For high-precision use cases, consider using a small tolerance window.
            </p>
          </div>
        </div>
      </div>

      {/* Job Definition */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Job Definition</h2>
        <p className="text-muted-foreground">
          Here's the Switchboard job definition used for crypto price oracles:
        </p>
        
        <CodeBlock
          language="json"
          title="Crypto Price Job"
          code={`{
  "name": "AXIS_CRYPTO_SOL_USD",
  "tasks": [
    {
      "httpTask": {
        "url": "https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/So11111111111111111111111111111111111111112"
      }
    },
    {
      "jsonParseTask": {
        "path": "$.data.attributes.token_prices.So11111111111111111111111111111111111111112"
      }
    },
    {
      "multiplyTask": {
        "scalar": 1e8
      }
    }
  ]
}`}
        />
      </div>

      {/* Reading the Oracle */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Reading Crypto Oracle Data</h2>
        
        <CodeBlock
          language="typescript"
          title="TypeScript Example"
          code={`import { CrossbarClient } from "@switchboard-xyz/on-demand";

async function getCryptoPrice(feedPubkey: string) {
  const client = new CrossbarClient("https://crossbar.switchboard.xyz");
  
  // Simulate the feed to get the latest value
  const result = await client.simulateFeed(feedPubkey);
  
  // Parse the value (8 decimal places)
  const price = Number(result.value) / 1e8;
  
  return {
    price,
    timestamp: result.timestamp,
    raw: result.value
  };
}

// Usage
const solPrice = await getCryptoPrice("YOUR_FEED_PUBKEY");
console.log(\`SOL Price: $\${solPrice.price.toFixed(2)}\`);`}
        />

        <CodeBlock
          language="rust"
          title="Anchor/Rust Example"
          code={`use anchor_lang::prelude::*;
use switchboard_on_demand::PullFeedAccountData;

pub fn get_crypto_price(feed_account: &AccountInfo) -> Result<f64> {
    let feed = PullFeedAccountData::parse(feed_account)?;
    
    // Get the result value (i128 with scale)
    let value = feed.result.value;
    let scale = 8_i32;
    
    // Convert to f64
    let price = (value as f64) / 10_f64.powi(scale);
    
    msg!("Crypto price: {}", price);
    Ok(price)
}`}
        />
      </div>

      {/* Best Practices */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Check staleness</span>
              <p className="text-sm text-muted-foreground">Verify the oracle timestamp is recent enough for your use case</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Verify liquidity</span>
              <p className="text-sm text-muted-foreground">For smaller tokens, ensure sufficient DEX liquidity exists for accurate pricing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Use appropriate precision</span>
              <p className="text-sm text-muted-foreground">8 decimal places is more than enough for most applications</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Handle price impact</span>
              <p className="text-sm text-muted-foreground">For large trades, aggregated price may not reflect executable price</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoModulePage;
