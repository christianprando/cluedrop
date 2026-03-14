import { useState, useEffect } from 'react';
import { Modal } from '../UI';
import { useServices } from '@/di';
import { Puzzle } from '@/domain/models';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPuzzle: (puzzle: Puzzle) => void;
  currentPuzzleId: number;
}

export function ArchiveModal({ isOpen, onClose, onSelectPuzzle, currentPuzzleId }: ArchiveModalProps) {
  const { puzzleRepository } = useServices();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      loadPuzzles();
    }
  }, [isOpen]);

  const loadPuzzles = async () => {
    setLoading(true);
    try {
      const allPuzzles = await puzzleRepository.getAllPuzzles();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter out future puzzles
      const pastPuzzles = allPuzzles.filter(puzzle => {
        const puzzleDate = new Date(puzzle.date + 'T00:00:00Z');
        return puzzleDate <= today;
      });
      setPuzzles(pastPuzzles);
    } catch (error) {
      console.error('Error loading puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getPuzzleForDate = (year: number, month: number, day: number): Puzzle | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return puzzles.find(p => p.date === dateStr);
  };

  const isToday = (year: number, month: number, day: number): boolean => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const isFutureDate = (year: number, month: number, day: number): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate > today;
  };

  const handleSelectDate = (puzzle: Puzzle) => {
    onSelectPuzzle(puzzle);
    onClose();
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const today = new Date();
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (nextMonth <= today) {
      setCurrentMonth(nextMonth);
    }
  };

  const canGoToNextMonth = (): boolean => {
    const today = new Date();
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return nextMonth <= today;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const puzzle = getPuzzleForDate(year, month, day);
      const isCurrentDay = isToday(year, month, day);
      const isFuture = isFutureDate(year, month, day);
      const isCurrentPuzzle = puzzle?.id === currentPuzzleId;

      days.push(
        <button
          key={day}
          onClick={() => puzzle && handleSelectDate(puzzle)}
          disabled={!puzzle || isFuture}
          className={`aspect-square p-1 rounded-lg text-sm md:text-base transition-colors ${
            isFuture
              ? 'text-gray-300 cursor-not-allowed'
              : puzzle
              ? isCurrentPuzzle
                ? 'bg-primary-600 text-white font-bold'
                : isCurrentDay
                ? 'bg-primary-100 text-primary-900 font-semibold hover:bg-primary-200'
                : 'bg-gray-100 text-gray-900 hover:bg-primary-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a Date">
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        ) : (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                disabled={!canGoToNextMonth()}
                className={`p-2 rounded-lg transition-colors ${
                  canGoToNextMonth()
                    ? 'text-primary-600 hover:bg-primary-50'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs md:text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
