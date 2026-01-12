import { FC } from 'react';
import { Callout } from '@/components/docs/CodeBlock';
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const TrustModelPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Core Concepts</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Security & Trust Model</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          An honest assessment of AXIS's security guarantees, trust assumptions, and potential failure modes.
        </p>
      </div>

      <Callout type="warning">
        <strong>Transparency First:</strong> We believe in being upfront about what oracles can and cannot guarantee.
        No oracle system is trustless—understanding the trust assumptions is critical for building secure applications.
      </Callout>

      {/* Trust Layers */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Trust Layers</h2>
        
        <div className="space-y-4">
          {/* Layer 1 */}
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Layer 1: Data Source APIs</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  AXIS relies on external APIs for raw data. These are trusted third parties.
                </p>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium w-24">Binance:</span>
                    <span className="text-muted-foreground">Crypto prices (BTC, ETH, SOL, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium w-24">PandaScore:</span>
                    <span className="text-muted-foreground">Esports match results</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium w-24">DexScreener:</span>
                    <span className="text-muted-foreground">Memecoin prices and market cap</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium w-24">Open-Meteo:</span>
                    <span className="text-muted-foreground">Weather data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Layer 2: Switchboard Oracle Network</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  The Switchboard network provides the infrastructure for fetching, validating, and posting data on-chain.
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Operators are staked and can be slashed for misbehavior</li>
                  <li>• TEE (Trusted Execution Environment) ensures job execution integrity</li>
                  <li>• Open-source and audited smart contracts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Layer 3: AXIS Job Definitions</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  AXIS creates standardized job definitions that tell Switchboard how to fetch and parse data.
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Job definitions are transparent and verifiable</li>
                  <li>• No hidden logic or proprietary processing</li>
                  <li>• Users can inspect exactly what data is being fetched</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What We Guarantee */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">What We Guarantee</h2>
        
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Accurate Data Relay</span>
              <p className="text-sm text-muted-foreground">Data from APIs is faithfully relayed to the blockchain without modification</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Transparent Methodology</span>
              <p className="text-sm text-muted-foreground">All job definitions and data sources are publicly documented</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Immutable Feed Addresses</span>
              <p className="text-sm text-muted-foreground">Once created, a feed's address and configuration cannot be changed</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Cryptographic Verification</span>
              <p className="text-sm text-muted-foreground">Oracle updates are signed and verifiable on-chain</p>
            </div>
          </div>
        </div>
      </div>

      {/* What We Cannot Guarantee */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">What We Cannot Guarantee</h2>
        
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">API Accuracy</span>
              <p className="text-sm text-muted-foreground">If Binance reports a wrong price, the oracle will also be wrong</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">API Availability</span>
              <p className="text-sm text-muted-foreground">If an API is down, oracle updates will fail until it recovers</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Event Outcomes</span>
              <p className="text-sm text-muted-foreground">For esports/sports, we report what the source says—disputes must be handled off-chain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Failure Modes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Known Failure Modes
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Scenario</th>
                <th className="text-left py-3 px-4 font-semibold">Impact</th>
                <th className="text-left py-3 px-4 font-semibold">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">API returns error</td>
                <td className="py-3 px-4 text-muted-foreground">Oracle update fails</td>
                <td className="py-3 px-4 text-muted-foreground">Retry with exponential backoff</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Match canceled</td>
                <td className="py-3 px-4 text-muted-foreground">Oracle returns invalid/empty</td>
                <td className="py-3 px-4 text-muted-foreground">Check status before consuming</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Price manipulation</td>
                <td className="py-3 px-4 text-muted-foreground">Incorrect price reported</td>
                <td className="py-3 px-4 text-muted-foreground">Use reputable sources, TWAP</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Network congestion</td>
                <td className="py-3 px-4 text-muted-foreground">Delayed updates</td>
                <td className="py-3 px-4 text-muted-foreground">Priority fees, multiple attempts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Practices */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Best Practices for Consumers</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Always Check Staleness</h4>
            <p className="text-sm text-muted-foreground">
              Verify the oracle's timestamp is recent enough for your use case. Don't accept stale data.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Handle Edge Cases</h4>
            <p className="text-sm text-muted-foreground">
              Your program should gracefully handle scenarios where oracle data is unavailable or invalid.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Verify Feed Address</h4>
            <p className="text-sm text-muted-foreground">
              Ensure the feed pubkey matches what you expect. Don't blindly trust user-provided addresses.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Use Appropriate Buffers</h4>
            <p className="text-sm text-muted-foreground">
              For time-sensitive events, add safety buffers to account for network delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustModelPage;
