import { FC } from 'react';
import { Callout } from '@/components/docs/CodeBlock';
import { Cloud, Trophy, Clock, Landmark, Calendar, Zap } from 'lucide-react';

const WeatherSportsPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Data Modules</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">RWA & Event Settlement</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Oracle modules for real-world asset data and event-based settlement, including weather data 
          and traditional sports outcomes.
        </p>
      </div>

      {/* Overview */}
      <div className="space-y-4">
        <div className="p-5 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Landmark className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">Real-World Assets (RWA)</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Axis enables permissionless oracles for any real-world data with verifiable APIs. 
            Weather data is the first RWA module, with more coming soon (commodities, forex, economic indicators).
          </p>
        </div>
      </div>

      {/* Weather Module */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Cloud className="h-6 w-6 text-blue-500" />
          Weather Module
        </h2>
        
        <p className="text-muted-foreground">
          The Weather module fetches temperature and precipitation data for major global cities using the Open-Meteo API.
          Ideal for parametric insurance, prediction markets, and weather-dependent smart contracts.
        </p>

        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <h4 className="font-medium mb-2">Data Source</h4>
          <p className="text-sm text-muted-foreground">
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open-Meteo</a> - 
            Free, open-source weather API with global coverage and no API key required.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Supported Cities (50+ locations)</h4>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm">
            {['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Singapore', 'Hong Kong', 'Berlin', 'Toronto'].map((city) => (
              <div key={city} className="p-2 rounded border border-border/50 bg-muted/20 text-center text-muted-foreground">
                {city}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">...and many more major capitals and cities worldwide.</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Available Metrics</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold">Metric</th>
                  <th className="text-left py-2 px-3 font-semibold">Unit</th>
                  <th className="text-left py-2 px-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3">Max Temperature</td>
                  <td className="py-2 px-3 font-mono">°C</td>
                  <td className="py-2 px-3 text-muted-foreground">Daily maximum temperature</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 px-3">Min Temperature</td>
                  <td className="py-2 px-3 font-mono">°C</td>
                  <td className="py-2 px-3 text-muted-foreground">Daily minimum temperature</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Precipitation</td>
                  <td className="py-2 px-3 font-mono">mm</td>
                  <td className="py-2 px-3 text-muted-foreground">Total daily precipitation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Use Cases</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Parametric Insurance:</strong> Automatic payouts when temperature exceeds thresholds</li>
            <li>• <strong>Prediction Markets:</strong> Will it rain in NYC on New Year's Eve?</li>
            <li>• <strong>Gaming:</strong> Weather-reactive on-chain games</li>
            <li>• <strong>Agriculture:</strong> Crop insurance and yield predictions</li>
          </ul>
        </div>
      </div>

      {/* Sports Module */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Sports Module
        </h2>
        
        <div className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Traditional sports oracles (NBA, NFL, MLB, Soccer) are currently in development.
            Stay tuned for updates!
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Planned Features</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50">
              <h5 className="font-medium mb-2">Major Leagues</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• NBA (Basketball)</li>
                <li>• NFL (American Football)</li>
                <li>• MLB (Baseball)</li>
                <li>• Premier League (Soccer)</li>
                <li>• Champions League</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-border/50">
              <h5 className="font-medium mb-2">Supported Markets</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Match Winner</li>
                <li>• Point Spreads</li>
                <li>• Over/Under Totals</li>
                <li>• Player Props</li>
              </ul>
            </div>
          </div>
        </div>

        <Callout type="info">
          <strong>Interested in Sports Oracles?</strong> Follow us on <a href="https://x.com/axis_oracle" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">X</a> to be notified when the Sports module launches
          and to provide feedback on which leagues and markets to prioritize.
        </Callout>
      </div>

      {/* Event Settlement */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-500" />
          Event-Based Settlement
        </h2>
        
        <p className="text-muted-foreground">
          Unlike time-based oracles that resolve at a specific timestamp, event-based oracles 
          resolve when a real-world event occurs (e.g., match completion, election result).
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">Time-Based</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Resolves at a specific UTC timestamp. Used for crypto prices, weather data.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <h4 className="font-medium">Event-Based</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Resolves when an event completes. Used for esports, sports, elections.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
          <h4 className="font-semibold mb-2">Zero-Maintenance Settlement</h4>
          <p className="text-sm text-muted-foreground">
            Our automated keeper network monitors event APIs and triggers settlement as soon as 
            results are available. You don't need to run your own crank or manually settle oracles.
          </p>
        </div>
      </div>

      {/* Weather Oracle Example */}
      <div className="space-y-4 pt-8 border-t border-border">
        <h2 className="text-2xl font-semibold">Creating a Weather Oracle</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <div>
              <p className="font-medium">Select a City</p>
              <p className="text-sm text-muted-foreground">Choose from 50+ major global cities via the searchable dropdown</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</span>
            <div>
              <p className="font-medium">Choose a Metric</p>
              <p className="text-sm text-muted-foreground">Max Temperature (°C), Min Temperature (°C), or Precipitation (mm)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">3</span>
            <div>
              <p className="font-medium">Set Resolution Date</p>
              <p className="text-sm text-muted-foreground">When should the weather be measured? Must be at least 1 hour in future.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm font-bold shrink-0">✓</span>
            <div>
              <p className="font-medium">Automatic Settlement</p>
              <p className="text-sm text-muted-foreground">Our keeper network settles the oracle automatically at the specified time!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSportsPage;
