import { describe, it, expect, beforeEach } from 'vitest';
import { StaticPuzzleRepository } from './StaticPuzzleRepository';
import { Puzzle } from '@/domain/models';

describe('StaticPuzzleRepository', () => {
  let repository: StaticPuzzleRepository;
  let mockPuzzles: Puzzle[];

  beforeEach(() => {
    mockPuzzles = [
      {
        id: 1,
        date: '2026-03-05',
        person: {
          name: 'Albert Einstein',
          alternateNames: ['Einstein'],
        },
        clues: Array(10).fill('Clue'),
        metadata: {
          category: 'people',
        },
      },
      {
        id: 2,
        date: '2026-03-06',
        person: {
          name: 'Frida Kahlo',
          alternateNames: ['Kahlo'],
        },
        clues: Array(10).fill('Clue'),
        metadata: {
          category: 'people',
        },
      },
      {
        id: 3,
        date: '2026-03-07',
        person: {
          name: 'Nelson Mandela',
          alternateNames: ['Mandela'],
        },
        clues: Array(10).fill('Clue'),
        metadata: {
          category: 'people',
        },
      },
    ];

    repository = new StaticPuzzleRepository(mockPuzzles);
  });

  describe('getPuzzleForDate', () => {
    it('should return puzzle for matching date', async () => {
      const date = new Date('2026-03-05');
      const puzzle = await repository.getPuzzleForDate(date);

      expect(puzzle).not.toBeNull();
      expect(puzzle?.id).toBe(1);
      expect(puzzle?.person.name).toBe('Albert Einstein');
    });

    it('should return null for non-existent date', async () => {
      const date = new Date('2026-12-31');
      const puzzle = await repository.getPuzzleForDate(date);

      expect(puzzle).toBeNull();
    });

    it('should handle different dates correctly', async () => {
      const date1 = new Date('2026-03-05');
      const date2 = new Date('2026-03-06');
      const date3 = new Date('2026-03-07');

      const puzzle1 = await repository.getPuzzleForDate(date1);
      const puzzle2 = await repository.getPuzzleForDate(date2);
      const puzzle3 = await repository.getPuzzleForDate(date3);

      expect(puzzle1?.id).toBe(1);
      expect(puzzle2?.id).toBe(2);
      expect(puzzle3?.id).toBe(3);
    });
  });

  describe('getPuzzleById', () => {
    it('should return puzzle for matching id', async () => {
      const puzzle = await repository.getPuzzleById(2);

      expect(puzzle).not.toBeNull();
      expect(puzzle?.id).toBe(2);
      expect(puzzle?.person.name).toBe('Frida Kahlo');
    });

    it('should return null for non-existent id', async () => {
      const puzzle = await repository.getPuzzleById(999);

      expect(puzzle).toBeNull();
    });
  });

  describe('getAllPuzzles', () => {
    it('should return all puzzles', async () => {
      const puzzles = await repository.getAllPuzzles();

      expect(puzzles).toHaveLength(3);
      expect(puzzles[0]?.id).toBe(1);
      expect(puzzles[1]?.id).toBe(2);
      expect(puzzles[2]?.id).toBe(3);
    });

    it('should return a copy of puzzles array', async () => {
      const puzzles1 = await repository.getAllPuzzles();
      const puzzles2 = await repository.getAllPuzzles();

      expect(puzzles1).not.toBe(puzzles2); // Different array instances
      expect(puzzles1).toEqual(puzzles2); // Same content
    });

    it('should return empty array when no puzzles', async () => {
      const emptyRepo = new StaticPuzzleRepository([]);
      const puzzles = await emptyRepo.getAllPuzzles();

      expect(puzzles).toEqual([]);
    });
  });
});
