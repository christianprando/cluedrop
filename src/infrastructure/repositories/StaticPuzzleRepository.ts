import { IPuzzleRepository } from '@/domain/services';
import { Puzzle } from '@/domain/models';

/**
 * Static implementation of puzzle repository
 * Serves puzzles from a pre-defined array
 */
export class StaticPuzzleRepository implements IPuzzleRepository {
  constructor(private puzzles: Puzzle[]) {}

  async getPuzzleForDate(date: Date): Promise<Puzzle | null> {
    const dateString = this.formatDate(date);
    const puzzle = this.puzzles.find((p) => p.date === dateString);
    return puzzle || null;
  }

  async getPuzzleById(id: number): Promise<Puzzle | null> {
    const puzzle = this.puzzles.find((p) => p.id === id);
    return puzzle || null;
  }

  async getAllPuzzles(): Promise<Puzzle[]> {
    return [...this.puzzles];
  }

  /**
   * Format date as ISO string (YYYY-MM-DD)
   * Uses UTC to avoid timezone issues
   */
  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
