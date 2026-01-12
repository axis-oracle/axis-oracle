import { addDays, addHours, setHours, setMinutes } from 'date-fns';

export type GameType = 'cs2' | 'lol' | 'dota2';

export interface EsportsMatch {
  id: string;
  game: GameType;
  team1: string;
  team1Short: string;
  team2: string;
  team2Short: string;
  tournament: string;
  scheduledAt: Date;
  estimatedEndAt: Date;
}

// Generate realistic upcoming matches
const now = new Date();

const createMatch = (
  id: string,
  game: GameType,
  team1: string,
  team1Short: string,
  team2: string,
  team2Short: string,
  tournament: string,
  daysFromNow: number,
  hour: number
): EsportsMatch => {
  const scheduledAt = setMinutes(setHours(addDays(now, daysFromNow), hour), 0);
  // Estimate match duration: CS2 ~2.5 hours, LoL ~1.5 hours, Dota 2 ~2 hours
  const durationHours = game === 'cs2' ? 2.5 : game === 'lol' ? 1.5 : 2;
  const estimatedEndAt = addHours(scheduledAt, durationHours);
  
  return {
    id,
    game,
    team1,
    team1Short,
    team2,
    team2Short,
    tournament,
    scheduledAt,
    estimatedEndAt,
  };
};

export const ESPORTS_MATCHES: EsportsMatch[] = [
  // CS2 Matches
  createMatch('cs2_001', 'cs2', 'Natus Vincere', 'NaVi', 'FaZe Clan', 'FaZe', 'IEM Katowice 2025', 1, 18),
  createMatch('cs2_002', 'cs2', 'Natus Vincere', 'NaVi', 'Team Vitality', 'Vitality', 'IEM Katowice 2025', 4, 20),
  createMatch('cs2_003', 'cs2', 'Team Spirit', 'Spirit', 'G2 Esports', 'G2', 'BLAST Premier', 2, 15),
  createMatch('cs2_004', 'cs2', 'FaZe Clan', 'FaZe', 'Team Vitality', 'Vitality', 'IEM Katowice 2025', 3, 19),
  createMatch('cs2_005', 'cs2', 'G2 Esports', 'G2', 'Natus Vincere', 'NaVi', 'BLAST Premier', 5, 17),
  createMatch('cs2_006', 'cs2', 'Team Spirit', 'Spirit', 'MOUZ', 'MOUZ', 'ESL Pro League', 2, 21),
  createMatch('cs2_007', 'cs2', 'Heroic', 'Heroic', 'FaZe Clan', 'FaZe', 'ESL Pro League', 6, 16),
  createMatch('cs2_008', 'cs2', 'Cloud9', 'C9', 'Team Spirit', 'Spirit', 'BLAST Premier', 4, 14),
  
  // League of Legends Matches
  createMatch('lol_001', 'lol', 'T1', 'T1', 'Gen.G', 'GenG', 'LCK Spring 2025', 1, 11),
  createMatch('lol_002', 'lol', 'Gen.G', 'GenG', 'DRX', 'DRX', 'LCK Spring 2025', 2, 14),
  createMatch('lol_003', 'lol', 'T1', 'T1', 'Dplus KIA', 'DK', 'LCK Spring 2025', 3, 11),
  createMatch('lol_004', 'lol', 'G2 Esports', 'G2', 'Fnatic', 'FNC', 'LEC Winter 2025', 1, 19),
  createMatch('lol_005', 'lol', 'Fnatic', 'FNC', 'Team Vitality', 'VIT', 'LEC Winter 2025', 3, 18),
  createMatch('lol_006', 'lol', 'Cloud9', 'C9', 'Team Liquid', 'TL', 'LCS Spring 2025', 2, 22),
  createMatch('lol_007', 'lol', 'JD Gaming', 'JDG', 'Top Esports', 'TES', 'LPL Spring 2025', 4, 12),
  createMatch('lol_008', 'lol', 'Bilibili Gaming', 'BLG', 'Weibo Gaming', 'WBG', 'LPL Spring 2025', 5, 13),
  
  // Dota 2 Matches
  createMatch('dota_001', 'dota2', 'Team Spirit', 'Spirit', 'Team Liquid', 'Liquid', 'DPC Tour 2025', 2, 16),
  createMatch('dota_002', 'dota2', 'Tundra Esports', 'Tundra', 'OG', 'OG', 'DPC Tour 2025', 3, 18),
  createMatch('dota_003', 'dota2', 'Gaimin Gladiators', 'GG', 'Team Spirit', 'Spirit', 'ESL One', 5, 15),
  createMatch('dota_004', 'dota2', 'BetBoom Team', 'BB', 'Virtus.pro', 'VP', 'DPC Tour 2025', 1, 14),
];

// Search function to find matches by team name
export function searchMatches(query: string, gameFilter?: GameType): EsportsMatch[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return ESPORTS_MATCHES.filter(match => {
    const matchesQuery = 
      match.team1.toLowerCase().includes(lowerQuery) ||
      match.team2.toLowerCase().includes(lowerQuery) ||
      match.team1Short.toLowerCase().includes(lowerQuery) ||
      match.team2Short.toLowerCase().includes(lowerQuery);
    
    const matchesGame = !gameFilter || match.game === gameFilter;
    
    return matchesQuery && matchesGame;
  });
}

// Get all upcoming matches for a specific game
export function getMatchesByGame(game: GameType): EsportsMatch[] {
  return ESPORTS_MATCHES.filter(match => match.game === game);
}

// Format match for display
export function formatMatchDisplay(match: EsportsMatch): string {
  return `${match.team1Short} vs ${match.team2Short}`;
}

// Get game label
export function getGameLabel(game: GameType): string {
  switch (game) {
    case 'cs2': return 'CS2';
    case 'lol': return 'LoL';
    case 'dota2': return 'Dota 2';
    default: return game;
  }
}

// Get game badge color classes
export function getGameBadgeClasses(game: GameType): string {
  switch (game) {
    case 'cs2': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    case 'lol': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'dota2': return 'bg-red-500/20 text-red-600 border-red-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
}
