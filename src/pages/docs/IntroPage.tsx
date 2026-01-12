import { FC } from 'react';
import { CodeBlock, Callout } from '@/components/docs/CodeBlock';
import { ArrowRight, Zap, Shield, Globe, Cpu, Lock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const IntroPage: FC = () => {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>Getting Started</span>
          <span>/</span>
          <span className="text-foreground">Introduction</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          Axis Protocol: The Resolution Layer for Solana.
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          The infrastructure for permissionless prediction markets and verifiable data. 
          Unlike legacy oracles, Axis provides on-demand, trustless settlement for ANY event—from 
          crypto prices to e-sports results.
        </p>
      </div>

      {/* Quick links */}
      <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <NavLink 
          to="/docs/quickstart"
          className="group flex flex-col p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Zap className="h-5 w-5 text-primary mb-2" />
          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
            Quick Start
          </span>
          <span className="text-sm text-muted-foreground">
            Deploy your first oracle in 5 minutes
          </span>
        </NavLink>
        <NavLink 
          to="/docs/architecture"
          className="group flex flex-col p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Globe className="h-5 w-5 text-primary mb-2" />
          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
            Architecture
          </span>
          <span className="text-sm text-muted-foreground">
            TEE verification & data flow
          </span>
        </NavLink>
        <NavLink 
          to="/docs/integration"
          className="group flex flex-col p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Shield className="h-5 w-5 text-primary mb-2" />
          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
            Integration Guide
          </span>
          <span className="text-sm text-muted-foreground">
            Consume oracles in your dApp
          </span>
        </NavLink>
      </div>

      {/* Why Axis */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Why Axis?</h2>
      <p className="text-muted-foreground leading-relaxed">
        Traditional oracle systems require manual multisig resolution or rely on centralized operators. 
        Axis eliminates these trust assumptions by leveraging <strong className="text-foreground">Trusted Execution Environments (TEEs)</strong> via 
        the Switchboard network to fetch and sign data with mathematical integrity.
      </p>

      <div className="not-prose my-8 grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-primary" />
            <h4 className="font-medium text-foreground">Trustless Settlement</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            No multisigs. No manual intervention. Data is fetched, verified, and signed inside TEEs 
            where even the node operator cannot tamper with results.
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-5 w-5 text-primary" />
            <h4 className="font-medium text-foreground">Zero-Maintenance</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Automated keepers detect resolution criteria and settle markets instantly. 
            You don't need to run your own crank nodes.
          </p>
        </div>
      </div>

      <p className="text-muted-foreground leading-relaxed">
        Whether you need cryptocurrency prices, esports match results, weather data, or any custom API data, 
        Axis makes it possible to bring that information on-chain in minutes—not weeks.
      </p>

      {/* Pull vs Push */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Pull-Based Architecture</h2>
      <p className="text-muted-foreground leading-relaxed">
        Unlike traditional "push-based" oracles (like legacy Chainlink Price Feeds) that continuously 
        update on-chain data regardless of demand, Axis uses a <strong className="text-foreground">pull-based model</strong>.
      </p>

      <Callout type="info" title="Why Pull-Based?">
        <p>
          In a pull-based system, data is only written on-chain when explicitly requested. 
          This dramatically reduces costs and eliminates wasted compute. You only pay for 
          the data you actually use.
        </p>
      </Callout>

      <div className="not-prose my-8 p-6 rounded-lg bg-muted/30 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-destructive mb-2">❌ Push Model (Legacy)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Constant on-chain updates</li>
              <li>• High gas costs (paid by oracle)</li>
              <li>• Limited customization</li>
              <li>• Centralized feed approval</li>
              <li>• Manual multisig resolution</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-2">✓ Pull Model (Axis)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• On-demand updates only</li>
              <li>• Pay only when you need data</li>
              <li>• Fully customizable feeds</li>
              <li>• Permissionless creation</li>
              <li>• TEE-verified automation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How it works */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">How It Works</h2>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Creating and using an Axis oracle involves three simple steps:
      </p>

      <div className="not-prose space-y-4">
        <div className="flex gap-4 p-4 rounded-lg border border-border">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            1
          </div>
          <div>
            <h4 className="font-medium text-foreground">Define Your Data Source</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Select from pre-built modules (Global Crypto, Esports, Token Analytics) or define a custom API endpoint.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 rounded-lg border border-border">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            2
          </div>
          <div>
            <h4 className="font-medium text-foreground">Deploy On-Chain</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Axis creates a Switchboard Pull Feed account on Solana. This is your oracle's permanent address.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 rounded-lg border border-border">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            3
          </div>
          <div>
            <h4 className="font-medium text-foreground">Automatic Settlement</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Our keeper network monitors your oracle and settles it automatically when resolution criteria are met.
            </p>
          </div>
        </div>
      </div>

      {/* Code example */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Quick Example</h2>
      <p className="text-muted-foreground leading-relaxed">
        Here's how simple it is to consume an Axis oracle in your application:
      </p>

      <CodeBlock
        language="typescript"
        filename="fetchOracleData.ts"
        code={`import { CrossbarClient } from "@switchboard-xyz/on-demand";
import { Connection, PublicKey } from "@solana/web3.js";

// Initialize connection (use dedicated RPC for production)
const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=YOUR_KEY");

// Your Axis oracle address (copy from Dashboard)
const feedPubkey = new PublicKey("YourAxisFeedAddress...");

// Fetch the latest oracle value
async function getOracleValue() {
  const client = new CrossbarClient();
  
  const result = await client.fetchFeedValues({
    connection,
    feeds: [feedPubkey],
  });
  
  console.log("Oracle Value:", result[0].value);
  return result[0].value;
}`}
      />

      {/* Next steps */}
      <div className="not-prose mt-12 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
        <h3 className="font-semibold text-foreground mb-2">Ready to build?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Continue to the Architecture section to understand how TEE verification works, 
          or jump straight to the Integration Guide.
        </p>
        <div className="flex gap-3">
          <NavLink to="/docs/architecture">
            <Button variant="outline" size="sm" className="gap-2">
              Architecture
              <ArrowRight className="h-4 w-4" />
            </Button>
          </NavLink>
          <NavLink to="/docs/integration">
            <Button variant="gold" size="sm" className="gap-2">
              Integration Guide
              <ArrowRight className="h-4 w-4" />
            </Button>
          </NavLink>
        </div>
      </div>
    </article>
  );
};

export default IntroPage;
