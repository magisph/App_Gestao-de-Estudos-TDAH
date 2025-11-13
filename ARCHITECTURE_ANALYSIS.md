# Architecture Analysis - App Gestão de Estudos TDAH

## Project Overview

**Type:** Progressive Web App (PWA)  
**Framework:** React 18 + Vite 5  
**Styling:** Tailwind CSS + Custom CSS Variables  
**State Management:** React Context + useReducer  
**Package Manager:** npm  

---

## Directory Structure

```
project/
├── public/
│   ├── index.html              # Main HTML file
│   ├── manifest.webmanifest    # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── offline.html            # Offline fallback
│   └── icons/                  # App icons
├── src/
│   ├── index.jsx              # React entry point
│   ├── App.jsx                # Root component
│   ├── App.css                # Global styles
│   ├── context/               # State management
│   │   ├── AppContext.jsx     # Main context + reducer
│   │   └── SessionManager.jsx # ⚠️ Component in wrong location
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx     # Top navigation
│   │   │   └── Sidebar.jsx    # Discipline sidebar
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx  # Main dashboard
│   │   ├── session/
│   │   │   └── SessionManager.jsx # ⚠️ Actual file in context/
│   │   ├── calendar/
│   │   │   └── Calendar.jsx   # Calendar view
│   │   └── progress/
│   │       └── ProgressView.jsx # Progress analytics
│   ├── utils/
│   │   ├── dateUtils.js       # Date calculations
│   │   └── pwaUtils.js        # PWA helpers
│   ├── assets/
│   │   └── ??? (reference in code but actual: data/)
│   └── data/
│       └── arquivo.json       # Disciplines data
├── package.json
├── vite.config.js
├── .gitignore
└── .deepsource.toml
```

---

## Component Architecture

### Top-Level Component Tree

```
<App>
  └── <AppProvider>
      └── <AppContent>
          ├── <Header>
          │   ├── Theme toggle
          │   ├── PWA install button
          │   └── Navigation (desktop/mobile)
          ├── <Sidebar>
          │   ├── Discipline list (with filtering)
          │   └── Theme selection
          └── <main>
              ├── <Dashboard> (if currentView === 'dashboard')
              ├── <SessionManager> (if currentView === 'session')
              ├── <Calendar> (if currentView === 'calendar')
              └── <ProgressView> (if currentView === 'progress')
```

---

## State Management Architecture

### AppContext State Structure

```javascript
{
  // Disciplines Data
  disciplinas: [
    {
      id, nome, color, priority_default,
      themes: [
        { id, nome, default_estimate_minutes, subtemas }
      ],
      captureHints: []
    }
  ],
  
  // Current Session
  currentSession: {
    id, disciplinaId, themeId, subtema,
    estimatedTime, status, notes, distractions,
    createdAt, actualTime, completedAt
  } | null,
  
  // Session History
  sessions: [
    { ...session data... }
  ],
  
  // User Settings
  settings: {
    theme: 'light' | 'dark' | 'system',
    defaultTimerType: 'pomodoro',
    pomodoroSettings: { workTime, shortBreak, longBreak, longBreakInterval },
    notifications: boolean,
    soundEnabled: boolean,
    autoStartBreaks: boolean
  },
  
  // Timer State
  timer: {
    isActive, isPaused, timeLeft, totalTime,
    type: 'work' | 'shortBreak' | 'longBreak',
    sessionCount
  },
  
  // Captured Distractions
  distractions: [
    { id, text, timestamp, resolved }
  ],
  
  // UI State
  ui: {
    sidebarOpen: boolean,
    currentView: 'dashboard' | 'session' | 'progress' | 'calendar',
    selectedDisciplina: null | Disciplina,
    selectedTheme: null | Theme
  },
  
  // PWA State
  pwa: {
    isInstalled: boolean,
    isOnline: boolean,
    canInstall: boolean,
    updateAvailable: boolean,
    support: { serviceWorker, manifest, ... }
  }
}
```

### Actions (Reducer)

**25 Total Actions:**

#### Session Management (6)
- START_SESSION
- END_SESSION
- PAUSE_SESSION
- RESUME_SESSION
- UPDATE_SESSION_NOTES

#### Timer Control (6)
- START_TIMER
- PAUSE_TIMER
- RESUME_TIMER
- STOP_TIMER
- TICK_TIMER
- SWITCH_TIMER_MODE

#### Distraction Tracking (3)
- ADD_DISTRACTION
- RESOLVE_DISTRACTION
- CLEAR_DISTRACTIONS

#### Settings & UI (6)
- UPDATE_SETTINGS
- SET_THEME
- SET_CURRENT_VIEW
- TOGGLE_SIDEBAR
- SELECT_DISCIPLINA
- SELECT_THEME

#### Data & PWA (4)
- LOAD_DATA
- SAVE_DATA
- SET_PWA_STATUS
- SET_ONLINE_STATUS
- SET_INSTALL_PROMPT

---

## Data Flow

### Session Flow
```
User selects Discipline/Theme in Sidebar
    ↓
Sidebar dispatches SELECT_DISCIPLINA + SELECT_THEME
    ↓
SessionManager displays "Start Session" UI
    ↓
User clicks "Start Session" button
    ↓
SessionManager dispatches START_SESSION
    ↓
AppContext updates:
  - currentSession created
  - timer started
  - UI view → 'session'
    ↓
Timer Effect runs every second:
  - Dispatches TICK_TIMER
  - Timer decrements
    ↓
User clicks "Finish" or timer ends
    ↓
SessionManager dispatches END_SESSION
    ↓
AppContext:
  - currentSession moved to sessions[]
  - Saved to localStorage
  - UI view → 'dashboard'
```

### Data Persistence Flow
```
State changes (sessions, settings, distractions)
    ↓
useEffect watches state.sessions, state.settings, state.distractions
    ↓
Serializes to JSON
    ↓
Saves to localStorage['gestao-estudos-data']
    ↓
On app load:
  - AppContext reads from localStorage
  - Dispatches LOAD_DATA
  - Merges with initialState
```

### PWA Lifecycle
```
App initializes
    ↓
useEffect in AppContext calls initializePWA()
    ↓
registerManifest() - Creates dynamic manifest
    ↓
registerServiceWorker() - Registers /sw.js
    ↓
setupPWAListeners() - Listens for:
  - online/offline events
  - beforeinstallprompt
  - appinstalled
    ↓
checkPWASupport() - Detects capabilities
    ↓
Dispatches SET_PWA_STATUS with support info
```

---

## Feature Breakdown

### 1. Dashboard (`Dashboard.jsx`)
**Purpose:** Overview of study progress  
**Key Features:**
- Days remaining to exam countdown
- Statistics cards (sessions, hours, disciplines, average)
- Progress bar for schedule completion
- Discipline-specific progress breakdown
- Suggested sessions (high priority, not yet studied)
- Quick start buttons (2-min Zeigarnik, Full session)

**Data Used:**
- `state.sessions` - Calculate statistics
- `state.disciplinas` - Show progress
- `state.currentSession` - Show active session badge

**Interactions:**
- Navigate to calendar
- Start quick sessions
- View full session manager

---

### 2. Session Manager (`SessionManager.jsx`)
**Purpose:** Active study session interface  
**Key Features:**
- Discipline/Theme selection UI
- Study mode selection (Pomodoro, Flowtime, Custom)
- Timer with pause/resume/reset/stop
- Progress bar for timer
- Distraction capture (quick note-taking)
- Session notes textarea

**Components Used (UI Library):**
- Button, Card, Textarea, Input, Badge, Progress

**Data Used:**
- `state.currentSession` - Show active session
- `state.timer` - Display time
- `state.distractions` - Show captured thoughts

**Interactions:**
- Start/pause/resume timer
- Capture distractions
- Take session notes
- End session

---

### 3. Calendar (`Calendar.jsx`)
**Purpose:** Visualize study schedule and progress  
**Key Features:**
- Monthly calendar view
- Daily session count and time display
- Daily goal indicator (checkmark if met)
- Weekly schedule summary
- Weekly goal tracking
- Calendar insights (warnings, recommendations)
- Day details modal
- Date navigation

**Data Used:**
- `state.sessions` - Plot on calendar
- `state.disciplinas` - Show in daily details
- Date utilities - Calculate goals and progress

**Interactions:**
- Navigate months
- Click day for details
- Start session from day view

---

### 4. Progress View (`ProgressView.jsx`)
**Purpose:** Detailed analytics and achievements  
**Key Features:**
- Overall meta progress to exam approval
- Weekly session statistics (last 4 weeks)
- Per-discipline progress bars
- Achievement badges (milestones)
- Insights & recommendations based on data

**Data Calculated:**
- Total sessions, total time, days studied
- Average sessions/day, average time/day
- Weekly breakdown
- Per-discipline: sessions, time, themes studied

**Insights Logic:**
- If avg_time < 60min: "Increase daily time"
- If many disciplines < 20%: "Focus on priority"
- If avg_sessions ≥ 2/day: "Excellent consistency"

---

### 5. Header (`Header.jsx`)
**Purpose:** Top navigation and settings  
**Key Features:**
- Logo with days remaining counter
- Desktop navigation (Dashboard, Session, Calendar, Progress)
- Mobile navigation (bottom bar)
- Theme toggle (Light/Dark/System)
- PWA install button
- Mobile menu toggle

**PWA Features:**
- Listens for `beforeinstallprompt` event
- Prompts user to install app
- Handles user choice

---

### 6. Sidebar (`Sidebar.jsx`)
**Purpose:** Discipline and theme selection  
**Key Features:**
- Filterable discipline list (by priority)
- Expandable themes per discipline
- Theme details (icon, name, estimate time)
- Selected state highlighting
- Productivity hints display
- Mobile close button

**Filtering:**
- All, Alta, Média, Baixa priority levels

---

## Utility Functions

### `dateUtils.js` - Date Calculations
```javascript
EXAM_DATE = 2025-09-28

getCurrentDate()           // Dev: 2025-08-27, Prod: new Date()
getDaysRemaining()        // Days until exam
getDaysPassed()          // Days since start
getScheduleProgress()     // Percentage of schedule complete

isToday(date)            // Check if date is today
isThisWeek(date)         // Check if date is this week

formatDate(date, format) // pt-BR formatted date

getWeeksRemaining()      // Weeks until exam
generateWeeklySchedule() // 5-week schedule array

getDailyStudyGoal()      // Minutes per day to meet 200h goal
isOnTrack(totalTime)     // Check if meeting goals

getCalendarInsights()    // Generate insights array
getIdealTimeDistribution() // Recommend time per discipline
```

### `pwaUtils.js` - PWA Features
```javascript
generateManifest()           // Create dynamic manifest
registerManifest()          // Inject manifest link
registerServiceWorker()     // Register /sw.js
isAppInstalled()           // Check if installed
isOffline()               // Check online status
setupPWAListeners()       // Add event listeners
checkPWASupport()         // Detect capabilities
getCacheConfig()          // Cache strategy config
initializePWA()           // Main initialization
```

---

## Data Sources

### `arquivo.json` Structure
```javascript
{
  meta: {
    title: "Estrutura de Disciplinas - PWA Gestão de Estudos (TJ-CE)",
    source: "index (6).html",
    note: "Temas e subtemas extraídos do cronograma/anexo..."
  },
  disciplinas: [
    {
      id: string
      nome: string (e.g., "Direito Civil")
      slug: string
      color: string (hex color)
      priority_default: 'alta' | 'média' | 'baixa'
      icon: string (URL)
      themes: [
        {
          id: string
          nome: string
          default_estimate_minutes: number
          subtemas: string[]
        }
      ]
      captureHints: string[]
    }
  ]
}
```

**Sample Disciplines:**
- Direito Civil (HIGH priority, 4 themes)
- Direito Processual Civil (HIGH priority, 4 themes)
- Direito Criminal (HIGH priority, 2 themes)
- Direito Penal (MEDIUM priority, 2 themes)
- [+more...]

**Total Coverage:** Multiple areas of law for TJ-CE exam preparation

---

## Storage Strategy

### localStorage Keys
```javascript
'gestao-estudos-data' => {
  sessions: [
    {
      id, disciplinaId, themeId, subtema,
      estimatedTime, status, notes, distractions,
      createdAt, actualTime, completedAt
    }
  ],
  settings: { theme, defaultTimerType, ... },
  distractions: [{ id, text, timestamp, resolved }]
}
```

### Data Persistence Rules
- Saved on every state change (sessions, settings, distractions)
- Loaded on app initialization
- No database backend (PWA offline-first approach)
- 5-10MB typical storage per user

---

## PWA Features

### Service Worker (`sw.js`)
- Offline support
- Cache strategies
- Background sync (if implemented)

### Manifest (`manifest.webmanifest`)
- App metadata
- Installation prompts
- Icons and themes
- App shortcuts

### Offline Support
- Offline.html fallback page
- localStorage for data backup
- App shell caching

---

## Styling Architecture

### CSS Variables (in App.css)
```css
/* Color system */
--background, --foreground, --card, --border, etc.

/* Light mode values (OKLCH color space)
Dark mode overrides (.dark selector)

/* Radius tokens */
--radius-sm, --radius-md, --radius-lg, --radius-xl

/* Sidebar theming */
--sidebar, --sidebar-foreground, --sidebar-primary, etc.

/* Chart colors */
--chart-1 through --chart-5
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg (Tailwind defaults)
- Flexible sidebar (fixed on desktop, hamburger on mobile)
- Bottom navigation for mobile

---

## Performance Characteristics

### Strengths
- ✅ Small component tree depth
- ✅ Efficient state updates (useReducer)
- ✅ useMemo for expensive calculations
- ✅ Service Worker caching
- ✅ Lazy loading potential (not implemented)

### Potential Issues
- ⚠️ No code splitting
- ⚠️ Could memoize more components
- ⚠️ Discipline.json can grow large
- ⚠️ Weekly calculations recreated monthly

### Recommendations
- Implement React.lazy() for route code splitting
- Add more useMemo/useCallback
- Consider virtual scrolling if disciplines grow
- Optimize calendar calculations with memoization

---

## Security Considerations

### Vulnerabilities
- ✅ No XSS risk (React escapes by default)
- ✅ No SQL injection (no database)
- ✅ localStorage accessible to any script on domain
- ⚠️ Service Worker should validate cache

### Recommendations
- Add Content Security Policy headers
- Implement authentication if multi-user
- Encrypt sensitive data before localStorage
- Validate service worker cache integrity

---

## Testing Strategy

### Unit Tests Needed
```javascript
// dateUtils
- getDaysRemaining() ← varies by current date
- isToday()
- formatDate()
- getDailyStudyGoal()

// pwaUtils
- checkPWASupport()
- getCacheConfig()
```

### Component Tests Needed
```javascript
// Dashboard
- Renders statistics correctly
- Suggested sessions appear
- Navigation works

// SessionManager
- Timer counts down
- Distractions capture
- Session notes save

// Calendar
- Month navigation
- Day selection
- Details display

// ProgressView
- Calculations accurate
- Achievements appear
```

### Integration Tests
```javascript
- Session creation → appears in calendar
- Settings save → persist on reload
- PWA install flow
- Offline functionality
```

---

## Potential Improvements

### Short Term (1-2 sprints)
1. Fix all import paths ⭐ CRITICAL
2. Add TypeScript
3. Implement error boundaries
4. Add loading states
5. Better empty state UI
6. Accessibility improvements

### Medium Term (1-2 months)
1. Code splitting by route
2. PWA push notifications
3. Background sync for data
4. Advanced analytics
5. Dark mode improvements
6. Theme customization

### Long Term (3+ months)
1. Multi-device sync (backend)
2. Social features (share progress)
3. AI study recommendations
4. Gamification (leaderboards)
5. Mobile app wrapper (Capacitor/Tauri)
6. Export/import sessions

---

## Deployment Checklist

Before production:
- [ ] Fix all build errors
- [ ] Run ESLint
- [ ] Add tests
- [ ] Update date utilities for production
- [ ] Configure PWA cache strategy
- [ ] Set up HTTPS
- [ ] Add analytics
- [ ] Test offline mode
- [ ] Performance audit
- [ ] Security audit
- [ ] Accessibility audit

---

## Conclusion

The architecture is **sound and scalable**. Main issues are:
1. Incomplete dependency installation
2. Import path inconsistencies
3. Missing configurations

Once fixed, the app will be:
- ✅ Fully functional PWA
- ✅ Great offline support
- ✅ Responsive design
- ✅ Solid state management
- ✅ Ready for production with minor enhancements

**Estimated refactor time:** 1-2 hours for critical fixes
