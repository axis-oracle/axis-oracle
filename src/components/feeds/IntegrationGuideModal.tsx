import { FC, useState } from 'react';
import { Copy, Check, Code, Terminal, FileCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Feed } from '@/hooks/useFeeds';
import { toast } from 'sonner';

interface IntegrationGuideModalProps {
  feed: Feed;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IntegrationGuideModal: FC<IntegrationGuideModalProps> = ({
  feed,
  open,
  onOpenChange,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getDataFormat = () => {
    switch (feed.module) {
      case 'crypto':
      case 'memecoin':
        return {
          type: 'Decimal (f64)',
          description: 'Price in USD with up to 8 decimal places',
          example: '98543.12345678',
        };
      case 'weather':
        return {
          type: 'Decimal (f64)',
          description: 'Temperature in Celsius',
          example: '23.5',
        };
      case 'esports':
        return {
          type: 'Integer (u8)',
          description: 'Winner ID: 1 = Team 1, 2 = Team 2, 0 = Not resolved',
          example: '1',
        };
      default:
        return {
          type: 'Decimal (f64)',
          description: 'Numeric value',
          example: '0.0',
        };
    }
  };

  const dataFormat = getDataFormat();

  const typescriptCode = `import { Connection, PublicKey } from "@solana/web3.js";
import * as sb from "@switchboard-xyz/on-demand";

// Your AXIS Oracle Feed Address
const FEED_PUBKEY = new PublicKey("${feed.feed_pubkey}");

async function readOracleValue() {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  
  // Fetch the feed account data directly
  const accountInfo = await connection.getAccountInfo(FEED_PUBKEY);
  
  if (!accountInfo) {
    console.log("Feed account not found");
    return null;
  }
  
  // Parse the feed data
  const feed = sb.PullFeedAccountData.decode(accountInfo.data);
  
  // Get the current value (returns Decimal with mantissa/scale)
  const value = feed.value();
  
  if (value) {
    console.log("Oracle Value:", value.toString());
    // For ${feed.module}: ${dataFormat.description}
    return value;
  }
  
  return null;
}

// For prediction markets: Check if feed is settled
async function checkFeedStatus() {
  // Query AXIS API for settlement status
  const response = await fetch(
    "https://zryeulucckdgaiboxntn.supabase.co/rest/v1/feeds?feed_pubkey=eq.${feed.feed_pubkey}",
    { headers: { "apikey": "YOUR_SUPABASE_ANON_KEY" } }
  );
  const [feedData] = await response.json();
  
  if (feedData.status === "settled") {
    console.log("Settled Value:", feedData.settled_value);
    console.log("Settled At:", feedData.settled_at);
    return { settled: true, value: feedData.settled_value };
  }
  
  return { settled: false, value: null };
}`;

  const rustCode = `use anchor_lang::prelude::*;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

// Your AXIS Oracle Feed Address
pub const FEED_PUBKEY: Pubkey = pubkey!("${feed.feed_pubkey}");

#[derive(Accounts)]
pub struct ReadOracle<'info> {
    /// The Switchboard feed account
    /// CHECK: Validated by parsing PullFeedAccountData
    pub feed: AccountInfo<'info>,
}

pub fn read_oracle_value(ctx: Context<ReadOracle>) -> Result<()> {
    // Validate this is the correct AXIS feed
    require!(
        ctx.accounts.feed.key() == FEED_PUBKEY,
        CustomError::InvalidFeedAddress
    );
    
    // Borrow and parse the feed account data
    let feed_account = ctx.accounts.feed.data.borrow();
    let feed = PullFeedAccountData::parse(feed_account)
        .map_err(|_| CustomError::InvalidFeedData)?;
    
    // Get the oracle value
    // Returns: ${dataFormat.description}
    if let Some(value) = feed.value() {
        msg!("Oracle Value: {:?}", value);
        
        // Example: Use in prediction market logic
        // let threshold: i128 = 100_000_000_000; // $100,000
        // let outcome = value.mantissa > threshold;
    } else {
        msg!("No value available yet");
    }
    
    Ok(())
}

#[error_code]
pub enum CustomError {
    #[msg("Invalid feed address")]
    InvalidFeedAddress,
    #[msg("Failed to parse feed data")]
    InvalidFeedData,
}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Code className="h-5 w-5 text-primary" />
            Integration Guide
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Integrate <span className="font-semibold text-foreground">{feed.title}</span> into your application
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Feed Address Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Feed Public Key
            </h3>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border">
              <code className="flex-1 text-foreground font-mono text-xs break-all">
                {feed.feed_pubkey}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => copyToClipboard(feed.feed_pubkey, 'pubkey')}
              >
                {copiedSection === 'pubkey' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Data Format Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Data Format
            </h3>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-muted-foreground">Type:</span>
                <code className="font-mono text-primary">{dataFormat.type}</code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-muted-foreground">Description:</span>
                <span className="text-foreground">{dataFormat.description}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-muted-foreground">Example:</span>
                <code className="font-mono text-foreground">{dataFormat.example}</code>
              </div>
            </div>
          </div>

          {/* Code Snippets */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Integration Code</h3>
            
            <Tabs defaultValue="typescript" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="typescript">TypeScript / JS</TabsTrigger>
                <TabsTrigger value="rust">Rust / Anchor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="typescript" className="mt-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 gap-1.5 text-xs z-10"
                    onClick={() => copyToClipboard(typescriptCode, 'typescript')}
                  >
                    {copiedSection === 'typescript' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <div className="p-4 rounded-lg bg-zinc-950 border border-border overflow-x-auto max-w-full">
                    <pre className="text-xs text-zinc-100 font-mono whitespace-pre-wrap break-all">
                      {typescriptCode}
                    </pre>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 break-words">
                  Install: <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">npm install @switchboard-xyz/on-demand @solana/web3.js</code>
                </p>
              </TabsContent>
              
              <TabsContent value="rust" className="mt-3">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 gap-1.5 text-xs z-10"
                    onClick={() => copyToClipboard(rustCode, 'rust')}
                  >
                    {copiedSection === 'rust' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <div className="p-4 rounded-lg bg-zinc-950 border border-border overflow-x-auto max-w-full">
                    <pre className="text-xs text-zinc-100 font-mono whitespace-pre-wrap break-all">
                      {rustCode}
                    </pre>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 break-words">
                  Add to Cargo.toml: <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">switchboard-on-demand = "0.1"</code>
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://solscan.io/account/${feed.feed_pubkey}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Solscan
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://docs.switchboard.xyz/docs/switchboard/readme"
                target="_blank"
                rel="noopener noreferrer"
              >
                Switchboard Docs
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/docs/integration">
                AXIS Integration Guide
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
