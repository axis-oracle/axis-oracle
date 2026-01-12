import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Gamepad2, Users, Target, Calendar, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModuleCard } from './ModuleCard';
import { FeeDisplay } from './FeeDisplay';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  getDefaultLocalResolutionDate, 
  getDefaultLocalHour, 
  getDefaultLocalMinute,
  createDateTimeFromLocal,
  isValidFutureTimeOneHour,
  formatDateTimeForTitle,
  getTimezoneAbbr 
} from '@/utils/utcTime';

interface SteamGame {
  appid: number;
  name: string;
  developer: string;
  publisher: string;
  owners: string;
  ccu: number;
}

interface SteamModuleProps {
  onCreateFeed: (config: {
    appId: number;
    gameName: string;
    targetCcu: number;
    currentCcu: number;
    resolutionDate: Date;
    title: string;
  }) => Promise<void>;
  isLoading: boolean;
  deploymentState: string;
  getButtonText: (defaultText?: string, moduleId?: string) => string;
}

const SteamModule: React.FC<SteamModuleProps> = ({
  onCreateFeed,
  isLoading,
  deploymentState,
  getButtonText,
}) => {
  const { connected } = useWallet();
  const [games, setGames] = useState<SteamGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<SteamGame | null>(null);
  const [currentPlayerCount, setCurrentPlayerCount] = useState<number | null>(null);
  const [targetCcu, setTargetCcu] = useState<string>('');
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingPlayers, setIsFetchingPlayers] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [gameSelectorOpen, setGameSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Date/time state
  const defaultDate = getDefaultLocalResolutionDate();
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [selectedHour, setSelectedHour] = useState<string>(getDefaultLocalHour(defaultDate));
  const [selectedMinute, setSelectedMinute] = useState<string>(getDefaultLocalMinute(defaultDate));
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Fetch games on mount
  useEffect(() => {
    const fetchGames = async () => {
      setIsFetching(true);
      setFetchError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('steam-search');
        
        if (error) throw error;
        
        if (data?.games) {
          setGames(data.games);
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        setFetchError('Failed to load games');
      } finally {
        setIsFetching(false);
      }
    };

    fetchGames();
  }, []);

  // Fetch current player count when game is selected
  useEffect(() => {
    if (!selectedGame) {
      setCurrentPlayerCount(null);
      return;
    }

    const fetchPlayerCount = async () => {
      setIsFetchingPlayers(true);
      try {
        const { data, error } = await supabase.functions.invoke('steam-players', {
          body: {},
          headers: {},
        });
        
        // Use query parameter approach
        const response = await fetch(
          `https://zryeulucckdgaiboxntn.supabase.co/functions/v1/steam-players?appid=${selectedGame.appid}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) throw new Error('Failed to fetch players');
        
        const playerData = await response.json();
        setCurrentPlayerCount(playerData.player_count);
      } catch (err) {
        console.error('Error fetching player count:', err);
        // Fallback to cached CCU from search
        setCurrentPlayerCount(selectedGame.ccu);
      } finally {
        setIsFetchingPlayers(false);
      }
    };

    fetchPlayerCount();
  }, [selectedGame]);

  // Filter games by search query
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const query = searchQuery.toLowerCase();
    return games.filter(game => 
      game.name.toLowerCase().includes(query)
    );
  }, [games, searchQuery]);

  // Calculate resolution date
  const resolutionDate = useMemo(() => {
    return createDateTimeFromLocal(selectedDate, selectedHour, selectedMinute);
  }, [selectedDate, selectedHour, selectedMinute]);

  // Validate resolution date
  const isValidResolutionTime = useMemo(() => {
    return isValidFutureTimeOneHour(resolutionDate);
  }, [resolutionDate]);

  // Generate title
  const autoGeneratedTitle = useMemo(() => {
    if (!selectedGame || !targetCcu) return '';
    const target = parseInt(targetCcu);
    if (isNaN(target)) return '';
    return `${selectedGame.name} > ${target.toLocaleString()} players by ${formatDateTimeForTitle(resolutionDate)}`;
  }, [selectedGame, targetCcu, resolutionDate]);

  const handleCreate = async () => {
    if (!selectedGame || !targetCcu || !isValidResolutionTime) return;

    const target = parseInt(targetCcu);
    if (isNaN(target)) return;

    await onCreateFeed({
      appId: selectedGame.appid,
      gameName: selectedGame.name,
      targetCcu: target,
      currentCcu: currentPlayerCount || selectedGame.ccu,
      resolutionDate,
      title: autoGeneratedTitle,
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const conditionMet = useMemo(() => {
    if (!currentPlayerCount || !targetCcu) return null;
    const target = parseInt(targetCcu);
    if (isNaN(target)) return null;
    return currentPlayerCount > target;
  }, [currentPlayerCount, targetCcu]);

  const isFormValid = connected && selectedGame && targetCcu && parseInt(targetCcu) > 0 && isValidResolutionTime;

  // Generate hour/minute options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <ModuleCard
      title="Steam Stats"
      description="Create oracles for game player counts - track if CCU exceeds target"
      icon={Gamepad2}
    >
      <div className="space-y-4">
        {/* Game Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select Game</label>
          <Popover open={gameSelectorOpen} onOpenChange={setGameSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={gameSelectorOpen}
                className="w-full justify-between h-auto min-h-[44px] py-2 bg-background/50 border-border/50"
                disabled={isFetching}
              >
                {isFetching ? (
                  <span className="text-muted-foreground">Loading games...</span>
                ) : selectedGame ? (
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium truncate max-w-[280px]">{selectedGame.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(currentPlayerCount || selectedGame.ccu)} playing now
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Search for a game...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search games..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {fetchError ? fetchError : 'No games found.'}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredGames.map((game) => (
                      <CommandItem
                        key={game.appid}
                        value={game.appid.toString()}
                        onSelect={() => {
                          setSelectedGame(game);
                          setGameSelectorOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center py-3"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedGame?.appid === game.appid ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{game.name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {formatNumber(game.ccu)} playing
                            </span>
                            <span>•</span>
                            <span>{game.developer}</span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Target CCU Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Target Player Count</label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="e.g., 1000000"
              value={targetCcu}
              onChange={(e) => setTargetCcu(e.target.value)}
              className="pl-9 bg-background/50 border-border/50"
              min="1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Oracle resolves TRUE if player count exceeds this target
          </p>
        </div>

        {/* Date/Time Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Resolution Date & Time ({getTimezoneAbbr()})</label>
          <div className="flex gap-2">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-left font-normal bg-background/50 border-border/50"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setDatePickerOpen(false);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger className="w-20 bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="flex items-center text-muted-foreground">:</span>

            <Select value={selectedMinute} onValueChange={setSelectedMinute}>
              <SelectTrigger className="w-20 bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isValidResolutionTime && (
            <p className="text-xs text-destructive">
              Resolution time must be at least 1 hour in the future
            </p>
          )}
        </div>

        {/* Game Preview */}
        {selectedGame && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Gamepad2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{selectedGame.name}</h4>
                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {isFetchingPlayers ? (
                        'Loading...'
                      ) : (
                        `${formatNumber(currentPlayerCount || selectedGame.ccu)} playing now`
                      )}
                    </span>
                  </div>
                  {targetCcu && parseInt(targetCcu) > 0 && (
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5" />
                      <span>Target: &gt; {formatNumber(parseInt(targetCcu))}</span>
                      {conditionMet !== null && (
                        <span className={cn(
                          "text-xs font-medium px-1.5 py-0.5 rounded",
                          conditionMet 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        )}>
                          {conditionMet ? 'MET' : 'NOT MET'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fee Display */}
        <FeeDisplay />

        {/* Create Button */}
        <Button
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          onClick={handleCreate}
          disabled={!isFormValid || isLoading}
        >
          {getButtonText('Create Oracle', 'steam')}
        </Button>
      </div>
    </ModuleCard>
  );
};

export default SteamModule;
