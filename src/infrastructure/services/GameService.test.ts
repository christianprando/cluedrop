import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from './GameService';
import { Puzzle, GameState } from '@/domain/models';

describe('GameService', () => {
  let gameService: GameService;
  let mockPuzzle: Puzzle;

  beforeEach(() => {
    gameService = new GameService();
    mockPuzzle = {
      id: 1,
      date: '2026-03-05',
      person: {
        name: 'Albert Einstein',
        alternateNames: ['Einstein', 'A. Einstein'],
      },
      clues: Array(10).fill('Test clue'),
      metadata: {
        category: 'people',
      },
    };
  });

  describe('initializeGame', () => {
    it('should create initial game state', () => {
      const state = gameService.initializeGame(mockPuzzle);

      expect(state.puzzleId).toBe(1);
      expect(state.revealedClues).toBe(0);
      expect(state.guesses).toEqual([]);
      expect(state.status).toBe('in_progress');
      expect(state.guessedAt).toBeUndefined();
    });
  });

  describe('revealNextClue', () => {
    it('should reveal the next clue', () => {
      let state = gameService.initializeGame(mockPuzzle);

      state = gameService.revealNextClue(state);
      expect(state.revealedClues).toBe(1);

      state = gameService.revealNextClue(state);
      expect(state.revealedClues).toBe(2);
    });

    it('should throw error if game is over', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: ['Einstein'],
        status: 'won',
        guessedAt: Date.now(),
      };

      expect(() => gameService.revealNextClue(state)).toThrow('game is already over');
    });

    it('should throw error if all clues revealed', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 10,
        guesses: [],
        status: 'in_progress',
      };

      expect(() => gameService.revealNextClue(state)).toThrow('all clues have been revealed');
    });
  });

  describe('submitGuess', () => {
    it('should accept correct guess with exact match', () => {
      const state = gameService.initializeGame(mockPuzzle);
      const result = gameService.submitGuess(state, mockPuzzle, 'Albert Einstein');

      expect(result.isCorrect).toBe(true);
      expect(result.gameState.status).toBe('won');
      expect(result.gameState.guesses).toContain('Albert Einstein');
      expect(result.gameState.guessedAt).toBeDefined();
    });

    it('should accept correct guess case-insensitively', () => {
      const state = gameService.initializeGame(mockPuzzle);
      const result = gameService.submitGuess(state, mockPuzzle, 'albert einstein');

      expect(result.isCorrect).toBe(true);
      expect(result.gameState.status).toBe('won');
    });

    it('should accept alternate name', () => {
      const state = gameService.initializeGame(mockPuzzle);
      const result = gameService.submitGuess(state, mockPuzzle, 'Einstein');

      expect(result.isCorrect).toBe(true);
      expect(result.gameState.status).toBe('won');
    });

    it('should reject incorrect guess', () => {
      const state = gameService.initializeGame(mockPuzzle);
      const result = gameService.submitGuess(state, mockPuzzle, 'Isaac Newton');

      expect(result.isCorrect).toBe(false);
      expect(result.gameState.status).toBe('in_progress');
      expect(result.gameState.guesses).toContain('Isaac Newton');
    });

    it('should set status to lost when all clues revealed and guess wrong', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 10,
        guesses: [],
        status: 'in_progress',
      };

      const result = gameService.submitGuess(state, mockPuzzle, 'Wrong Answer');

      expect(result.isCorrect).toBe(false);
      expect(result.gameState.status).toBe('lost');
    });

    it('should throw error if game is already over', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: [],
        status: 'won',
      };

      expect(() => gameService.submitGuess(state, mockPuzzle, 'test')).toThrow('game is already over');
    });

    it('should throw error for empty guess', () => {
      const state = gameService.initializeGame(mockPuzzle);

      expect(() => gameService.submitGuess(state, mockPuzzle, '')).toThrow('Cannot submit empty guess');
      expect(() => gameService.submitGuess(state, mockPuzzle, '   ')).toThrow('Cannot submit empty guess');
    });
  });

  describe('isGuessCorrect', () => {
    it('should match with normalized strings (accents removed)', () => {
      const puzzle: Puzzle = {
        ...mockPuzzle,
        person: {
          name: 'José María',
          alternateNames: [],
        },
      };

      expect(gameService.isGuessCorrect('Jose Maria', puzzle)).toBe(true);
      expect(gameService.isGuessCorrect('josé maría', puzzle)).toBe(true);
    });

    it('should trim whitespace', () => {
      expect(gameService.isGuessCorrect('  Albert Einstein  ', mockPuzzle)).toBe(true);
    });
  });

  describe('isGameOver', () => {
    it('should return true for won status', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 3,
        guesses: ['Einstein'],
        status: 'won',
      };

      expect(gameService.isGameOver(state)).toBe(true);
    });

    it('should return true for lost status', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 10,
        guesses: [],
        status: 'lost',
      };

      expect(gameService.isGameOver(state)).toBe(true);
    });

    it('should return false for in_progress status', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: [],
        status: 'in_progress',
      };

      expect(gameService.isGameOver(state)).toBe(false);
    });
  });

  describe('canRevealClue', () => {
    it('should return true when clues remain and game in progress', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: [],
        status: 'in_progress',
      };

      expect(gameService.canRevealClue(state)).toBe(true);
    });

    it('should return false when all clues revealed', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 10,
        guesses: [],
        status: 'in_progress',
      };

      expect(gameService.canRevealClue(state)).toBe(false);
    });

    it('should return false when game is over', () => {
      const state: GameState = {
        puzzleId: 1,
        revealedClues: 3,
        guesses: ['Einstein'],
        status: 'won',
      };

      expect(gameService.canRevealClue(state)).toBe(false);
    });
  });
});
