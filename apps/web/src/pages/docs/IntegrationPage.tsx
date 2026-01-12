import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { ArrowRight, Terminal, FileCode } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const IntegrationPage: FC = () => {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>Integration</span>
          <span>/</span>
          <span className="text-foreground">TypeScript SDK</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          Integration Guide
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Learn how to consume AXIS oracles in your Solana applications using 
          TypeScript and Rust/Anchor.
        </p>
      </div>

      {/* Target audience */}
      <Callout type="info" title="Prerequisites">
        This guide assumes familiarity with Solana development. You should be comfortable 
        with transactions, accounts, and either TypeScript (for frontend/scripts) or 
        Rust/Anchor (for on-chain programs).
      </Callout>

      {/* Installation */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Installation</h2>
      
      <div className="not-prose flex gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
          <Terminal className="h-4 w-4" />
          <span>TypeScript</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
          <FileCode className="h-4 w-4" />
          <span>Rust / Anchor</span>
        </div>
      </div>

      <CodeBlock
        language="bash"
        filename="terminal"
        showLineNumbers={false}
        code={`# Install the Switchboard On-Demand SDK
npm install @switchboard-xyz/on-demand @solana/web3.js

# Or with yarn
yarn add @switchboard-xyz/on-demand @solana/web3.js`}
      />

      <p className="text-muted-foreground leading-relaxed">
        For Rust programs, add to your <InlineCode>Cargo.toml</InlineCode>:
      </p>

      <CodeBlock
        language="toml"
        filename="Cargo.toml"
        code={`[dependencies]
switchboard-on-demand = "0.1"
anchor-lang = "0.29"
solana-program = "1.17"`}
      />

      {/* Consuming an AXIS Feed - TypeScript */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">
        Consuming an AXIS Feed (TypeScript)
      </h2>
      
      <p className="text-muted-foreground leading-relaxed">
        Use the <InlineCode>CrossbarClient</InlineCode> to fetch the latest oracle values. 
        This is the recommended approach for frontend applications and scripts.
      </p>

      <CodeBlock
        language="typescript"
        filename="fetchAxisOracle.ts"
        code={`import { CrossbarClient, PullFeed } from "@switchboard-xyz/on-demand";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";

// Your RPC endpoint (use a dedicated RPC for production)
const connection = new Connection("https://api.mainnet-beta.solana.com");

// The AXIS oracle feed address you created or want to consume
const AXIS_FEED_PUBKEY = new PublicKey("YourAxisFeedAddress...");

async function fetchOracleValue() {
  // Initialize the Crossbar client
  const crossbar = new CrossbarClient(
    "https://crossbar.switchboard.xyz"
  );

  // Create a PullFeed instance
  const feed = new PullFeed(connection, AXIS_FEED_PUBKEY);

  // Fetch the latest oracle results
  // This returns fresh data from the oracle network
  const [oracleResult, responses, success] = await feed.fetchUpdateIx();

  if (!success) {
    throw new Error("Failed to fetch oracle update");
  }

  // The value is returned as a big number (scaled by 1e9)
  const value = oracleResult.value.toNumber() / 1e9;
  const timestamp = oracleResult.timestamp.toNumber();

  console.log("Oracle Value:", value);
  console.log("Last Updated:", new Date(timestamp * 1000));

  return { value, timestamp };
}

// Execute
fetchOracleValue()
  .then(console.log)
  .catch(console.error);`}
      />

      <Callout type="success" title="Atomic Updates">
        The <InlineCode>fetchUpdateIx</InlineCode> method returns an instruction that 
        updates the oracle and fetches the value atomically. Include this instruction 
        in your transaction to ensure you're using fresh data.
      </Callout>

      {/* Using in a Transaction */}
      <h3 className="text-lg font-medium text-foreground mt-8 mb-3">
        Including Oracle Data in Transactions
      </h3>

      <p className="text-muted-foreground leading-relaxed">
        For applications that need to use oracle data in smart contract calls, 
        combine the oracle update instruction with your program instruction:
      </p>

      <CodeBlock
        language="typescript"
        filename="transactionWithOracle.ts"
        code={`import { CrossbarClient, PullFeed } from "@switchboard-xyz/on-demand";
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction 
} from "@solana/web3.js";

async function executeWithOracleData(
  connection: Connection,
  wallet: Keypair,
  feedPubkey: PublicKey,
  yourProgramInstruction: TransactionInstruction
) {
  // Create the feed instance
  const feed = new PullFeed(connection, feedPubkey);

  // Get the oracle update instruction
  const [_, responses, oracleIx] = await feed.fetchUpdateIx();

  // Build transaction with oracle update FIRST
  const tx = new Transaction();
  
  // 1. Update the oracle (must come first)
  tx.add(oracleIx);
  
  // 2. Then call your program that reads the oracle
  tx.add(yourProgramInstruction);

  // Send the atomic transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [wallet],
    { commitment: "confirmed" }
  );

  console.log("Transaction confirmed:", signature);
  return signature;
}`}
      />

      {/* Rust/Anchor Integration */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">
        On-Chain Validation (Rust/Anchor)
      </h2>

      <p className="text-muted-foreground leading-relaxed">
        For smart contracts that need to validate and use oracle data, here's the 
        recommended pattern in Anchor:
      </p>

      <CodeBlock
        language="rust"
        filename="lib.rs"
        code={`use anchor_lang::prelude::*;
use switchboard_on_demand::PullFeedAccountData;

declare_id!("YourProgramId...");

#[program]
pub mod your_protocol {
    use super::*;

    /// Resolve a bet using AXIS oracle data
    pub fn resolve_bet(ctx: Context<ResolveBet>) -> Result<()> {
        // Load the oracle feed account
        let feed_account = &ctx.accounts.oracle_feed;
        let feed_data = feed_account.load_data()?;

        // Get the latest confirmed value
        let value = feed_data.value();
        let timestamp = feed_data.latest_confirmed_round.round_open_timestamp;

        // Staleness check (reject data older than 60 seconds)
        let clock = Clock::get()?;
        let max_staleness: i64 = 60;
        
        require!(
            clock.unix_timestamp - timestamp < max_staleness,
            ErrorCode::StaleOracleData
        );

        // Use the oracle value in your logic
        msg!("Oracle value: {}", value);
        
        // Example: Compare against a threshold
        let threshold = ctx.accounts.bet.threshold;
        let bet_result = if value > threshold {
            BetOutcome::Over
        } else {
            BetOutcome::Under
        };

        // Settle the bet...
        ctx.accounts.bet.outcome = bet_result;
        ctx.accounts.bet.settled_at = clock.unix_timestamp;
        ctx.accounts.bet.settlement_value = value;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ResolveBet<'info> {
    #[account(mut)]
    pub bet: Account<'info, Bet>,
    
    /// The AXIS oracle feed account
    /// CHECK: Validated by Switchboard SDK
    pub oracle_feed: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct Bet {
    pub threshold: i128,
    pub outcome: BetOutcome,
    pub settled_at: i64,
    pub settlement_value: i128,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BetOutcome {
    Pending,
    Over,
    Under,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Oracle data is stale")]
    StaleOracleData,
}`}
      />

      <Callout type="warning" title="Always Validate">
        Never trust oracle data without validation. Always check:
        <ul className="mt-2 space-y-1">
          <li>• <strong>Staleness</strong> — Is the data recent enough?</li>
          <li>• <strong>Feed Address</strong> — Is this the expected oracle?</li>
          <li>• <strong>Value Bounds</strong> — Is the value within expected range?</li>
        </ul>
      </Callout>

      {/* Error Handling */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Error Handling</h2>

      <p className="text-muted-foreground leading-relaxed">
        Handle common error scenarios gracefully:
      </p>

      <CodeBlock
        language="typescript"
        filename="errorHandling.ts"
        code={`import { PullFeed } from "@switchboard-xyz/on-demand";

async function safeOracleFetch(connection: Connection, feedPubkey: PublicKey) {
  const feed = new PullFeed(connection, feedPubkey);

  try {
    const [result, responses, success] = await feed.fetchUpdateIx();

    if (!success) {
      // Oracle network couldn't reach consensus
      throw new Error("Oracle fetch failed - no consensus");
    }

    const value = result.value.toNumber() / 1e9;
    const age = Date.now() / 1000 - result.timestamp.toNumber();

    // Validate freshness
    if (age > 60) {
      throw new Error(\`Oracle data too old: \${age.toFixed(0)}s\`);
    }

    // Validate reasonable bounds (example for price)
    if (value <= 0 || value > 1_000_000) {
      throw new Error(\`Oracle value out of bounds: \${value}\`);
    }

    return value;

  } catch (error) {
    if (error.message.includes("Account not found")) {
      throw new Error("Oracle feed does not exist");
    }
    if (error.message.includes("RPC")) {
      throw new Error("Network error - please retry");
    }
    throw error;
  }
}`}
      />

      {/* Best Practices */}
      <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Best Practices</h2>

      <div className="not-prose space-y-4 my-6">
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
          <h4 className="font-medium text-foreground mb-2">✓ Use a Dedicated RPC with Domain Whitelisting</h4>
          <p className="text-sm text-muted-foreground">
            For the fastest settlement and UI performance, use a dedicated RPC provider 
            (Helius, QuickNode, Triton) with your domain whitelisted. This is the recommended 
            approach for production—no proxy needed.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
          <h4 className="font-medium text-foreground mb-2">💡 Pro Tip: Copy Feed Pubkey from Dashboard</h4>
          <p className="text-sm text-muted-foreground">
            You can copy your specific <InlineCode>Feed Pubkey</InlineCode> directly from the 
            Axis Dashboard after creating an oracle. Look for the copy button next to the address.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">✓ Cache When Appropriate</h4>
          <p className="text-sm text-muted-foreground">
            For display purposes, cache oracle values with a short TTL (5-30 seconds). 
            Only fetch fresh data when executing transactions.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">✓ Handle Network Failures</h4>
          <p className="text-sm text-muted-foreground">
            Implement retry logic with exponential backoff. Oracle networks may 
            occasionally be slow due to network conditions.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <h4 className="font-medium text-foreground mb-2">✓ Monitor Oracle Health</h4>
          <p className="text-sm text-muted-foreground">
            Track oracle update frequency and response times. Set up alerts for 
            anomalies that could indicate issues.
          </p>
        </div>
      </div>

      {/* Next steps */}
      <div className="not-prose mt-12 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
        <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Follow us on X for updates and support, or dive into the API reference 
          for complete SDK documentation.
        </p>
        <div className="flex gap-3">
          <a href="https://x.com/axis_oracle" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Follow on X
            </Button>
          </a>
          <NavLink to="/docs/api-reference">
            <Button variant="gold" size="sm" className="gap-2">
              API Reference
              <ArrowRight className="h-4 w-4" />
            </Button>
          </NavLink>
        </div>
      </div>
    </article>
  );
};

export default IntegrationPage;
