interface ClueListProps {
  clues: string[];
  revealedCount: number;
  guesses: string[];
  isWon?: boolean;
}

export function ClueList({ clues, revealedCount, guesses, isWon = false }: ClueListProps) {
  return (
    <div className="space-y-2 md:space-y-3">
      {clues.slice(0, revealedCount).map((clue, index) => {
        const guess = guesses[index];
        const hasGuess = guess !== undefined;
        const isSkipped = guess === 'SKIPPED';
        const isCorrectGuess = isWon && index === guesses.length - 1;

        return (
          <div
            key={index}
            className="bg-white border-2 border-gray-200 rounded-lg shadow-sm animate-fadeIn p-2.5 md:p-4"
          >
            {/* Clue and Guess Container */}
            <div className="flex flex-row items-start gap-2 md:gap-4 flex-wrap">
              {/* Clue */}
              <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                  {index + 1}
                </span>
                <p className="flex-1 text-gray-800 text-sm md:text-base leading-snug md:leading-relaxed">{clue}</p>
              </div>

              {/* Guess or Skip indicator - side by side, wraps only when necessary */}
              {hasGuess && (
                <div
                  className={`flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg border flex-shrink-0 ${
                    isSkipped
                      ? 'bg-blue-50 border-blue-200'
                      : isCorrectGuess
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {isSkipped ? (
                    <span className="text-xs md:text-sm text-blue-600 font-medium">Skipped</span>
                  ) : (
                    <>
                      <span className={`italic text-xs md:text-sm ${isCorrectGuess ? 'text-green-700' : 'text-gray-600'}`}>
                        "{guess}"
                      </span>
                      {!isCorrectGuess && <span className="text-red-500 text-sm">✗</span>}
                      {isCorrectGuess && <span className="text-green-600 text-sm">✓</span>}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
