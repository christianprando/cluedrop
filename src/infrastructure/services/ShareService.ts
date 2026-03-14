import { IShareService } from '@/domain/services';
import { GameState } from '@/domain/models';

/**
 * Implementation of share/clipboard functionality
 */
export class ShareService implements IShareService {
  generateShareText(puzzleNumber: number, gameState: GameState, appUrl: string): string {
    if (gameState.status === 'in_progress') {
      throw new Error('Cannot generate share text: game is not completed');
    }

    const isWin = gameState.status === 'won';
    const cluesRevealed = gameState.revealedClues;

    // Generate emoji pattern
    const emojiPattern = this.generateEmojiPattern(cluesRevealed, isWin);

    // Generate status line
    const statusLine = isWin
      ? `Guessed in ${cluesRevealed} clue${cluesRevealed === 1 ? '' : 's'}!`
      : "Couldn't guess it 😔";

    return `ClueDrop #${puzzleNumber} 💧
${statusLine}

${emojiPattern}

Play at: ${appUrl}`;
  }

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      // Fallback for older browsers
      return this.fallbackCopyToClipboard(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Generate emoji pattern for share text
   */
  private generateEmojiPattern(cluesRevealed: number, isWin: boolean): string {
    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    if (isWin) {
      // Show numbered emojis up to the clue where they won, then checkmark
      const emojis = numberEmojis.slice(0, cluesRevealed - 1);
      emojis.push('✅');
      return emojis.join('');
    } else {
      // Show all 10 clues (lost)
      return numberEmojis.join('');
    }
  }

  /**
   * Fallback clipboard copy for older browsers
   */
  private fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}
