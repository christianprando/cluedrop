import { useState, useEffect } from 'react';
import { Puzzle, GameState } from '@/domain/models';
import { useServices } from '@/di';
import { ClueList } from './ClueList';
import { GuessInput } from './GuessInput';
import { GameResult } from './GameResult';

interface GameBoardProps {
  puzzle: Puzzle;
  isArchiveMode?: boolean;
}

export function GameBoard({ puzzle, isArchiveMode = false }: GameBoardProps) {
  const { gameService, storageService, statisticsService, shareService } = useServices();

  const loadGameState = (): GameState => {
    if (isArchiveMode) {
      // For archive, use a different storage approach
      const archiveKey = `cluedrop_archive_${puzzle.id}`;
      const saved = localStorage.getItem(archiveKey);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        if (parsed.puzzleId === puzzle.id) {
          return parsed;
        }
      }
    } else {
      // For today's puzzle, use normal storage
      const saved = storageService.getGameState();
      if (saved && saved.puzzleId === puzzle.id) {
        return saved;
      }
    }
    return gameService.initializeGame(puzzle);
  };

  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [feedback, setFeedback] = useState<string>('');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Reset game state when puzzle changes and auto-reveal first clue if needed
  useEffect(() => {
    const loadedState = loadGameState();

    // Automatically reveal first clue if this is a fresh game
    if (loadedState.revealedClues === 0 && !gameService.isGameOver(loadedState)) {
      const withFirstClue = gameService.revealNextClue(loadedState);
      setGameState(withFirstClue);
    } else {
      setGameState(loadedState);
    }

    setFeedback('');
    setShareSuccess(false);
  }, [puzzle.id, isArchiveMode]);

  // Save game state whenever it changes
  useEffect(() => {
    if (isArchiveMode) {
      // Save archive game separately
      const archiveKey = `cluedrop_archive_${puzzle.id}`;
      localStorage.setItem(archiveKey, JSON.stringify(gameState));
    } else {
      // Save today's game normally
      storageService.saveGameState(gameState);
    }

    // Update stats if game is complete (for first-time completions only)
    if (gameService.isGameOver(gameState)) {
      const completedKey = 'cluedrop_completed_puzzles';
      const completedData = localStorage.getItem(completedKey);
      const completedPuzzles = completedData ? JSON.parse(completedData) as number[] : [];

      // Only update stats if this puzzle hasn't been completed before
      if (!completedPuzzles.includes(puzzle.id)) {
        const stats = storageService.getPlayerStats();
        const updatedStats = statisticsService.updateStats(stats, gameState, puzzle.date);
        storageService.savePlayerStats(updatedStats);

        // Mark this puzzle as completed
        completedPuzzles.push(puzzle.id);
        localStorage.setItem(completedKey, JSON.stringify(completedPuzzles));
      }
    }
  }, [gameState, gameService, storageService, statisticsService, puzzle.date, isArchiveMode, puzzle.id]);

  const handleSubmitGuess = (guess: string) => {
    try {
      const result = gameService.submitGuess(gameState, puzzle, guess);

      if (result.isCorrect) {
        setGameState(result.gameState);
        setFeedback('Correct! 🎉');
      } else {
        setFeedback(`"${guess}" is not correct. Try again!`);

        // Automatically reveal next clue if available
        if (gameService.canRevealClue(result.gameState)) {
          const withNextClue = gameService.revealNextClue(result.gameState);
          setGameState(withNextClue);
        } else {
          setGameState(result.gameState);
        }
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  const handleShare = async () => {
    const shareText = shareService.generateShareText(
      puzzle.id,
      gameState,
      window.location.origin
    );

    const success = await shareService.copyToClipboard(shareText);
    if (success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  const handleSkipClue = () => {
    if (gameService.canRevealClue(gameState)) {
      const withNextClue = gameService.revealNextClue(gameState);
      // Add a skip marker to keep guesses aligned with clues
      const withSkipMarker = {
        ...withNextClue,
        guesses: [...withNextClue.guesses, 'SKIPPED'],
      };
      setGameState(withSkipMarker);
    }
  };

  const isGameOver = gameService.isGameOver(gameState);

  return (
    <div className="space-y-3 md:space-y-5">
      {/* Instructions */}
      {!isGameOver && gameState.revealedClues === 1 && gameState.guesses.length === 0 && (
        <div className="text-center">
          <p className="text-sm md:text-base text-gray-600">
            Guess the mystery person!
          </p>
        </div>
      )}

      {/* Clues */}
      {gameState.revealedClues > 0 && (
        <ClueList
          clues={puzzle.clues}
          revealedCount={gameState.revealedClues}
          guesses={gameState.guesses}
          isWon={gameState.status === 'won'}
        />
      )}

      {/* Game controls or result */}
      {isGameOver ? (
        <GameResult
          gameState={gameState}
          correctAnswer={puzzle.person.name}
          onShare={handleShare}
          shareSuccess={shareSuccess}
          isArchiveMode={isArchiveMode}
        />
      ) : (
        <div className="space-y-3 md:space-y-4">
          {/* Guess input */}
          <GuessInput
            onSubmitGuess={handleSubmitGuess}
            onSkipClue={handleSkipClue}
            canSkip={gameService.canRevealClue(gameState)}
          />

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-2.5 md:p-3 rounded-lg text-center font-medium text-sm md:text-base ${
                feedback.includes('Correct')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
