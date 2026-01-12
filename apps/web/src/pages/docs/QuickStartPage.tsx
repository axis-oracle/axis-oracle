import { FC } from 'react';
import { CodeBlock, Callout } from '@/components/docs/CodeBlock';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Zap, Terminal, CheckCircle2 } from 'lucide-react';

const QuickStartPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Getting Started</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Quick Start</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Get up and running with AXIS in under 5 minutes. Create your first oracle and consume data on-chain.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {/* Step 1 */}
        <div className="relative pl-8 pb-8 border-l-2 border-border">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h2 className="text-xl font-semibold mb-3">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-4">
            Visit the AXIS app and connect your Solana wallet. We support Phantom, Solflare, and all major wallet adapters.
          </p>
          <NavLink 
            to="/app" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Launch App
            <ArrowRight className="h-4 w-4" />
          </NavLink>
        </div>

        {/* Step 2 */}
        <div className="relative pl-8 pb-8 border-l-2 border-border">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            2
          </div>
          <h2 className="text-xl font-semibold mb-3">Choose a Data Module</h2>
          <p className="text-muted-foreground mb-4">
            Select from our pre-built modules: Global Crypto, Esports, Memecoins, Weather, or Sports.
            Each module is optimized for specific data types and use cases.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
              <span className="text-sm font-medium">Crypto</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
              <span className="text-sm font-medium">Esports</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
              <span className="text-sm font-medium">Memecoins</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
              <span className="text-sm font-medium">Weather</span>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative pl-8 pb-8 border-l-2 border-border">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            3
          </div>
          <h2 className="text-xl font-semibold mb-3">Configure Your Oracle</h2>
          <p className="text-muted-foreground mb-4">
            Fill in the required parameters. For example, for a Crypto oracle:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Select the trading pair (e.g., BTC/USD)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Choose the metric (Price)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Set the resolution date (must be 1+ hour in future)
            </li>
          </ul>
        </div>

        {/* Step 4 */}
        <div className="relative pl-8 pb-8 border-l-2 border-border">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            4
          </div>
          <h2 className="text-xl font-semibold mb-3">Create & Sign Transaction</h2>
          <p className="text-muted-foreground mb-4">
            Click "Create Oracle" and approve the transaction in your wallet. This costs:
          </p>
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Creation Fee</span>
              <span className="font-mono font-semibold">~0.046 SOL</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-muted-foreground">Network Fee (estimated)</span>
              <span className="font-mono">~0.00001 SOL</span>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="relative pl-8">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
            ✓
          </div>
          <h2 className="text-xl font-semibold mb-3">Done! Consume Your Oracle</h2>
          <p className="text-muted-foreground mb-4">
            Your oracle is now live on Solana. Use the public key to read data in your DApp:
          </p>
          <CodeBlock
            language="typescript"
            code={`import { CrossbarClient } from "@switchboard-xyz/on-demand";

const client = new CrossbarClient("https://crossbar.switchboard.xyz");
const feedPubkey = "YOUR_FEED_PUBKEY"; // From "My Oracles" page

// Fetch the latest value
const result = await client.simulateFeed(feedPubkey);
console.log("Current Value:", result.value);`}
          />
        </div>
      </div>

      <Callout type="info">
        <strong>Need help?</strong> Check out our{' '}
        <NavLink to="/docs/developers/tutorial" className="text-primary hover:underline">
          step-by-step tutorial
        </NavLink>{' '}
        for building a complete betting DApp with AXIS oracles.
      </Callout>

      {/* Next steps */}
      <div className="pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <NavLink 
            to="/docs/architecture" 
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors group"
          >
            <h4 className="font-medium group-hover:text-primary transition-colors">Understand the Architecture</h4>
            <p className="text-sm text-muted-foreground mt-1">Learn how the pull-based oracle model works</p>
          </NavLink>
          <NavLink 
            to="/docs/developers/rust-integration" 
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors group"
          >
            <h4 className="font-medium group-hover:text-primary transition-colors">Rust Integration</h4>
            <p className="text-sm text-muted-foreground mt-1">Consume oracles in your Anchor program</p>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default QuickStartPage;
