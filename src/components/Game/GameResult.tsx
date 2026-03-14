import { GameState } from '@/domain/models';
import { Button } from '../UI';

interface GameResultProps {
  gameState: GameState;
  correctAnswer: string;
  onShare: () => void;
  onViewClues: () => void;
  shareSuccess?: boolean;
  isArchiveMode?: boolean;
}

export function GameResult({ gameState, correctAnswer, onShare, onViewClues, shareSuccess, isArchiveMode = false }: GameResultProps) {
  const isWin = gameState.status === 'won';

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 md:p-6 shadow-lg text-center space-y-3 md:space-y-4">
      {/* Result icon and message */}
      <div className="space-y-2 md:space-y-3">
        {isWin ? (
          <>
            <div className="text-5xl md:text-6xl">✅</div>
            <h2 className="text-2xl md:text-3xl font-bold text-green-600">Congratulations!</h2>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{correctAnswer}</p>
            <p className="text-base md:text-lg text-gray-700">
              Guessed in{' '}
              <span className="font-bold text-green-600">{gameState.revealedClues}</span>{' '}
              {gameState.revealedClues === 1 ? 'clue' : 'clues'}!
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl md:text-6xl">😔</div>
            <h2 className="text-2xl md:text-3xl font-bold text-red-600">Better luck next time!</h2>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{correctAnswer}</p>
          </>
        )}
      </div>

      {/* Share button */}
      <div className="pt-2 md:pt-3">
        <Button onClick={onShare} variant={shareSuccess ? 'success' : 'primary'} className="w-full">
          {shareSuccess ? '✓ Copied to Clipboard!' : 'Share Result'}
        </Button>
      </div>

      {/* View clues */}
      <button
        onClick={onViewClues}
        className="text-sm font-medium px-4 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Back to clues
      </button>

      {/* Next puzzle info */}
      {!isArchiveMode && (
        <p className="text-xs md:text-sm text-gray-500">Come back tomorrow for a new puzzle!</p>
      )}
    </div>
  );
}
