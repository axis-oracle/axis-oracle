import { FC } from 'react';
import { CodeBlock, Callout } from '@/components/docs/CodeBlock';
import { GraduationCap, Zap, FileCode, Globe } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const TutorialPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Developer Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Building a Betting DApp</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Step-by-step guide to building a complete prediction market DApp using AXIS oracles.
        </p>
      </div>

      <Callout type="info">
        <strong>Time Estimate:</strong> 2-3 hours to complete. Prerequisites: Basic React, TypeScript, and Solana knowledge.
      </Callout>

      {/* What We're Building */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          What We're Building
        </h2>
        
        <p className="text-muted-foreground">
          A simple betting DApp where users can:
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">1. Create Bets</h4>
            <p className="text-sm text-muted-foreground">
              Bet on whether BTC will be above or below a target price at a future time
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">2. Join Bets</h4>
            <p className="text-sm text-muted-foreground">
              Take the opposite side of an existing bet by matching the stake
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">3. Resolve Bets</h4>
            <p className="text-sm text-muted-foreground">
              Once time passes, anyone can trigger resolution using the AXIS oracle
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-medium mb-2">4. Claim Winnings</h4>
            <p className="text-sm text-muted-foreground">
              Winner receives the entire pot minus protocol fees
            </p>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Architecture Overview</h2>
        
        <div className="p-6 rounded-xl border border-border bg-muted/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="p-4 rounded-lg bg-background border border-border text-center">
              <Globe className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <span className="font-medium">React Frontend</span>
              <p className="text-xs text-muted-foreground mt-1">UI + Wallet</p>
            </div>
            
            <span className="text-2xl text-muted-foreground">→</span>
            
            <div className="p-4 rounded-lg bg-background border border-primary/50 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <span className="font-medium">AXIS Oracle</span>
              <p className="text-xs text-muted-foreground mt-1">Price Feed</p>
            </div>
            
            <span className="text-2xl text-muted-foreground">→</span>
            
            <div className="p-4 rounded-lg bg-background border border-border text-center">
              <FileCode className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <span className="font-medium">Anchor Program</span>
              <p className="text-xs text-muted-foreground mt-1">Bet Logic</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 1: Create the AXIS Oracle</h2>
        
        <p className="text-muted-foreground">
          First, use the AXIS app to create a crypto price oracle for BTC/USD:
        </p>

        <ol className="space-y-3 ml-4">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <span className="text-muted-foreground">Go to <NavLink to="/app" className="text-primary hover:underline">AXIS App</NavLink> and connect wallet</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</span>
            <span className="text-muted-foreground">Select "Global Crypto" module and choose BTC/USDT</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">3</span>
            <span className="text-muted-foreground">Set resolution date (e.g., 24 hours from now)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">4</span>
            <span className="text-muted-foreground">Click "Create Oracle" and sign the transaction</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm font-bold shrink-0">✓</span>
            <span className="text-muted-foreground">Copy the feed public key - you'll need this!</span>
          </li>
        </ol>
      </div>

      {/* Step 2 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 2: The Anchor Program</h2>
        
        <p className="text-muted-foreground">
          Create the betting program that references the AXIS oracle:
        </p>

        <CodeBlock
          language="rust"
          title="programs/betting/src/lib.rs"
          code={`use anchor_lang::prelude::*;
use switchboard_on_demand::PullFeedAccountData;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod betting {
    use super::*;

    /// Create a new bet on price direction
    pub fn create_bet(
        ctx: Context<CreateBet>,
        target_price: u64,  // Target price in cents
        direction: bool,    // true = above, false = below
    ) -> Result<()> {
        let bet = &mut ctx.accounts.bet;
        let user = &ctx.accounts.user;
        
        bet.creator = user.key();
        bet.oracle_feed = ctx.accounts.oracle_feed.key();
        bet.target_price = target_price;
        bet.direction = direction;
        bet.stake = 0;
        bet.is_matched = false;
        bet.is_resolved = false;
        bet.bump = ctx.bumps.bet;
        
        Ok(())
    }

    /// Match an existing bet by taking the opposite side
    pub fn match_bet(ctx: Context<MatchBet>, stake: u64) -> Result<()> {
        let bet = &mut ctx.accounts.bet;
        
        require!(!bet.is_matched, ErrorCode::BetAlreadyMatched);
        
        bet.matcher = Some(ctx.accounts.matcher.key());
        bet.stake = stake;
        bet.is_matched = true;
        
        // Transfer stake from both parties to escrow
        // ... transfer logic
        
        Ok(())
    }

    /// Resolve the bet using AXIS oracle
    pub fn resolve_bet(ctx: Context<ResolveBet>) -> Result<()> {
        let bet = &mut ctx.accounts.bet;
        
        require!(bet.is_matched, ErrorCode::BetNotMatched);
        require!(!bet.is_resolved, ErrorCode::BetAlreadyResolved);
        
        // Verify oracle address
        require!(
            ctx.accounts.oracle_feed.key() == bet.oracle_feed,
            ErrorCode::InvalidOracle
        );
        
        // Parse oracle data
        let feed = PullFeedAccountData::parse(&ctx.accounts.oracle_feed)?;
        let result = feed.result;
        require!(result.num_success > 0, ErrorCode::OracleInvalid);
        
        // Convert oracle value to price in cents
        let oracle_price = (result.value / 1_000_000) as u64; // Adjust scale
        
        // Determine winner
        let creator_wins = if bet.direction {
            oracle_price > bet.target_price
        } else {
            oracle_price < bet.target_price
        };
        
        bet.is_resolved = true;
        bet.resolved_price = oracle_price;
        bet.creator_won = creator_wins;
        
        // Transfer winnings
        let winner = if creator_wins {
            bet.creator
        } else {
            bet.matcher.unwrap()
        };
        
        // ... payout logic
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + Bet::SIZE,
        seeds = [b"bet", user.key().as_ref(), oracle_feed.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    
    /// CHECK: The AXIS oracle feed
    pub oracle_feed: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Bet {
    pub creator: Pubkey,
    pub matcher: Option<Pubkey>,
    pub oracle_feed: Pubkey,
    pub target_price: u64,
    pub direction: bool,
    pub stake: u64,
    pub is_matched: bool,
    pub is_resolved: bool,
    pub resolved_price: u64,
    pub creator_won: bool,
    pub bump: u8,
}

impl Bet {
    pub const SIZE: usize = 32 + 33 + 32 + 8 + 1 + 8 + 1 + 1 + 8 + 1 + 1;
}`}
        />
      </div>

      {/* Step 3 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 3: Frontend Integration</h2>
        
        <p className="text-muted-foreground">
          Connect the frontend to both the betting program and AXIS oracle:
        </p>

        <CodeBlock
          language="typescript"
          title="src/hooks/useBetting.ts"
          code={`import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { CrossbarClient } from "@switchboard-xyz/on-demand";
import { useCallback, useState } from "react";

const AXIS_ORACLE_PUBKEY = new PublicKey("YOUR_AXIS_FEED_PUBKEY");

export function useBetting() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  // Fetch current oracle price for UI display
  const fetchCurrentPrice = useCallback(async () => {
    const crossbar = new CrossbarClient("https://crossbar.switchboard.xyz");
    const result = await crossbar.simulateFeed(AXIS_ORACLE_PUBKEY.toString());
    const price = Number(result.value) / 1e8;
    setCurrentPrice(price);
    return price;
  }, []);

  // Create a new bet
  const createBet = useCallback(async (
    targetPrice: number,
    isAbove: boolean,
    stake: number
  ) => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    
    // Build and send transaction
    // ... program interaction code
    
    console.log(\`Created bet: BTC \${isAbove ? 'above' : 'below'} $\${targetPrice}\`);
  }, [wallet, connection]);

  // Resolve a bet using the oracle
  const resolveBet = useCallback(async (betPubkey: PublicKey) => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    
    // The program will read the AXIS oracle automatically
    // ... program interaction code
    
    console.log("Bet resolved using AXIS oracle!");
  }, [wallet, connection]);

  return {
    currentPrice,
    fetchCurrentPrice,
    createBet,
    resolveBet,
  };
}`}
        />

        <CodeBlock
          language="typescript"
          title="src/components/BetCreator.tsx"
          code={`import { useState } from "react";
import { useBetting } from "../hooks/useBetting";

export function BetCreator() {
  const { currentPrice, fetchCurrentPrice, createBet } = useBetting();
  const [targetPrice, setTargetPrice] = useState("");
  const [isAbove, setIsAbove] = useState(true);
  const [stake, setStake] = useState("");

  const handleCreate = async () => {
    await createBet(
      parseFloat(targetPrice),
      isAbove,
      parseFloat(stake)
    );
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Create a BTC Price Bet</h2>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Current BTC Price: <strong>\${currentPrice?.toFixed(2)}</strong>
        </p>
        <button onClick={fetchCurrentPrice}>Refresh Price</button>
      </div>

      <input
        type="number"
        placeholder="Target Price (e.g., 50000)"
        value={targetPrice}
        onChange={(e) => setTargetPrice(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setIsAbove(true)}
          className={\`px-4 py-2 rounded \${isAbove ? 'bg-green-500 text-white' : 'bg-gray-200'}\`}
        >
          Above
        </button>
        <button
          onClick={() => setIsAbove(false)}
          className={\`px-4 py-2 rounded \${!isAbove ? 'bg-red-500 text-white' : 'bg-gray-200'}\`}
        >
          Below
        </button>
      </div>

      <input
        type="number"
        placeholder="Stake (SOL)"
        value={stake}
        onChange={(e) => setStake(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        onClick={handleCreate}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold"
      >
        Create Bet
      </button>
    </div>
  );
}`}
        />
      </div>

      {/* Testing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Step 4: Testing</h2>
        
        <ol className="space-y-3 ml-4">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <div>
              <span className="font-medium">Deploy to Devnet</span>
              <p className="text-sm text-muted-foreground">Use devnet AXIS oracles for testing</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</span>
            <div>
              <span className="font-medium">Create a test oracle</span>
              <p className="text-sm text-muted-foreground">Short resolution time (1 hour) for quick testing</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">3</span>
            <div>
              <span className="font-medium">Create and match a bet</span>
              <p className="text-sm text-muted-foreground">Use two different wallets</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">4</span>
            <div>
              <span className="font-medium">Wait for resolution</span>
              <p className="text-sm text-muted-foreground">After the oracle updates, resolve the bet</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm font-bold shrink-0">✓</span>
            <div>
              <span className="font-medium">Verify payouts</span>
              <p className="text-sm text-muted-foreground">Check that the winner received the funds</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Next Steps */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Extend Your DApp</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-medium mb-2">Add More Markets</h4>
            <p className="text-sm text-muted-foreground">
              Support esports betting, memecoin predictions, weather bets, etc.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-medium mb-2">Pool Betting</h4>
            <p className="text-sm text-muted-foreground">
              Allow multiple users to bet on the same outcome with proportional payouts.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-medium mb-2">Automated Settlement</h4>
            <p className="text-sm text-muted-foreground">
              Set up a crank to automatically resolve bets when oracles update.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-medium mb-2">Social Features</h4>
            <p className="text-sm text-muted-foreground">
              Leaderboards, bet sharing, and follow functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
