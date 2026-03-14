import { useState, FormEvent } from 'react';

interface GuessInputProps {
  onSubmitGuess: (guess: string) => void;
  onSkipClue?: () => void;
  canSkip?: boolean;
  disabled?: boolean;
}

export function GuessInput({ onSubmitGuess, onSkipClue, canSkip = false, disabled = false }: GuessInputProps) {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onSubmitGuess(guess.trim());
      setGuess('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="guess-input" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
          Your guess:
        </label>
        <div className="flex items-center gap-2">
          <input
            id="guess-input"
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer..."
            className="flex-1 px-3 py-2 md:px-4 md:py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-base md:text-lg"
            autoComplete="off"
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={disabled || !guess.trim()}
            title="Submit guess"
            className="p-2 md:p-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Skip button */}
          {onSkipClue && (
            <button
              type="button"
              onClick={onSkipClue}
              disabled={!canSkip}
              title="Skip to next clue"
              className="p-2 md:p-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
