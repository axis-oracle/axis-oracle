import { FC, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ModuleCard } from './ModuleCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isFuture } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Search, Film, Star, TrendingUp, Loader2, Calendar, Clock, DollarSign, CalendarClock } from 'lucide-react';
import moviesIcon from '@/assets/movies-icon.png';
import { DeploymentState } from '@/hooks/useCreateFeed';


const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w200';

interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  overview?: string;
  isUpcoming?: boolean;
}

type MovieMetric = 'vote_average' | 'popularity' | 'revenue';

interface MoviesModuleProps {
  onCreateFeed: (config: {
    movieId: number;
    movieTitle: string;
    posterPath: string | null;
    metric: MovieMetric;
    currentValue: number;
    resolutionDate: Date;
    title: string;
  }) => Promise<void>;
  isLoading: boolean;
  deploymentState: DeploymentState;
  getButtonText: (defaultText: string) => string;
}

export const MoviesModule: FC<MoviesModuleProps> = ({
  onCreateFeed,
  isLoading,
  deploymentState,
  getButtonText,
}) => {
  const { connected } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [metric, setMetric] = useState<MovieMetric>('vote_average');
  const [showResults, setShowResults] = useState(false);
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  // Date/time state - default to 1 day from now (for movies)
  const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [resolutionDate, setResolutionDate] = useState(format(defaultDate, 'yyyy-MM-dd'));
  const [resolutionTime, setResolutionTime] = useState(format(defaultDate, 'HH:mm'));
  const [dateError, setDateError] = useState<string | null>(null);

  // Get minimum date (1 day from now)
  const getMinimumDateTimeOneDay = (): Date => {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  };

  // Check if movie is upcoming
  const isMovieUpcoming = (releaseDate: string): boolean => {
    if (!releaseDate) return false;
    try {
      return isFuture(parseISO(releaseDate));
    } catch {
      return false;
    }
  };

  // Load upcoming movies on mount or when toggle changes (but don't auto-show)
  useEffect(() => {
    if (upcomingOnly && !searchQuery.trim()) {
      const loadUpcoming = async () => {
        setIsSearching(true);
        try {
          const { data, error } = await supabase.functions.invoke('tmdb-search', {
            body: { mode: 'upcoming' },
          });
          if (error) throw error;
          if (data.success) {
            const moviesWithFlag = data.results.map((m: Movie) => ({
              ...m,
              isUpcoming: isMovieUpcoming(m.releaseDate),
            }));
            setSearchResults(moviesWithFlag);
            // Don't auto-show results, wait for user to focus the input
          }
        } catch (e) {
          console.error('Upcoming fetch error:', e);
        } finally {
          setIsSearching(false);
        }
      };
      loadUpcoming();
    }
  }, [upcomingOnly]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const { data, error } = await supabase.functions.invoke('tmdb-search', {
            body: { query: searchQuery.trim(), mode: upcomingOnly ? 'upcoming' : 'all' },
          });

          if (error) throw error;
          if (data.success) {
            const moviesWithFlag = data.results.map((m: Movie) => ({
              ...m,
              isUpcoming: isMovieUpcoming(m.releaseDate),
            }));
            setSearchResults(moviesWithFlag);
            setShowResults(true);
          }
        } catch (e) {
          console.error('Search error:', e);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else if (!upcomingOnly) {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, upcomingOnly]);

  // Parse date/time inputs to Date object
  const parseDateTime = (dateStr: string, timeStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return result;
  };

  // Validate date/time - minimum 1 day for movies
  useEffect(() => {
    if (resolutionDate && resolutionTime) {
      const selectedDateTime = parseDateTime(resolutionDate, resolutionTime);
      const minDateTime = getMinimumDateTimeOneDay();
      
      if (selectedDateTime < minDateTime) {
        setDateError('Resolution time must be at least 1 day in the future');
      } else {
        setDateError(null);
      }
    }
  }, [resolutionDate, resolutionTime]);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowResults(false);
    setSearchQuery(movie.title);
  };

  const generateTitle = useCallback(() => {
    if (!selectedMovie || !resolutionDate || !resolutionTime) return '';
    const dateTime = parseDateTime(resolutionDate, resolutionTime);
    const metricLabels: Record<MovieMetric, string> = {
      vote_average: 'rating',
      popularity: 'popularity',
      revenue: 'box office',
    };
    return `${selectedMovie.title} ${metricLabels[metric]} on ${format(dateTime, 'MMM d, yyyy HH:mm')} UTC`;
  }, [selectedMovie, metric, resolutionDate, resolutionTime]);

  const currentValue = selectedMovie 
    ? (metric === 'vote_average' ? selectedMovie.voteAverage : selectedMovie.popularity)
    : 0;

  // Check if revenue metric is valid for selected movie
  const isRevenueAvailable = selectedMovie && selectedMovie.releaseDate && !isMovieUpcoming(selectedMovie.releaseDate);

  const handleCreate = async () => {
    if (!selectedMovie || !resolutionDate || !resolutionTime) return;

    const dateTime = parseDateTime(resolutionDate, resolutionTime);

    await onCreateFeed({
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      posterPath: selectedMovie.posterPath,
      metric,
      currentValue,
      resolutionDate: dateTime,
      title: generateTitle(),
    });
  };

  const isFormValid = selectedMovie && resolutionDate && resolutionTime && !dateError && connected;

  return (
    <ModuleCard
      title="Movies"
      description="Create oracles for upcoming movie ratings, popularity, and box office"
      iconImage={moviesIcon}
    >
      <div className="space-y-4">
        {/* Upcoming Toggle */}
        <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border/30">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium">Upcoming Movies Only</Label>
          </div>
          <Switch
            checked={upcomingOnly}
            onCheckedChange={(checked) => {
              setUpcomingOnly(checked);
              setSearchQuery('');
              setSelectedMovie(null);
            }}
          />
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <Label className="text-foreground/80">
            {upcomingOnly ? 'Search Upcoming Movies' : 'Search All Movies'}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={upcomingOnly ? "Search upcoming movies..." : "Search for a movie..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() || searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => {
                setTimeout(() => {
                  if (!searchQuery.trim()) {
                    setShowResults(false);
                  }
                }, 200);
              }}
              className="pl-9 bg-background/50 border-border/50"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Search Results Dropdown - only show when focused and no movie selected */}
          {showResults && searchResults.length > 0 && !selectedMovie && (
            <div className="absolute z-50 w-full max-h-60 overflow-y-auto bg-card border border-border rounded-md shadow-lg mt-1">
              {searchResults.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-accent/50 transition-colors text-left"
                >
                  {movie.posterPath ? (
                    <img
                      src={`${TMDB_IMAGE_BASE}${movie.posterPath}`}
                      alt={movie.title}
                      className="w-10 h-14 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                      <Film className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{movie.title}</p>
                      {movie.isUpcoming && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {movie.releaseDate ? format(parseISO(movie.releaseDate), 'MMM d, yyyy') : 'N/A'} • ⭐ {movie.voteAverage.toFixed(1)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Movie Card */}
        {selectedMovie && (
          <div className="flex gap-3 p-3 bg-accent/20 rounded-lg border border-border/50">
            {selectedMovie.posterPath ? (
              <img
                src={`${TMDB_IMAGE_BASE}${selectedMovie.posterPath}`}
                alt={selectedMovie.title}
                className="w-16 h-24 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                <Film className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{selectedMovie.title}</p>
                {selectedMovie.isUpcoming && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                    Upcoming
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {selectedMovie.releaseDate ? format(parseISO(selectedMovie.releaseDate), 'MMM d, yyyy') : 'N/A'}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-500" />
                  <span>{selectedMovie.voteAverage.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span>{Math.round(selectedMovie.popularity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metric Select */}
        <div className="space-y-2">
          <Label className="text-foreground/80">Metric</Label>
          <Select 
            value={metric} 
            onValueChange={(v) => setMetric(v as MovieMetric)}
          >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vote_average">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Rating (0-10)</span>
                </div>
              </SelectItem>
              <SelectItem value="popularity">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Popularity / Hype</span>
                </div>
              </SelectItem>
              <SelectItem value="revenue" disabled={selectedMovie?.isUpcoming}>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>Box Office Revenue</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {metric === 'revenue' && (
            <p className="text-xs text-amber-500">
              ⚠️ Revenue data updates with delay after theatrical release
            </p>
          )}
        </div>

        {/* Date/Time Picker */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-foreground/80 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Date (UTC)
            </Label>
            <Input
              type="date"
              value={resolutionDate}
              onChange={(e) => setResolutionDate(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Time (UTC)
            </Label>
            <Input
              type="time"
              value={resolutionTime}
              onChange={(e) => setResolutionTime(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>
        </div>

        {dateError && (
          <p className="text-xs text-destructive">{dateError}</p>
        )}

        {/* Current Value Preview */}
        {selectedMovie && (
          <div className="p-3 bg-accent/10 rounded-lg border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Current {metric === 'vote_average' ? 'Rating' : 'Popularity'}</p>
            <p className="text-lg font-bold text-primary">
              {metric === 'vote_average' ? `${currentValue.toFixed(1)}/10` : Math.round(currentValue).toLocaleString()}
            </p>
          </div>
        )}

        {/* Auto Title Preview */}
        {selectedMovie && resolutionDate && resolutionTime && !dateError && (
          <div className="p-3 bg-accent/10 rounded-lg border border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Oracle Title</p>
            <p className="text-sm font-medium">{generateTitle()}</p>
          </div>
        )}

        {/* Create Button */}
        <Button
          onClick={handleCreate}
          disabled={!isFormValid || isLoading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {getButtonText('Create Oracle')}
        </Button>
      </div>
    </ModuleCard>
  );
};
