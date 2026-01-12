import { FC } from 'react';
import { CodeBlock, Callout, InlineCode } from '@/components/docs/CodeBlock';
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

const ErrorsPage: FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-primary font-medium mb-2">Developer Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Error Codes & Troubleshooting</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Common errors, their causes, and how to fix them.
        </p>
      </div>

      {/* Oracle Errors */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Oracle Errors
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">OracleResultInvalid</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The oracle feed has no valid result. This happens when:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground ml-4 list-disc">
                  <li>The oracle has never been updated</li>
                  <li>The API call failed during the last update attempt</li>
                  <li>The match was canceled (for esports oracles)</li>
                </ul>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check <InlineCode>result.num_success &gt; 0</InlineCode> before using the value.
                    If zero, trigger an oracle update or wait for the API to recover.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">InvalidOracleAccount</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The provided account is not a valid Switchboard PullFeed account.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verify you're passing the correct feed public key. 
                    Check the "My Oracles" page for the correct address.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">UnauthorizedOracleFeed</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The oracle feed address doesn't match the expected feed stored in your program.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ensure you're passing the exact same feed pubkey that was used when creating the bet/position.
                    This is a security check to prevent oracle substitution attacks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">OracleDataStale</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The oracle data is older than the maximum allowed staleness.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trigger an oracle update before consuming the data.
                    For on-demand feeds, call the settlement function to refresh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Errors */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Transaction Errors</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">Transaction Rejected</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  User declined to sign the transaction in their wallet.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Normal user behavior. Show a friendly "Transaction cancelled" message.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">Insufficient Funds</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Wallet doesn't have enough SOL for the transaction and fees.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Oracle creation costs ~0.046 SOL + network fees. Ensure wallet has at least 0.05 SOL.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">Network Congestion</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Transaction failed due to Solana network congestion or timeout.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Retry with priority fees. Use <InlineCode>computeUnits</InlineCode> and <InlineCode>priorityFee</InlineCode> in your transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Errors */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">API & Data Errors</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">Market Cap Below $1M</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  (Memecoins only) The token's FDV is below the $1,000,000 minimum.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is an anti-scam protection. Choose a token with higher market cap, or wait for the token to grow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">Event Still In Progress</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  (Esports only) Tried to settle an oracle while the match is still running.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wait for the match to finish. The preflight check will show "Match is still in progress."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">Token Not Found</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The contract address doesn't exist on DexScreener.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verify the contract address is correct. Token must have at least one trading pair on a supported DEX.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-mono text-sm font-semibold text-red-500">Resolution Time Too Soon</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Resolution date must be at least 1 hour in the future.
                </p>
                <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Fix:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a resolution time that's at least 60 minutes from now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting Guide */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          General Troubleshooting
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">Oracle won't update</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Check that the resolution time has passed</li>
              <li>Verify the source API is responding (test directly in browser)</li>
              <li>Check Switchboard queue status at <a href="https://app.switchboard.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">app.switchboard.xyz</a></li>
              <li>Try triggering a manual update via the "Settle Now" button</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">Transaction keeps failing</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Check you have enough SOL (at least 0.05 SOL recommended)</li>
              <li>Try a different RPC endpoint</li>
              <li>Add priority fees if network is congested</li>
              <li>Check Solana Status at <a href="https://status.solana.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">status.solana.com</a></li>
            </ol>
          </div>

          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-2">Wallet won't connect</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Refresh the page and try again</li>
              <li>Make sure you're on the correct network (Mainnet-Beta)</li>
              <li>Try a different browser or disable conflicting extensions</li>
              <li>Update your wallet extension to the latest version</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Getting Help */}
      <div className="p-6 rounded-xl border border-border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Still Stuck?</h2>
        <p className="text-muted-foreground mb-4">
          If you're still encountering issues, we're here to help:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="https://x.com/axis_oracle" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <h4 className="font-medium">Twitter / X</h4>
            <p className="text-sm text-muted-foreground mt-1">Get updates and connect with the team</p>
          </a>
          <a href="https://github.com/axis-oracle" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <h4 className="font-medium">GitHub</h4>
            <p className="text-sm text-muted-foreground mt-1">Report bugs and track known issues</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorsPage;
