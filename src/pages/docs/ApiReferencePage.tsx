import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { FileCode, Zap } from 'lucide-react';

const ApiReferencePage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Reference</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">API Reference</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Complete reference for the AXIS Oracle SDK and Switchboard integration.
        </p>
      </div>

      {/* CrossbarClient */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          CrossbarClient
        </h2>
        
        <p className="text-muted-foreground">
          The primary client for interacting with Switchboard oracles off-chain.
        </p>

        <CodeBlock
          language="typescript"
          title="Constructor"
          code={`import { CrossbarClient } from "@switchboard-xyz/on-demand";

// Initialize the client
const client = new CrossbarClient(
  "https://crossbar.switchboard.xyz" // Crossbar server URL
);`}
        />

        {/* Methods */}
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-mono text-lg font-semibold mb-2">simulateFeed()</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Simulates a feed update and returns the current value without writing to chain.
            </p>
            <CodeBlock
              language="typescript"
              code={`const result = await client.simulateFeed(feedPubkey: string);

// Returns:
{
  value: bigint;        // The oracle value
  timestamp: number;    // Unix timestamp of last update
  slot: number;         // Solana slot number
  numSuccess: number;   // Number of successful oracle responses
}`}
            />
          </div>

          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-mono text-lg font-semibold mb-2">fetchUpdateIx()</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Builds a transaction instruction to update the oracle on-chain.
            </p>
            <CodeBlock
              language="typescript"
              code={`const [ix, responses] = await client.fetchUpdateIx({
  feedPubkey: PublicKey,
  gateway?: string,
});

// ix: TransactionInstruction to add to your transaction
// responses: Raw oracle node responses`}
            />
          </div>
        </div>
      </div>

      {/* PullFeedAccountData */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileCode className="h-6 w-6 text-purple-500" />
          PullFeedAccountData
        </h2>
        
        <p className="text-muted-foreground">
          On-chain account structure for Switchboard pull feeds.
        </p>

        <CodeBlock
          language="typescript"
          title="TypeScript"
          code={`import { PullFeedAccountData } from "@switchboard-xyz/on-demand";

// Parse from account info
const feed = PullFeedAccountData.decode(accountInfo.data);

// Access feed properties
feed.queue          // Queue this feed belongs to
feed.result         // Latest result data
feed.maxStaleness   // Max seconds before data considered stale
feed.minResponses   // Minimum oracle responses required`}
        />

        <CodeBlock
          language="rust"
          title="Rust"
          code={`use switchboard_on_demand::PullFeedAccountData;

// Parse from account info
let feed = PullFeedAccountData::parse(account_info)?;

// Access result
let result = feed.result;
let value = result.value;           // i128
let slot = result.slot;             // u64
let num_success = result.num_success; // u32`}
        />
      </div>

      {/* Result Structure */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Result Structure</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">value</td>
                <td className="py-3 px-4 text-muted-foreground">i128</td>
                <td className="py-3 px-4 text-muted-foreground">The oracle result value (scaled integer)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">slot</td>
                <td className="py-3 px-4 text-muted-foreground">u64</td>
                <td className="py-3 px-4 text-muted-foreground">Solana slot when value was written</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">numSuccess</td>
                <td className="py-3 px-4 text-muted-foreground">u32</td>
                <td className="py-3 px-4 text-muted-foreground">Number of successful oracle responses</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">numError</td>
                <td className="py-3 px-4 text-muted-foreground">u32</td>
                <td className="py-3 px-4 text-muted-foreground">Number of failed oracle responses</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono">range</td>
                <td className="py-3 px-4 text-muted-foreground">i128</td>
                <td className="py-3 px-4 text-muted-foreground">Variance range of responses</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Value Scaling */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Value Scaling by Module</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Module</th>
                <th className="text-left py-3 px-4 font-semibold">Scale</th>
                <th className="text-left py-3 px-4 font-semibold">Example</th>
                <th className="text-left py-3 px-4 font-semibold">Human Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-medium">Crypto</td>
                <td className="py-3 px-4 font-mono">10^8</td>
                <td className="py-3 px-4 font-mono text-xs">4523167890000</td>
                <td className="py-3 px-4 text-muted-foreground">$45,231.67890000</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-medium">Memecoins</td>
                <td className="py-3 px-4 font-mono">10^18</td>
                <td className="py-3 px-4 font-mono text-xs">21340000000000</td>
                <td className="py-3 px-4 text-muted-foreground">$0.00002134</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-medium">Esports</td>
                <td className="py-3 px-4 font-mono">1 (integer)</td>
                <td className="py-3 px-4 font-mono text-xs">1, 2, or -1</td>
                <td className="py-3 px-4 text-muted-foreground">Team 1, Team 2, Invalid</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Weather</td>
                <td className="py-3 px-4 font-mono">10^2</td>
                <td className="py-3 px-4 font-mono text-xs">2345</td>
                <td className="py-3 px-4 text-muted-foreground">23.45°C</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Constants */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Constants</h2>

        <CodeBlock
          language="typescript"
          code={`// Switchboard On-Demand Queue (Mainnet)
const SWITCHBOARD_QUEUE = new PublicKey(
  "A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w"
);

// Crossbar Server
const CROSSBAR_URL = "https://crossbar.switchboard.xyz";

// AXIS Platform Treasury
const AXIS_TREASURY = new PublicKey(
  "AxisTreasuryXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
);

// Creation Fee
const CREATION_FEE_LAMPORTS = 46_000_000; // ~0.046 SOL`}
        />
      </div>

      {/* Utility Functions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Utility Functions</h2>

        <CodeBlock
          language="typescript"
          title="Value Conversion Helpers"
          code={`// Convert crypto price (8 decimals) to human readable
function cryptoPriceToHuman(value: bigint): number {
  return Number(value) / 1e8;
}

// Convert memecoin price (18 decimals) to human readable  
function memecoinPriceToHuman(value: bigint): number {
  return Number(value) / 1e18;
}

// Parse esports result
function parseEsportsResult(value: bigint): 'team1' | 'team2' | 'invalid' {
  const num = Number(value);
  if (num === 1) return 'team1';
  if (num === 2) return 'team2';
  return 'invalid';
}

// Check if oracle data is stale
function isStale(slot: number, currentSlot: number, maxSeconds: number): boolean {
  const slotsElapsed = currentSlot - slot;
  const secondsElapsed = (slotsElapsed * 400) / 1000;
  return secondsElapsed > maxSeconds;
}`}
        />
      </div>

      <Callout type="info">
        For the complete Switchboard SDK documentation, visit the{' '}
        <a href="https://docs.switchboard.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          official Switchboard docs
        </a>.
      </Callout>
    </div>
  );
};

export default ApiReferencePage;
