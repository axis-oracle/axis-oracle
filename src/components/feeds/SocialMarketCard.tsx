import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Repeat, Eye, Users, ExternalLink, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TweetData, 
  formatMetricValue, 
  getMetricDisplayName,
  subscribeToMetricUpdates,
  calculateProgress
} from '@/services/socialOracleService';
import socialIcon from '@/assets/social-icon.png';

interface SocialMarket {
  id: string;
  tweetUrl: string;
  tweetData: TweetData;
  metric: 'likes' | 'retweets' | 'views' | 'followers';
  targetValue: number;
  deadline: Date;
  status: 'active' | 'resolved_yes' | 'resolved_no' | 'expired';
}

interface SocialMarketCardProps {
  market: SocialMarket;
  index?: number;
  onBetYes?: (marketId: string) => void;
  onBetNo?: (marketId: string) => void;
}

const METRIC_ICONS = {
  likes: Heart,
  retweets: Repeat,
  views: Eye,
  followers: Users,
};

export const SocialMarketCard: FC<SocialMarketCardProps> = ({ 
  market, 
  index = 0,
  onBetYes,
  onBetNo,
}) => {
  const [currentValue, setCurrentValue] = useState(() => {
    switch (market.metric) {
      case 'likes': return market.tweetData.metrics.likes;
      case 'retweets': return market.tweetData.metrics.retweets;
      case 'views': return market.tweetData.metrics.views;
      case 'followers': return market.tweetData.author.followers;
    }
  });
  const [isPulsing, setIsPulsing] = useState(false);

  const MetricIcon = METRIC_ICONS[market.metric];
  const progress = calculateProgress(currentValue, market.targetValue);
  const isCompleted = progress >= 100;

  // Subscribe to live updates
  useEffect(() => {
    if (market.status !== 'active') return;

    const unsubscribe = subscribeToMetricUpdates(
      market.tweetData,
      market.metric,
      (newValue) => {
        setCurrentValue((prev) => {
          if (newValue !== prev) {
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 300);
          }
          return newValue;
        });
      },
      3000
    );

    return unsubscribe;
  }, [market.tweetData, market.metric, market.status]);

  const getStatusBadge = () => {
    switch (market.status) {
      case 'active':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30 gap-1">
            <Activity className="h-3 w-3 animate-pulse" />
            Live
          </Badge>
        );
      case 'resolved_yes':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Resolved: YES</Badge>;
      case 'resolved_no':
        return <Badge variant="secondary">Resolved: NO</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full hover-lift overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex gap-2 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-secondary border border-border flex-shrink-0">
                <img src={socialIcon} alt="Social" className="h-5 w-5 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm leading-snug line-clamp-2">
                  @{market.tweetData.author.username} {getMetricDisplayName(market.metric)} &gt; {formatMetricValue(market.targetValue)}
                </CardTitle>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tweet Preview */}
          <div className="p-3 bg-secondary/30 border border-border rounded-lg">
            <div className="flex items-start gap-2">
              <img 
                src={market.tweetData.author.avatarUrl} 
                alt={market.tweetData.author.username}
                className="w-8 h-8 rounded-full border border-border"
                onError={(e) => { 
                  e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${market.tweetData.author.username}`;
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-medium text-foreground truncate">{market.tweetData.author.displayName}</span>
                  <span className="text-muted-foreground">@{market.tweetData.author.username}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{market.tweetData.content}</p>
              </div>
              <a
                href={market.tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MetricIcon className="h-4 w-4" />
                {getMetricDisplayName(market.metric)}
              </span>
              <span className={`font-mono font-medium transition-all ${isPulsing ? 'text-primary scale-110' : 'text-foreground'}`}>
                {formatMetricValue(currentValue)} / {formatMetricValue(market.targetValue)}
              </span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-3 bg-secondary"
              />
              {/* Glow overlay for active markets */}
              {market.status === 'active' && (
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent ${Math.max(0, progress - 5)}%, hsl(var(--primary) / 0.3) ${progress}%, transparent ${Math.min(100, progress + 5)}%)`,
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.toFixed(1)}% complete</span>
              {isCompleted && (
                <span className="text-green-500 font-medium">Target Reached! 🎉</span>
              )}
            </div>
          </div>

          {/* Live Pulse Indicator */}
          {market.status === 'active' && (
            <div className="flex items-center justify-center gap-2 py-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-xs text-muted-foreground">Live tracking active</span>
            </div>
          )}

          {/* Betting Buttons */}
          {market.status === 'active' && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                onClick={() => onBetYes?.(market.id)}
              >
                Bet YES
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => onBetNo?.(market.id)}
              >
                Bet NO
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
