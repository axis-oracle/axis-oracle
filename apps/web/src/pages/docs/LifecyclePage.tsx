import { FC } from 'react';
import { CodeBlock, Callout } from '@/components/docs/CodeBlock';
import { ArrowDown, Wallet, Clock, Zap, CheckCircle, Database } from 'lucide-react';

const LifecyclePage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Core Concepts</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Oracle Lifecycle</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          From creation to consumption: understanding the complete journey of an AXIS oracle.
        </p>
      </div>

      {/* Lifecycle Diagram */}
      <div className="p-6 rounded-xl border border-border bg-muted/10">
        <h2 className="text-lg font-semibold mb-6 text-center">Oracle State Machine</h2>
        
        <div className="flex flex-col items-center gap-2">
          {/* State 1 */}
          <div className="w-full max-w-md p-4 rounded-lg border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">INIT</h3>
                <p className="text-sm text-muted-foreground">User creates feed, pays fee</p>
              </div>
            </div>
          </div>
          
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
          
          {/* State 2 */}
          <div className="w-full max-w-md p-4 rounded-lg border-2 border-amber-500 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">PENDING</h3>
                <p className="text-sm text-muted-foreground">Waiting for resolution time / event</p>
              </div>
            </div>
          </div>
          
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
          
          {/* State 3 */}
          <div className="w-full max-w-md p-4 rounded-lg border-2 border-blue-500 bg-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">UPDATE</h3>
                <p className="text-sm text-muted-foreground">Someone triggers settlement</p>
              </div>
            </div>
          </div>
          
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
          
          {/* State 4 */}
          <div className="w-full max-w-md p-4 rounded-lg border-2 border-purple-500 bg-purple-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold">VERIFY</h3>
                <p className="text-sm text-muted-foreground">Node fetches API, signs, writes on-chain</p>
              </div>
            </div>
          </div>
          
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
          
          {/* State 5 */}
          <div className="w-full max-w-md p-4 rounded-lg border-2 border-green-500 bg-green-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">RESOLVED</h3>
                <p className="text-sm text-muted-foreground">DApps can consume the value</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Phases */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Phase Details</h2>

        {/* Phase 1 */}
        <div className="p-5 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">Phase 1: Initialization</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            The user creates a new oracle feed through the AXIS UI or directly via SDK.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium w-32 shrink-0">Transaction:</span>
              <span className="text-muted-foreground">Creates new Switchboard PullFeed account</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-32 shrink-0">Fee:</span>
              <span className="text-muted-foreground">~0.046 SOL total (platform fee + rent exempt minimum)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-32 shrink-0">Output:</span>
              <span className="text-muted-foreground">Feed public key (unique identifier)</span>
            </div>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="p-5 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-amber-500" />
            <h3 className="text-lg font-semibold">Phase 2: Pending</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            The oracle exists on-chain but has no resolved value yet. For event-based oracles (esports, sports),
            this phase lasts until the event completes.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded bg-muted/30">
              <span className="font-medium">Crypto Oracle:</span>
              <p className="text-muted-foreground mt-1">Waits until the specified resolution timestamp</p>
            </div>
            <div className="p-3 rounded bg-muted/30">
              <span className="font-medium">Esports Oracle:</span>
              <p className="text-muted-foreground mt-1">Waits until match ends + safety buffer</p>
            </div>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="p-5 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Phase 3: Update Request</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Anyone can trigger an oracle update by calling the settlement function. This is typically done by:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>The oracle creator</strong> via "Settle Now" button</li>
            <li>• <strong>A DApp</strong> that needs the data before use</li>
            <li>• <strong>An automated crank</strong> for high-frequency feeds</li>
          </ul>
          <Callout type="info" className="mt-4">
            The preflight check ensures settlement is only attempted when the underlying event is complete,
            preventing wasted gas on failed transactions.
          </Callout>
        </div>

        {/* Phase 4 */}
        <div className="p-5 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-6 w-6 text-purple-500" />
            <h3 className="text-lg font-semibold">Phase 4: Verification & Writing</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            The Switchboard oracle node executes the job definition:
          </p>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Fetches data from the configured API endpoint</li>
            <li>Parses the response using the job's JSON path</li>
            <li>Applies any transformations (scaling, rounding)</li>
            <li>Signs the result with the oracle's private key</li>
            <li>Submits the signed result to the Solana program</li>
            <li>Program verifies signature and updates the feed account</li>
          </ol>
        </div>

        {/* Phase 5 */}
        <div className="p-5 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold">Phase 5: Resolved</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            The oracle now contains a valid, signed value that any program can read.
          </p>
          <CodeBlock
            language="typescript"
            code={`// Reading a resolved oracle
const feedAccount = await program.account.pullFeedAccountData.fetch(feedPubkey);

console.log("Value:", feedAccount.result.value.toString());
console.log("Updated:", new Date(feedAccount.result.slot * 400)); // approximate
console.log("Valid:", feedAccount.result.numSuccess > 0);`}
          />
        </div>
      </div>

      {/* Edge Cases */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Edge Cases</h2>
        
        <div className="grid gap-4">
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Match Canceled</h4>
            <p className="text-sm text-muted-foreground">
              If an esports match is canceled, the API returns no winner. The oracle will report an invalid/null state.
              DApps should check for this and handle appropriately (e.g., refund bets).
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">API Downtime</h4>
            <p className="text-sm text-muted-foreground">
              If the source API is unavailable during settlement, the oracle update will fail.
              The feed remains in pending state until a successful update is made.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Stale Data</h4>
            <p className="text-sm text-muted-foreground">
              For on-demand feeds, data is only as fresh as the last update. Always check the timestamp
              and trigger an update if the data is too old for your use case.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifecyclePage;
