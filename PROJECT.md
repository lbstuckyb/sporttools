# SPORTTOOLS — Project Document

> Master document explaining the vision, architecture, decisions, and roadmap.

---

## Vision

**SPORTTOOLS** is a curated marketplace of ready-to-use sports administration tools.

**Tagline:** "Simple tools. Direct solutions."

**Core Value Proposition:**
- Getting from "good idea" to "polished, working tool" takes significant iteration time
- SPORTTOOLS saves that time by providing battle-tested tools AND their source prompts
- Users can either use tools directly OR customize them with the provided prompts

**Philosophy:** One problem, one solution. No bloated Swiss Army knives.

---

## Target Users

1. **Sports administrators** — Need scheduling, rankings, roster management
2. **Tournament organizers** — Need brackets, schedules, standings
3. **Developers/AI users** — Want prompts to create or customize tools

---

## Core Features

### Three Actions Per Tool

| Button | Color | Action |
|--------|-------|--------|
| **Use** | Purple (#7c3aed) | Opens tool in wrapper page with SPORTTOOLS branding |
| **Download** | Green (#059669) | Downloads standalone HTML file |
| **Prompt** | Orange (#ea580c) | Copies generation prompt to clipboard |

### Bilingual Support
- Platform supports EN/ES toggle
- Each tool can support different languages (shown as badges)

### Tool Cards Display
- Name + language badges
- Description
- "Solves: [problem]" badge
- Expandable features list (click to show)
- Metadata: author, date, downloads, rating
- Action buttons

---

## Architecture

### Why Static Site?

**Decision:** Fully static site hosted on GitHub Pages

**Reasons:**
1. Zero hosting cost
2. No backend to maintain
3. Simple deployment (push to GitHub)
4. Tools work offline after download
5. Easy to understand and modify

**Trade-offs accepted:**
- No real-time download counts (placeholder/manual)
- No user accounts or ratings input (display only)
- Adding tools requires GitHub knowledge

### File Structure

```
sporttools/
├── docs/                     ← GitHub Pages serves from here
│   ├── index.html            ← Landing page
│   ├── catalog.json          ← Auto-generated tool catalog
│   └── tools/                ← Copied from /tools on build
│
├── tools/                    ← Source of truth
│   └── [tool-name]/
│       ├── tool.json         ← Metadata
│       ├── index.html        ← Wrapper page (branding)
│       ├── tool.html         ← Actual tool
│       └── prompt.md         ← Generation prompt
│
├── scripts/
│   └── build.js              ← Scans /tools → generates catalog
│
├── .github/workflows/
│   └── deploy.yml            ← Auto-build + deploy on push
│
├── README.md                 ← Setup guide
├── TOOL-TEMPLATE.md          ← Guide for creating tools
├── PROJECT.md                ← This document
└── TECHNICAL.md              ← Code documentation
```

### Why This Structure?

**Separation of source and output:**
- `/tools/` = source of truth (you edit here)
- `/docs/` = build output (auto-generated)
- Clear distinction prevents confusion

**Tool folders are self-contained:**
- Each tool has everything it needs
- Easy to add/remove tools
- Easy for future contributors

**Build script generates catalog:**
- No manual JSON editing
- Add a folder → run build → done
- Reduces human error

### Wrapper Page Architecture

**Decision:** Tools open in a wrapper page with SPORTTOOLS header

**Why wrapper page instead of branding in tool?**

| Approach | Pros | Cons |
|----------|------|------|
| Branding in tool.html | Downloads keep branding | Must enforce in every tool |
| Wrapper page (iframe) | Auto-branding for any tool | Downloads have no branding |

**Our choice:** Wrapper page with optional footer in tool

**Reasoning:**
- Wrapper provides consistent branding on-site
- Tools remain clean, standalone files
- Future community tools get branding automatically
- Optional footer in tool.html for downloaded versions

**Wrapper structure:**
```
┌─────────────────────────────────────────┐
│ ← Back to Tools              SPORTTOOLS │  ← Header (black bar)
├─────────────────────────────────────────┤
│                                         │
│            <iframe>                     │  ← Tool loads here
│            tool.html                    │
│                                         │
├─────────────────────────────────────────┤
│      Powered by SPORTTOOLS              │  ← Footer
└─────────────────────────────────────────┘
```

---

## Design Decisions

### Visual Design

**Direction:** Clean, minimal, professional. Black/white base with colored action buttons.

**Color Palette:**
- Background: #ffffff
- Surface: #fafafa
- Borders: #e8e8e8
- Text: #0a0a0a (primary), #525252 (secondary), #a3a3a3 (muted)
- Use button: #7c3aed (purple)
- Download button: #059669 (green)
- Prompt button: #ea580c (orange)

**Typography:**
- Display: Space Grotesk (headings, UI)
- Mono: JetBrains Mono (metadata, code)

**Why these choices:**
- Black/white = professional, print-friendly
- Colored buttons = clear action differentiation
- Space Grotesk = modern but readable
- Consistent with "simple, direct" philosophy

### Tool Card Interaction

**Decision:** Click to expand features (not hover)

**Why:**
- Works on mobile (no hover)
- Prevents accidental expansion
- User controls what they see
- Only clicked card expands (not adjacent ones)

### Prompt Copy Behavior

**Decision:** Copy to clipboard, fallback to new tab

**Implementation:**
1. Try `fetch()` the .md file
2. Copy text to clipboard
3. Show success toast
4. If fails → open file in new tab

**Why fallback:**
- Local `file://` protocol blocks fetch
- User can still access the prompt
- Works perfectly when deployed

---

## Data Model

### tool.json Schema

```json
{
  "id": "string",           // URL-safe identifier
  "name": {
    "en": "string",
    "es": "string"
  },
  "description": {
    "en": "string",
    "es": "string"
  },
  "problem": {
    "en": "string",
    "es": "string"
  },
  "features": {
    "en": ["string"],
    "es": ["string"]
  },
  "languages": ["EN", "ES"], // Languages the tool supports
  "author": "string",
  "dateAdded": "YYYY-MM",
  "downloads": 0,            // Placeholder (manual)
  "rating": 0.0,             // Placeholder (manual)
  "status": "active"         // or "coming-soon"
}
```

### catalog.json (Auto-generated)

```json
{
  "generated": "ISO timestamp",
  "count": 2,
  "tools": [
    { /* tool objects with paths added */ }
  ]
}
```

**Paths added by build script:**
- `paths.page` → `tools/[id]/` (wrapper)
- `paths.tool` → `tools/[id]/tool.html` (download)
- `paths.prompt` → `tools/[id]/prompt.md`

---

## Build Process

### build.js Flow

1. Scan `/tools/` for directories
2. For each directory:
   - Read `tool.json`
   - Validate required fields
   - Add paths
   - Copy entire folder to `/docs/tools/`
3. Sort tools (active first, then by date)
4. Write `catalog.json`

### GitHub Actions Workflow

**Trigger:** Push to main branch

**Steps:**
1. Checkout repo
2. Run `node scripts/build.js`
3. Commit updated `docs/` if changed
4. Deploy `/docs/` to GitHub Pages

---

## Future Roadmap

### Phase 1: Foundation (Current)
- [x] Landing page with tool catalog
- [x] Bilingual support (EN/ES)
- [x] Wrapper page for tools
- [x] Build script + auto-deploy
- [x] Documentation

### Phase 2: More Tools
- [ ] Bracket Generator
- [ ] Team Roster Manager
- [ ] Score Tracker
- [ ] Timer/Stopwatch

### Phase 3: Enhanced Features
- [ ] Search/filter tools
- [ ] Category tags (Scheduling, Rankings, Admin)
- [ ] Sport tags (General, Fencing, Soccer, etc.)

### Phase 4: Community
- [ ] Contribution guidelines
- [ ] Tool submission process
- [ ] Quality review workflow

### Phase 5: Dynamic Features (if needed)
- [ ] Real download counts (Supabase/Firebase)
- [ ] User ratings
- [ ] Comments/feedback

### Phase 6: Monetization (ideas)
- Premium tools
- Custom tool development service
- Sponsored placements
- "Pro" prompt versions

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `docs/index.html` | Landing page |
| `docs/catalog.json` | Tool data (auto-generated) |
| `tools/[name]/tool.json` | Tool metadata |
| `tools/[name]/index.html` | Wrapper page |
| `tools/[name]/tool.html` | Actual tool |
| `tools/[name]/prompt.md` | Generation prompt |
| `scripts/build.js` | Build script |
| `.github/workflows/deploy.yml` | CI/CD |
| `README.md` | Setup guide |
| `TOOL-TEMPLATE.md` | Tool creation guide |
| `PROJECT.md` | This document |
| `TECHNICAL.md` | Code documentation |

---

## Design Inspiration

- **Hugging Face** — Model/dataset catalog UI
- **GitHub** — Clean, functional design
- **Notion** — Minimal, professional aesthetic

---

## Contact / Ownership

- **Project:** SPORTTOOLS
- **Domain:** sporttools.io (or .app, .com — TBD)
- **Repository:** github.com/[username]/sporttools
