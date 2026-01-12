import { FC } from 'react';
import { CodeBlock, Callout } from '@/components/docs/CodeBlock';
import { Package, Terminal, CheckCircle2 } from 'lucide-react';

const InstallationPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Developer Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Installation</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Set up your development environment to interact with AXIS oracles.
        </p>
      </div>

      {/* Prerequisites */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Prerequisites</h2>
        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Node.js 18.0 or later</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>A Solana wallet with SOL for transactions</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Basic understanding of Solana development</span>
          </div>
        </div>
      </div>

      {/* TypeScript SDK */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          TypeScript SDK
        </h2>
        
        <p className="text-muted-foreground">
          Install the Switchboard On-Demand SDK to interact with AXIS oracles from your TypeScript/JavaScript application.
        </p>

        <CodeBlock
          language="bash"
          title="npm"
          code={`npm install @switchboard-xyz/on-demand @solana/web3.js`}
        />

        <CodeBlock
          language="bash"
          title="yarn"
          code={`yarn add @switchboard-xyz/on-demand @solana/web3.js`}
        />

        <CodeBlock
          language="bash"
          title="pnpm"
          code={`pnpm add @switchboard-xyz/on-demand @solana/web3.js`}
        />
      </div>

      {/* Quick Test */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Terminal className="h-6 w-6 text-green-500" />
          Quick Test
        </h2>
        
        <p className="text-muted-foreground">
          Verify your installation by reading an existing oracle:
        </p>

        <CodeBlock
          language="typescript"
          title="test-connection.ts"
          code={`import { Connection, PublicKey } from "@solana/web3.js";
import { CrossbarClient, PullFeed } from "@switchboard-xyz/on-demand";

async function main() {
  // Connect to Solana mainnet
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  
  // Initialize the Crossbar client
  const crossbar = new CrossbarClient("https://crossbar.switchboard.xyz");
  
  // Example: Read a public BTC/USD oracle
  const feedPubkey = new PublicKey("YOUR_FEED_PUBKEY_HERE");
  
  try {
    // Simulate the feed to get current value
    const result = await crossbar.simulateFeed(feedPubkey.toString());
    
    console.log("✅ Connection successful!");
    console.log("Feed Value:", result.value);
    console.log("Timestamp:", new Date(result.timestamp * 1000));
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();`}
        />

        <p className="text-sm text-muted-foreground">
          Run with: <code className="bg-muted px-2 py-0.5 rounded">npx ts-node test-connection.ts</code>
        </p>
      </div>

      {/* Rust Installation */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Rust / Anchor</h2>
        
        <p className="text-muted-foreground">
          For on-chain programs, add the Switchboard crate to your Cargo.toml:
        </p>

        <CodeBlock
          language="toml"
          title="Cargo.toml"
          code={`[dependencies]
anchor-lang = "0.29.0"
switchboard-on-demand = "0.1.0"

[features]
default = []
cpi = ["switchboard-on-demand/cpi"]`}
        />

        <Callout type="info">
          Make sure your Anchor version is compatible with the Switchboard crate.
          Check the <a href="https://github.com/switchboard-xyz/on-demand" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Switchboard GitHub</a> for the latest compatibility matrix.
        </Callout>
      </div>

      {/* Environment Setup */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Environment Variables</h2>
        
        <p className="text-muted-foreground">
          Configure your environment for mainnet or devnet:
        </p>

        <CodeBlock
          language="bash"
          title=".env"
          code={`# Solana RPC endpoint
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# For devnet testing
# SOLANA_RPC_URL=https://api.devnet.solana.com

# Switchboard Crossbar endpoint
CROSSBAR_URL=https://crossbar.switchboard.xyz

# Your wallet private key (for signing transactions)
# NEVER commit this to version control!
WALLET_PRIVATE_KEY=your_base58_private_key`}
        />

        <Callout type="warning">
          <strong>Security Warning:</strong> Never commit private keys to version control.
          Use environment variables or a secrets manager in production.
        </Callout>
      </div>

      {/* Network Configuration */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Network Configuration</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Network</th>
                <th className="text-left py-3 px-4 font-semibold">RPC Endpoint</th>
                <th className="text-left py-3 px-4 font-semibold">Queue Address</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-medium">Mainnet</td>
                <td className="py-3 px-4 font-mono text-xs">https://api.mainnet-beta.solana.com</td>
                <td className="py-3 px-4 font-mono text-xs">A43DyUGA7s8eXPxqE...</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Devnet</td>
                <td className="py-3 px-4 font-mono text-xs">https://api.devnet.solana.com</td>
                <td className="py-3 px-4 font-mono text-xs">FfD96yeXs4cxZ...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="/docs/integration" className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors group">
            <h4 className="font-medium group-hover:text-primary">TypeScript Integration →</h4>
            <p className="text-sm text-muted-foreground mt-1">Learn to read and create oracles with TypeScript</p>
          </a>
          <a href="/docs/developers/rust-integration" className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors group">
            <h4 className="font-medium group-hover:text-primary">Rust Integration →</h4>
            <p className="text-sm text-muted-foreground mt-1">Consume oracles in your Anchor program</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstallationPage;
