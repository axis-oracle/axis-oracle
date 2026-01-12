<div align="center">

<img src="src/assets/axis-logo.png" alt="AXIS Protocol" width="120" />

# AXIS Protocol

![AXIS Protocol](https://img.shields.io/badge/AXIS-Protocol-gold?style=for-the-badge)
![Solana](https://img.shields.io/badge/Solana-Mainnet-purple?style=for-the-badge)
![Switchboard](https://img.shields.io/badge/Switchboard-TEE%20Verified-blue?style=for-the-badge)

**The Resolution Layer for Solana**

[Launch App](https://axisoracle.com/app) | [Documentation](https://axisoracle.com/docs) | [Twitter](https://x.com/axis_oracle) | [GitHub](https://github.com/axis-oracle)

</div>

---

## What is AXIS?

AXIS Protocol is a **permissionless oracle factory** that enables anyone to deploy custom data feeds on Solana in under 60 seconds. Built on [Switchboard's TEE-verified infrastructure](https://switchboard.xyz), AXIS provides cryptographically-proven, tamper-proof data for DeFi, prediction markets, gaming, and beyond.

### The Problem

Traditional oracle solutions require:
- Complex smart contract development
- Expensive node infrastructure
- Ongoing maintenance and monitoring
- Deep technical expertise

### The Solution

AXIS abstracts all complexity into a simple UI:

1. **Select a Module** — Choose from Crypto, Token Analytics, Weather, or Esports
2. **Configure Your Oracle** — Pick the asset, metric, and resolution time
3. **Deploy with One Click** — Sign a single transaction and you're live on Mainnet
4. **Integrate Anywhere** — Use the public key in your smart contracts immediately

---

## Architecture

```
                              AXIS FRONTEND
              React + Vite + Tailwind + Solana Wallet Adapter
                                  |
                                  v
                        SWITCHBOARD ON-DEMAND
       +-------------+  +-------------+  +------------------------+
       |   Oracles   |--|  Crossbar   |--|  TEE-Verified Execution |
       |  (Mainnet)  |  |   Gateway   |  |   (Intel SGX Enclaves)  |
       +-------------+  +-------------+  +------------------------+
                                  |
                                  v
                            DATA SOURCES
    +------------+  +-------------+  +-----------+  +-------------+
    | GeckoTerm- |  | DexScreener |  | Open-Meteo|  |  PandaScore |
    |   inal     |  |     API     |  |    API    |  |     API     |
    +------------+  +-------------+  +-----------+  +-------------+
        Crypto     Token Analytics    Weather         Esports
                                  |
                                  v
                          SETTLEMENT ENGINE
    +----------------+  +----------------+  +------------------+
    | Supabase Edge  |--|  Railway Cron  |--|  On-Chain Proof  |
    |   Functions    |  |    Settler     |  |    (Solscan)     |
    +----------------+  +----------------+  +------------------+
```

---

## Modules

### Global Crypto
Stream high-precision price data for major cryptocurrencies.

- **Data Source**: GeckoTerminal API (aggregated DEX liquidity)
- **Supported Assets**: BTC, ETH, SOL, BNB, ADA, DOGE, AVAX, LINK, UNI, ARB, OP, PEPE, and 20+ more
- **Metrics**: Price (USD)
- **Resolution**: User-defined (minimum 5 minutes)

### Token Analytics
Comprehensive tracking for Solana memecoins and long-tail tokens.

- **Data Source**: DexScreener API
- **Input**: Any Solana token contract address
- **Metrics**: Price, Market Cap (FDV)
- **Safety Filter**: Minimum $1M market cap required
- **Resolution**: User-defined (minimum 5 minutes)

### Weather and RWA
Hyper-local meteorological data for real-world asset settlements.

- **Data Source**: Open-Meteo Archive API
- **Coverage**: 50+ global capital cities
- **Metrics**: Max Temperature, Min Temperature, Precipitation
- **Resolution**: End of selected day (UTC)

### Esports
Instant settlement data for global esports tournaments.

- **Data Source**: PandaScore API
- **Games**: CS2, Dota 2
- **Markets**: Match Winner
- **Settlement**: Automated via match-watcher cron job
- **Filter**: Only confirmed matches (no TBD teams)

---

## Security Model

### Trusted Execution Environments (TEE)

All AXIS oracles run inside **Intel SGX enclaves** via Switchboard's infrastructure:

1. **Isolated Execution** — Code runs in hardware-encrypted memory
2. **Remote Attestation** — Cryptographic proof that code wasn't tampered with
3. **Sealed Storage** — Secrets are encrypted to specific enclave identities

### On-Chain Verification

Every settlement produces:
- **Transaction Signature** — Verifiable on Solscan
- **Oracle Response** — Stored in Switchboard feed account
- **Timestamp Proof** — Immutable resolution time

### Zero Admin Keys

- No multisig can alter feed data
- No backend can override results
- Settlement is fully deterministic

---

## Quick Start

### For Users

1. Visit [axisoracle.com/app](https://axisoracle.com/app)
2. Connect your Solana wallet (Phantom, Solflare, Backpack)
3. Verify your wallet with a signature
4. Select a module and configure your oracle
5. Pay 0.02 SOL creation fee + gas
6. Your oracle is live! Copy the public key for integration

### For Developers

#### Reading Oracle Data (TypeScript)

```typescript
import { PullFeed } from "@switchboard-xyz/on-demand";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const feedPubkey = new PublicKey("YOUR_FEED_PUBKEY");

const feed = new PullFeed(program, feedPubkey);
const [value, slot] = await feed.loadValue();

console.log(`Value: ${value.toString()}`);
console.log(`Slot: ${slot}`);
```

#### Reading Oracle Data (Rust/Anchor)

```rust
use switchboard_on_demand::PullFeedAccountData;

let feed_account = ctx.accounts.feed.load()?;
let result = feed_account.result;

// For decimal values (crypto/token analytics)
let price: f64 = result.value.try_into()?;

// For integer values (esports: 1 = Team 1, 2 = Team 2)
let winner: i64 = result.value.try_into()?;
```

---

## Project Structure

```
axis-protocol/
├── src/
│   ├── components/
│   │   ├── modules/          # Oracle creation modules
│   │   ├── feeds/            # Feed cards and displays
│   │   ├── sections/         # Landing page sections
│   │   └── ui/               # Shadcn components
│   ├── hooks/                # React hooks (useCreateFeed, useFeeds)
│   ├── services/             # Switchboard SDK integration
│   ├── pages/                # Route components
│   └── utils/                # API services, utilities
├── supabase/
│   └── functions/            # Edge functions
│       ├── oracle-settler/   # Automated settlement coordinator
│       ├── esports-match-watcher/  # PandaScore polling
│       ├── pandascore-matches/     # Match data endpoint
│       └── rpc-proxy/        # Secure RPC proxy
├── scripts/
│   └── settler.js            # Railway on-chain settler
└── public/                   # Static assets
```

---

## Configuration

### Environment Variables

```bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_HELIUS_RPC_URL=your_helius_rpc

# Railway Settler
SETTLER_PRIVATE_KEY=base58_encoded_keypair
HELIUS_RPC_URL=your_helius_rpc
SETTLER_API_KEY=your_api_key

# Supabase Edge Functions
PANDASCORE_API_KEY=your_pandascore_key
RAILWAY_SETTLER_URL=your_railway_url
```

### Key Addresses

| Component | Address |
|-----------|---------|
| Treasury Wallet | `5aQjw32kxCTDhEdXritusCAnNyGmrzy1nGGuaCz27uaX` |
| Switchboard Queue | `A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w` |
| Switchboard Program | `SBondMDrcV3K4kxZR1HNVT7osZxAHVHgYXL5Ze1oMUv` |

---

## Settlement Flow

```
User Creates Oracle
        |
        v
+-------------------+
|  Feed Initialized | <- On-chain (Switchboard)
|  Status: Pending  | <- Database (Supabase)
+---------+---------+
          |
          v
+-------------------+
|   Resolution Time | <- Cron checks every 60s
|      Reached      |
+---------+---------+
          |
          v
+-------------------+
|  Fetch Live Data  | <- API call to data source
|  via Crossbar     |
+---------+---------+
          |
          v
+-------------------+
|  TEE Verification | <- Intel SGX attestation
|  Sign Response    |
+---------+---------+
          |
          v
+-------------------+
|  Submit On-Chain  | <- Railway settler
|  Transaction      |
+---------+---------+
          |
          v
+-------------------+
|  Status: Settled  | <- Verifiable on Solscan
|  Value Recorded   |
+-------------------+
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| UI Components | Shadcn/ui, Radix Primitives, Framer Motion |
| Blockchain | Solana Web3.js, Switchboard On-Demand SDK |
| Wallet | Solana Wallet Adapter (Phantom, Solflare, Backpack) |
| Backend | Supabase (Postgres, Edge Functions, Realtime) |
| Settlement | Railway (Node.js cron worker) |
| RPC | Helius (high-performance Solana RPC) |

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Links

- **Website**: [axisoracle.com](https://axisoracle.com)
- **App**: [axisoracle.com/app](https://axisoracle.com/app)
- **Documentation**: [axisoracle.com/docs](https://axisoracle.com/docs)
- **Twitter**: [@axis_oracle](https://x.com/axis_oracle)
- **GitHub**: [github.com/axis-oracle](https://github.com/axis-oracle)

---

<div align="center">

**Built on Solana**

*The Reference Point.*

</div>
