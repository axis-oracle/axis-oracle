import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { BarChart3, Shield, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

const MemecoinsModulePage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Data Modules</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Token Analytics Module</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Comprehensive token analytics including price, market cap, volume, and bonding curve verification 
          for any Solana SPL token via DexScreener integration.
        </p>
      </div>

      {/* Overview */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <p className="text-muted-foreground">
          The Token Analytics module fetches real-time price and market data for any Solana token using its contract address.
          This enables oracles for tokens not listed on centralized exchanges, with built-in anti-manipulation protections.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">Price Data</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Current USD price based on DEX liquidity pools
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">Market Cap (FDV)</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Fully Diluted Valuation based on total supply × price
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-amber-500" />
              <h4 className="font-medium">Volume 24h</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Trading volume over the last 24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Source: DexScreener</h2>
        <p className="text-muted-foreground">
          All token data is sourced from <a href="https://dexscreener.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DexScreener</a>,
          the leading DEX aggregator that tracks tokens across multiple decentralized exchanges.
        </p>
        
        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-2">API Endpoint</h4>
          <code className="text-sm bg-muted px-2 py-1 rounded font-mono break-all">
            GET https://api.dexscreener.com/latest/dex/tokens/{'{tokenAddress}'}
          </code>
        </div>

        <CodeBlock
          language="json"
          title="Example Response"
          code={`{
  "pairs": [
    {
      "chainId": "solana",
      "baseToken": {
        "symbol": "BONK",
        "name": "Bonk"
      },
      "priceUsd": "0.00002134",
      "fdv": 1523456789,
      "volume": {
        "h24": 45678901
      },
      "liquidity": {
        "usd": 8234567
      }
    }
  ]
}`}
        />
      </div>

      {/* Anti-Scam Filter */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-green-500" />
          Anti-Manipulation Protection
        </h2>
        
        <Callout type="warning">
          <strong>Market Cap Filter:</strong> Axis blocks oracle creation for tokens with a market cap below $1,000,000.
          This protects users from creating oracles for easily manipulated low-liquidity tokens.
        </Callout>

        <div className="p-5 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-3">Why This Matters</h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Low market cap tokens are extremely susceptible to price manipulation. A malicious actor could:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Create an oracle for a low-cap token</li>
              <li>Place bets on a specific price target</li>
              <li>Manipulate the price by buying/selling with minimal capital</li>
              <li>Settle the oracle and collect winnings</li>
            </ol>
            <p className="mt-3">
              By requiring a minimum $1M market cap, we ensure there's sufficient liquidity to make manipulation economically unfeasible.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
          <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Blocked Creation Example</h4>
          <p className="text-sm text-muted-foreground">
            If a user tries to create an oracle for a token with FDV &lt; $1,000,000:
          </p>
          <div className="mt-2 p-3 rounded bg-background/50 font-mono text-sm">
            Error: Market Cap is below $1M. Too risky for an oracle.
          </div>
        </div>
      </div>

      {/* Bonding Curve Verification */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Bonding Curve Verification</h2>
        <p className="text-muted-foreground">
          For tokens launched via bonding curve platforms (like Pump.fun), Axis verifies the token has 
          "graduated" from the bonding curve before allowing oracle creation.
        </p>

        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Why Graduation Matters</h4>
          <p className="text-sm text-muted-foreground">
            Tokens still on a bonding curve have predictable price mechanics that can be gamed. 
            Only after graduation (when full DEX liquidity is established) do prices reflect 
            genuine market dynamics.
          </p>
        </div>
      </div>

      {/* Liquidity Considerations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Liquidity Considerations
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Price Volatility</h4>
            <p className="text-sm text-muted-foreground">
              Token prices can move 50%+ in minutes. This is normal and expected.
              The oracle reports the price at the exact moment of update.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">DEX vs CEX Prices</h4>
            <p className="text-sm text-muted-foreground">
              DexScreener prices may differ from centralized exchange prices due to arbitrage delays
              and different liquidity pools. Axis reports DEX prices only.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Rug Pulls</h4>
            <p className="text-sm text-muted-foreground">
              If a token's liquidity is pulled, the price will crash to near-zero.
              The oracle will report this new (crashed) price. Axis cannot prevent or predict rug pulls.
            </p>
          </div>
        </div>
      </div>

      {/* Input Requirements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Creating a Token Analytics Oracle</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
                <th className="text-left py-3 px-4 font-semibold">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-medium">Contract Address</td>
                <td className="py-3 px-4 text-muted-foreground">Solana SPL token mint address</td>
                <td className="py-3 px-4 font-mono text-xs">DezXAZ8z7...pump</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-medium">Resolution Date</td>
                <td className="py-3 px-4 text-muted-foreground">When to fetch the data</td>
                <td className="py-3 px-4">Jan 15, 2025 12:00 UTC</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Metric</td>
                <td className="py-3 px-4 text-muted-foreground">What to measure</td>
                <td className="py-3 px-4">Price (USD) / Market Cap</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="info">
          A live preview shows the current token price and market cap when you enter a valid contract address.
          This helps verify you're creating an oracle for the correct token.
        </Callout>
      </div>

      {/* Reading Oracle Data */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Reading Token Oracle Data</h2>
        
        <CodeBlock
          language="typescript"
          title="TypeScript Example"
          code={`import { CrossbarClient } from "@switchboard-xyz/on-demand";

async function getTokenPrice(feedPubkey: string) {
  const client = new CrossbarClient("https://crossbar.switchboard.xyz");
  
  const result = await client.simulateFeed(feedPubkey);
  
  // Token prices stored with 18 decimal precision
  // to handle very small values (e.g., $0.00000001)
  const price = Number(result.value) / 1e18;
  
  return {
    price,
    priceFormatted: price < 0.01 
      ? price.toExponential(4) 
      : price.toFixed(8),
    timestamp: result.timestamp
  };
}

const bonkPrice = await getTokenPrice("BONK_FEED_PUBKEY");
console.log(\`BONK: $\${bonkPrice.priceFormatted}\`);`}
        />
      </div>

      {/* Best Practices */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Best Practices for Token Analytics DApps</h2>
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Verify contract address</span>
              <p className="text-sm text-muted-foreground">Always double-check the token address to avoid scam tokens with similar names</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Check liquidity before betting</span>
              <p className="text-sm text-muted-foreground">Tokens can be de-listed or have liquidity pulled at any time</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Use short time horizons</span>
              <p className="text-sm text-muted-foreground">Token markets change rapidly; prefer shorter oracle windows</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Handle extreme precision</span>
              <p className="text-sm text-muted-foreground">Prices can be very small (10+ decimal places); use appropriate math libraries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemecoinsModulePage;
