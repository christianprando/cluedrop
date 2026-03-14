import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShareService } from './ShareService';
import { GameState } from '@/domain/models';

describe('ShareService', () => {
  let shareService: ShareService;

  beforeEach(() => {
    shareService = new ShareService();
  });

  describe('generateShareText', () => {
    it('should generate correct share text for won game', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 5,
        guesses: ['guess1', 'Einstein'],
        status: 'won',
        guessedAt: Date.now(),
      };

      const shareText = shareService.generateShareText(42, gameState, 'https://cluedrop.com');

      expect(shareText).toContain('ClueDrop #42 💧');
      expect(shareText).toContain('Guessed in 5 clues!');
      expect(shareText).toContain('1️⃣2️⃣3️⃣4️⃣✅');
      expect(shareText).toContain('Play at: https://cluedrop.com');
    });

    it('should use singular "clue" for single clue win', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 1,
        guesses: ['Einstein'],
        status: 'won',
        guessedAt: Date.now(),
      };

      const shareText = shareService.generateShareText(1, gameState, 'https://cluedrop.com');

      expect(shareText).toContain('Guessed in 1 clue!');
      expect(shareText).toContain('✅'); // No number emojis before checkmark
    });

    it('should generate correct share text for lost game', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 10,
        guesses: ['guess1', 'guess2'],
        status: 'lost',
      };

      const shareText = shareService.generateShareText(42, gameState, 'https://cluedrop.com');

      expect(shareText).toContain('ClueDrop #42 💧');
      expect(shareText).toContain("Couldn't guess it 😔");
      expect(shareText).toContain('1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟');
      expect(shareText).toContain('Play at: https://cluedrop.com');
    });

    it('should generate emoji pattern for mid-game win', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 3,
        guesses: ['Einstein'],
        status: 'won',
        guessedAt: Date.now(),
      };

      const shareText = shareService.generateShareText(1, gameState, 'https://cluedrop.com');

      expect(shareText).toContain('1️⃣2️⃣✅');
    });

    it('should throw error for in_progress game', () => {
      const gameState: GameState = {
        puzzleId: 1,
        revealedClues: 3,
        guesses: [],
        status: 'in_progress',
      };

      expect(() => shareService.generateShareText(1, gameState, 'https://cluedrop.com')).toThrow(
        'game is not completed'
      );
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard successfully', async () => {
      const writeTextMock = vi.fn(() => Promise.resolve());
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const result = await shareService.copyToClipboard('Test text');

      expect(result).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith('Test text');
    });

    it('should return false on clipboard error', async () => {
      const writeTextMock = vi.fn(() => Promise.reject(new Error('Clipboard error')));
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const result = await shareService.copyToClipboard('Test text');

      expect(result).toBe(false);
    });
  });
});
