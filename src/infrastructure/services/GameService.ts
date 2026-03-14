import { IGameService, GuessResult } from '@/domain/services';
import { GameState, Puzzle } from '@/domain/models';

/**
 * Implementation of game business logic
 */
export class GameService implements IGameService {
  private readonly MAX_CLUES = 10;

  initializeGame(puzzle: Puzzle): GameState {
    return {
      puzzleId: puzzle.id,
      revealedClues: 0,
      guesses: [],
      status: 'in_progress',
    };
  }

  revealNextClue(gameState: GameState): GameState {
    if (this.isGameOver(gameState)) {
      throw new Error('Cannot reveal clue: game is already over');
    }

    if (!this.canRevealClue(gameState)) {
      throw new Error('Cannot reveal clue: all clues have been revealed');
    }

    return {
      ...gameState,
      revealedClues: gameState.revealedClues + 1,
    };
  }

  submitGuess(gameState: GameState, puzzle: Puzzle, guess: string): GuessResult {
    if (this.isGameOver(gameState)) {
      throw new Error('Cannot submit guess: game is already over');
    }

    const trimmedGuess = guess.trim();
    if (!trimmedGuess) {
      throw new Error('Cannot submit empty guess');
    }

    const isCorrect = this.isGuessCorrect(trimmedGuess, puzzle);

    const updatedState: GameState = {
      ...gameState,
      guesses: [...gameState.guesses, trimmedGuess],
      status: isCorrect ? 'won' : gameState.status,
      guessedAt: isCorrect ? Date.now() : gameState.guessedAt,
    };

    // Check if player lost (all clues revealed and still didn't win)
    if (!isCorrect && gameState.revealedClues >= this.MAX_CLUES) {
      updatedState.status = 'lost';
    }

    return {
      isCorrect,
      gameState: updatedState,
    };
  }

  isGuessCorrect(guess: string, puzzle: Puzzle): boolean {
    const normalizedGuess = this.normalizeString(guess);
    const normalizedAnswer = this.normalizeString(puzzle.person.name);

    // Check main name
    if (normalizedGuess === normalizedAnswer) {
      return true;
    }

    // Check alternate names
    return puzzle.person.alternateNames.some(
      (alternateName) => this.normalizeString(alternateName) === normalizedGuess
    );
  }

  isGameOver(gameState: GameState): boolean {
    return gameState.status === 'won' || gameState.status === 'lost';
  }

  canRevealClue(gameState: GameState): boolean {
    return gameState.revealedClues < this.MAX_CLUES && !this.isGameOver(gameState);
  }

  /**
   * Normalize a string for comparison (lowercase, remove accents, trim)
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .trim();
  }
}
