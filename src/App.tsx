import { useState, useEffect } from 'react';
import { Puzzle } from './domain/models';
import { useServices } from './di';
import { GameBoard } from './components/Game';
import { StatsModal } from './components/Stats';
import { ArchiveModal } from './components/Archive';
import { Button } from './components/UI';

function App() {
  const { puzzleRepository } = useServices();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [todaysPuzzle, setTodaysPuzzle] = useState<Puzzle | null>(null);
  const [allPuzzles, setAllPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [isArchiveMode, setIsArchiveMode] = useState(false);

  useEffect(() => {
    loadTodaysPuzzle();
  }, []);

  const loadTodaysPuzzle = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const fetchedPuzzle = await puzzleRepository.getPuzzleForDate(today);

      // Load all past puzzles for navigation
      const allFetchedPuzzles = await puzzleRepository.getAllPuzzles();
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const pastPuzzles = allFetchedPuzzles.filter(p => {
        const puzzleDate = new Date(p.date + 'T00:00:00Z');
        return puzzleDate <= todayDate;
      });
      const sortedPuzzles = pastPuzzles.sort((a, b) => a.date.localeCompare(b.date));
      setAllPuzzles(sortedPuzzles);

      if (!fetchedPuzzle) {
        setError('No puzzle available for today. Check back tomorrow!');
      } else {
        setPuzzle(fetchedPuzzle);
        setTodaysPuzzle(fetchedPuzzle);
        setIsArchiveMode(false);
      }
    } catch (err) {
      setError('Failed to load puzzle. Please try again later.');
      console.error('Error loading puzzle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArchivePuzzle = (selectedPuzzle: Puzzle) => {
    setPuzzle(selectedPuzzle);
    setIsArchiveMode(selectedPuzzle.id !== todaysPuzzle?.id);
  };

  const handleBackToToday = () => {
    if (todaysPuzzle) {
      setPuzzle(todaysPuzzle);
      setIsArchiveMode(false);
    }
  };

  const handlePreviousPuzzle = () => {
    if (!puzzle) return;
    const currentIndex = allPuzzles.findIndex(p => p.id === puzzle.id);
    if (currentIndex > 0) {
      const previousPuzzle = allPuzzles[currentIndex - 1];
      if (!previousPuzzle) return;
      setPuzzle(previousPuzzle);
      setIsArchiveMode(previousPuzzle.id !== todaysPuzzle?.id);
    }
  };

  const handleNextPuzzle = () => {
    if (!puzzle) return;
    const currentIndex = allPuzzles.findIndex(p => p.id === puzzle.id);
    if (currentIndex < allPuzzles.length - 1) {
      const nextPuzzle = allPuzzles[currentIndex + 1];
      if (!nextPuzzle) return;
      setPuzzle(nextPuzzle);
      setIsArchiveMode(nextPuzzle.id !== todaysPuzzle?.id);
    }
  };

  const canGoToPrevious = () => {
    if (!puzzle || allPuzzles.length === 0) return false;
    const currentIndex = allPuzzles.findIndex(p => p.id === puzzle.id);
    return currentIndex > 0;
  };

  const canGoToNext = () => {
    if (!puzzle || allPuzzles.length === 0) return false;
    const currentIndex = allPuzzles.findIndex(p => p.id === puzzle.id);
    return currentIndex < allPuzzles.length - 1 && puzzle.id !== todaysPuzzle?.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading today's puzzle...</p>
        </div>
      </div>
    );
  }

  if (error || !puzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadTodaysPuzzle}>Try Again</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00Z'); // Parse as UTC
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 py-2 md:px-4 md:py-3">
          <div className="flex items-center justify-between">
            {/* Title and Date */}
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                ClueDrop <span className="text-gray-500 font-normal text-sm md:text-xl">{formatDate(puzzle.date)}</span>
              </h1>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              {/* Previous/Next Navigation with Calendar */}
              {/* Back to Today pill — always rendered to prevent layout shift */}
              <button
                onClick={handleBackToToday}
                className={`text-xs md:text-sm font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors ${isArchiveMode ? 'visible' : 'invisible'}`}
              >
                Today
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePreviousPuzzle}
                  disabled={!canGoToPrevious()}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                    canGoToPrevious()
                      ? 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  aria-label="Previous puzzle"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowArchive(true)}
                  className="p-1.5 md:p-2 rounded-lg transition-colors text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                  aria-label="Choose date"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={handleNextPuzzle}
                  disabled={!canGoToNext()}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                    canGoToNext()
                      ? 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  aria-label="Next puzzle"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Stats Button */}
              <Button variant="secondary" size="sm" onClick={() => setShowStats(true)}>
                <span className="hidden sm:inline">📊 </span>Stats
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-3 py-3 md:px-4 md:py-6">
        <GameBoard puzzle={puzzle} isArchiveMode={isArchiveMode} />
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-3 py-4 md:py-6 text-center text-xs md:text-sm text-gray-500">
        <p className="hidden sm:block">A new puzzle drops every day at midnight UTC</p>
      </footer>

      {/* Modals */}
      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
      <ArchiveModal
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        onSelectPuzzle={handleSelectArchivePuzzle}
        currentPuzzleId={puzzle?.id || 0}
      />
    </div>
  );
}

export default App;
