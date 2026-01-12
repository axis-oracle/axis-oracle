import { FC } from 'react';
import { Trophy } from 'lucide-react';
import { ModuleCard } from './ModuleCard';
import { Button } from '@/components/ui/button';
import { FeeDisplay } from './FeeDisplay';

export const SportsModule: FC = () => {
  return (
    <ModuleCard
      icon={Trophy}
      title="Sports"
      description="Traditional sports data feeds"
      disabled
      comingSoon
      index={4}
    >
      <div className="space-y-4 flex-1 flex flex-col opacity-60">
        <p className="text-sm text-muted-foreground">
          NFL, NBA, MLB, and more sports data feeds coming soon. Stay tuned for real-time scores and statistics.
        </p>
        <div className="flex flex-wrap gap-2">
          {['NFL', 'NBA', 'MLB', 'NHL', 'Soccer'].map((sport) => (
            <span
              key={sport}
              className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground border border-border"
            >
              {sport}
            </span>
          ))}
        </div>
        
        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        <div className="flex items-center justify-between pt-2">
          <FeeDisplay />
          <Button
            variant="gold"
            size="sm"
            disabled
          >
            Coming Soon
          </Button>
        </div>
      </div>
    </ModuleCard>
  );
};
