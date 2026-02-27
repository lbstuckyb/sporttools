# Tournament Manager — Generation Prompt

> Use this prompt to generate a single-file tournament management tool for round-robin scheduling and standings calculation.

---

## Project Overview

Build a **single, self-contained HTML file** called `tournament-manager.html` that handles two core tournament workflows:

1. **Schedule Generation** — Create a round-robin fixture list with conflict-free court and time assignments
2. **Standings Calculation** — Calculate rankings from match results

### Core Constraints

- **Single HTML file** — No build step, no external files except CDN-loaded libraries
- **Works offline** — Double-click to open in any browser, no server required
- **Deployable anywhere** — GitHub Pages, Netlify, S3, any static host
- **Stateless** — No persistent storage; each session is fresh
- **Excel-based workflow** — Input and output via `.xlsx` files using SheetJS

---

## Architecture

### Dependencies

Load SheetJS from CDN for Excel reading/writing:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
```

### Structure

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
│ ┌─────────────────────────────────┐  ┌───────────┐ │
│ │ Tournament Manager (logo/title) │  │ EN │ ES   │ │
│ └─────────────────────────────────┘  └───────────┘ │
├─────────────────────────────────────────────────────┤
│ TABS                                                │
│ ┌──────────────┐ ┌──────────────┐                  │
│ │  Schedule    │ │  Standings   │                  │
│ └──────────────┘ └──────────────┘                  │
├─────────────────────────────────────────────────────┤
│ TAB CONTENT                                         │
│                                                     │
│  Step 1: [Download/Upload]                          │
│  Step 2: [Upload/Configure]                         │
│  Step 3: [Configure/Generate]                       │
│  Step 4: [Generate] → Preview → Download            │
│                                                     │
├─────────────────────────────────────────────────────┤
│ FOOTER                                              │
│         Powered by SPORTTOOLS                       │
└─────────────────────────────────────────────────────┘
```

---

## Language System: Full Bilingual (EN / ES)

### Toggle Behavior

A two-button toggle in the header (`EN | ES`) switches the entire interface instantly without page reload.

### What Changes with Language

| Element | English | Spanish |
|---------|---------|---------|
| All UI labels, buttons, hints | English | Spanish |
| Template file name | `teams_template.xlsx` | `plantilla_equipos.xlsx` |
| Template columns | `Team`, `Affiliation` | `Equipo`, `Afiliación` |
| Schedule output columns | `Team1`, `s1`, `s2`, `Team2`, `Match Number`, `Round`, `Court`, `Match Time` | `Equipo1`, `p1`, `p2`, `Equipo2`, `Número de Partido`, `Ronda`, `Pista`, `Hora del Partido` |
| Schedule file name | `schedule.xlsx` | `programacion.xlsx` |
| Field sheets file name | `field_sheets.xlsx` | `hojas_de_pista.xlsx` |
| Team schedules file name | `team_schedules.xlsx` | `horarios_por_equipo.xlsx` |
| Standings output columns | `Pos`, `Team`, `City`, `Bouts Played`, `Bouts Won`, `Win %`, `Points For`, `Points Against`, `Point Diff` | `Pos`, `Equipo`, `Ciudad`, `Asaltos Jugados`, `Asaltos Ganados`, `% Victoria`, `Puntos a Favor`, `Puntos en Contra`, `Diferencia` |
| Standings file name | `standings.xlsx` | `Tabla_de_Posiciones.xlsx` |
| Court terminology | `Court` | `Pista` |

### Implementation

```javascript
const translations = {
  en: {
    title: 'Tournament Manager',
    tabSchedule: 'Schedule',
    tabStandings: 'Standings',
    // Algorithm toggle
    scheduleMode: 'Schedule Mode',
    algoFast: 'Fast',
    algoBalanced: 'Balanced',
    algoFastDesc: 'Maximum court utilization. Schedules matches as soon as courts are free.',
    algoBalancedDesc: 'Optimizes for player welfare with rest times and balanced court usage.',
    // ... all strings
  },
  es: {
    title: 'Gestor de Torneos',
    tabSchedule: 'Programación',
    tabStandings: 'Posiciones',
    // Algorithm toggle
    scheduleMode: 'Modo de Programación',
    algoFast: 'Rápido',
    algoBalanced: 'Equilibrado',
    algoFastDesc: 'Máxima utilización de pistas. Programa partidos tan pronto como las pistas estén libres.',
    algoBalancedDesc: 'Optimiza el bienestar de los jugadores con tiempos de descanso y uso equilibrado de pistas.',
    // ... all strings
  }
};

// Helper function with argument substitution
function t(key, ...args) {
  let str = translations[currentLang][key] || translations['en'][key] || key;
  args.forEach((arg, i) => {
    str = str.replace(`{${i}}`, arg);
  });
  return str;
}

// Apply to DOM elements with data-i18n attribute
function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // Re-render any dynamic content (previews, algorithm description, etc.)
  updateAlgoDescription();
  if (generatedSchedule) renderSchedulePreview();
  if (generatedStandings) renderStandingsPreview();
}
```

---

## Tab 1: Schedule Generation

### Workflow Steps

#### Step 1: Download Team Template
- Button: "↓ Download Template"
- Downloads an Excel file with 2-3 example rows showing the expected format
- Columns based on current language (`Team`, `Affiliation` or `Equipo`, `Afiliación`)

#### Step 2: Upload Teams File
- File input accepting `.xlsx` and `.xls`
- Display filename and team count after successful upload
- Store parsed data in memory

#### Step 3: Configure Tournament

**Algorithm Toggle (at top of config section):**

```
Schedule Mode: [ Fast | Balanced ]
```

| Mode | Description | Features |
|------|-------------|----------|
| **Fast** | Maximum court utilization | Courts always in use, Shortest total duration, No rest time guarantees |
| **Balanced** | Optimizes for player welfare | Minimum rest between matches, Balanced court distribution, Better for player welfare |

Show description and feature bullets below toggle, updating when mode changes.

**Configuration Parameters:**

| Parameter | Control Type | Details |
|-----------|--------------|---------|
| **Number of Courts** | Stepper `[−] N [+]` | Minimum: 1. Show hint: "Max needed: M" where M = floor(teamCount / 2) |
| **Start Time** | Native `<input type="time">` | Default: `09:00` |
| **Match Duration** | Slider (5–90 min, step 5) | **Show current value beside slider**: `15 min` |
| **Gap Between Matches** | Slider (0–60 min, step 5) | **Show current value beside slider**: `5 min` |

**Odd Teams Warning:** If team count is odd, show a warning: "Odd number of teams detected. One team will have a bye each round."

#### Step 4: Generate Schedule
- Button: "Generate Schedule" (disabled until teams uploaded)
- On click: run selected algorithm, show summary card, show preview table, enable downloads

**Summary Card shows:**
- Teams count
- Matches count
- Rounds count
- **Exact finish time** (calculated from last match time + duration)

**Algorithm Statistics (Balanced mode only):**
- Min Rest (min) — Shortest rest any team got
- Avg Rest (min) — Average rest time between matches
- Court Balance — Range of court usage (e.g., "14-16")
- Conflicts Resolved — How many matches needed special handling

**Preview Table columns:** Team1, s1, s2, Team2, Match Number, Round, Court, Match Time

**Download Buttons:**

| Button | Output |
|--------|--------|
| ↓ Schedule | Main Excel file with all matches |
| ↓ Field Sheets | Excel with one sheet per court (for referees) |
| ⎙ Field Sheets | Print view with page breaks per court |
| ↓ Team Schedules | Excel with "By Team" and "By Court" sheets |

---

## Tab 2: Standings Calculation

### Workflow Steps

#### Step 1: Upload Teams File
- Same format as Tab 1 (provides affiliation/city data for the standings table)

#### Step 2: Upload Results File
- The schedule Excel file with `s1`/`p1` and `s2`/`p2` score columns filled in manually

#### Step 3: Generate Standings
- Button: "Generate Standings" (disabled until both files uploaded)
- Process matches, calculate standings, show preview

**Validation Rules:**
- Skip matches with empty score cells (show count of skipped matches)
- **No ties allowed**: If s1 === s2, show error for that specific match

**Standings Calculation per match:**
- Winner: +1 bout played, +1 bout won, scores added to points for/against
- Loser: +1 bout played, +0 bout won, scores added to points for/against

**Sorting Criteria (in priority order):**
1. Win % (`Bouts Won / Bouts Played × 100`) — descending
2. Point differential (`Points For − Points Against`) — descending
3. Points scored (`Points For`) — descending
4. Points conceded (`Points Against`) — ascending

**Preview Table columns:** Pos, Team, City, Bouts Played, Bouts Won, Win %, Points For, Points Against, Point Diff

**Actions:**
- "⎙ Print" button — triggers `window.print()` with print-optimized CSS
- "↓ Download" button — saves Excel file

---

## Scheduling Algorithms

### Round-Robin Generation (Circle Method)

Used by both Fast and Balanced modes to generate pairings:

```javascript
function generateRoundRobin(teams) {
  const n = teams.length;
  const isOdd = n % 2 === 1;
  const participants = isOdd ? [...teams, null] : [...teams]; // null = bye
  const numParticipants = participants.length;
  const rounds = numParticipants - 1;
  
  const schedule = [];
  
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < numParticipants / 2; i++) {
      const home = participants[i];
      const away = participants[numParticipants - 1 - i];
      
      // Skip bye matches (where one team is null)
      if (home !== null && away !== null) {
        schedule.push({ round: round + 1, team1: home, team2: away });
      }
    }
    
    // Rotate: first position fixed, others rotate clockwise
    const last = participants.pop();
    participants.splice(1, 0, last);
  }
  
  return { schedule, rounds };
}
```

### Fast Algorithm: Maximum Court Utilization

**Goal:** Fill courts as quickly as possible. Shortest total tournament duration.

**Behavior:**
- Assigns each match to the earliest available court
- Only constraint: no team plays twice simultaneously
- No rest time guarantees
- No court balancing

```javascript
function assignTimesAndCourtsFast(matches, numCourts, startTime, duration, gap) {
  const slotLength = duration + gap;
  const courtNextTime = Array(numCourts).fill(startTimeInMinutes);
  const teamBusy = {}; // { teamName: [[start, end], ...] }
  
  function isTeamFree(team, time) {
    if (!teamBusy[team]) return true;
    return !teamBusy[team].some(([start, end]) => time < end && time + duration > start);
  }
  
  function markBusy(team, time) {
    if (!teamBusy[team]) teamBusy[team] = [];
    teamBusy[team].push([time, time + duration]);
  }
  
  const assigned = [];
  const deferred = [];
  
  // Greedy assignment
  for (const match of matches) {
    const courtsByTime = courtNextTime
      .map((time, idx) => ({ court: idx, time }))
      .sort((a, b) => a.time - b.time);
    
    let wasAssigned = false;
    for (const { court, time } of courtsByTime) {
      if (isTeamFree(match.team1, time) && isTeamFree(match.team2, time)) {
        assigned.push({ ...match, court: court + 1, time });
        markBusy(match.team1, time);
        markBusy(match.team2, time);
        courtNextTime[court] = time + slotLength;
        wasAssigned = true;
        break;
      }
    }
    if (!wasAssigned) deferred.push(match);
  }
  
  // Retry deferred matches
  let attempts = 0;
  while (deferred.length > 0 && attempts < matches.length * 10) {
    const match = deferred.shift();
    // ... same assignment logic ...
    attempts++;
  }
  
  // Force-assign any remaining
  for (const match of deferred) {
    const minCourt = courtNextTime.indexOf(Math.min(...courtNextTime));
    assigned.push({ ...match, court: minCourt + 1, time: courtNextTime[minCourt] });
    courtNextTime[minCourt] += slotLength;
  }
  
  // Sort and number
  assigned.sort((a, b) => a.time - b.time || a.court - b.court);
  assigned.forEach((m, i) => m.matchNum = i + 1);
  
  return { matches: assigned, finishTime, stats: null };
}
```

### Balanced Algorithm: Player Welfare Optimization

**Goal:** Ensure fair rest times and balanced court distribution.

**Additional Constraints:**
1. **Minimum rest time** — Teams get at least one match duration of rest between matches
2. **Court balancing** — Prefer courts a team has used less often
3. **Constraint-first scheduling** — Schedule most constrained teams first

**Additional Tracking:**
- `teamLastMatchEnd` — When each team's last match ended
- `teamCourtCount` — How many times each team played on each court
- `restTimes` — Array of actual rest times (for statistics)

```javascript
function assignTimesAndCourtsBalanced(matches, numCourts, startTime, duration, gap) {
  const slotLength = duration + gap;
  const minRestTime = duration; // At least one match duration of rest
  
  const courtNextTime = Array(numCourts).fill(startTimeInMinutes);
  const teamLastMatchEnd = {};
  const teamCourtCount = {};
  const teamBusy = {};
  
  let conflictsResolved = 0;
  const restTimes = [];
  
  function hasEnoughRest(team, time) {
    const lastEnd = teamLastMatchEnd[team];
    if (lastEnd === undefined) return true;
    const rest = time - lastEnd;
    if (rest > 0) restTimes.push(rest);
    return rest >= minRestTime;
  }
  
  function getCourtScore(team, courtIdx) {
    if (!teamCourtCount[team]) return 0;
    return teamCourtCount[team][courtIdx] || 0;
  }
  
  function canAssign(match, courtIdx, time) {
    return isTeamFree(match.team1, time) && 
           isTeamFree(match.team2, time) &&
           hasEnoughRest(match.team1, time) && 
           hasEnoughRest(match.team2, time);
  }
  
  // Sort matches by constraint level (most constrained first)
  const teamMatchCount = {};
  matches.forEach(m => {
    teamMatchCount[m.team1] = (teamMatchCount[m.team1] || 0) + 1;
    teamMatchCount[m.team2] = (teamMatchCount[m.team2] || 0) + 1;
  });
  
  const sortedMatches = [...matches].sort((a, b) => {
    const constraintA = teamMatchCount[a.team1] + teamMatchCount[a.team2];
    const constraintB = teamMatchCount[b.team1] + teamMatchCount[b.team2];
    if (constraintB !== constraintA) return constraintB - constraintA;
    return a.round - b.round;
  });
  
  // Assignment with scoring
  for (const match of sortedMatches) {
    let bestSlot = null;
    let bestScore = Infinity;
    
    // Generate candidate slots (current + future)
    const candidateSlots = [];
    for (let courtIdx = 0; courtIdx < numCourts; courtIdx++) {
      candidateSlots.push({ court: courtIdx, time: courtNextTime[courtIdx] });
      for (let extra = 1; extra <= 3; extra++) {
        candidateSlots.push({ 
          court: courtIdx, 
          time: courtNextTime[courtIdx] + (extra * slotLength) 
        });
      }
    }
    
    // Score each candidate
    for (const { court, time } of candidateSlots) {
      if (canAssign(match, court, time)) {
        let score = 0;
        score += (time - startMinutes) * 0.1; // Prefer earlier
        score += getCourtScore(match.team1, court) * 10; // Balance courts
        score += getCourtScore(match.team2, court) * 10;
        
        if (score < bestScore) {
          bestScore = score;
          bestSlot = { court, time };
        }
      }
    }
    
    if (bestSlot) {
      // Assign to best slot
    } else {
      deferred.push(match);
      conflictsResolved++;
    }
  }
  
  // Retry with relaxed constraints, then force-assign remaining
  // ...
  
  // Calculate statistics
  const stats = {
    minRest: Math.min(...restTimes),
    avgRest: Math.round(restTimes.reduce((a,b) => a+b, 0) / restTimes.length),
    courtBalance: `${minCourtUsage}-${maxCourtUsage}`,
    conflictsResolved
  };
  
  return { matches: assigned, finishTime, stats };
}
```

---

## Additional Downloads

### Field Sheets (Excel)

One sheet per court for referees to record scores:

```javascript
function downloadFieldSheets() {
  const wb = XLSX.utils.book_new();
  
  // Group matches by court
  const matchesByCourt = {};
  generatedSchedule.forEach(m => {
    if (!matchesByCourt[m.court]) matchesByCourt[m.court] = [];
    matchesByCourt[m.court].push(m);
  });
  
  // Create sheet per court
  Object.keys(matchesByCourt).sort().forEach(court => {
    const data = matchesByCourt[court].map(m => ({
      [t('colMatchNum')]: m.matchNum,
      [t('colTeam1')]: m.team1,
      [t('colTeam2')]: m.team2,
      [t('colTime')]: m.timeStr,
      [t('colS1')]: '',  // Empty for referee to fill
      [t('colS2')]: ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, t('fieldSheetTitle', court));
  });
  
  XLSX.writeFile(wb, t('fieldSheetsFileName'));
}
```

### Field Sheets (Print)

Open new window with print-formatted HTML:

```javascript
function printFieldSheets() {
  // Build HTML with page-break-after per court
  let html = `<!DOCTYPE html><html><head>
    <style>
      .field-sheet { page-break-after: always; padding: 2rem; }
      .field-sheet:last-child { page-break-after: auto; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #000; padding: 0.5rem; }
      th { background: #f0f0f0; }
      .score-cell { width: 80px; text-align: center; }
    </style>
  </head><body>`;
  
  Object.keys(matchesByCourt).forEach(court => {
    html += `<div class="field-sheet">
      <h2>${t('fieldSheetTitle', court)}</h2>
      <table>...</table>
    </div>`;
  });
  
  html += `</body></html>`;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 250);
}
```

### Team Schedules (Excel)

Two sheets:

**Sheet 1: "By Team"** — Each team's personal schedule
```
| Team    | Match # | Opponent | Time  | Court | Round |
|---------|---------|----------|-------|-------|-------|
| Alpha   | 1       | Beta     | 09:00 | 1     | 1     |
| Alpha   | 5       | Gamma    | 09:40 | 2     | 2     |
| (empty row)                                          |
| Beta    | 1       | Alpha    | 09:00 | 1     | 1     |
| ...     |         |          |       |       |       |
```

**Sheet 2: "By Court"** — Each court's full schedule
```
| Court   | Match # | Team1 | Team2 | Time  | Round |
|---------|---------|-------|-------|-------|-------|
| Court 1 | 1       | Alpha | Beta  | 09:00 | 1     |
| Court 1 | 3       | Gamma | Delta | 09:20 | 1     |
| (empty row)                                        |
| Court 2 | 2       | Epsilon| Zeta | 09:00 | 1     |
| ...     |         |       |       |       |       |
```

---

## Visual Design

### Direction
Clean, minimal, **black and white palette**. Professional and print-friendly. No color accents.

### Color Palette

| Role | Value |
|------|-------|
| Background | `#ffffff` |
| Secondary background | `#f7f7f7` |
| Tertiary background | `#efefef` |
| Borders | `#e0e0e0` |
| Dark borders | `#cccccc` |
| Primary text | `#0a0a0a` |
| Secondary text | `#555555` |
| Muted text | `#888888` |
| Interactive (buttons) | `#0a0a0a` with white text |
| Interactive hover | `#2a2a2a` |

### Typography

- **Display font**: `'Syne', sans-serif` — Headers, labels, buttons
- **Mono font**: `'Space Mono', monospace` — Numbers, times, table data

Load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Component Styles

**Buttons:**
- Primary: Black background, white text, black border
- Secondary: White background, black text, black border
- Small variant for action rows with multiple buttons
- Uppercase, letter-spacing, no border-radius

**Algorithm Toggle:** Two-button toggle similar to language toggle, with description and feature list below

**Stepper:** `[−] value [+]` with borders, mono font for value

**Sliders:** Simple track with square thumb, value displayed beside in mono font

**Tables:** Clean borders, sticky header, mono font for data, hover state on rows

**Cards/Sections:** Light gray background, subtle border, generous padding

**Algorithm Stats:** Small stats grid showing min rest, avg rest, court balance, conflicts resolved

### Print Styles

Use `@media print` to:
- Hide header, tabs, buttons, algorithm toggle
- Remove max-height from table scroll containers
- Show a print-only header with title and date

---

## File I/O Summary

| File | Direction | Tab | Contents |
|------|-----------|-----|----------|
| Team template | Download | 1 | Team, Affiliation (2-3 example rows) |
| Teams file | Upload | 1 & 2 | Team, Affiliation |
| Schedule | Download | 1 | Team1, s1, s2, Team2, Match Number, Round, Court, Match Time |
| Field Sheets | Download | 1 | One sheet per court with Match #, Team1, Team2, Time, Score1, Score2 |
| Team Schedules | Download | 1 | "By Team" and "By Court" sheets |
| Schedule with scores | Upload | 2 | Same as schedule with s1/s2 filled |
| Standings | Download | 2 | Pos, Team, City, Bouts Played, Bouts Won, Win %, Points For, Points Against, Point Diff |

---

## State Management

Simple module-level variables:

```javascript
let currentLang = 'en';
let currentAlgo = 'fast';        // 'fast' or 'balanced'
let teamsData = null;            // Tab 1: parsed teams
let standingsTeamsData = null;   // Tab 2: parsed teams
let resultsData = null;          // Tab 2: parsed results
let generatedSchedule = null;    // Tab 1: output
let generatedStandings = null;   // Tab 2: output
let lastAlgoStats = null;        // Tab 1: algorithm statistics (balanced only)
let numCourtsUsed = 2;           // For field sheets generation
```

---

## Test Suite

Include a built-in test suite accessible via "Run Tests" button in header.

### Tests to Run

| Test | What it verifies |
|------|------------------|
| No simultaneous matches | No team plays twice at same time |
| Round-robin completeness | All pairings exist, correct match count |
| Chronological order | Schedule sorted by time |
| Odd teams handling | Bye matches skipped correctly |
| Many courts edge case | 4 teams, 10 courts works |
| Zero gap | No gap between matches works |
| Single court | All matches sequential |

Run tests for **both** Fast and Balanced algorithms.

```javascript
const TestSuite = {
  results: [],
  
  assert(condition, testName, details = '') {
    this.results.push({ pass: condition, name: testName, details });
  },
  
  testNoSimultaneousMatches(schedule, algoName) {
    const timeSlots = {};
    let conflicts = [];
    
    schedule.forEach(match => {
      const key1 = `${match.team1}-${match.time}`;
      const key2 = `${match.team2}-${match.time}`;
      if (timeSlots[key1]) conflicts.push(`${match.team1} at ${match.timeStr}`);
      if (timeSlots[key2]) conflicts.push(`${match.team2} at ${match.timeStr}`);
      timeSlots[key1] = true;
      timeSlots[key2] = true;
    });
    
    this.assert(conflicts.length === 0, `[${algoName}] No simultaneous matches`, conflicts.join(', '));
  },
  
  runAll() {
    this.results = [];
    // Test both algorithms with various team counts
    // Return results for display
  }
};
```

Display results in a modal with pass/fail indicators.

---

## Edge Cases to Handle

1. **Odd number of teams** — Insert null for bye, skip null matches, show warning
2. **Empty score cells** — Skip match, count and report skipped matches
3. **Tie scores** — Show specific error, don't crash
4. **Column name detection** — Check for both EN and ES column names in uploaded files
5. **Extreme parameters** — Many teams + few courts + short gaps → use retry queue with max attempts, then force-assign
6. **File read errors** — Catch and log, don't update state
7. **Single court** — All matches must be sequential
8. **More courts than needed** — Works fine, some courts unused

---

## Explicitly Excluded Features

- In-browser score entry (Excel workflow preferred)
- CSV support (Excel only)
- Persistent storage / localStorage
- Knockout brackets or group stages
- Sport-specific customization
- Server-side processing
- Consolidation tool for merging field sheets (manual copy-paste for now)

---

## Footer (Required)

Add a subtle footer at the bottom of the page, just before `</body>`:

```html
<!-- SPORTTOOLS Footer -->
<footer style="
  background: #fafafa;
  border-top: 1px solid #e5e5e5;
  padding: 12px 20px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  color: #999;
">
  Powered by SPORTTOOLS
</footer>
```

This footer provides attribution and should be included in all generated versions.

---

## Testing Checklist

- [ ] Language toggle updates all static text
- [ ] Language toggle updates template download (filename + columns)
- [ ] Language toggle updates generated schedule preview and download
- [ ] Language toggle updates generated standings preview and download
- [ ] Algorithm toggle switches between Fast and Balanced
- [ ] Algorithm toggle updates description and feature list
- [ ] Balanced mode shows algorithm statistics after generation
- [ ] Fast mode hides algorithm statistics
- [ ] Odd team count shows warning and generates valid schedule
- [ ] Generated schedule has no team conflicts (no team plays twice at same time)
- [ ] Finish time matches actual last match time + duration
- [ ] Field Sheets Excel download creates one sheet per court
- [ ] Field Sheets print opens formatted print view
- [ ] Team Schedules download creates both "By Team" and "By Court" sheets
- [ ] Standings correctly handles skipped matches (empty scores)
- [ ] Standings shows error for tie scores
- [ ] Standings sorts correctly by all criteria
- [ ] Print button produces clean output
- [ ] Run Tests button executes test suite for both algorithms
- [ ] Works offline (after initial load with CDN)
- [ ] Footer displays "Powered by SPORTTOOLS"
