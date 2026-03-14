import { GameState, Puzzle } from '../models';

/**
 * Result of a guess attempt
 */
export interface GuessResult {
  /** Whether the guess was correct */
  isCorrect: boolean;
  /** The updated game state */
  gameState: GameState;
}

/**
 * Service interface for game logic and business rules
 */
export interface IGameService {
  /**
   * Initialize a new game for a puzzle
   * @param puzzle - The puzzle to play
   * @returns The initial game state
   */
  initializeGame(puzzle: Puzzle): GameState;

  /**
   * Reveal the next clue
   * @param gameState - Current game state
   * @returns Updated game state with one more clue revealed
   * @throws Error if all clues already revealed or game is over
   */
  revealNextClue(gameState: GameState): GameState;

  /**
   * Submit a guess
   * @param gameState - Current game state
   * @param puzzle - The puzzle being played
   * @param guess - The player's guess
   * @returns GuessResult with correctness and updated state
   * @throws Error if game is already over
   */
  submitGuess(gameState: GameState, puzzle: Puzzle, guess: string): GuessResult;

  /**
   * Check if a guess matches the answer
   * @param guess - The player's guess
   * @param puzzle - The puzzle to check against
   * @returns True if the guess matches
   */
  isGuessCorrect(guess: string, puzzle: Puzzle): boolean;

  /**
   * Check if the game is over
   * @param gameState - Current game state
   * @returns True if game is won or lost
   */
  isGameOver(gameState: GameState): boolean;

  /**
   * Check if more clues can be revealed
   * @param gameState - Current game state
   * @returns True if more clues are available
   */
  canRevealClue(gameState: GameState): boolean;
}
