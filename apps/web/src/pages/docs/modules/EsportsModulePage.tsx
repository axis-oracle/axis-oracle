import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { Gamepad2, Clock, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

const EsportsModulePage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Data Modules</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Esports Module</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Deep dive into the Esports oracle module: settlement rules, timing logic, and edge case handling.
        </p>
      </div>

      {/* Supported Games */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Supported Games</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <Gamepad2 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <span className="font-medium">CS2</span>
            <p className="text-xs text-muted-foreground mt-1">Counter-Strike 2</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <Gamepad2 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <span className="font-medium">Dota 2</span>
            <p className="text-xs text-muted-foreground mt-1">Defense of the Ancients</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <Gamepad2 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <span className="font-medium">LoL</span>
            <p className="text-xs text-muted-foreground mt-1">League of Legends</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center opacity-50">
            <Gamepad2 className="h-8 w-8 mx-auto mb-2" />
            <span className="font-medium">More</span>
            <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Data Source */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Source: PandaScore</h2>
        <p className="text-muted-foreground">
          All esports data is sourced from <a href="https://pandascore.co" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PandaScore</a>,
          a professional esports data provider used by major betting platforms and media outlets.
        </p>
        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-2">API Endpoints Used</h4>
          <ul className="space-y-2 text-sm text-muted-foreground font-mono">
            <li><InlineCode>GET /matches/upcoming</InlineCode> — Fetch upcoming matches</li>
            <li><InlineCode>GET /matches/{'{id}'}</InlineCode> — Get match details and status</li>
            <li><InlineCode>GET /matches/{'{id}'}/results</InlineCode> — Get final results</li>
          </ul>
        </div>
      </div>

      {/* Smart Duration Logic */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Smart Duration Logic
        </h2>
        <p className="text-muted-foreground">
          Match duration varies significantly by format. AXIS automatically calculates expected duration based on match type:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Format</th>
                <th className="text-left py-3 px-4 font-semibold">Game</th>
                <th className="text-left py-3 px-4 font-semibold">Est. Duration</th>
                <th className="text-left py-3 px-4 font-semibold">Safety Buffer</th>
                <th className="text-left py-3 px-4 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Best of 1</td>
                <td className="py-3 px-4 text-muted-foreground">CS2</td>
                <td className="py-3 px-4 text-muted-foreground">45 min</td>
                <td className="py-3 px-4 text-muted-foreground">+15 min</td>
                <td className="py-3 px-4 font-medium">1 hour</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Best of 3</td>
                <td className="py-3 px-4 text-muted-foreground">CS2</td>
                <td className="py-3 px-4 text-muted-foreground">2.5 hours</td>
                <td className="py-3 px-4 text-muted-foreground">+30 min</td>
                <td className="py-3 px-4 font-medium">3 hours</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Best of 5</td>
                <td className="py-3 px-4 text-muted-foreground">CS2</td>
                <td className="py-3 px-4 text-muted-foreground">4 hours</td>
                <td className="py-3 px-4 text-muted-foreground">+1 hour</td>
                <td className="py-3 px-4 font-medium">5 hours</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Best of 3</td>
                <td className="py-3 px-4 text-muted-foreground">Dota 2</td>
                <td className="py-3 px-4 text-muted-foreground">2 hours</td>
                <td className="py-3 px-4 text-muted-foreground">+1 hour</td>
                <td className="py-3 px-4 font-medium">3 hours</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Best of 5</td>
                <td className="py-3 px-4 text-muted-foreground">LoL</td>
                <td className="py-3 px-4 text-muted-foreground">3.5 hours</td>
                <td className="py-3 px-4 text-muted-foreground">+1.5 hours</td>
                <td className="py-3 px-4 font-medium">5 hours</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="info">
          The <strong>Safety Buffer</strong> accounts for delays, technical pauses, and API update latency.
          It ensures the oracle is not settled before results are available.
        </Callout>
      </div>

      {/* Early Settlement */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-green-500" />
          Early Settlement Mechanism
        </h2>
        <p className="text-muted-foreground">
          AXIS includes a <strong>preflight check</strong> that allows early settlement when the match ends before the estimated time:
        </p>
        
        <div className="p-5 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-3">How It Works</h4>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span className="text-muted-foreground">User clicks "Settle Now" before the estimated end time</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span className="text-muted-foreground">Frontend calls PandaScore API to check match status</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div className="text-muted-foreground">
                If <InlineCode>status === "finished"</InlineCode> → Proceed with on-chain settlement<br />
                If <InlineCode>status === "running"</InlineCode> → Block and show current score
              </div>
            </li>
          </ol>
        </div>

        <CodeBlock
          language="typescript"
          title="Preflight Check Response"
          code={`// Example preflight check result
{
  canSettle: false,
  status: "running",
  message: "Match is still in progress",
  additionalInfo: "Current Score: Team A 1 - 0 Team B"
}

// When match is finished
{
  canSettle: true,
  status: "finished",
  message: "Match has ended. Ready to settle."
}`}
        />
      </div>

      {/* Edge Cases */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Edge Cases
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Match Canceled</h4>
            <p className="text-sm text-muted-foreground mb-2">
              If a match is canceled before it starts or during play, the PandaScore API returns <InlineCode>status: "canceled"</InlineCode>.
            </p>
            <div className="p-3 rounded bg-background/50 text-sm">
              <strong>Oracle Behavior:</strong> Returns an invalid/null result. The oracle cannot determine a winner.
            </div>
            <div className="p-3 rounded bg-background/50 text-sm mt-2">
              <strong>DApp Handling:</strong> Check for null/invalid values and handle appropriately (e.g., refund all bets).
            </div>
          </div>

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Match Postponed</h4>
            <p className="text-sm text-muted-foreground mb-2">
              If a match is rescheduled to a later date, the original oracle remains valid but pointing to the old time.
            </p>
            <div className="p-3 rounded bg-background/50 text-sm">
              <strong>Recommendation:</strong> Do not use the oracle if the match was postponed. Create a new oracle for the rescheduled match.
            </div>
          </div>

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Technical Forfeit</h4>
            <p className="text-sm text-muted-foreground mb-2">
              If a team forfeits due to technical issues, PandaScore records a winner.
            </p>
            <div className="p-3 rounded bg-background/50 text-sm">
              <strong>Oracle Behavior:</strong> Reports the technical winner as determined by the tournament organizer.
            </div>
          </div>

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">API Dispute</h4>
            <p className="text-sm text-muted-foreground mb-2">
              If the API reports an incorrect result (rare but possible), there is no on-chain mechanism to dispute.
            </p>
            <div className="p-3 rounded bg-background/50 text-sm">
              <strong>Reality:</strong> AXIS oracles report what the data source says. Disputes must be handled off-chain through your DApp's terms of service.
            </div>
          </div>
        </div>
      </div>

      {/* Oracle Data Structure */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Oracle Data Structure</h2>
        <p className="text-muted-foreground">
          Esports oracles report match results as numeric values:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Value</th>
                <th className="text-left py-3 px-4 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">1</td>
                <td className="py-3 px-4 text-muted-foreground">Team 1 (Home) wins</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">2</td>
                <td className="py-3 px-4 text-muted-foreground">Team 2 (Away) wins</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">0</td>
                <td className="py-3 px-4 text-muted-foreground">Draw (if applicable)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono">-1</td>
                <td className="py-3 px-4 text-muted-foreground">Invalid / Canceled / No Result</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          language="typescript"
          title="Reading Esports Oracle"
          code={`const result = await oracle.fetchResult();

switch (result.value) {
  case 1:
    console.log("Team 1 wins!");
    break;
  case 2:
    console.log("Team 2 wins!");
    break;
  case -1:
    console.log("Match canceled or invalid");
    // Handle refund logic
    break;
}`}
        />
      </div>

      {/* Best Practices */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Best Practices for Esports DApps</h2>
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Always check oracle validity</span>
              <p className="text-sm text-muted-foreground">Before resolving bets, verify the oracle value is not -1</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Display team names in UI</span>
              <p className="text-sm text-muted-foreground">Store team names off-chain and map to oracle values 1 and 2</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Implement refund logic</span>
              <p className="text-sm text-muted-foreground">Have a fallback for canceled matches to refund users</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Use the preflight check</span>
              <p className="text-sm text-muted-foreground">Before settling, verify the match has actually finished</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EsportsModulePage;
