import { CodeBlock } from "@/components/docs/CodeBlock";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Database, Server, Zap, Globe, Wallet, Clock, Shield, Code } from "lucide-react";

const TechnicalDocPage = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <Badge variant="outline" className="mb-4 text-primary border-primary/30">
          Technical Documentation
        </Badge>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          AXIS Protocol — Full Technical Specification
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete technical documentation for the AXIS oracle factory protocol. 
          This document covers architecture, APIs, smart contracts, and settlement mechanics.
        </p>
      </div>

      <Separator className="bg-border/50" />

      {/* Table of Contents */}
      <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Table of Contents
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li><a href="#overview" className="hover:text-primary transition-colors">System Overview</a></li>
          <li><a href="#architecture" className="hover:text-primary transition-colors">Architecture</a></li>
          <li><a href="#modules" className="hover:text-primary transition-colors">Data Modules</a></li>
          <li><a href="#oracle-creation" className="hover:text-primary transition-colors">Oracle Creation Flow</a></li>
          <li><a href="#settlement" className="hover:text-primary transition-colors">Settlement Process</a></li>
          <li><a href="#apis" className="hover:text-primary transition-colors">External APIs</a></li>
          <li><a href="#database" className="hover:text-primary transition-colors">Database Schema</a></li>
          <li><a href="#configuration" className="hover:text-primary transition-colors">Configuration</a></li>
        </ol>
      </div>

      <Separator className="bg-border/50" />

      {/* 1. System Overview */}
      <section id="overview" className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Globe className="h-6 w-6 text-primary" />
          1. System Overview
        </h2>
        
        <p className="text-muted-foreground">
          AXIS is a <strong>permissionless oracle factory</strong> built on Solana that allows anyone to create 
          custom data feeds for crypto prices, memecoins, weather, and esports. The protocol uses 
          Switchboard On-Demand for decentralized oracle infrastructure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-primary mb-2">Network</h3>
            <p className="text-sm text-muted-foreground">Solana Mainnet-Beta</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-primary mb-2">Oracle Provider</h3>
            <p className="text-sm text-muted-foreground">Switchboard On-Demand v2.17.6</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-primary mb-2">RPC Provider</h3>
            <p className="text-sm text-muted-foreground">Helius (Primary) + Ankr/Public (Fallback)</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold text-primary mb-2">Creation Fee</h3>
            <p className="text-sm text-muted-foreground">~0.046 SOL per oracle</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mt-6 text-foreground">Key Addresses</h3>
        <CodeBlock
          language="text"
          code={`// Switchboard On-Demand Program ID
SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv

// Switchboard Mainnet Queue
A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w

// AXIS Treasury Wallet
5oPrhqL38zvCDoKgN56UmLNem526RE5CM1hzt6HoJwot`}
        />
      </section>

      <Separator className="bg-border/50" />

      {/* 2. Architecture */}
      <section id="architecture" className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Server className="h-6 w-6 text-primary" />
          2. Architecture
        </h2>

        <p className="text-muted-foreground">
          AXIS uses a <strong>pull-based oracle model</strong> where data is fetched on-demand 
          rather than continuously pushed. This significantly reduces costs and improves efficiency.
        </p>

        <h3 className="text-xl font-semibold mt-6 text-foreground">Component Stack</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-foreground">Layer</th>
                <th className="text-left p-3 text-foreground">Technology</th>
                <th className="text-left p-3 text-foreground">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="p-3">Frontend</td>
                <td className="p-3">React + Vite + TypeScript</td>
                <td className="p-3">User interface and wallet integration</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3">Styling</td>
                <td className="p-3">Tailwind CSS + shadcn/ui</td>
                <td className="p-3">UI components and design system</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3">Blockchain SDK</td>
                <td className="p-3">@solana/web3.js + @switchboard-xyz/on-demand</td>
                <td className="p-3">Solana interactions and oracle creation</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3">Database</td>
                <td className="p-3">Supabase (PostgreSQL)</td>
                <td className="p-3">Feed storage and status tracking</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3">Backend</td>
                <td className="p-3">Supabase Edge Functions (Deno)</td>
                <td className="p-3">Settlement orchestration</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3">Settler</td>
                <td className="p-3">Railway (Node.js)</td>
                <td className="p-3">On-chain transaction signing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* 3. Data Modules */}
      <section id="modules" className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Zap className="h-6 w-6 text-primary" />
          3. Data Modules
        </h2>

        <p className="text-muted-foreground">
          AXIS supports multiple data modules, each with its own data source and oracle job definition.
        </p>

        {/* Crypto Module */}
        <div className="bg-card/50 rounded-lg p-6 border border-border/50 mt-6">
          <h3 className="text-xl font-semibold text-primary mb-3">3.1 Crypto Module</h3>
          <p className="text-muted-foreground mb-4">
            Price feeds for major cryptocurrencies using GeckoTerminal API.
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Data Source</h4>
              <p className="text-sm text-muted-foreground">GeckoTerminal API (api.geckoterminal.com)</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Supported Assets</h4>
              <div className="flex flex-wrap gap-2">
                {['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC', 
                  'LINK', 'SHIB', 'UNI', 'ATOM', 'LTC', 'TRX', 'NEAR', 'APT', 'ARB', 'OP',
                  'PEPE', 'INJ', 'FTM', 'AAVE', 'MKR', 'GRT', 'LDO', 'IMX', 'SNX', 'RUNE'].map(asset => (
                  <Badge key={asset} variant="secondary">{asset}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Oracle Job Definition</h4>
              <CodeBlock
                language="json"
                code={`{
  "tasks": [
    {
      "httpTask": {
        "url": "https://api.geckoterminal.com/api/v2/networks/eth/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      }
    },
    {
      "jsonParseTask": {
        "path": "$.data.attributes.price_usd"
      }
    }
  ]
}`}
              />
            </div>
          </div>
        </div>

        {/* Memecoin Module */}
        <div className="bg-card/50 rounded-lg p-6 border border-border/50 mt-6">
          <h3 className="text-xl font-semibold text-primary mb-3">3.2 Memecoin Module</h3>
          <p className="text-muted-foreground mb-4">
            Price and market cap feeds for Solana memecoins using GeckoTerminal API.
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground">Data Source</h4>
              <p className="text-sm text-muted-foreground">GeckoTerminal API — Solana Network</p>
            </div>

            <div>
              <h4 className="font-medium text-foreground">Supported Metrics</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li><code className="bg-muted px-1 rounded">price</code> — Current token price in USD</li>
                <li><code className="bg-muted px-1 rounded">marketcap</code> — Fully diluted valuation (FDV)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Weather Module */}
        <div className="bg-card/50 rounded-lg p-6 border border-border/50 mt-6">
          <h3 className="text-xl font-semibold text-primary mb-3">3.3 Weather Module</h3>
          <p className="text-muted-foreground mb-4">
            Temperature data for world capitals using Open-Meteo API (Free, No API Key Required).
          </p>
        </div>

        {/* Esports Module */}
        <div className="bg-card/50 rounded-lg p-6 border border-border/50 mt-6">
          <h3 className="text-xl font-semibold text-primary mb-3">3.4 Esports Module</h3>
          <p className="text-muted-foreground mb-4">
            Match winner data for CS2, Dota 2, and LoL using PandaScore API (Requires API Key).
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Settlement Mode:</strong> <code className="bg-muted px-1 rounded">manual</code> — Requires explicit settlement trigger after match ends
          </p>
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* 4. Oracle Creation Flow */}
      <section id="oracle-creation" className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Wallet className="h-6 w-6 text-primary" />
          4. Oracle Creation Flow
        </h2>

        <p className="text-muted-foreground">
          Complete step-by-step process for creating a new AXIS oracle:
        </p>

        <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
          <li>Connect Wallet (Phantom, Solflare, etc.) & verify ownership</li>
          <li>Select module + configure parameters</li>
          <li>Check minimum balance (0.031 SOL)</li>
          <li>Generate OracleJob definition from module config</li>
          <li>Store job in Crossbar → get feedHash</li>
          <li>Generate new PullFeed keypair</li>
          <li>Build PullFeed init instruction with feedHash</li>
          <li>Build fee transfer instruction (~0.046 SOL → Treasury)</li>
          <li>Simulate, sign, and send transaction</li>
          <li>Insert feed record to Supabase database</li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 text-foreground">Key Files</h3>
        <ul className="list-disc list-inside text-muted-foreground ml-4">
          <li><code className="bg-muted px-1 rounded">src/services/switchboardService.ts</code> — Oracle deployment</li>
          <li><code className="bg-muted px-1 rounded">src/hooks/useCreateFeed.ts</code> — React hook for creation flow</li>
          <li><code className="bg-muted px-1 rounded">src/config/constants.ts</code> — Configuration</li>
        </ul>
      </section>

      <Separator className="bg-border/50" />

      {/* 5. Settlement Process */}
      <section id="settlement" className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Clock className="h-6 w-6 text-primary" />
          5. Settlement Process
        </h2>

        <p className="text-muted-foreground">
          AXIS uses a two-tier settlement architecture: Supabase Edge Function for orchestration 
          and Railway service for on-chain transaction signing.
        </p>

        <h3 className="text-xl font-semibold mt-6 text-foreground">Settlement Flow</h3>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
          <li>Edge Function queries pending feeds from database</li>
          <li>Fetches oracle value via Crossbar HTTP API</li>
          <li>Calls Railway settler for on-chain transaction</li>
          <li>Railway signs with SETTLER_PRIVATE_KEY</li>
          <li>Transaction confirmed on Solana</li>
          <li>Database updated with settlement result</li>
        </ol>

        <h3 className="text-xl font-semibold mt-6 text-foreground">Key Files</h3>
        <ul className="list-disc list-inside text-muted-foreground ml-4">
          <li><code className="bg-muted px-1 rounded">supabase/functions/oracle-settler/index.ts</code> — Orchestrator</li>
          <li><code className="bg-muted px-1 rounded">scripts/settler.js</code> — Railway on-chain settler</li>
        </ul>
      </section>

      <Separator className="bg-border/50" />

      {/* 6. External APIs */}
      <section id="apis" className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Globe className="h-6 w-6 text-primary" />
          6. External APIs
        </h2>

        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-foreground">API</th>
                <th className="text-left p-3 text-foreground">Base URL</th>
                <th className="text-left p-3 text-foreground">Auth</th>
                <th className="text-left p-3 text-foreground">Rate Limit</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="p-3 font-medium">GeckoTerminal</td>
                <td className="p-3 font-mono text-xs">api.geckoterminal.com</td>
                <td className="p-3"><Badge variant="secondary">None</Badge></td>
                <td className="p-3">30 req/min</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 font-medium">Open-Meteo</td>
                <td className="p-3 font-mono text-xs">api.open-meteo.com</td>
                <td className="p-3"><Badge variant="secondary">None</Badge></td>
                <td className="p-3">10,000 req/day</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 font-medium">PandaScore</td>
                <td className="p-3 font-mono text-xs">api.pandascore.co</td>
                <td className="p-3"><Badge>API Key</Badge></td>
                <td className="p-3">1,000 req/hour</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 font-medium">Helius RPC</td>
                <td className="p-3 font-mono text-xs">mainnet.helius-rpc.com</td>
                <td className="p-3"><Badge>API Key</Badge></td>
                <td className="p-3">10 req/sec</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-3 font-medium">Crossbar</td>
                <td className="p-3 font-mono text-xs">crossbar.switchboard.xyz</td>
                <td className="p-3"><Badge variant="secondary">None</Badge></td>
                <td className="p-3">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* 7. Database Schema */}
      <section id="database" className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Database className="h-6 w-6 text-primary" />
          7. Database Schema
        </h2>

        <h3 className="text-xl font-semibold mt-6 text-foreground">Feeds Table</h3>
        <CodeBlock
          language="sql"
          code={`CREATE TABLE public.feeds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  TEXT NOT NULL,     -- Creator's Solana wallet
  feed_pubkey     TEXT NOT NULL,     -- On-chain feed address
  feed_hash       TEXT,              -- Crossbar feed hash
  title           TEXT NOT NULL,     -- Human-readable title
  feed_type       TEXT NOT NULL,     -- Asset type (BTC, ETH, etc.)
  module          TEXT NOT NULL,     -- Module type
  config          JSONB DEFAULT '{}',-- Module-specific config
  resolution_date TIMESTAMPTZ,       -- When to settle
  status          TEXT DEFAULT 'pending',
  settled_at      TIMESTAMPTZ,
  settled_value   TEXT,
  settlement_tx   TEXT,              -- Solana tx signature
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);`}
        />

        <h3 className="text-xl font-semibold mt-6 text-foreground">Status Values</h3>
        <ul className="list-disc list-inside text-muted-foreground ml-4">
          <li><code className="bg-muted px-1 rounded">pending</code> — Awaiting resolution date</li>
          <li><code className="bg-muted px-1 rounded">settled</code> — Successfully settled</li>
          <li><code className="bg-muted px-1 rounded">failed</code> — Settlement failed</li>
          <li><code className="bg-muted px-1 rounded">manual</code> — Requires manual trigger (esports)</li>
        </ul>
      </section>

      <Separator className="bg-border/50" />

      {/* 8. Configuration */}
      <section id="configuration" className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Code className="h-6 w-6 text-primary" />
          8. Configuration
        </h2>

        <h3 className="text-xl font-semibold mt-6 text-foreground">Environment Variables</h3>
        <CodeBlock
          language="bash"
          code={`# Frontend (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx

# Supabase Secrets (Edge Functions)
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RAILWAY_SETTLER_URL
SETTLER_API_KEY
HELIUS_RPC_URL
PANDASCORE_API_KEY

# Railway (Settler Service)
SETTLER_PRIVATE_KEY
HELIUS_RPC_URL
SETTLER_API_KEY
PORT=3000`}
        />

        <h3 className="text-xl font-semibold mt-6 text-foreground">Constants (src/config/constants.ts)</h3>
        <CodeBlock
          language="typescript"
          code={`// Treasury
TREASURY_WALLET_PUBKEY = "5oPrhqL38zvCDoKgN56UmLNem526RE5CM1hzt6HoJwot"

// Fees
CREATION_FEE_SOL = 0.046
MIN_BALANCE_SOL = 0.05

// Switchboard
SWITCHBOARD_QUEUE_PUBKEY = "A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w"
SWITCHBOARD_PROGRAM_ID = "SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv"`}
        />
      </section>

      <Separator className="bg-border/50" />

      {/* Footer */}
      <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-2">Document Info</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Last Updated:</strong> December 2025</p>
          <p><strong>Network:</strong> Solana Mainnet-Beta</p>
          <p><strong>SDK:</strong> @switchboard-xyz/on-demand v2.17.6</p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDocPage;