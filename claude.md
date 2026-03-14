# ClueDrop - Technical Documentation

## Overview

ClueDrop is a daily puzzle game inspired by the Brazilian board game "Perfil". Players guess a mystery person by revealing clues one at a time. The application is built with a clean, testable architecture using React, TypeScript, and follows SOLID principles with dependency injection.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library
- **Storage**: LocalStorage (with abstraction for future API migration)
- **Architecture**: Clean Architecture with IoC/DI pattern

## Architecture

### Design Patterns

1. **Dependency Injection (IoC)**: All services are injected via a custom DI container
2. **Repository Pattern**: Data access abstracted through interfaces
3. **Service Layer**: Business logic separated from UI components
4. **Factory Pattern**: Model creation functions for consistent initialization
5. **Single Responsibility Principle**: Each service handles one concern

### Layer Structure

```
┌─────────────────────────────────────┐
│         React Components            │  (Presentation Layer)
│   - GameBoard, StatsModal, etc.    │
└──────────────┬──────────────────────┘
               │ uses
               ↓
┌─────────────────────────────────────┐
│      Dependency Injection           │  (IoC Container)
│     ServiceProvider & Container     │
└──────────────┬──────────────────────┘
               │ provides
               ↓
┌─────────────────────────────────────┐
│       Service Interfaces            │  (Domain Layer)
│  IGameService, IStorageService...  │
└──────────────┬──────────────────────┘
               │ implemented by
               ↓
┌─────────────────────────────────────┐
│    Service Implementations          │  (Infrastructure Layer)
│  GameService, LocalStorageService   │
└─────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Data Layer Abstraction**: The `IPuzzleRepository` interface allows switching from static data to API without changing game logic
2. **Testability**: All business logic is in pure functions/classes, testable without React
3. **Immutability**: State updates create new objects rather than mutating
4. **UTC Dates**: All date handling uses UTC to avoid timezone issues
5. **Progressive Enhancement**: Core logic works without UI, enabling future CLI/mobile versions

## Project Structure

```
twenty-clues/
├── src/
│   ├── domain/                    # Core business logic (framework-agnostic)
│   │   ├── models/                # Data models and types
│   │   │   ├── Puzzle.ts          # Puzzle interface
│   │   │   ├── GameState.ts       # Game state + factory
│   │   │   └── PlayerStats.ts     # Statistics + factory
│   │   └── services/              # Service interfaces (contracts)
│   │       ├── IPuzzleRepository.ts
│   │       ├── IGameService.ts
│   │       ├── IStorageService.ts
│   │       ├── IStatisticsService.ts
│   │       └── IShareService.ts
│   │
│   ├── infrastructure/            # Concrete implementations
│   │   ├── services/
│   │   │   ├── GameService.ts             # Game logic implementation
│   │   │   ├── GameService.test.ts        # 19 unit tests
│   │   │   ├── StatisticsService.ts       # Stats calculations
│   │   │   ├── StatisticsService.test.ts  # 15 unit tests
│   │   │   ├── ShareService.ts            # Share text generation
│   │   │   ├── ShareService.test.ts       # 7 unit tests
│   │   │   ├── StorageService.ts          # LocalStorage wrapper
│   │   │   └── StorageService.test.ts     # 7 unit tests
│   │   └── repositories/
│   │       ├── StaticPuzzleRepository.ts       # Client-side puzzle data
│   │       └── StaticPuzzleRepository.test.ts  # 8 unit tests
│   │
│   ├── di/                        # Dependency Injection
│   │   ├── Container.ts           # DI container (singleton)
│   │   └── ServiceContext.tsx     # React context provider
│   │
│   ├── components/                # React UI components
│   │   ├── Game/
│   │   │   ├── GameBoard.tsx      # Main game orchestrator
│   │   │   ├── ClueList.tsx       # Displays revealed clues
│   │   │   ├── GuessInput.tsx     # Guess form component
│   │   │   └── GameResult.tsx     # Win/loss screen
│   │   ├── Stats/
│   │   │   └── StatsModal.tsx     # Statistics display with charts
│   │   └── UI/
│   │       ├── Button.tsx         # Reusable button component
│   │       └── Modal.tsx          # Reusable modal component
│   │
│   ├── data/
│   │   └── puzzles.ts             # Sample puzzle data
│   │
│   ├── test/
│   │   └── setup.ts               # Test environment setup
│   │
│   ├── App.tsx                    # Root application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles + Tailwind
│
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite + Vitest configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── REQUIREMENTS.md                # Product requirements document
└── claude.md                      # This file
```

## Domain Models

### Puzzle

```typescript
interface Puzzle {
  id: number;                       // Sequential puzzle number
  date: string;                     // ISO date (YYYY-MM-DD)
  person: {
    name: string;                   // Canonical answer
    alternateNames: string[];       // Accepted variations
  };
  clues: string[];                  // 10 clues, general → specific
  metadata: {
    category: 'people';             // Future: expand categories
    difficulty?: number;
    source?: string;
  };
}
```

### GameState

```typescript
type GameStatus = 'in_progress' | 'won' | 'lost';

interface GameState {
  puzzleId: number;
  revealedClues: number;            // 0-10
  guesses: string[];                // All guesses made
  status: GameStatus;
  guessedAt?: number;               // Timestamp of win
}
```

### PlayerStats

```typescript
interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;            // Consecutive wins
  maxStreak: number;                // Best streak
  clueDistribution: Record<number, number>;  // Wins by clue count
  lastPlayedDate: string;           // ISO date
}
```

## Services

### IGameService

**Responsibility**: Game logic and business rules

**Key Methods**:
- `initializeGame(puzzle)` - Create new game state
- `revealNextClue(gameState)` - Reveal next clue (validates constraints)
- `submitGuess(gameState, puzzle, guess)` - Process guess and update state
- `isGuessCorrect(guess, puzzle)` - Fuzzy matching with normalization
- `isGameOver(gameState)` - Check completion status
- `canRevealClue(gameState)` - Validate if more clues available

**Implementation Details**:
- Normalizes strings (lowercase, removes accents, trims)
- Checks both main name and alternateNames
- Enforces 10-clue maximum
- Prevents actions on completed games

### IStatisticsService

**Responsibility**: Track and calculate player performance metrics

**Key Methods**:
- `updateStats(stats, gameState, puzzleDate)` - Update stats after game
- `getWinRate(stats)` - Calculate win percentage
- `getAverageClues(stats)` - Calculate average clues to win

**Implementation Details**:
- Tracks consecutive day streaks (UTC-based)
- Resets streak on loss or skipped day
- Maintains clue distribution histogram
- Calculates weighted averages

### IShareService

**Responsibility**: Generate shareable game results

**Key Methods**:
- `generateShareText(puzzleNumber, gameState, appUrl)` - Create share text
- `copyToClipboard(text)` - Copy to clipboard with fallback

**Share Format**:
```
ClueDrop #42 💧
Guessed in 5 clues!

1️⃣2️⃣3️⃣4️⃣✅

Play at: https://cluedrop.com
```

### IStorageService

**Responsibility**: Persist game data locally

**Key Methods**:
- `getGameState()` / `saveGameState(state)` / `clearGameState()`
- `getPlayerStats()` / `savePlayerStats(stats)`

**Implementation**: LocalStorageService uses browser localStorage with JSON serialization

### IPuzzleRepository

**Responsibility**: Provide puzzle data

**Key Methods**:
- `getPuzzleForDate(date)` - Get puzzle for specific date
- `getPuzzleById(id)` - Get puzzle by ID
- `getAllPuzzles()` - Get all available puzzles

**Current Implementation**: StaticPuzzleRepository (client-side data)
**Future Implementation**: ApiPuzzleRepository (fetch from backend)

## Dependency Injection

### Container Setup

```typescript
// Create singleton container
const container = Container.getInstance();

// Access services
const gameService = container.gameService;
const storageService = container.storageService;
```

### React Integration

```typescript
// Provide services to component tree
<ServiceProvider>
  <App />
</ServiceProvider>

// Use services in components
function MyComponent() {
  const { gameService, storageService } = useServices();
  // ...
}
```

### Testing with DI

```typescript
// Create test container with mocks
const mockContainer = new Container();
mockContainer.storageService = mockStorageService;

// Render with custom container
<ServiceProvider container={mockContainer}>
  <ComponentUnderTest />
</ServiceProvider>
```

## Testing Strategy

### Unit Tests (56 tests, all passing ✅)

**Coverage**:
- GameService: 19 tests (guess validation, state transitions, edge cases)
- StatisticsService: 15 tests (streak calculations, averages, distributions)
- ShareService: 7 tests (text generation, clipboard functionality)
- StorageService: 7 tests (save/load/clear operations)
- StaticPuzzleRepository: 8 tests (date matching, UTC handling)

**Running Tests**:
```bash
npm test              # Watch mode
npm run test:ui       # UI interface
npm run test:coverage # Coverage report
```

### Test Patterns

```typescript
// Arrange
const gameService = new GameService();
const puzzle = createMockPuzzle();

// Act
const result = gameService.submitGuess(gameState, puzzle, 'Einstein');

// Assert
expect(result.isCorrect).toBe(true);
expect(result.gameState.status).toBe('won');
```

## Game Flow

### Initialization

1. App loads and requests today's puzzle from `IPuzzleRepository`
2. Container provides all required services via DI
3. GameBoard checks for existing `GameState` in storage
4. If exists and matches puzzle ID → resume game
5. If not → initialize new game via `IGameService.initializeGame()`

### Playing the Game

1. User clicks "Reveal First Clue"
   - `GameService.revealNextClue()` increments `revealedClues`
   - New clue appears in ClueList component

2. User types guess and submits
   - `GameService.submitGuess()` validates and compares
   - If correct → status = 'won', trigger stats update
   - If incorrect → add to guesses array, allow next clue

3. Repeat until win or 10 clues exhausted

4. Game ends
   - `StatisticsService.updateStats()` calculates new stats
   - Stats saved via `IStorageService`
   - Share button appears

### Statistics Update

```typescript
// When game completes
if (gameService.isGameOver(gameState)) {
  const stats = storageService.getPlayerStats();
  const updatedStats = statisticsService.updateStats(
    stats,
    gameState,
    puzzle.date
  );
  storageService.savePlayerStats(updatedStats);
}
```

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test
```

### Building

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Adding a New Puzzle

```typescript
// In src/data/puzzles.ts
export const PUZZLES: Puzzle[] = [
  // ... existing puzzles
  {
    id: 6,
    date: '2026-03-10',
    person: {
      name: 'Leonardo da Vinci',
      alternateNames: ['Leonardo', 'da Vinci', 'Da Vinci'],
    },
    clues: [
      'I was a polymath from the Renaissance period.',
      'I was born in Italy in 1452.',
      // ... 8 more clues
    ],
    metadata: {
      category: 'people',
      difficulty: 3,
      source: 'manual',
    },
  },
];
```

## Extending the Application

### Adding a Backend API

1. Create `ApiPuzzleRepository`:

```typescript
export class ApiPuzzleRepository implements IPuzzleRepository {
  constructor(private baseUrl: string) {}

  async getPuzzleForDate(date: Date): Promise<Puzzle | null> {
    const dateStr = formatDate(date);
    const response = await fetch(`${this.baseUrl}/puzzles/${dateStr}`);
    if (!response.ok) return null;
    return response.json();
  }
  // ... implement other methods
}
```

2. Update Container:

```typescript
// In Container.ts
private constructor() {
  this._puzzleRepository = new ApiPuzzleRepository(
    import.meta.env.VITE_API_URL
  );
  // ... rest of services
}
```

### Adding User Accounts

1. Create `IAuthService` interface
2. Implement authentication service
3. Modify `IStorageService` to sync with backend
4. Add authentication wrapper around App

### Adding New Categories

1. Update `Puzzle` metadata type:
```typescript
metadata: {
  category: 'people' | 'places' | 'movies' | 'events';
  // ...
}
```

2. Add category selector in UI
3. Filter puzzles by category in repository

### Mobile App (React Native)

The clean architecture enables easy React Native conversion:

1. Keep all domain logic (models, services)
2. Keep all infrastructure implementations
3. Keep DI container
4. Replace React components with React Native equivalents
5. Replace `LocalStorageService` with `AsyncStorageService`

## Performance Considerations

### Bundle Size

- Tailwind CSS purging reduces CSS to ~10KB
- No heavy dependencies (React + minimal libraries)
- Lazy loading for modals and stats

### Runtime Performance

- Immutable state updates prevent unnecessary re-renders
- Service instances are singletons (no recreation)
- LocalStorage operations are synchronous (fast)
- Date calculations use UTC (no timezone library needed)

### Optimization Opportunities

1. Code splitting for stats modal
2. Service worker for offline support
3. Image optimization for puzzle thumbnails (future)
4. Debounce guess input validation

## Security Considerations

### Current (Client-Side)

- Puzzles are visible in source code (acceptable for POC)
- LocalStorage is per-domain (no cross-site access)
- No sensitive data stored

### Future (With Backend)

- Implement API authentication
- Rate limiting on puzzle requests
- Content Security Policy headers
- HTTPS only in production

## Deployment

### Static Hosting (Current)

**Recommended Platforms**: Vercel, Netlify, GitHub Pages

**Build Command**: `npm run build`
**Output Directory**: `dist`

**Vercel Deployment**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Environment Variables**: None required for static version

### Future Backend Deployment

- Frontend: Same static hosting
- Backend: Railway, Render, AWS Lambda
- Database: PostgreSQL (Supabase/Neon) or MongoDB Atlas
- CDN: Cloudflare for static assets

## Troubleshooting

### Tests Failing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Date Mismatch Issues

The app uses UTC dates. If puzzle doesn't appear:
1. Check puzzle dates are formatted as `YYYY-MM-DD`
2. Verify `StaticPuzzleRepository.formatDate()` uses UTC methods
3. Test with `new Date('2026-03-05')` (UTC midnight)

### LocalStorage Not Persisting

- Check browser privacy settings
- Verify not in incognito/private mode
- Clear browser cache if corrupted
- Check browser console for errors

## Future Enhancements

### Phase 2 (Polish)
- [ ] Dark mode
- [ ] Animations for clue reveals
- [ ] Keyboard navigation
- [ ] Tutorial/help modal
- [ ] Accessibility improvements (ARIA labels)

### Phase 3 (Content)
- [ ] AI-assisted puzzle generation script
- [ ] Editorial review workflow
- [ ] 30+ days of puzzles
- [ ] Difficulty ratings

### Phase 4 (Features)
- [ ] Multiple categories (places, movies, events)
- [ ] Archive mode (replay old puzzles)
- [ ] Hint system (skip clue with penalty)
- [ ] Daily leaderboard (with backend)
- [ ] Social sharing to Twitter/Facebook

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow SOLID principles
- Write unit tests for all business logic
- Use functional components and hooks
- Prefer composition over inheritance

### Git Workflow

1. Create feature branch from main
2. Implement feature with tests
3. Ensure all tests pass (`npm test`)
4. Build succeeds (`npm run build`)
5. Create pull request

### Pull Request Checklist

- [ ] All tests passing
- [ ] New code has unit tests
- [ ] TypeScript compiles without errors
- [ ] Components are accessible (ARIA labels)
- [ ] Mobile responsive
- [ ] Updated documentation if needed

## License

[Your chosen license]

## Contact

[Your contact information]

---

**Built with Claude Code** 🤖
Generated: 2026-03-05
