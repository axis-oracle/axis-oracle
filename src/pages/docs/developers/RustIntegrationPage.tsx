import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { FileCode, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const RustIntegrationPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Developer Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Rust / Anchor Integration</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Copy-paste examples for consuming AXIS oracles in your Solana programs.
        </p>
      </div>

      <Callout type="info">
        This guide assumes familiarity with Anchor framework and Solana program development.
        If you're new to Anchor, check out the <a href="https://www.anchor-lang.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">official Anchor documentation</a>.
      </Callout>

      {/* Dependencies */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Dependencies</h2>
        
        <CodeBlock
          language="toml"
          title="Cargo.toml"
          code={`[dependencies]
anchor-lang = "0.29.0"
switchboard-on-demand = "0.1.0"

[features]
default = []
cpi = ["switchboard-on-demand/cpi"]`}
        />
      </div>

      {/* Account Setup */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileCode className="h-6 w-6 text-primary" />
          Account Setup
        </h2>
        
        <p className="text-muted-foreground">
          First, define your instruction context to include the oracle feed account:
        </p>

        <CodeBlock
          language="rust"
          title="lib.rs - Context"
          code={`use anchor_lang::prelude::*;
use switchboard_on_demand::PullFeedAccountData;

#[derive(Accounts)]
pub struct ResolveBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub bet_account: Account<'info, BetAccount>,
    
    /// The AXIS oracle feed account
    /// CHECK: Validated in instruction logic
    pub oracle_feed: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}`}
        />
      </div>

      {/* Reading Oracle Value */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Reading the Oracle Value</h2>
        
        <p className="text-muted-foreground">
          Parse the feed account and extract the result value:
        </p>

        <CodeBlock
          language="rust"
          title="lib.rs - Reading Value"
          code={`pub fn resolve_bet(ctx: Context<ResolveBet>) -> Result<()> {
    // Parse the oracle feed account
    let feed_account = &ctx.accounts.oracle_feed;
    let feed = PullFeedAccountData::parse(feed_account)
        .map_err(|_| ErrorCode::InvalidOracleAccount)?;
    
    // Get the oracle result
    let result = feed.result;
    
    // Check if the result is valid (has at least one successful update)
    require!(
        result.num_success > 0,
        ErrorCode::OracleResultInvalid
    );
    
    // Get the raw value (i128)
    let raw_value = result.value;
    
    // For price feeds, convert to a usable format
    // AXIS uses 8 decimal places for crypto prices
    let scale = 8_u32;
    let price_scaled = raw_value; // Keep as i128 for precision
    
    msg!("Oracle value (raw): {}", raw_value);
    msg!("Decimal places: {}", scale);
    
    // Use the value in your business logic
    resolve_bet_with_price(&mut ctx.accounts.bet_account, price_scaled)?;
    
    Ok(())
}`}
        />
      </div>

      {/* Feed Verification */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-green-500" />
          Feed Address Verification
        </h2>
        
        <Callout type="warning">
          <strong>Critical Security Check:</strong> Always verify the oracle feed address matches the expected feed.
          Attackers may try to pass a different oracle to manipulate your program.
        </Callout>

        <CodeBlock
          language="rust"
          title="Verifying Feed Address"
          code={`use anchor_lang::prelude::*;

// Store expected feed addresses as constants or in your state
pub const EXPECTED_BTC_FEED: Pubkey = pubkey!("YOUR_AXIS_FEED_PUBKEY_HERE");

pub fn resolve_bet(ctx: Context<ResolveBet>) -> Result<()> {
    let feed_account = &ctx.accounts.oracle_feed;
    
    // CRITICAL: Verify this is the correct oracle feed
    require!(
        feed_account.key() == EXPECTED_BTC_FEED,
        ErrorCode::UnauthorizedOracleFeed
    );
    
    // Now safe to proceed with parsing
    let feed = PullFeedAccountData::parse(feed_account)?;
    
    // ... rest of logic
    Ok(())
}

// Alternative: Store expected feed in your program state
#[account]
pub struct GameConfig {
    pub admin: Pubkey,
    pub oracle_feed: Pubkey,  // Store the expected feed here
    pub bump: u8,
}

pub fn resolve_with_config(ctx: Context<ResolveWithConfig>) -> Result<()> {
    let config = &ctx.accounts.config;
    let feed_account = &ctx.accounts.oracle_feed;
    
    // Verify against stored config
    require!(
        feed_account.key() == config.oracle_feed,
        ErrorCode::UnauthorizedOracleFeed
    );
    
    // Safe to proceed
    Ok(())
}`}
        />
      </div>

      {/* Staleness Check */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Staleness Check</h2>
        
        <p className="text-muted-foreground">
          For time-sensitive applications, verify the oracle data is recent enough:
        </p>

        <CodeBlock
          language="rust"
          title="Checking Data Freshness"
          code={`use anchor_lang::prelude::*;

const MAX_STALENESS_SECONDS: i64 = 60; // 1 minute

pub fn resolve_bet(ctx: Context<ResolveBet>) -> Result<()> {
    let feed = PullFeedAccountData::parse(&ctx.accounts.oracle_feed)?;
    let result = feed.result;
    
    // Get current timestamp
    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;
    
    // result.slot gives us the slot when data was written
    // Convert slot to approximate timestamp (400ms per slot)
    let data_slot = result.slot;
    let current_slot = clock.slot;
    let slots_elapsed = current_slot.saturating_sub(data_slot);
    let seconds_elapsed = (slots_elapsed * 400) / 1000; // approximate
    
    require!(
        seconds_elapsed <= MAX_STALENESS_SECONDS as u64,
        ErrorCode::OracleDataStale
    );
    
    msg!("Data age: {} seconds", seconds_elapsed);
    
    // Proceed with fresh data
    Ok(())
}`}
        />
      </div>

      {/* Data Parsing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Parsing: Mantissa & Scale</h2>
        
        <p className="text-muted-foreground">
          Switchboard stores values as integers with a scale factor. Here's how to work with them:
        </p>

        <CodeBlock
          language="rust"
          title="Converting Oracle Values"
          code={`/// Convert oracle value to a human-readable format
/// 
/// AXIS oracles use different scales:
/// - Crypto prices: 8 decimal places
/// - Memecoin prices: 18 decimal places  
/// - Esports results: 0 decimal places (1, 2, or -1)
/// - Weather: 2 decimal places

pub fn parse_crypto_price(raw_value: i128) -> u64 {
    // For crypto, value is price * 10^8
    // e.g., BTC at $45,231.67 = 4523167000000
    let scale = 100_000_000_i128; // 10^8
    
    // Convert to u64 with 2 decimal places for display
    let price_cents = (raw_value / (scale / 100)) as u64;
    price_cents // Returns price in cents (4523167 = $45,231.67)
}

pub fn parse_esports_result(raw_value: i128) -> Option<u8> {
    // Esports returns: 1 (team1 wins), 2 (team2 wins), -1 (invalid)
    match raw_value {
        1 => Some(1),
        2 => Some(2),
        _ => None, // Invalid or canceled
    }
}

pub fn parse_weather_temp(raw_value: i128) -> i32 {
    // Temperature in Celsius * 100 (2 decimal places)
    // e.g., 23.45°C = 2345
    (raw_value / 1_000_000) as i32 // Adjust based on actual scale
}

// Example usage in your program
pub fn resolve_crypto_bet(ctx: Context<ResolveBet>) -> Result<()> {
    let feed = PullFeedAccountData::parse(&ctx.accounts.oracle_feed)?;
    let raw_value = feed.result.value;
    
    let price_cents = parse_crypto_price(raw_value);
    let target_cents = ctx.accounts.bet.target_price_cents;
    
    let bet_won = match ctx.accounts.bet.direction {
        BetDirection::Above => price_cents > target_cents,
        BetDirection::Below => price_cents < target_cents,
    };
    
    if bet_won {
        // Pay out winnings
    }
    
    Ok(())
}`}
        />
      </div>

      {/* Error Codes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Error Codes
        </h2>

        <CodeBlock
          language="rust"
          title="errors.rs"
          code={`use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid oracle feed account")]
    InvalidOracleAccount,
    
    #[msg("Unauthorized oracle feed - address mismatch")]
    UnauthorizedOracleFeed,
    
    #[msg("Oracle result is invalid or not yet available")]
    OracleResultInvalid,
    
    #[msg("Oracle data is too stale")]
    OracleDataStale,
    
    #[msg("Match was canceled - no valid result")]
    MatchCanceled,
    
    #[msg("Bet already resolved")]
    BetAlreadyResolved,
}`}
        />
      </div>

      {/* Complete Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Complete Example: Betting Program</h2>
        
        <CodeBlock
          language="rust"
          title="lib.rs - Full Example"
          code={`use anchor_lang::prelude::*;
use switchboard_on_demand::PullFeedAccountData;

declare_id!("YourProgramId111111111111111111111111111111");

#[program]
pub mod axis_betting {
    use super::*;

    pub fn resolve_bet(ctx: Context<ResolveBet>) -> Result<()> {
        let bet = &mut ctx.accounts.bet;
        let feed_account = &ctx.accounts.oracle_feed;
        
        // 1. Verify bet is not already resolved
        require!(!bet.is_resolved, ErrorCode::BetAlreadyResolved);
        
        // 2. Verify oracle feed address
        require!(
            feed_account.key() == bet.oracle_feed,
            ErrorCode::UnauthorizedOracleFeed
        );
        
        // 3. Parse the oracle
        let feed = PullFeedAccountData::parse(feed_account)
            .map_err(|_| ErrorCode::InvalidOracleAccount)?;
        
        // 4. Check result validity
        let result = feed.result;
        require!(result.num_success > 0, ErrorCode::OracleResultInvalid);
        
        // 5. Get and process the value
        let oracle_value = result.value;
        
        // 6. Determine winner
        let user_won = match bet.bet_type {
            BetType::PriceAbove { target } => {
                let price = (oracle_value / 100_000_000) as u64;
                price > target
            },
            BetType::Team1Wins => oracle_value == 1,
            BetType::Team2Wins => oracle_value == 2,
        };
        
        // 7. Update bet state
        bet.is_resolved = true;
        bet.user_won = user_won;
        bet.resolved_value = oracle_value;
        
        // 8. Transfer winnings if applicable
        if user_won {
            // ... payout logic
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ResolveBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        constraint = bet.user == user.key()
    )]
    pub bet: Account<'info, Bet>,
    
    /// CHECK: Validated against bet.oracle_feed
    pub oracle_feed: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Bet {
    pub user: Pubkey,
    pub oracle_feed: Pubkey,
    pub bet_type: BetType,
    pub amount: u64,
    pub is_resolved: bool,
    pub user_won: bool,
    pub resolved_value: i128,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum BetType {
    PriceAbove { target: u64 },
    Team1Wins,
    Team2Wins,
}`}
        />
      </div>

      {/* Best Practices */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Security Best Practices</h2>
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Always verify feed address</span>
              <p className="text-sm text-muted-foreground">Never trust user-provided oracle accounts blindly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Check result validity</span>
              <p className="text-sm text-muted-foreground">Ensure <InlineCode>num_success &gt; 0</InlineCode> before using the value</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Handle edge cases</span>
              <p className="text-sm text-muted-foreground">Account for canceled matches, API failures, and stale data</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Use appropriate data types</span>
              <p className="text-sm text-muted-foreground">Oracle values are i128; handle overflow carefully</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <NavLink 
            to="/docs/developers/tutorial" 
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors group"
          >
            <h4 className="font-medium group-hover:text-primary transition-colors">Build a Betting DApp →</h4>
            <p className="text-sm text-muted-foreground mt-1">Complete tutorial from frontend to program</p>
          </NavLink>
          <NavLink 
            to="/docs/developers/errors" 
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors group"
          >
            <h4 className="font-medium group-hover:text-primary transition-colors">Error Codes →</h4>
            <p className="text-sm text-muted-foreground mt-1">Complete list of errors and troubleshooting</p>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default RustIntegrationPage;
