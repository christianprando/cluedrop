import { IStatisticsService } from '@/domain/services';
import { GameState, PlayerStats } from '@/domain/models';

/**
 * Implementation of statistics tracking logic
 */
export class StatisticsService implements IStatisticsService {
  updateStats(stats: PlayerStats, gameState: GameState, puzzleDate: string, isArchiveMode = false): PlayerStats {
    if (gameState.status === 'in_progress') {
      throw new Error('Cannot update stats: game is not completed');
    }

    const isWin = gameState.status === 'won';
    const updatedStats = { ...stats };

    updatedStats.gamesPlayed++;

    if (isWin) {
      updatedStats.gamesWon++;

      // Update clue distribution
      const cluesUsed = gameState.revealedClues;
      updatedStats.clueDistribution = {
        ...updatedStats.clueDistribution,
        [cluesUsed]: (updatedStats.clueDistribution[cluesUsed] || 0) + 1,
      };

      // Only update streaks for today's puzzle, not archive plays
      if (!isArchiveMode) {
        const isConsecutiveDay = this.isConsecutiveDay(stats.lastPlayedDate, puzzleDate);
        if (isConsecutiveDay || stats.currentStreak === 0) {
          updatedStats.currentStreak++;
          updatedStats.maxStreak = Math.max(updatedStats.maxStreak, updatedStats.currentStreak);
        } else {
          updatedStats.currentStreak = 1;
        }
      }
    } else if (!isArchiveMode) {
      // Lost on today's puzzle - reset streak
      updatedStats.currentStreak = 0;
    }

    if (!isArchiveMode) {
      updatedStats.lastPlayedDate = puzzleDate;
    }

    return updatedStats;
  }

  getWinRate(stats: PlayerStats): number {
    if (stats.gamesPlayed === 0) {
      return 0;
    }
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }

  getAverageClues(stats: PlayerStats): number {
    if (stats.gamesWon === 0) {
      return 0;
    }

    const totalClues = Object.entries(stats.clueDistribution).reduce(
      (sum, [clues, count]) => sum + parseInt(clues) * count,
      0
    );

    return Math.round((totalClues / stats.gamesWon) * 10) / 10; // One decimal place
  }

  /**
   * Check if two dates are consecutive days
   */
  private isConsecutiveDay(lastDate: string, currentDate: string): boolean {
    if (!lastDate) {
      return false;
    }

    const last = new Date(lastDate);
    const current = new Date(currentDate);

    // Set to start of day for comparison
    last.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);

    const diffTime = current.getTime() - last.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays === 1;
  }
}
