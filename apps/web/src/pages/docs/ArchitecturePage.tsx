import { FC } from 'react';
import { CodeBlock, Callout } from '@/components/docs/CodeBlock';
import { ArrowRight, Shield, Cpu, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ArchitecturePage: FC = () => {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>Core Concepts</span>
          <span>/</span>
          <span className="text-foreground">Architecture</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          System Architecture
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Understanding how data flows from external APIs through TEE verification to your Solana program.
        </p>
      </div>

      {/* Data Flow Diagram */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Data Flow Overview</h2>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Axis leverages the Switchboard On-Demand infrastructure with TEE (Trusted Execution Environment) 
        verification to securely bring off-chain data onto Solana. Here's the complete data flow:
      </p>

      {/* ASCII Diagram */}
      <div className="not-prose my-8 p-6 rounded-lg bg-[#1e1e1e] border border-border overflow-x-auto">
        <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
{`┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│   Source API    │────▶│  Axis Protocol  │────▶│   TEE Oracles   │────▶│  Solana Account │
│  (GeckoTerminal │     │  (Job Config)   │     │  (Switchboard)  │     │  (Your Feed)    │
│   PandaScore)   │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
    Real-time              Job Definition           Signed inside             On-chain
    Data Source            & Validation           Secure Enclave            Settlement

`}
        </pre>
      </div>

      {/* TEE Verification */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4 flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        TEE Verification
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        The cornerstone of Axis's trustless architecture is <strong className="text-foreground">Trusted Execution Environment (TEE)</strong> verification. 
        Every oracle update is fetched and signed inside a secure hardware enclave.
      </p>

      <div className="not-prose my-6 p-5 rounded-lg border border-primary/30 bg-primary/5">
        <h4 className="font-semibold text-foreground mb-3">How TEE Works</h4>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <p>Oracle node receives a data request with the job definition (API endpoint, parsing rules)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <p>The job executes <strong className="text-foreground">inside the TEE</strong> — a hardware-isolated environment the node operator cannot access</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <p>The TEE fetches the API, parses the result, and signs it with a key only the enclave can access</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <p>The signed result is returned — mathematically proving the data wasn't tampered with</p>
          </div>
        </div>
      </div>

      <Callout type="success" title="Mathematical Integrity">
        Even if a node operator is malicious, they cannot modify the data or forge signatures. 
        The TEE's cryptographic attestation proves the code executed correctly on genuine data.
      </Callout>

      {/* Zero-Maintenance Settlement */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4 flex items-center gap-2">
        <Cpu className="h-6 w-6 text-green-500" />
        Zero-Maintenance Settlement
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Developers do not need to run their own crank nodes. Axis utilizes a network of 
        <strong className="text-foreground"> automated keepers</strong> (hosted on robust infrastructure like Railway) 
        to detect resolution criteria and settle markets instantly on-chain.
      </p>

      <div className="not-prose my-6 grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h4 className="font-medium text-foreground">Automated Detection</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Keepers continuously monitor resolution dates and event triggers. When criteria are met, 
            settlement happens automatically.
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-green-500" />
            <h4 className="font-medium text-foreground">Reliable Infrastructure</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Our keeper network runs 24/7 with redundancy and retry logic. You focus on your dApp; 
            we handle the infrastructure.
          </p>
        </div>
      </div>

      {/* Component breakdown */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Component Breakdown</h2>

      <h3 className="text-lg font-medium text-foreground mt-8 mb-3">1. Source APIs</h3>
      <p className="text-muted-foreground leading-relaxed">
        Axis supports multiple data sources out of the box:
      </p>
      <ul className="list-disc list-inside text-muted-foreground space-y-2 my-4">
        <li><strong className="text-foreground">GeckoTerminal API</strong> — Aggregated DEX liquidity data and price feeds for any SPL token on Solana</li>
        <li><strong className="text-foreground">DexScreener API</strong> — Token analytics including price, market cap, and volume</li>
        <li><strong className="text-foreground">Open-Meteo API</strong> — Weather data for global locations</li>
        <li><strong className="text-foreground">PandaScore API</strong> — Esports match results and statistics</li>
      </ul>

      <h3 className="text-lg font-medium text-foreground mt-8 mb-3">2. Axis Protocol Layer</h3>
      <p className="text-muted-foreground leading-relaxed">
        When you create an oracle through Axis, the protocol:
      </p>
      <ul className="list-disc list-inside text-muted-foreground space-y-2 my-4">
        <li>Generates a Switchboard Job definition specifying the data source</li>
        <li>Configures the parsing logic (JSON path extraction)</li>
        <li>Initializes the on-chain Feed account</li>
        <li>Associates the feed with the Switchboard Oracle Queue</li>
        <li>Registers the feed for automated settlement</li>
      </ul>

      <CodeBlock
        language="typescript"
        filename="jobDefinition.ts"
        code={`// Example Job Definition for a crypto price feed
const jobDefinition = {
  name: "ETH/USD Price Feed",
  tasks: [
    {
      httpTask: {
        url: "https://api.geckoterminal.com/api/v2/simple/networks/solana/token_price/...",
      },
    },
    {
      jsonParseTask: {
        path: "$.data.attributes.token_prices.*",
      },
    },
    {
      multiplyTask: {
        scalar: 1e9, // Scale to avoid floating point
      },
    },
  ],
};`}
      />

      <h3 className="text-lg font-medium text-foreground mt-8 mb-3">3. Switchboard TEE Oracle Network</h3>
      <p className="text-muted-foreground leading-relaxed">
        The Switchboard network consists of independent oracle operators running TEE-enabled nodes who:
      </p>
      <ul className="list-disc list-inside text-muted-foreground space-y-2 my-4">
        <li>Execute the job definition inside a secure enclave (SGX/TDX)</li>
        <li>Fetch data from the source API with cryptographic attestation</li>
        <li>Sign the data with enclave-only keys</li>
        <li>Return the verified result for inclusion in transactions</li>
      </ul>

      <Callout type="info" title="Decentralization + TEE">
        Multiple oracles independently fetch and verify data inside their own TEEs. 
        The final value is determined through aggregation (median), combining decentralization 
        with hardware-enforced integrity.
      </Callout>

      <h3 className="text-lg font-medium text-foreground mt-8 mb-3">4. Solana Account</h3>
      <p className="text-muted-foreground leading-relaxed">
        Each Axis oracle is represented by a Solana account containing:
      </p>
      <ul className="list-disc list-inside text-muted-foreground space-y-2 my-4">
        <li><strong className="text-foreground">Feed Address</strong> — The unique public key identifying your oracle</li>
        <li><strong className="text-foreground">Latest Value</strong> — The most recently verified data point</li>
        <li><strong className="text-foreground">Timestamp</strong> — When the data was last updated</li>
        <li><strong className="text-foreground">Config</strong> — Job definition and parameters</li>
      </ul>

      {/* Trust Assumptions */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Trust Assumptions</h2>
      <p className="text-muted-foreground leading-relaxed">
        Transparency about trust is critical in decentralized systems. Here's what you're trusting 
        when using Axis oracles:
      </p>

      <div className="not-prose my-8 space-y-4">
        <div className="p-4 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">📡 Source API Reliability</h4>
          <p className="text-sm text-muted-foreground">
            Axis relies on the underlying data sources (GeckoTerminal, PandaScore, etc.) for accurate data. 
            If the source API provides incorrect data, the oracle will reflect that. TEE ensures the data 
            wasn't modified in transit, but cannot verify the source's accuracy.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <h4 className="font-medium text-foreground mb-2">🔐 TEE Hardware Security</h4>
          <p className="text-sm text-muted-foreground">
            We trust that Intel SGX/TDX enclaves are secure and that attestation proofs are valid. 
            This is industry-standard technology used by major cloud providers and financial institutions.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">⏱️ Data Freshness</h4>
          <p className="text-sm text-muted-foreground">
            Pull-based oracles fetch data on-demand. There may be a brief delay (typically under 1 second) 
            between the API response and on-chain settlement. For time-sensitive applications, 
            verify the timestamp.
          </p>
        </div>
      </div>

      {/* Security considerations */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Security Considerations</h2>
      
      <h3 className="text-lg font-medium text-foreground mt-8 mb-3">Staleness Checks</h3>
      <p className="text-muted-foreground leading-relaxed">
        Always verify that oracle data is fresh before using it in critical operations:
      </p>

      <CodeBlock
        language="rust"
        filename="staleness_check.rs"
        code={`// In your Anchor program
pub fn process_with_oracle(ctx: Context<ProcessOracle>) -> Result<()> {
    let feed = &ctx.accounts.oracle_feed;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Reject data older than 60 seconds
    let max_staleness: i64 = 60;
    let last_update = feed.latest_confirmed_round.round_open_timestamp;
    
    require!(
        current_time - last_update < max_staleness,
        OracleError::StaleData
    );
    
    // Safe to use feed.latest_confirmed_round.result
    Ok(())
}`}
      />

      {/* Next steps */}
      <div className="not-prose mt-12 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
        <h3 className="font-semibold text-foreground mb-2">Continue Learning</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Now that you understand the architecture and TEE verification, learn how to integrate 
          Axis oracles into your Solana applications.
        </p>
        <NavLink to="/docs/integration">
          <Button variant="gold" size="sm" className="gap-2">
            Integration Guide
            <ArrowRight className="h-4 w-4" />
          </Button>
        </NavLink>
      </div>
    </article>
  );
};

export default ArchitecturePage;
