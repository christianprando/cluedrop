/**
 * Represents the current state of a game session
 */
export type GameStatus = 'in_progress' | 'won' | 'lost';

export interface GameState {
  /** The puzzle ID being played */
  puzzleId: number;

  /** Number of clues revealed (0-10) */
  revealedClues: number;

  /** List of all guesses made by the player */
  guesses: string[];

  /** Current game status */
  status: GameStatus;

  /** Timestamp when the correct guess was made (if won) */
  guessedAt?: number;
}

/**
 * Factory function to create a new game state
 */
export function createNewGameState(puzzleId: number): GameState {
  return {
    puzzleId,
    revealedClues: 0,
    guesses: [],
    status: 'in_progress',
  };
}
