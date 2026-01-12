import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { Twitter, Film, Rocket, Gamepad2, Satellite, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SocialMediaPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Data Modules</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Social & Media Modules</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Oracle modules for social media metrics, entertainment data, gaming analytics, 
          space launches, and token launchpad events.
        </p>
      </div>

      {/* Social (X/Twitter) Module */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Twitter className="h-6 w-6 text-sky-500" />
          Social Module (X/Twitter)
        </h2>
        
        <p className="text-muted-foreground">
          Track follower counts and engagement metrics for any X (Twitter) account.
          Perfect for prediction markets on influencer growth or social reach.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Supported Metrics</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Followers:</strong> Total follower count</li>
              <li>• <strong>Following:</strong> Accounts being followed</li>
              <li>• <strong>Tweets:</strong> Total post count</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Data Source</h4>
            <p className="text-sm text-muted-foreground">
              X/Twitter API v2 via authenticated Edge Function
            </p>
          </div>
        </div>

        <CodeBlock
          language="typescript"
          title="Example Configuration"
          code={`// Social Oracle - Track Elon Musk followers
{
  module: "social",
  platform: "twitter",
  username: "elonmusk",
  metric: "followers",
  resolutionDate: "2025-01-15T12:00:00Z"
}`}
        />
      </div>

      {/* Movies Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Film className="h-6 w-6 text-red-500" />
          Movies Module
        </h2>
        
        <p className="text-muted-foreground">
          Track box office performance and movie metrics using The Movie Database (TMDB) API.
          Create oracles for opening weekend revenue, total gross, and audience scores.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Supported Metrics</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Revenue:</strong> Box office earnings (USD)</li>
              <li>• <strong>Popularity:</strong> TMDB popularity score</li>
              <li>• <strong>Vote Average:</strong> User rating (0-10)</li>
              <li>• <strong>Vote Count:</strong> Number of ratings</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Data Source</h4>
            <p className="text-sm text-muted-foreground">
              <a href="https://themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TMDB API</a> - 
              Comprehensive movie and TV database
            </p>
          </div>
        </div>

        <Callout type="info">
          Search for movies by title to get the correct TMDB ID. The oracle will fetch 
          the latest revenue and rating data at resolution time.
        </Callout>
      </div>

      {/* Launchpad Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Rocket className="h-6 w-6 text-orange-500" />
          Launchpad Module
        </h2>
        
        <p className="text-muted-foreground">
          Track bonding curve graduation status for tokens launched on Pump.fun. 
          Create oracles to predict whether a token will graduate before a specific date.
        </p>

        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Early Settlement</h4>
          <p className="text-sm text-muted-foreground">
            Launchpad oracles support <strong>early settlement</strong>. If a token graduates before 
            the resolution date, the oracle is automatically settled with the result "Graduated: Yes".
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Resolution Values</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Graduated: Yes</strong> — Token graduated from bonding curve</li>
              <li>• <strong>Graduated: No</strong> — Still on bonding curve at resolution</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Token must be launched on Pump.fun</li>
              <li>• Valid Solana mint address required</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Steam Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-blue-600" />
          Steam Module
        </h2>
        
        <p className="text-muted-foreground">
          Track Steam game statistics including concurrent players and player counts.
          Perfect for gaming prediction markets and engagement tracking.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Supported Metrics</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Current Players:</strong> Live concurrent player count</li>
              <li>• <strong>Peak Players:</strong> All-time peak (when available)</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">Data Source</h4>
            <p className="text-sm text-muted-foreground">
              Steam Web API - Official Valve API
            </p>
          </div>
        </div>

        <CodeBlock
          language="typescript"
          title="Example: Counter-Strike 2 Player Count"
          code={`// Steam Oracle - CS2 Concurrent Players
{
  module: "steam",
  gameId: "730", // CS2 App ID
  gameName: "Counter-Strike 2",
  metric: "player_count",
  resolutionDate: "2025-01-20T18:00:00Z"
}`}
        />
      </div>

      {/* Cosmos (Space) Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Satellite className="h-6 w-6 text-indigo-500" />
          Cosmos Module (Space Launches)
        </h2>
        
        <p className="text-muted-foreground">
          Track upcoming rocket launches and space events. Create oracles for launch success, 
          timing, and mission outcomes.
        </p>

        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-2">Supported Events</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {['SpaceX Falcon 9', 'SpaceX Starship', 'NASA SLS', 'Blue Origin', 'Rocket Lab', 'ULA Atlas V'].map(launch => (
              <Badge key={launch} variant="secondary">{launch}</Badge>
            ))}
          </div>
        </div>

        <Callout type="info">
          Space launch data is sourced from public APIs. Resolution is based on official 
          launch status updates from providers.
        </Callout>
      </div>

      {/* Data Sources Summary */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold">Data Sources Summary</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Module</th>
                <th className="text-left py-3 px-4 font-semibold">Data Source</th>
                <th className="text-left py-3 px-4 font-semibold">Update Frequency</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Social (X)</td>
                <td className="py-3 px-4 text-muted-foreground">Twitter API v2</td>
                <td className="py-3 px-4 text-muted-foreground">Real-time at resolution</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Movies</td>
                <td className="py-3 px-4 text-muted-foreground">TMDB API</td>
                <td className="py-3 px-4 text-muted-foreground">Daily updates</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Launchpad</td>
                <td className="py-3 px-4 text-muted-foreground">Pump.fun API</td>
                <td className="py-3 px-4 text-muted-foreground">Every 2 minutes (watcher)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Steam</td>
                <td className="py-3 px-4 text-muted-foreground">Steam Web API</td>
                <td className="py-3 px-4 text-muted-foreground">Real-time at resolution</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Cosmos</td>
                <td className="py-3 px-4 text-muted-foreground">Space Launch APIs</td>
                <td className="py-3 px-4 text-muted-foreground">Event-based</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Practices */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Verify account/game IDs</span>
              <p className="text-sm text-muted-foreground">Double-check usernames and game IDs before creating oracles</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Account for time zones</span>
              <p className="text-sm text-muted-foreground">Resolution times are in UTC; plan accordingly for regional events</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Consider API rate limits</span>
              <p className="text-sm text-muted-foreground">Some APIs have rate limits; resolution may be delayed during high traffic</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaPage;
