import { GameState, PlayerStats } from '../models';

/**
 * Service interface for persisting game data
 * Implementations can use localStorage, sessionStorage, IndexedDB, etc.
 */
export interface IStorageService {
  /**
   * Get the current game state
   * @returns The game state, or null if none exists
   */
  getGameState(): GameState | null;

  /**
   * Save the current game state
   * @param state - The game state to save
   */
  saveGameState(state: GameState): void;

  /**
   * Clear the current game state
   */
  clearGameState(): void;

  /**
   * Get player statistics
   * @returns The player stats
   */
  getPlayerStats(): PlayerStats;

  /**
   * Save player statistics
   * @param stats - The stats to save
   */
  savePlayerStats(stats: PlayerStats): void;
}
