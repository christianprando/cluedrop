import { Puzzle } from '../models';

/**
 * Repository interface for accessing puzzle data
 * Implementations can be static (client-side) or API-based
 */
export interface IPuzzleRepository {
  /**
   * Get puzzle for a specific date
   * @param date - The date to get puzzle for
   * @returns Promise resolving to the puzzle, or null if not found
   */
  getPuzzleForDate(date: Date): Promise<Puzzle | null>;

  /**
   * Get puzzle by ID
   * @param id - The puzzle ID
   * @returns Promise resolving to the puzzle, or null if not found
   */
  getPuzzleById(id: number): Promise<Puzzle | null>;

  /**
   * Get all available puzzles
   * @returns Promise resolving to array of all puzzles
   */
  getAllPuzzles(): Promise<Puzzle[]>;
}
