import { IStorageService } from '@/domain/services';
import { GameState, PlayerStats, createInitialStats } from '@/domain/models';

/**
 * LocalStorage implementation of storage service
 */
export class LocalStorageService implements IStorageService {
  private readonly GAME_STATE_KEY = 'cluedrop_game_state';
  private readonly PLAYER_STATS_KEY = 'cluedrop_player_stats';

  getGameState(): GameState | null {
    try {
      const data = localStorage.getItem(this.GAME_STATE_KEY);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as GameState;
    } catch (error) {
      console.error('Failed to get game state from localStorage:', error);
      return null;
    }
  }

  saveGameState(state: GameState): void {
    try {
      localStorage.setItem(this.GAME_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
    }
  }

  clearGameState(): void {
    try {
      localStorage.removeItem(this.GAME_STATE_KEY);
    } catch (error) {
      console.error('Failed to clear game state from localStorage:', error);
    }
  }

  getPlayerStats(): PlayerStats {
    try {
      const data = localStorage.getItem(this.PLAYER_STATS_KEY);
      if (!data) {
        return createInitialStats();
      }
      return JSON.parse(data) as PlayerStats;
    } catch (error) {
      console.error('Failed to get player stats from localStorage:', error);
      return createInitialStats();
    }
  }

  savePlayerStats(stats: PlayerStats): void {
    try {
      localStorage.setItem(this.PLAYER_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save player stats to localStorage:', error);
    }
  }
}
