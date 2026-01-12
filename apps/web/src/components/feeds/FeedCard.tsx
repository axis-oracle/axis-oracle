import { FC, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, RefreshCw, Loader2, CheckCircle, Code, Clock, CircleCheck, CircleDashed, RotateCcw, User, Play, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Feed } from '@/hooks/useFeeds';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { runPreflightCheck } from '@/utils/preflightCheck';
import { IntegrationGuideModal } from './IntegrationGuideModal';
import { supabase } from '@/integrations/supabase/client';

// Import module icons
import bitcoinIcon from '@/assets/bitcoin-icon.png';
import pepeIcon from '@/assets/pepe-icon.png';
import weatherIcon from '@/assets/weather-icon.png';
import esportsIcon from '@/assets/esports-icon.png';

// Get the appropriate icon for a feed based on module (with dynamic logo support)
const getModuleIcon = (feed: Feed): { iconSrc: string; alt: string; isDynamic: boolean } => {
  const config = feed.config as Record<string, unknown>;
  
  switch (feed.module) {
    case 'crypto':
      // Use saved logo if available
      const cryptoLogo = config?.logo as string;
      if (cryptoLogo) {
        return { iconSrc: cryptoLogo, alt: (config?.symbol as string) || 'Crypto', isDynamic: true };
      }
      return { iconSrc: bitcoinIcon, alt: 'Crypto', isDynamic: false };
    case 'memecoin':
      // Use saved tokenLogo if available
      const tokenLogo = config?.tokenLogo as string;
      if (tokenLogo) {
        return { iconSrc: tokenLogo, alt: 'Token', isDynamic: true };
      }
      return { iconSrc: pepeIcon, alt: 'Memecoin', isDynamic: false };
    case 'weather':
      return { iconSrc: weatherIcon, alt: 'Weather', isDynamic: false };
    case 'esports':
      return { iconSrc: esportsIcon, alt: 'Esports', isDynamic: false };
    case 'sports':
      return { iconSrc: esportsIcon, alt: 'Sports', isDynamic: false };
    default:
      return { iconSrc: bitcoinIcon, alt: 'Feed', isDynamic: false };
  }
};

// Get short title from feed config
const getShortTitle = (feed: Feed): string => {
  const config = feed.config as Record<string, unknown>;
  
  switch (feed.module) {
    case 'crypto':
      const symbol = config.symbol as string;
      const quoteCurrency = config.quoteCurrency as string || 'USD';
      return symbol ? `${symbol}/${quoteCurrency}` : feed.title.split(' ')[0];
    case 'memecoin':
      return (config.tokenSymbol as string) || (config.tokenName as string) || 'Token';
    case 'weather':
      return (config.location as string) || 'Weather';
    case 'esports':
      const team1 = (config.team1Name as string) || (config.team1Short as string);
      const team2 = (config.team2Name as string) || (config.team2Short as string);
      if (team1 && team2) {
        return `${team1} vs ${team2}`;
      }
      return feed.title.split(' Winner')[0] || 'Match';
    default:
      return feed.title.split(' ')[0];
  }
};

// Get metric label from feed config
const getMetricLabel = (feed: Feed): string => {
  const config = feed.config as Record<string, unknown>;
  const metric = config.metric as string;
  
  switch (feed.module) {
    case 'crypto':
      return 'Price';
    case 'memecoin':
      return metric === 'marketcap' ? 'Market Cap' : 'Price';
    case 'weather':
      if (metric === 'temp_max') return 'Max Temp';
      if (metric === 'temp_min') return 'Min Temp';
      if (metric === 'precipitation') return 'Precipitation';
      return 'Weather';
    case 'esports':
      return 'Match Winner';
    default:
      return metric || 'Value';
  }
};

// Get game badge for esports
const getGameBadge = (feed: Feed): { label: string; className: string } | null => {
  if (feed.module !== 'esports') return null;
  
  const config = feed.config as Record<string, unknown>;
  const game = config.game as string;
  
  switch (game) {
    case 'cs2':
      return { label: 'CS2', className: 'bg-orange-500/20 text-orange-500 border-orange-500/30' };
    case 'dota2':
      return { label: 'Dota 2', className: 'bg-red-500/20 text-red-500 border-red-500/30' };
    case 'lol':
      return { label: 'LoL', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
    default:
      return null;
  }
};

// Format number with thousand separators
const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format settled value based on module and metric type
const formatSettledValue = (value: string, config: any, module: string): string => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;
  
  const metric = config?.metric;
  
  // Esports: show winner team name
  if (module === 'esports') {
    const winnerValue = Math.round(numValue);
    if (winnerValue === 1) {
      return `Winner: ${config?.team1Name || config?.team1Short || 'Team 1'}`;
    } else if (winnerValue === 2) {
      return `Winner: ${config?.team2Name || config?.team2Short || 'Team 2'}`;
    } else {
      return 'Draw / Canceled';
    }
  }
  
  // Weather: show temperature in Celsius
  if (module === 'weather') {
    return `${numValue.toFixed(1)}°C`;
  }
  
  if (metric === 'marketcap') {
    // Market cap: use compact notation for large numbers
    if (numValue >= 1e9) {
      return `$${(numValue / 1e9).toFixed(2)}B`;
    } else if (numValue >= 1e6) {
      return `$${(numValue / 1e6).toFixed(2)}M`;
    } else if (numValue >= 1e3) {
      return `$${(numValue / 1e3).toFixed(2)}K`;
    }
    return `$${formatNumber(Math.round(numValue))}`;
  } else {
    // Price: use smart precision based on value magnitude
    if (numValue >= 1000) {
      // Large prices (BTC, ETH): 2 decimals
      return `$${formatNumber(numValue, 2)}`;
    } else if (numValue >= 1) {
      // Medium prices (SOL, ARB): 4 decimals
      return `$${numValue.toFixed(4)}`;
    } else if (numValue >= 0.0001) {
      // Small prices (memecoins): 8 decimals
      return `$${numValue.toFixed(8)}`;
    } else {
      // Very small prices: scientific notation
      return `$${numValue.toExponential(4)}`;
    }
  }
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: CircleDashed },
  settled: { label: 'Settled', variant: 'default', icon: CircleCheck },
};

interface FeedCardProps {
  feed: Feed;
  showRefresh?: boolean;
  showSettle?: boolean;
  showRecreate?: boolean;
  showIntegration?: boolean;
  onRefresh?: (feedPubkey: string) => void;
  onSettle?: (feedPubkey: string) => void;
  onRecreate?: (feedPubkey: string) => void;
  isRecreating?: boolean;
  index?: number;
}

export const FeedCard: FC<FeedCardProps> = ({ 
  feed, 
  showRefresh, 
  showSettle,
  showRecreate,
  showIntegration = true,
  onRefresh, 
  onSettle,
  onRecreate,
  isRecreating = false,
  index = 0 
}) => {
  const { iconSrc, alt, isDynamic } = getModuleIcon(feed);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);

  // Get display values
  const shortTitle = useMemo(() => getShortTitle(feed), [feed]);
  const metricLabel = useMemo(() => getMetricLabel(feed), [feed]);
  const gameBadge = useMemo(() => getGameBadge(feed), [feed]);

  // Determine if esports settle button should be shown
  const canShowEsportsSettle = useMemo(() => {
    if (feed.module !== 'esports') return true; // Non-esports always show if showSettle is true
    const config = feed.config as Record<string, unknown>;
    const matchStatus = config?.matchStatus as string;
    return matchStatus === 'finished';
  }, [feed.module, feed.config]);

  // Get esports match status for display
  const esportsMatchStatus = useMemo(() => {
    if (feed.module !== 'esports') return null;
    const config = feed.config as Record<string, unknown>;
    return config?.matchStatus as string || 'waiting';
  }, [feed.module, feed.config]);

  // Fetch creator username
  useEffect(() => {
    const fetchCreator = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('wallet_address', feed.wallet_address)
        .maybeSingle();
      
      if (data) {
        setCreatorUsername(data.username);
      }
    };
    fetchCreator();
  }, [feed.wallet_address]);

  const copyAddress = () => {
    navigator.clipboard.writeText(feed.feed_pubkey);
    toast.success('Feed address copied!');
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSettleClick = async () => {
    if (!onSettle) return;

    setIsCheckingStatus(true);

    try {
      // Run pre-flight check
      const result = await runPreflightCheck(feed.module, feed.config);

      if (!result.canSettle) {
        // Show error toast with details
        const toastMessage = result.details 
          ? `${result.message}\n${result.details}`
          : result.message;
        
        toast.error(toastMessage, {
          duration: 5000,
        });
        return;
      }

      // Pre-flight passed, proceed with settlement
      toast.success(result.message, {
        description: result.details,
        duration: 3000,
      });

      // Call the actual settle function
      onSettle(feed.feed_pubkey);
    } catch (error) {
      console.error('Settlement pre-flight error:', error);
      toast.error('Failed to verify event status. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="h-full min-h-[340px] hover-lift flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-secondary border border-border flex-shrink-0 h-fit">
                  <img 
                    src={iconSrc} 
                    alt={alt} 
                    className={`h-5 w-5 object-contain ${isDynamic ? 'rounded-full' : ''}`}
                    onError={(e) => {
                      // Fallback to default icon on error
                      e.currentTarget.src = feed.module === 'memecoin' ? pepeIcon : bitcoinIcon;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base leading-snug line-clamp-3">{feed.title}</CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-medium">
                      {metricLabel}
                    </Badge>
                    {gameBadge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${gameBadge.className}`}>
                        {gameBadge.label}
                      </span>
                    )}
                    <span className="text-muted-foreground">•</span>
                    <Link 
                      to={`/app/profile/${feed.wallet_address}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <User className="h-3 w-3" />
                      <span>{creatorUsername || feed.wallet_address.slice(0, 5)}</span>
                    </Link>
                  </div>
                </div>
              </div>
              {(() => {
                const status = feed.status || 'pending';
                const config = statusConfig[status] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <Badge variant={config.variant} className="gap-1 flex-shrink-0">
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                );
              })()}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Feed Address */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border">
                <code className="text-xs text-muted-foreground font-mono flex-1">
                  {truncateAddress(feed.feed_pubkey)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={copyAddress}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  asChild
                >
                  <a
                    href={`https://solscan.io/account/${feed.feed_pubkey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>

              {/* Status Info - grows to fill space */}
              <div className="space-y-1.5 text-xs flex-1">
                {/* Esports Match Status Indicator */}
                {feed.module === 'esports' && esportsMatchStatus && feed.status !== 'settled' && (
                  <div className={`flex items-center justify-between p-2 rounded-lg border ${
                    esportsMatchStatus === 'finished' 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : esportsMatchStatus === 'running'
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-muted/50 border-border'
                  }`}>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {esportsMatchStatus === 'finished' ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : esportsMatchStatus === 'running' ? (
                        <Play className="h-3 w-3 text-yellow-500" />
                      ) : (
                        <Timer className="h-3 w-3" />
                      )}
                      Match Status
                    </span>
                    <span className={`font-medium ${
                      esportsMatchStatus === 'finished' 
                        ? 'text-green-500' 
                        : esportsMatchStatus === 'running'
                        ? 'text-yellow-500'
                        : 'text-muted-foreground'
                    }`}>
                      {esportsMatchStatus === 'finished' ? 'Finished - Ready to Settle' 
                        : esportsMatchStatus === 'running' ? 'In Progress' 
                        : esportsMatchStatus === 'canceled' ? 'Canceled'
                        : 'Waiting to Start'}
                    </span>
                  </div>
                )}

                {feed.resolution_date && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Resolution
                    </span>
                    <span className="font-mono">
                      {format(new Date(feed.resolution_date), 'dd MMM HH:mm')} UTC
                    </span>
                  </div>
                )}
              {feed.status === 'settled' && feed.settled_value && (
                  <a
                    href={`https://ondemand.switchboard.xyz/solana/mainnet/feed/${feed.feed_pubkey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ExternalLink className="h-3 w-3 text-primary" />
                      Result
                    </span>
                    <span className="font-mono font-semibold text-primary">
                      {formatSettledValue(feed.settled_value, feed.config, feed.module)}
                    </span>
                  </a>
                )}
                {/* On-chain Transaction Proof */}
                {feed.settlement_tx && (
                  <a
                    href={`https://solscan.io/tx/${feed.settlement_tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer"
                  >
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <ExternalLink className="h-3 w-3 text-green-500" />
                      On-chain Proof
                    </span>
                    <span className="font-mono text-xs text-green-500">
                      {feed.settlement_tx.slice(0, 8)}...{feed.settlement_tx.slice(-4)}
                    </span>
                  </a>
                )}
              </div>

              {/* Action Buttons - always at bottom */}
              <div className="flex gap-2 flex-wrap mt-auto pt-2">
                {/* Integration Guide Button - only show for pending feeds */}
                {showIntegration && feed.status !== 'settled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[120px]"
                    onClick={() => setShowIntegrationModal(true)}
                  >
                    <Code className="h-3.5 w-3.5 mr-2" />
                    Integrate
                  </Button>
                )}

                {/* Refresh Button */}
                {showRefresh && onRefresh && (
                  <Button
                    variant="goldOutline"
                    size="sm"
                    className="flex-1 min-w-[100px]"
                    onClick={() => onRefresh(feed.feed_pubkey)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Refresh
                  </Button>
                )}

                {/* Settle Now Button - for esports, only show when match is finished */}
                {showSettle && onSettle && canShowEsportsSettle && (
                  <Button
                    variant="gold"
                    size="sm"
                    className="flex-1 min-w-[100px]"
                    onClick={handleSettleClick}
                    disabled={isCheckingStatus}
                  >
                    {isCheckingStatus ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 mr-2" />
                        Settle Now
                      </>
                    )}
                  </Button>
                )}

                {/* Recreate Feed Button (for feeds with hash mismatch) */}
                {showRecreate && onRecreate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[100px]"
                    onClick={() => onRecreate(feed.feed_pubkey)}
                    disabled={isRecreating}
                  >
                    {isRecreating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                        Recreating...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                        Recreate
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Integration Guide Modal */}
      <IntegrationGuideModal
        feed={feed}
        open={showIntegrationModal}
        onOpenChange={setShowIntegrationModal}
      />
    </>
  );
};