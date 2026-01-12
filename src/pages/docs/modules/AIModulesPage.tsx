import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { Sparkles, Brain, Gavel, TrendingUp, Trophy, Vote, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AIModulesPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-primary font-medium">Data Modules</p>
          <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-xs">
            BETA
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">AI-Powered Modules</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Oracle modules powered by Claude AI for resolving complex real-world events that cannot be 
          determined by traditional APIs — elections, court cases, awards ceremonies, and custom predictions.
        </p>
      </div>

      {/* Beta Notice */}
      <Callout type="warning">
        <strong>Beta Status:</strong> AI-powered modules are in beta. Results depend on question clarity 
        and publicly available information. Always verify outcomes before making critical decisions.
      </Callout>

      {/* How It Works */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-500" />
          How AI Resolution Works
        </h2>
        
        <p className="text-muted-foreground">
          Unlike traditional oracles that fetch data from APIs, AI modules use Claude AI to analyze 
          publicly available information and determine outcomes for events that require interpretation.
        </p>

        <div className="p-5 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-3">Resolution Flow</h4>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span className="text-muted-foreground">User creates an oracle with a specific question and resolution date</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span className="text-muted-foreground">At resolution date, the system calls the AI with the question and context</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span className="text-muted-foreground">AI analyzes available data and returns: outcome, confidence level, reasoning, and sources</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
              <span className="text-muted-foreground">Result is recorded on-chain via Solana Memo Program for verifiability</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Politics Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Vote className="h-6 w-6 text-blue-500" />
          Politics Module
        </h2>
        
        <p className="text-muted-foreground">
          Create oracles for political events including elections, legislation, appointments, and policy decisions.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Event Types</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Elections:</strong> Presidential, congressional, state</li>
              <li>• <strong>Legislation:</strong> Bill passage, vetoes, amendments</li>
              <li>• <strong>Appointments:</strong> Cabinet, judicial nominations</li>
              <li>• <strong>Policy:</strong> Executive orders, regulations</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Supported Regions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• United States</li>
              <li>• European Union</li>
              <li>• United Kingdom</li>
              <li>• Global / International</li>
            </ul>
          </div>
        </div>

        <CodeBlock
          language="typescript"
          title="Example Question"
          code={`// Politics Oracle
{
  module: "politics",
  eventType: "election",
  region: "United States",
  question: "Who will win the 2024 US Presidential Election?",
  resolutionDate: "2024-11-06T00:00:00Z"
}`}
        />
      </div>

      {/* Economy Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-500" />
          Economy Module
        </h2>
        
        <p className="text-muted-foreground">
          Create oracles for economic indicators and policy decisions including Fed rates, CPI, GDP, and unemployment data.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Supported Indicators</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Fed Rate:</strong> FOMC interest rate decisions</li>
              <li>• <strong>CPI:</strong> Consumer Price Index inflation</li>
              <li>• <strong>GDP:</strong> Gross Domestic Product growth</li>
              <li>• <strong>Unemployment:</strong> Jobs and labor data</li>
              <li>• <strong>Custom:</strong> Any economic metric</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">2025 FOMC Meeting Dates</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• January 28-29</li>
              <li>• March 18-19</li>
              <li>• May 6-7</li>
              <li>• June 17-18</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Awards Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Awards Module
        </h2>
        
        <p className="text-muted-foreground">
          Create oracles for major awards ceremonies including the Oscars, Grammys, Emmys, and Nobel Prizes.
        </p>

        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-2">Supported Ceremonies</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Academy Awards (Oscars)', 'Grammy Awards', 'Emmy Awards', 'Golden Globes', 
              'Tony Awards', 'Nobel Prize', 'Pulitzer Prize'].map(award => (
              <Badge key={award} variant="secondary">{award}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Legal Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Gavel className="h-6 w-6 text-red-500" />
          Legal Module
        </h2>
        
        <p className="text-muted-foreground">
          Create oracles for legal case outcomes including Supreme Court decisions, SEC enforcement, 
          antitrust rulings, and class action settlements.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Case Types</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Supreme Court rulings</li>
              <li>• SEC enforcement actions</li>
              <li>• Antitrust cases</li>
              <li>• Class action lawsuits</li>
              <li>• Regulatory decisions</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Notable Cases (Quick Select)</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• SEC vs Ripple Labs</li>
              <li>• DOJ vs Google (Antitrust)</li>
              <li>• FTC vs Meta</li>
              <li>• Epic vs Apple</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom AI Prediction */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          Custom AI Prediction
        </h2>
        
        <p className="text-muted-foreground">
          Create oracles for any question that can be resolved through publicly available information.
          Perfect for unique predictions that don't fit other modules.
        </p>

        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Best Practices for Custom Questions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Be specific:</strong> "Will Tesla stock close above $250 on Jan 15?" vs "Will Tesla go up?"</li>
            <li>• <strong>Include context:</strong> Provide relevant background information</li>
            <li>• <strong>Set clear resolution criteria:</strong> What defines success/failure?</li>
            <li>• <strong>Choose appropriate dates:</strong> Allow time for the event to occur and be reported</li>
          </ul>
        </div>

        <CodeBlock
          language="typescript"
          title="Custom Question Example"
          code={`// Custom AI Prediction Oracle
{
  module: "custom",
  question: "Will Apple announce a new MacBook Pro at their March 2025 event?",
  additionalContext: "Apple typically announces Mac updates in spring. Focus on official Apple announcements only.",
  resolutionDate: "2025-03-31T23:59:59Z"
}`}
        />
      </div>

      {/* AI Response Structure */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold">AI Response Structure</h2>
        
        <p className="text-muted-foreground">
          When an AI module resolves, it returns a structured response with multiple fields:
        </p>

        <CodeBlock
          language="json"
          title="Resolution Response"
          code={`{
  "success": true,
  "outcome": "Team A wins" | "Yes" | "No" | "pending",
  "confidence": "high" | "medium" | "low",
  "reasoning": "Based on official election results published by...",
  "sources": [
    "https://example.com/official-results",
    "https://reuters.com/election-coverage"
  ]
}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">outcome</td>
                <td className="py-3 px-4 text-muted-foreground">The determined result or "pending" if undeterminable</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">confidence</td>
                <td className="py-3 px-4 text-muted-foreground">AI's confidence level: high, medium, or low</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-mono">reasoning</td>
                <td className="py-3 px-4 text-muted-foreground">Explanation of how the outcome was determined</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono">sources</td>
                <td className="py-3 px-4 text-muted-foreground">URLs of sources used for verification</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edge Cases */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Edge Cases & Limitations
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Pending Results</h4>
            <p className="text-sm text-muted-foreground">
              If the AI cannot determine an outcome (event hasn't occurred, insufficient information), 
              it returns <InlineCode>"outcome": "pending"</InlineCode>. The oracle will retry on the next settlement cycle.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Knowledge Cutoff</h4>
            <p className="text-sm text-muted-foreground">
              AI models have a knowledge cutoff date. For recent events, the AI relies on web search 
              capabilities to find current information. Very recent events (within hours) may not be resolvable.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Ambiguous Questions</h4>
            <p className="text-sm text-muted-foreground">
              Poorly phrased questions may lead to unexpected results. Always be specific about 
              what constitutes a "yes" or "no" outcome.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Best Practices for AI Oracles</h2>
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Use clear, unambiguous questions</span>
              <p className="text-sm text-muted-foreground">Avoid questions with multiple interpretations</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Set resolution dates after events conclude</span>
              <p className="text-sm text-muted-foreground">Allow 24-48 hours after expected event completion</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Provide context for complex questions</span>
              <p className="text-sm text-muted-foreground">Use the "Additional Context" field to clarify edge cases</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Verify AI results independently</span>
              <p className="text-sm text-muted-foreground">For critical applications, always cross-check AI outcomes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModulesPage;
