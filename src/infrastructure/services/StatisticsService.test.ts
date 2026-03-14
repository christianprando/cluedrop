import { describe, it, expect, beforeEach } from 'vitest';
import { StatisticsService } from './StatisticsService';
import { PlayerStats, GameState, createInitialStats } from '@/domain/models';

describe('StatisticsService', () => {
  let statsService: StatisticsService;
  let initialStats: PlayerStats;

  beforeEach(() => {
    statsService = new StatisticsService();
    initialStats = createInitialStats();
  });

  describe('updateStats', () => {
    it('should update stats for a won game', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: ['guess1', 'guess2', 'Einstein'],
        status: 'won',
        guessedAt: Date.now(),
      };

      const updatedStats = statsService.updateStats(initialStats, gameState, '2026-03-05');

      expect(updatedStats.gamesPlayed).toBe(1);
      expect(updatedStats.gamesWon).toBe(1);
      expect(updatedStats.currentStreak).toBe(1);
      expect(updatedStats.maxStreak).toBe(1);
      expect(updatedStats.clueDistribution[5]).toBe(1);
      expect(updatedStats.lastPlayedDate).toBe('2026-03-05');
    });

    it('should update stats for a lost game', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 10,
        guesses: ['guess1', 'guess2'],
        status: 'lost',
      };

      const updatedStats = statsService.updateStats(initialStats, gameState, '2026-03-05');

      expect(updatedStats.gamesPlayed).toBe(1);
      expect(updatedStats.gamesWon).toBe(0);
      expect(updatedStats.currentStreak).toBe(0);
      expect(updatedStats.maxStreak).toBe(0);
      expect(updatedStats.lastPlayedDate).toBe('2026-03-05');
    });

    it('should increment streak on consecutive days', () => {
      let stats = initialStats;

      // Day 1
      const game1: GameState = {
        puzzleId: 1,
        revealedClues: 3,
        guesses: ['Einstein'],
        status: 'won',
        guessedAt: Date.now(),
      };
      stats = statsService.updateStats(stats, game1, '2026-03-05');
      expect(stats.currentStreak).toBe(1);

      // Day 2 (consecutive)
      const game2: GameState = {
        puzzleId: 2,
        revealedClues: 4,
        guesses: ['Kahlo'],
        status: 'won',
        guessedAt: Date.now(),
      };
      stats = statsService.updateStats(stats, game2, '2026-03-06');
      expect(stats.currentStreak).toBe(2);
      expect(stats.maxStreak).toBe(2);
    });

    it('should reset streak on non-consecutive days', () => {
      let stats = initialStats;

      // Day 1
      const game1: GameState = {
        puzzleId: 1,
        revealedClues: 3,
        guesses: ['Einstein'],
        status: 'won',
        guessedAt: Date.now(),
      };
      stats = statsService.updateStats(stats, game1, '2026-03-05');
      expect(stats.currentStreak).toBe(1);

      // Day 3 (skipped day 2)
      const game2: GameState = {
        puzzleId: 3,
        revealedClues: 4,
        guesses: ['Kahlo'],
        status: 'won',
        guessedAt: Date.now(),
      };
      stats = statsService.updateStats(stats, game2, '2026-03-07');
      expect(stats.currentStreak).toBe(1); // Reset to 1
      expect(stats.maxStreak).toBe(1);
    });

    it('should reset streak on loss', () => {
      let stats: PlayerStats = {
        ...initialStats,
        gamesPlayed: 3,
        gamesWon: 3,
        currentStreak: 3,
        maxStreak: 3,
        lastPlayedDate: '2026-03-04',
      };

      const lostGame: GameState = {
        puzzleId: 4,
        revealedClues: 10,
        guesses: [],
        status: 'lost',
      };

      stats = statsService.updateStats(stats, lostGame, '2026-03-05');
      expect(stats.currentStreak).toBe(0);
      expect(stats.maxStreak).toBe(3); // Max stays the same
    });

    it('should track clue distribution correctly', () => {
      let stats = initialStats;

      const game1: GameState = {
        puzzleId: 1,
        revealedClues: 3,
        guesses: [],
        status: 'won',
        guessedAt: Date.now(),
      };
      stats = statsService.updateStats(stats, game1, '2026-03-05');
      expect(stats.clueDistribution[3]).toBe(1);

      const game2: GameState = {
        puzzleId: 2,
        revealedClues: 3,
        guesses: [],
        status: 'won',
        guessedAt: Date.now(),
      };
      stats = statsService.updateStats(stats, game2, '2026-03-06');
      expect(stats.clueDistribution[3]).toBe(2);

      const game3: GameState = {
        puzzleId: 3,
        revealedClues: 7,
        guesses: [],
        status: 'won',
        guessedAt: Date.now(),
      };
      stats = statsService.updateStats(stats, game3, '2026-03-07');
      expect(stats.clueDistribution[7]).toBe(1);
    });

    it('should not update streak or lastPlayedDate for archive mode win', () => {
      const stats: PlayerStats = {
        ...initialStats,
        currentStreak: 3,
        maxStreak: 3,
        lastPlayedDate: '2026-03-05',
      };

      const archiveWin: GameState = {
        puzzleId: 1,
        revealedClues: 4,
        guesses: ['Einstein'],
        status: 'won',
        guessedAt: Date.now(),
      };

      const updatedStats = statsService.updateStats(stats, archiveWin, '2026-02-01', true);

      expect(updatedStats.gamesPlayed).toBe(1);
      expect(updatedStats.gamesWon).toBe(1);
      expect(updatedStats.clueDistribution[4]).toBe(1);
      expect(updatedStats.currentStreak).toBe(3); // unchanged
      expect(updatedStats.maxStreak).toBe(3);     // unchanged
      expect(updatedStats.lastPlayedDate).toBe('2026-03-05'); // unchanged
    });

    it('should not reset streak for archive mode loss', () => {
      const stats: PlayerStats = {
        ...initialStats,
        currentStreak: 3,
        maxStreak: 3,
        lastPlayedDate: '2026-03-05',
      };

      const archiveLoss: GameState = {
        puzzleId: 1,
        revealedClues: 10,
        guesses: [],
        status: 'lost',
      };

      const updatedStats = statsService.updateStats(stats, archiveLoss, '2026-02-01', true);

      expect(updatedStats.gamesPlayed).toBe(1);
      expect(updatedStats.currentStreak).toBe(3); // unchanged
      expect(updatedStats.lastPlayedDate).toBe('2026-03-05'); // unchanged
    });

    it('should throw error if game is in progress', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: [],
        status: 'in_progress',
      };

      expect(() => statsService.updateStats(initialStats, gameState, '2026-03-05')).toThrow(
        'game is not completed'
      );
    });
  });

  describe('getWinRate', () => {
    it('should return 0 for no games played', () => {
      expect(statsService.getWinRate(initialStats)).toBe(0);
    });

    it('should calculate win rate correctly', () => {
      const stats: PlayerStats = {
        ...initialStats,
        gamesPlayed: 10,
        gamesWon: 7,
      };

      expect(statsService.getWinRate(stats)).toBe(70);
    });

    it('should round to nearest integer', () => {
      const stats: PlayerStats = {
        ...initialStats,
        gamesPlayed: 3,
        gamesWon: 2,
      };

      expect(statsService.getWinRate(stats)).toBe(67); // 66.666... rounded to 67
    });

    it('should return 100 for all wins', () => {
      const stats: PlayerStats = {
        ...initialStats,
        gamesPlayed: 5,
        gamesWon: 5,
      };

      expect(statsService.getWinRate(stats)).toBe(100);
    });
  });

  describe('getAverageClues', () => {
    it('should return 0 for no wins', () => {
      expect(statsService.getAverageClues(initialStats)).toBe(0);
    });

    it('should calculate average clues correctly', () => {
      const stats: PlayerStats = {
        ...initialStats,
        gamesWon: 3,
        clueDistribution: {
          3: 1, // 1 win with 3 clues
          5: 1, // 1 win with 5 clues
          7: 1, // 1 win with 7 clues
        },
      };

      // Average: (3 + 5 + 7) / 3 = 5
      expect(statsService.getAverageClues(stats)).toBe(5);
    });

    it('should handle decimal averages with one decimal place', () => {
      const stats: PlayerStats = {
        ...initialStats,
        gamesWon: 3,
        clueDistribution: {
          2: 1, // 1 win with 2 clues
          3: 1, // 1 win with 3 clues
          4: 1, // 1 win with 4 clues
        },
      };

      // Average: (2 + 3 + 4) / 3 = 3.0
      expect(statsService.getAverageClues(stats)).toBe(3);
    });

    it('should handle multiple wins at same clue count', () => {
      const stats: PlayerStats = {
        ...initialStats,
        gamesWon: 5,
        clueDistribution: {
          3: 3, // 3 wins with 3 clues
          5: 2, // 2 wins with 5 clues
        },
      };

      // Average: (3*3 + 5*2) / 5 = (9 + 10) / 5 = 3.8
      expect(statsService.getAverageClues(stats)).toBe(3.8);
    });
  });
});
