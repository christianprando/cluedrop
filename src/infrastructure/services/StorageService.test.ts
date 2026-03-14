import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageService } from './StorageService';
import { GameState, PlayerStats, createInitialStats } from '@/domain/models';

describe('LocalStorageService', () => {
  let storageService: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new LocalStorageService();
  });

  describe('getGameState', () => {
    it('should return null when no game state exists', () => {
      const state = storageService.getGameState();
      expect(state).toBeNull();
    });

    it('should retrieve saved game state', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: ['guess1', 'guess2'],
        status: 'in_progress',
      };

      storageService.saveGameState(gameState);
      const retrieved = storageService.getGameState();

      expect(retrieved).toEqual(gameState);
    });
  });

  describe('saveGameState', () => {
    it('should save game state to localStorage', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 3,
        guesses: ['Einstein'],
        status: 'won',
        guessedAt: 123456789,
      };

      storageService.saveGameState(gameState);

      const saved = localStorage.getItem('cluedrop_game_state');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(gameState);
    });
  });

  describe('clearGameState', () => {
    it('should remove game state from localStorage', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: [],
        status: 'in_progress',
      };

      storageService.saveGameState(gameState);
      expect(storageService.getGameState()).not.toBeNull();

      storageService.clearGameState();
      expect(storageService.getGameState()).toBeNull();
    });
  });

  describe('getPlayerStats', () => {
    it('should return initial stats when none exist', () => {
      const stats = storageService.getPlayerStats();
      expect(stats).toEqual(createInitialStats());
    });

    it('should retrieve saved player stats', () => {
      const playerStats: PlayerStats = {
        gamesPlayed: 10,
        gamesWon: 7,
        currentStreak: 3,
        maxStreak: 5,
        clueDistribution: { 3: 2, 5: 3, 7: 2 },
        lastPlayedDate: '2026-03-05',
      };

      storageService.savePlayerStats(playerStats);
      const retrieved = storageService.getPlayerStats();

      expect(retrieved).toEqual(playerStats);
    });
  });

  describe('savePlayerStats', () => {
    it('should save player stats to localStorage', () => {
      const playerStats: PlayerStats = {
        gamesPlayed: 5,
        gamesWon: 4,
        currentStreak: 2,
        maxStreak: 3,
        clueDistribution: { 3: 1, 5: 2, 7: 1 },
        lastPlayedDate: '2026-03-05',
      };

      storageService.savePlayerStats(playerStats);

      const saved = localStorage.getItem('cluedrop_player_stats');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(playerStats);
    });
  });
});
