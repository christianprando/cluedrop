import { GameState } from '../models';

/**
 * Service interface for generating and sharing game results
 */
export interface IShareService {
  /**
   * Generate shareable text for a completed game
   * @param puzzleNumber - The puzzle number
   * @param gameState - The completed game state
   * @param appUrl - The app URL to include in share text
   * @returns Formatted share text with emoji pattern
   */
  generateShareText(puzzleNumber: number, gameState: GameState, appUrl: string): string;

  /**
   * Copy text to clipboard
   * @param text - The text to copy
   * @returns Promise resolving to true if successful, false otherwise
   */
  copyToClipboard(text: string): Promise<boolean>;
}
