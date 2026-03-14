/**
 * Core domain model for a puzzle
 */
export interface Puzzle {
  /** Sequential puzzle number */
  id: number;

  /** ISO date string (YYYY-MM-DD) */
  date: string;

  /** The person to guess */
  person: {
    /** Canonical name */
    name: string;
    /** Accepted name variations for matching */
    alternateNames: string[];
  };

  /** Array of 10 clues, ordered from general to specific */
  clues: string[];

  /** Additional metadata */
  metadata: {
    category: 'people';
    difficulty?: number;
    source?: string;
  };
}
