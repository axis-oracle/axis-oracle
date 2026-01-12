import { FC } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { AllFeedsSection } from '@/components/sections/AllFeedsSection';

const ExploreView: FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedFeed = searchParams.get('feed');

  return (
    <div className="py-8 px-4 md:px-6">
      {/* Header */}
      <section className="mb-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight"
          >
            Explore <span className="text-gradient-gold">Oracles</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Discover all oracle feeds deployed on the AXIS network.
          </motion.p>
        </div>
      </section>

      {/* All Feeds */}
      <AllFeedsSection highlightedFeedPubkey={highlightedFeed} />
    </div>
  );
};

export default ExploreView;