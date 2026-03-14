# ClueDrop - Requirements Document

## Project Overview

**ClueDrop** is a daily guessing game inspired by the Brazilian board game "Perfil". Players guess a mystery person by revealing clues one at a time. The game is designed to be shareable, engaging, and accessible to a global audience.

### Core Concept
- One new puzzle daily featuring a globally recognized person
- 10 clues revealed sequentially (clue 1 → clue 2 → ... → clue 10)
- Players make one guess after revealing each clue
- Win condition: Correctly guess the person
- Loss condition: Exhaust all 10 clues without guessing correctly

### Project Goals
1. Create an engaging daily puzzle experience
2. Build a POC quickly while maintaining clean, scalable architecture
3. Host for free (or very cheap) as a static web app
4. Design for future expansion (additional categories, mobile apps, backend services)

---

## Game Mechanics

### Clue Revelation
- **Sequential Order**: Clues must be revealed in order (1, 2, 3, etc.)
- Players cannot skip ahead or choose which clue to reveal
- Each revealed clue enables one guess attempt
- Clues progress from general to more specific

### Guessing Mechanics
- **Text Input**: Free-form text input for guesses
- **Unlimited Attempts**: Players can make incorrect guesses without penalty (beyond revealing another clue)
- **Guess Validation**: Case-insensitive, fuzzy matching to account for:
  - Slight misspellings
  - Name variations (e.g., "Bill Gates" vs "William Gates")
  - Accented characters
- **One Guess Per Clue**: After revealing clue N, player can make one guess before revealing clue N+1

### Game States
1. **In Progress**: Player is actively revealing clues and guessing
2. **Won**: Player guessed correctly
3. **Lost**: All 10 clues revealed without correct guess
4. **Completed**: Game finished (won or lost) for the day

### Daily Puzzle System
- One unique puzzle per day (resets at midnight local time or UTC)
- Puzzle number increments daily (e.g., "ClueDrop #1", "#2", etc.)
- All players worldwide see the same puzzle on the same day
- Previous puzzles cannot be replayed (for now)

---

## Content Requirements

### Target Subjects
- **Category**: People (to start)
- **Recognition Criteria**: Globally recognized figures, particularly in the Americas
- **Examples**: Historical figures, celebrities, athletes, scientists, political leaders, artists

### Clue Guidelines
1. **Factual & Verifiable**: Only confirmed, documented facts
2. **Non-Controversial**: Avoid divisive political stances, unverified claims, or sensitive topics
3. **Progressively Specific**: Early clues are vague, later clues are more specific
4. **Standalone Clarity**: Each clue should be clear on its own but vague enough to require multiple clues
5. **Accessible Language**: No jargon or overly technical terms
6. **Cultural Sensitivity**: Appropriate for global audience

### Clue Difficulty Progression (10 clues total)
- **Clues 1-3**: Very general (profession, era, nationality, broad accomplishments)
- **Clues 4-6**: Moderately specific (notable works, major achievements, associations)
- **Clues 7-9**: More specific (specific dates, lesser-known facts, unique attributes)
- **Clue 10**: Very specific (should make the answer obvious if not already guessed)

### Content Generation Strategy
- **AI-Assisted with Review**:
  - Use AI (ChatGPT, Claude, etc.) to generate candidate puzzles
  - Manual editorial review for accuracy, appropriateness, and quality
  - Fact-checking against reliable sources
  - Test puzzles internally before scheduling
- **Content Pipeline**: Maintain 2-4 weeks of reviewed puzzles ready to deploy

---

## User Experience

### Core User Flow
1. User visits site
2. Game board shows current puzzle number and date
3. User clicks "Reveal Clue 1"
4. Clue appears, guess input becomes active
5. User types guess and submits
6. Feedback shown (correct/incorrect)
7. If incorrect: "Reveal Clue 2" button becomes available
8. Repeat until win or loss
9. End screen shows results and share button

### Player Statistics (Local Storage)
Track and display:
- **Current Streak**: Consecutive days won
- **Max Streak**: Best streak achieved
- **Games Played**: Total puzzles attempted
- **Win Rate**: Percentage of games won
- **Average Clues**: Average number of clues needed to win

### Share Feature
Format similar to Wordle:
```
ClueDrop #42 💧
Guessed in 5 clues!

1️⃣2️⃣3️⃣4️⃣✅

Play at: [URL]
```

Where:
- **Game Number**: Sequential puzzle number
- **Win/Loss Indicator**: "Guessed in X clues!" or "Couldn't guess it 😔"
- **Emoji Pattern**:
  - 1️⃣2️⃣3️⃣ etc. = Clues revealed (wrong guesses)
  - ✅ = Correct guess
  - For losses: 1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟 (all 10 clues revealed)

### Visual Design Considerations
- Clean, minimal interface
- Mobile-first responsive design
- Accessible (WCAG 2.1 AA compliance)
- Smooth animations for clue reveals
- Clear visual feedback for guesses
- Dark mode support (optional for POC)

---

## Technical Architecture

### Core Principles
1. **Data Layer Abstraction**: Isolate data access to enable easy backend migration
2. **Client-Side First**: Start with static deployment, zero backend costs
3. **Mobile-Ready**: Clean component architecture suitable for future React Native port
4. **Progressive Enhancement**: Work without JavaScript for core content (optional)

### Technology Stack (Recommended)

#### Frontend Framework
- **React** with **TypeScript**
  - Large ecosystem, easy transition to React Native
  - Strong typing for maintainability
  - Excellent tooling and community support

#### Build Tool
- **Vite**
  - Fast development experience
  - Optimized production builds
  - Simple configuration

#### Styling
- **Tailwind CSS**
  - Rapid development
  - Small bundle size with purging
  - Consistent design system
  - Mobile-first utilities

#### State Management
- **React Context** or **Zustand** (lightweight)
  - No need for Redux complexity in POC
  - Easy to migrate to more robust solution later

#### Data Storage
- **LocalStorage** (POC)
  - Game progress (current day's guesses)
  - Player statistics
  - Completed puzzle IDs

### Data Layer Architecture

```typescript
// Abstract interface for data access
interface PuzzleDataSource {
  getPuzzleForDate(date: Date): Promise<Puzzle>;
  getAllPuzzles(): Promise<Puzzle[]>;
}

// Implementation 1: Client-side (POC)
class StaticPuzzleDataSource implements PuzzleDataSource {
  // Puzzles embedded in build
}

// Implementation 2: Future API (when needed)
class ApiPuzzleDataSource implements PuzzleDataSource {
  // Fetch from backend
}
```

This abstraction allows switching from client-side to API without changing game logic.

### Puzzle Data Format

```typescript
interface Puzzle {
  id: number;              // Sequential puzzle number
  date: string;            // ISO date string (YYYY-MM-DD)
  person: {
    name: string;          // Canonical name
    alternateNames: string[]; // Accepted variations
  };
  clues: string[];         // Array of 10 clues
  metadata: {
    category: 'people';    // Future: expand categories
    difficulty?: number;   // Optional difficulty rating
    source?: string;       // Where this puzzle came from
  };
}
```

### Hosting Strategy (POC)
- **Platform**: Vercel, Netlify, or GitHub Pages
- **Cost**: Free tier
- **Deployment**: Automatic via Git push
- **Custom Domain**: Optional (~$12/year)

### Future Backend Considerations
When/if we need a backend:
- **API**: Node.js (Express/Fastify) or serverless functions
- **Database**: PostgreSQL or MongoDB
- **Authentication**: Optional (OAuth, JWT)
- **Hosting**: Railway, Render, or AWS free tier

---

## Data Model

### Client-Side Storage (LocalStorage)

#### Game State
```typescript
interface GameState {
  puzzleId: number;
  revealedClues: number;      // How many clues revealed (0-10)
  guesses: string[];           // List of guesses made
  status: 'in_progress' | 'won' | 'lost';
  guessedAt?: number;          // Timestamp of correct guess
}
```

#### Player Statistics
```typescript
interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  clueDistribution: {
    1: number,  // Won with 1 clue
    2: number,  // Won with 2 clues
    // ... up to 10
  };
  lastPlayedDate: string;
}
```

---

## Development Phases

### Phase 1: POC / MVP (Week 1-2)
**Goal**: Playable game with core mechanics

- [ ] Project setup (Vite + React + TypeScript + Tailwind)
- [ ] Data structure and static puzzle data (5-10 puzzles)
- [ ] Core game logic (clue revelation, guessing, win/loss)
- [ ] Basic UI (puzzle display, input, feedback)
- [ ] LocalStorage integration (game state persistence)
- [ ] Date-based puzzle selection
- [ ] Share feature
- [ ] Deploy to hosting platform

### Phase 2: Polish & Statistics (Week 3)
**Goal**: Enhanced user experience

- [ ] Player statistics tracking
- [ ] Statistics display page
- [ ] Improved UI/UX (animations, feedback)
- [ ] Responsive design refinement
- [ ] Tutorial/instructions modal
- [ ] Error handling and edge cases
- [ ] Accessibility improvements

### Phase 3: Content Pipeline (Week 4)
**Goal**: Sustainable content creation process

- [ ] AI-assisted puzzle generation script
- [ ] Editorial review workflow
- [ ] Fact-checking guidelines document
- [ ] 30 days of puzzles created and reviewed
- [ ] Content calendar system

### Phase 4: Future Enhancements (Post-Launch)
**Goal**: Expand and scale

- [ ] Backend API (puzzle service)
- [ ] User accounts (optional)
- [ ] Archive mode (replay old puzzles)
- [ ] Multiple categories (places, movies, etc.)
- [ ] Leaderboards (if backend implemented)
- [ ] Mobile app (React Native)
- [ ] Internationalization (multiple languages)
- [ ] Puzzle difficulty ratings
- [ ] Community-submitted puzzles (moderated)

---

## Success Metrics

### POC Success Criteria
- [ ] Game loads and runs without errors
- [ ] Daily puzzle changes correctly
- [ ] Win/loss mechanics work correctly
- [ ] Share feature generates correct output
- [ ] Works on mobile and desktop browsers
- [ ] Game state persists across browser sessions

### Post-Launch Metrics (if analytics added)
- Daily active users
- Completion rate (% of players who finish daily puzzle)
- Average clues to win
- Share button usage
- User retention (day 2, day 7, day 30)

---

## Open Questions & Future Decisions

1. ~~**Name**: Is "Twenty Clues" final? (Note: We're using 10 clues, not 20)~~ **RESOLVED: ClueDrop**
2. **Branding**: Logo, color scheme, visual identity?
3. **Social Media**: Integration with Open Graph tags for rich link previews?
4. **Analytics**: Google Analytics, Plausible, or none for POC?
5. **Monetization**: Ads, donations, premium features? (Future consideration)
6. **Moderation**: How to handle offensive guesses in input field? (If we log data)
7. **Accessibility**: Screen reader support, keyboard navigation priority level?
8. **SEO**: Do we want discoverability, or is this word-of-mouth initially?

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content quality issues | High | Manual review process, clear guidelines, testing |
| Puzzles too easy/hard | Medium | Playtesting, adjustable clue progression, feedback loop |
| Client-side data visible | Low | Expected for POC; add backend when needed |
| Browser compatibility | Medium | Test on major browsers, use modern but stable APIs |
| Running out of content | High | Build 30-day buffer, establish content pipeline early |
| User confusion about rules | Medium | Clear tutorial, instructions always accessible |

---

## Technical Constraints

- Must work on iOS Safari, Chrome, Firefox, Edge (latest 2 versions)
- Must be responsive (mobile and desktop)
- Initial load time < 2 seconds on 3G
- Bundle size < 500KB (gzipped)
- No backend/server costs for POC
- Works with JavaScript disabled (degraded experience acceptable)

---

## Next Steps

1. **Review & Refine** this document with stakeholders
2. **Create initial puzzle set** (10-30 puzzles for testing)
3. **Set up development environment** (repo, tools, CI/CD)
4. **Begin Phase 1 development** following the roadmap above
5. **Establish content creation workflow** for ongoing puzzle generation

---

*Document Version: 1.0*
*Last Updated: 2026-03-05*
*Owner: [Your Name]*
