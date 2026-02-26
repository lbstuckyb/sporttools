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
| Standings output columns | `Pos`, `Team`, `City`, `Bouts Played`, `Bouts Won`, `Win %`, `Points For`, `Points Against`, `Point Diff` | `Pos`, `Equipo`, `Ciudad`, `Asaltos Jugados`, `Asaltos Ganados`, `% Victoria`, `Puntos a Favor`, `Puntos en Contra`, `Diferencia` |
| Standings file name | `standings.xlsx` | `Tabla_de_Posiciones.xlsx` |

### Implementation

```javascript
const translations = {
  en: {
    title: 'Tournament Manager',
    tabSchedule: 'Schedule',
    // ... all strings
  },
  es: {
    title: 'Gestor de Torneos',
    tabSchedule: 'Programación',
    // ... all strings
  }
};

// Helper function
function t(key, ...args) {
  let str = translations[currentLang][key] || key;
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
  // Re-render any dynamic content (previews, etc.)
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

| Parameter | Control Type | Details |
|-----------|--------------|---------|
| **Number of Courts** | Stepper `[−] N [+]` | Minimum: 1. Show hint: "Max needed: M" where M = floor(teamCount / 2) |
| **Start Time** | Native `<input type="time">` | Default: `09:00` |
| **Match Duration** | Slider (5–90 min, step 5) | **Show current value beside slider**: `15 min` |
| **Gap Between Matches** | Slider (0–60 min, step 5) | **Show current value beside slider**: `5 min` |

**Odd Teams Warning:** If team count is odd, show a warning: "Odd number of teams detected. One team will have a bye each round."

#### Step 4: Generate Schedule
- Button: "Generate Schedule" (disabled until teams uploaded)
- On click: run algorithm, show summary card, show preview table, enable download

**Summary Card shows:**
- Teams count
- Matches count
- Rounds count
- **Exact finish time** (calculated from last match time + duration)

**Preview Table columns:** Team1, s1, s2, Team2, Match Number, Round, Court, Match Time

**Download Button:** Saves Excel with columns in current language

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

## Scheduling Algorithm

### Round-Robin Generation (Circle Method)

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
  
  return schedule;
}
```

### Time & Court Assignment (Conflict-Free)

**Goal:** Assign each match a court and start time such that:
1. No team plays two matches simultaneously
2. Courts are used efficiently (earliest available slot preferred)

**Algorithm:**
```javascript
function assignTimesAndCourts(matches, numCourts, startTime, duration, gap) {
  const slotLength = duration + gap;
  
  // Track next available time per court
  const courtNextTime = Array(numCourts).fill(startTimeInMinutes);
  
  // Track busy periods per team: { teamName: [[start1, end1], [start2, end2], ...] }
  const teamBusy = {};
  
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
  
  // First pass: greedy assignment
  for (const match of matches) {
    // Sort courts by earliest available time
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
  
  // Retry deferred matches (iteratively)
  let attempts = 0;
  while (deferred.length > 0 && attempts < matches.length * 10) {
    const match = deferred.shift();
    // ... same assignment logic ...
    // If still can't assign, push back to deferred
    attempts++;
  }
  
  // Force-assign any remaining (edge cases)
  for (const match of deferred) {
    const minCourt = courtNextTime.indexOf(Math.min(...courtNextTime));
    const time = courtNextTime[minCourt];
    assigned.push({ ...match, court: minCourt + 1, time });
    courtNextTime[minCourt] = time + slotLength;
  }
  
  // Sort by time, then court; add match numbers
  assigned.sort((a, b) => a.time - b.time || a.court - b.court);
  assigned.forEach((m, i) => m.matchNum = i + 1);
  
  return assigned;
}
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
- Uppercase, letter-spacing, no border-radius

**Stepper:** `[−] value [+]` with borders, mono font for value

**Sliders:** Simple track with square thumb, value displayed beside in mono font

**Tables:** Clean borders, sticky header, mono font for data, hover state on rows

**Cards/Sections:** Light gray background, subtle border, generous padding

### Print Styles

Use `@media print` to:
- Hide header, tabs, buttons
- Remove max-height from table scroll containers
- Show a print-only header with title and date

---

## File I/O Summary

| File | Direction | Tab | Columns |
|------|-----------|-----|---------|
| Team template | Download | 1 | Team, Affiliation |
| Teams file | Upload | 1 & 2 | Team, Affiliation |
| Schedule | Download | 1 | Team1, s1, s2, Team2, Match Number, Round, Court, Match Time |
| Schedule with scores | Upload | 2 | (same as above, with s1/s2 filled) |
| Standings | Download | 2 | Pos, Team, City, Bouts Played, Bouts Won, Win %, Points For, Points Against, Point Diff |

---

## State Management

Simple module-level variables:

```javascript
let currentLang = 'en';
let teamsData = null;           // Tab 1: parsed teams
let standingsTeamsData = null;  // Tab 2: parsed teams
let resultsData = null;         // Tab 2: parsed results
let generatedSchedule = null;   // Tab 1: output
let generatedStandings = null;  // Tab 2: output
```

---

## Edge Cases to Handle

1. **Odd number of teams** — Insert null for bye, skip null matches, show warning
2. **Empty score cells** — Skip match, count and report skipped matches
3. **Tie scores** — Show specific error, don't crash
4. **Column name detection** — Check for both EN and ES column names in uploaded files
5. **Extreme parameters** — Many teams + few courts + short gaps → use retry queue with max attempts, then force-assign
6. **File read errors** — Catch and log, don't update state

---

## Explicitly Excluded Features

- In-browser score entry (Excel workflow preferred)
- CSV support (Excel only)
- Persistent storage / localStorage
- Knockout brackets or group stages
- Sport-specific customization
- Server-side processing

---

## Testing Checklist

- [ ] Language toggle updates all static text
- [ ] Language toggle updates template download (filename + columns)
- [ ] Language toggle updates generated schedule preview and download
- [ ] Language toggle updates generated standings preview and download
- [ ] Odd team count shows warning and generates valid schedule
- [ ] Generated schedule has no team conflicts (no team plays twice at same time)
- [ ] Finish time matches actual last match time + duration
- [ ] Standings correctly handles skipped matches (empty scores)
- [ ] Standings shows error for tie scores
- [ ] Standings sorts correctly by all criteria
- [ ] Print button produces clean output
- [ ] Works offline (after initial load with CDN)
