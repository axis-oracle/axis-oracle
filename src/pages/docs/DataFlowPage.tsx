import { FC } from 'react';
import { Callout } from '@/components/docs/CodeBlock';
import { ArrowRight, Database, Cloud, Shield, Box } from 'lucide-react';

const DataFlowPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Core Concepts</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Data Flow</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Understanding how data moves from external APIs to your Solana program through the AXIS oracle network.
        </p>
      </div>

      {/* Visual Flow Diagram */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-lg font-semibold mb-6 text-center">Oracle Data Pipeline</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background border border-border min-w-[140px]">
            <Cloud className="h-8 w-8 text-blue-500 mb-2" />
            <span className="font-medium">External API</span>
            <span className="text-xs text-muted-foreground mt-1">Binance, PandaScore</span>
          </div>
          
          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background border border-primary/50 min-w-[140px]">
            <Shield className="h-8 w-8 text-primary mb-2" />
            <span className="font-medium">AXIS Layer</span>
            <span className="text-xs text-muted-foreground mt-1">Validation & Formatting</span>
          </div>
          
          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background border border-border min-w-[140px]">
            <Database className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Switchboard</span>
            <span className="text-xs text-muted-foreground mt-1">Oracle Network</span>
          </div>
          
          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
          
          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background border border-border min-w-[140px]">
            <Box className="h-8 w-8 text-purple-500 mb-2" />
            <span className="font-medium">Solana Account</span>
            <span className="text-xs text-muted-foreground mt-1">On-chain Data</span>
          </div>
        </div>
      </div>

      {/* Detailed Steps */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Step-by-Step Flow</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">External API Request</h3>
                <p className="text-muted-foreground text-sm">
                  When an oracle update is requested, the Switchboard node fetches data from the configured API endpoint.
                  For crypto prices, this might be Binance's public API. For esports, PandaScore's match results endpoint.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">AXIS Validation Layer</h3>
                <p className="text-muted-foreground text-sm">
                  The AXIS job definition specifies how to parse and validate the API response. This includes:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• JSON path extraction (e.g., <code className="text-xs bg-muted px-1 rounded">$.price</code>)</li>
                  <li>• Data type validation (number, string, boolean)</li>
                  <li>• Range sanity checks (prevent obviously wrong values)</li>
                  <li>• Timestamp verification (ensure data freshness)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Switchboard Consensus</h3>
                <p className="text-muted-foreground text-sm">
                  The validated data is signed by the oracle node and submitted to the Switchboard program.
                  For on-demand feeds, a single node response is typically sufficient. For high-value feeds,
                  multiple nodes can be configured for consensus.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">On-Chain Storage</h3>
                <p className="text-muted-foreground text-sm">
                  The final value is written to a Solana account. This account is a PDA (Program Derived Address)
                  that can be read by any program. The account stores:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>value:</strong> The oracle result (as i128 with scale)</li>
                  <li>• <strong>timestamp:</strong> When the value was last updated</li>
                  <li>• <strong>range:</strong> Min/max bounds if configured</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pull vs Push */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Pull vs Push Model</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">✓ AXIS (Pull Model)</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Data fetched only when needed</li>
              <li>• Consumer pays for the update</li>
              <li>• No wasted transactions</li>
              <li>• Cost scales with actual usage</li>
              <li>• Ideal for event-based data</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">✗ Traditional (Push Model)</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Data pushed on fixed intervals</li>
              <li>• Oracle provider pays for updates</li>
              <li>• Many unused transactions</li>
              <li>• Fixed cost regardless of usage</li>
              <li>• Wasteful for infrequent reads</li>
            </ul>
          </div>
        </div>
      </div>

      <Callout type="info">
        <strong>Gas Efficiency:</strong> Because AXIS uses a pull model, you only pay for oracle updates when you actually need the data.
        This can reduce oracle costs by 90%+ compared to traditional push-based systems.
      </Callout>
    </div>
  );
};

export default DataFlowPage;
