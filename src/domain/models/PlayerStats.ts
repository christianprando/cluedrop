/**
 * Player statistics tracked across all games
 */
export interface PlayerStats {
  /** Total number of games played */
  gamesPlayed: number;

  /** Total number of games won */
  gamesWon: number;

  /** Current winning streak (consecutive days) */
  currentStreak: number;

  /** Best winning streak achieved */
  maxStreak: number;

  /** Distribution of wins by number of clues used */
  clueDistribution: Record<number, number>;

  /** ISO date string of last played game */
  lastPlayedDate: string;
}

/**
 * Factory function to create initial player stats
 */
export function createInitialStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    clueDistribution: {},
    lastPlayedDate: '',
  };
}
