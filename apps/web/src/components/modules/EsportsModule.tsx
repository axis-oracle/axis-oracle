import { FC, useState, useMemo, useEffect } from 'react';
import { CalendarIcon, Check, ChevronsUpDown, Search, Clock, Loader2, AlertCircle } from 'lucide-react';
import esportsIcon from '@/assets/esports-icon.png';
import { ModuleCard } from './ModuleCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FeeDisplay } from './FeeDisplay';
import { useWallet } from '@solana/wallet-adapter-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DeploymentState } from '@/hooks/useCreateFeed';
import { addUTCHours, formatUTCDateShort, formatUTCTime } from '@/utils/utcTime';

type GameType = 'cs2' | 'dota2' | 'lol';

interface EsportsMatch {
  id: string;
  game: GameType;
  team1: string;
  team1Short: string;
  team1Id: number;
  team2: string;
  team2Short: string;
  team2Id: number;
  tournament: string;
  scheduledAt: string;
  status: string;
  numberOfGames: number; // 1=BO1, 3=BO3, 5=BO5
}

const getGameLabel = (game: GameType): string => {
  switch (game) {
    case 'cs2': return 'CS2';
    case 'dota2': return 'Dota 2';
    case 'lol': return 'LoL';
    default: return game;
  }
};

const getGameBadgeClasses = (game: GameType): string => {
  switch (game) {
    case 'cs2':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'dota2':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'lol':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

interface EsportsModuleProps {
  onCreateFeed: (config: { 
    game: GameType;
    gameName: string;
    matchId: string;
    marketType: 'match_winner';
    resolutionDate: Date;
    title: string;
    team1Id: number;
    team2Id: number;
    scheduledAt: string;
  }) => void;
  isLoading?: boolean;
  deploymentState?: DeploymentState;
  getButtonText?: (defaultText?: string) => string;
}

export const EsportsModule: FC<EsportsModuleProps> = ({ onCreateFeed, isLoading, deploymentState, getButtonText }) => {
  const { connected } = useWallet();
  const [selectedMatch, setSelectedMatch] = useState<EsportsMatch | null>(null);
  const [matchSearchOpen, setMatchSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resolutionDate, setResolutionDate] = useState<Date>();
  
  // API state
  const [matches, setMatches] = useState<EsportsMatch[]>([]);
  const [isFetchingMatches, setIsFetchingMatches] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch matches from PandaScore via edge function
  useEffect(() => {
    const fetchMatches = async () => {
      setIsFetchingMatches(true);
      setFetchError(null);
      
      try {
        console.log('Fetching matches from PandaScore edge function...');
        
        const { data, error } = await supabase.functions.invoke('pandascore-matches');
        
        console.log('PandaScore Response:', data);
        
        if (error) {
          console.error('Edge function error:', error);
          setFetchError('Could not load matches from PandaScore');
          setMatches([]);
          return;
        }
        
        if (data?.error) {
          console.error('API error:', data.error);
          setFetchError('Could not load matches from PandaScore');
          setMatches([]);
          return;
        }
        
        if (data?.matches && Array.isArray(data.matches)) {
          // Parse dates and sort
          const parsedMatches = data.matches.map((m: any) => ({
            ...m,
            scheduledAt: m.scheduledAt,
          }));
          setMatches(parsedMatches);
          console.log('Loaded matches:', parsedMatches.length);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setFetchError('Could not load matches from PandaScore');
        setMatches([]);
      } finally {
        setIsFetchingMatches(false);
      }
    };

    fetchMatches();
  }, []);

  // Filter matches based on search query
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    
    const lowerQuery = searchQuery.toLowerCase();
    return matches.filter(match => 
      match.team1.toLowerCase().includes(lowerQuery) ||
      match.team2.toLowerCase().includes(lowerQuery) ||
      match.team1Short.toLowerCase().includes(lowerQuery) ||
      match.team2Short.toLowerCase().includes(lowerQuery) ||
      match.tournament.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, matches]);

  // Auto-fill resolution date when match is selected (match start + 3 hours in UTC)
  useEffect(() => {
    if (selectedMatch) {
      const matchStart = new Date(selectedMatch.scheduledAt);
      // Add 3 hours buffer for match completion
      const estimatedEnd = addUTCHours(matchStart, 3);
      setResolutionDate(estimatedEnd);
    }
  }, [selectedMatch]);

  // Auto-generate feed title with UTC
  const autoGeneratedTitle = useMemo(() => {
    if (!selectedMatch || !resolutionDate) return '';
    const dateLabel = formatUTCDateShort(resolutionDate);
    return `${selectedMatch.team1Short} vs ${selectedMatch.team2Short} Winner [${dateLabel} UTC]`;
  }, [selectedMatch, resolutionDate]);

  const handleCreate = () => {
    if (!selectedMatch || !resolutionDate) return;
    onCreateFeed({
      game: selectedMatch.game,
      gameName: getGameLabel(selectedMatch.game),
      matchId: selectedMatch.id,
      marketType: 'match_winner',
      resolutionDate,
      title: autoGeneratedTitle,
      team1Id: selectedMatch.team1Id,
      team2Id: selectedMatch.team2Id,
      scheduledAt: selectedMatch.scheduledAt,
    });
  };

  const canCreate = connected && selectedMatch && resolutionDate;

  return (
    <ModuleCard
      iconImage={esportsIcon}
      title="Esports"
      description="Instant settlement data for global esports tournaments"
      index={3}
    >
      <div className="space-y-4 flex-1 flex flex-col">
        {/* Smart Match Finder */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Find Match</Label>
          
          {/* Error State */}
          {fetchError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-sm text-destructive">{fetchError}</span>
            </div>
          )}
          
          {/* Loading State */}
          {isFetchingMatches && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading matches from PandaScore...</span>
            </div>
          )}
          
          {/* Match Selector */}
          {!isFetchingMatches && !fetchError && (
            <Popover open={matchSearchOpen} onOpenChange={setMatchSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={matchSearchOpen}
                  className="w-full justify-between bg-background border-border h-auto min-h-[42px] py-2 max-w-full overflow-hidden"
                >
                  {selectedMatch ? (
                    <div className="flex items-center gap-2 text-left min-w-0 overflow-hidden">
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                        getGameBadgeClasses(selectedMatch.game)
                      )}>
                        {getGameLabel(selectedMatch.game)}
                      </span>
                      <div className="flex flex-col items-start min-w-0 overflow-hidden">
                        <span className="font-medium text-sm truncate max-w-full">
                          {selectedMatch.team1Short} vs {selectedMatch.team2Short}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-full">
                          {format(new Date(selectedMatch.scheduledAt), 'MMM d, HH:mm')} UTC
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-2 min-w-0 overflow-hidden">
                      <Search className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {matches.length > 0 
                          ? "Type team name..." 
                          : "No matches"}
                      </span>
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0 bg-popover border-border z-50" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search teams..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {matches.length === 0 ? "No upcoming matches found" : "No matches found for your search"}
                    </CommandEmpty>
                    <CommandGroup className="max-h-[280px] overflow-y-auto">
                      {filteredMatches.map((match) => (
                        <CommandItem
                          key={match.id}
                          value={match.id}
                          onSelect={() => {
                            setSelectedMatch(match);
                            setMatchSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-start gap-2 cursor-pointer py-3"
                        >
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5",
                            getGameBadgeClasses(match.game)
                          )}>
                            {getGameLabel(match.game)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {match.team1} vs {match.team2}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {match.tournament} • {format(new Date(match.scheduledAt), 'MMM d, HH:mm')} UTC
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0 mt-0.5",
                              selectedMatch?.id === match.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          
          {/* Show stored match ID for reference */}
          {selectedMatch && (
            <p className="text-xs text-muted-foreground">
              Match ID: <span className="font-mono">{selectedMatch.id}</span>
            </p>
          )}
        </div>

        {/* Resolution Date (UTC - Read-Only - Auto-calculated) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Resolution Date <span className="text-muted-foreground text-xs">(UTC)</span>
            <span className="text-xs text-muted-foreground ml-2">(auto: match start + 3hrs)</span>
          </Label>
          <div className="flex gap-2">
            <div className={cn(
              "flex-1 flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 border-border/50",
              !resolutionDate && "text-muted-foreground"
            )}>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {resolutionDate ? (
                <span className="text-sm">{formatUTCDateShort(resolutionDate)}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Select a match first</span>
              )}
            </div>
            
            {/* Time Display (Read-Only - UTC) */}
            <div className="flex items-center gap-1 px-3 py-2 rounded-md border bg-muted/50 border-border/50">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">
                {resolutionDate ? formatUTCTime(resolutionDate) : '--:--'}
              </span>
              <span className="text-xs text-muted-foreground">UTC</span>
            </div>
          </div>
          
          {selectedMatch && resolutionDate && (
            <p className="text-xs text-muted-foreground">
              Match starts at {formatUTCTime(new Date(selectedMatch.scheduledAt))} UTC, estimated to settle at {formatUTCTime(resolutionDate)} UTC
            </p>
          )}
        </div>

        {/* Auto-generated Feed Title Preview */}
        {autoGeneratedTitle && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Feed Title (auto)</Label>
            <div className="px-3 py-2 bg-muted/50 rounded-md border border-border/50 h-10 flex items-center">
              <span className="text-sm text-foreground truncate">{autoGeneratedTitle}</span>
            </div>
          </div>
        )}
        
        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        <div className="flex items-center justify-between pt-2">
          <FeeDisplay />
          <Button
            variant={deploymentState === 'success' ? 'default' : 'gold'}
            size="sm"
            onClick={handleCreate}
            disabled={!canCreate || isLoading}
            className={deploymentState === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {getButtonText ? getButtonText('Create Oracle') : (isLoading ? 'Creating...' : 'Create Oracle')}
          </Button>
        </div>
      </div>
    </ModuleCard>
  );
};
