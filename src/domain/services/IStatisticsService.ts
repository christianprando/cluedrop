import { GameState, PlayerStats } from '../models';

/**
 * Service interface for managing player statistics
 */
export interface IStatisticsService {
  /**
   * Update statistics after a game is completed
   * @param stats - Current player statistics
   * @param gameState - The completed game state
   * @param puzzleDate - The date of the puzzle
   * @returns Updated statistics
   */
  updateStats(stats: PlayerStats, gameState: GameState, puzzleDate: string, isArchiveMode?: boolean): PlayerStats;

  /**
   * Calculate win rate percentage
   * @param stats - Player statistics
   * @returns Win rate as a percentage (0-100)
   */
  getWinRate(stats: PlayerStats): number;

  /**
   * Get average number of clues needed to win
   * @param stats - Player statistics
   * @returns Average clues used, or 0 if no wins
   */
  getAverageClues(stats: PlayerStats): number;
}
