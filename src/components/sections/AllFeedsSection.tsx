import { FC, useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeeds } from '@/hooks/useFeeds';
import { FeedCard } from '@/components/feeds/FeedCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AllFeedsSectionProps {
  highlightedFeedPubkey?: string | null;
}

const ITEMS_PER_PAGE = 12;

export const AllFeedsSection: FC<AllFeedsSectionProps> = ({ highlightedFeedPubkey }) => {
  const { data: feeds, isLoading } = useFeeds();
  const highlightedRef = useRef<HTMLDivElement>(null);
  const [pendingPage, setPendingPage] = useState(1);
  const [settledPage, setSettledPage] = useState(1);

  // Separate feeds by status
  const { pendingFeeds, settledFeeds } = useMemo(() => {
    if (!feeds) return { pendingFeeds: [], settledFeeds: [] };
    
    const pending = feeds.filter(f => f.status === 'pending' || f.status === 'processing' || f.status === 'manual');
    const settled = feeds.filter(f => f.status === 'settled' || f.status === 'failed' || f.status === 'permanently_failed');
    
    return { pendingFeeds: pending, settledFeeds: settled };
  }, [feeds]);

  // Paginated feeds
  const paginatedPending = useMemo(() => {
    const start = (pendingPage - 1) * ITEMS_PER_PAGE;
    return pendingFeeds.slice(start, start + ITEMS_PER_PAGE);
  }, [pendingFeeds, pendingPage]);

  const paginatedSettled = useMemo(() => {
    const start = (settledPage - 1) * ITEMS_PER_PAGE;
    return settledFeeds.slice(start, start + ITEMS_PER_PAGE);
  }, [settledFeeds, settledPage]);

  const totalPendingPages = Math.ceil(pendingFeeds.length / ITEMS_PER_PAGE);
  const totalSettledPages = Math.ceil(settledFeeds.length / ITEMS_PER_PAGE);

  // Determine which tab to show based on highlighted feed
  const defaultTab = useMemo(() => {
    if (highlightedFeedPubkey && feeds) {
      const feed = feeds.find(f => f.feed_pubkey === highlightedFeedPubkey);
      if (feed && (feed.status === 'settled' || feed.status === 'failed' || feed.status === 'permanently_failed')) {
        return 'settled';
      }
    }
    return 'pending';
  }, [highlightedFeedPubkey, feeds]);

  // Scroll to highlighted feed when data loads
  useEffect(() => {
    if (highlightedFeedPubkey && feeds && feeds.length > 0 && highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlightedFeedPubkey, feeds]);

  const renderFeedGrid = (feedList: typeof feeds, currentPage: number, setPage: (p: number) => void, totalPages: number) => {
    if (!feedList || feedList.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-card"
        >
          <p className="text-muted-foreground">
            No oracles in this category yet.
          </p>
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {feedList.map((feed, index) => {
            const isHighlighted = feed.feed_pubkey === highlightedFeedPubkey;
            return (
              <div
                key={feed.id}
                ref={isHighlighted ? highlightedRef : undefined}
                className={isHighlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl' : ''}
              >
                <FeedCard feed={feed} index={index} />
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <section id="all-feeds">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="all-feeds">
      <div className="container mx-auto">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingFeeds.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {pendingFeeds.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settled" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Settled
              {settledFeeds.length > 0 && (
                <span className="ml-1 text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                  {settledFeeds.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {renderFeedGrid(paginatedPending, pendingPage, setPendingPage, totalPendingPages)}
          </TabsContent>

          <TabsContent value="settled">
            {renderFeedGrid(paginatedSettled, settledPage, setSettledPage, totalSettledPages)}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};