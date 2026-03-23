# SPORTTOOLS — Technical Documentation

> Detailed documentation of how the code works. Use this as a reference or "memory" when working with AI assistants.

---

## Site Structure

```
/                    → docs/index.html (Tools page — home)
/about.html          → docs/about.html (About page)
/tools/[id]/         → Individual tool wrapper pages
```

**Navigation:** Tools | About (in header on both pages)

---

## Tools Page (docs/index.html)

### Overview

Single HTML file containing:
- All CSS (in `<style>` tag)
- All JavaScript (in `<script>` tag)
- No external dependencies except Google Fonts

**Why single file:** Simple to deploy, easy to understand, no build step for the page itself.

---

### CSS Architecture

#### CSS Variables (Custom Properties)

```css
:root {
  /* Fonts */
  --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Colors - Backgrounds */
  --bg-primary: #ffffff;      /* Main background */
  --bg-surface: #fafafa;      /* Cards, sections */
  --bg-elevated: #f5f5f5;     /* Hover states, badges */
  
  /* Colors - Borders */
  --border-light: #e8e8e8;    /* Subtle borders */
  --border-medium: #d4d4d4;   /* Prominent borders */
  
  /* Colors - Text */
  --text-primary: #0a0a0a;    /* Headings, important text */
  --text-secondary: #525252;  /* Body text */
  --text-muted: #a3a3a3;      /* Metadata, hints */
  
  /* Colors - Actions */
  --accent-use: #7c3aed;           /* Purple - Use button */
  --accent-use-hover: #6d28d9;
  --accent-download: #059669;       /* Green - Download button */
  --accent-download-hover: #047857;
  --accent-prompt: #ea580c;         /* Orange - Prompt button */
  --accent-prompt-hover: #c2410c;
  --accent-skill: #0a0a0a;          /* Black - AI Skill button */
  --accent-skill-hover: #262626;
  
  /* Spacing & Sizing */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Effects */
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
}
```

#### Key CSS Patterns

**Sticky Header with Navigation:**
```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}
.nav {
  display: flex;
  gap: 8px;
}
.nav-link {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
}
.nav-link.active {
  background: var(--bg-elevated);
}
```

**Responsive Grid:**
```css
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}
```
- `auto-fill` creates as many columns as fit
- `minmax(340px, 1fr)` ensures cards are at least 340px

**Card Hover Effect:**
```css
.tool-card {
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}
.tool-card:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

**Expandable Features (CSS Grid trick):**
```css
.tool-features {
  display: grid;
  grid-template-rows: 0fr;  /* Collapsed */
  transition: grid-template-rows 0.25s ease;
}
.tool-card.expanded .tool-features {
  grid-template-rows: 1fr;  /* Expanded */
}
.tool-features-inner {
  overflow: hidden;  /* Required for the animation */
}
```
- This technique allows smooth height animation
- `0fr` = 0 height, `1fr` = auto height
- Inner div with `overflow: hidden` clips content

---

### JavaScript Architecture

#### State Variables

```javascript
let lang = localStorage.getItem('sporttools-lang') || 'en';
let catalog = { tools: [] };
```

#### Translation System

```javascript
const i18n = {
  en: {
    navTools: 'Tools',
    navAbout: 'About',
    tagline: 'Simple tools. Direct solutions.',
    heroDescription: 'Ready-to-use sports tools built with AI. Community-driven.',
    heroActions: 'Use · Create · Customize · Improve · Share · Learn',
    // ... all strings
  },
  es: {
    navTools: 'Herramientas',
    navAbout: 'Acerca de',
    tagline: 'Herramientas simples. Soluciones directas.',
    heroDescription: 'Herramientas deportivas listas para usar, creadas con IA. Impulsado por la comunidad.',
    heroActions: 'Usar · Crear · Personalizar · Mejorar · Compartir · Aprender',
    // ... all strings
  }
};

// Translation helper with placeholder support
const t = (key, ...args) => {
  let s = i18n[lang][key] || key;
  args.forEach((a, i) => s = s.replace(`{${i}}`, a));
  return s;
};
```

**Usage:**
- `t('tagline')` → "Simple tools. Direct solutions."
- `t('toolCount', 5)` → "5 tools" (replaces `{0}`)

#### Catalog Loading

```javascript
async function loadCatalog() {
  try {
    const res = await fetch('./catalog.json');
    if (res.ok) catalog = await res.json();
  } catch (e) {
    console.warn('Could not load catalog.json');
  }
  render();
}
```

- Fetches `catalog.json` on page load
- Falls back to empty catalog if fetch fails
- Always calls `render()` regardless

#### Rendering Tools

```javascript
function render() {
  const grid = document.getElementById('toolsGrid');
  
  grid.innerHTML = catalog.tools.map(tool => {
    const hasSkill = tool.paths && tool.paths.skill;
    // Build HTML string for each tool card
    return `<article class="tool-card">...</article>`;
  }).join('');
  
  // Update tool count
  document.getElementById('toolCount').textContent = t('toolCount', catalog.tools.length);
}
```

**Key points:**
- Uses template literals for HTML
- Conditional rendering with ternary operators
- Handles both active and coming-soon states
- Shows AI Skill button only if `tool.paths.skill` exists
- Shows `createdWith` badge if field exists

#### Features Toggle

```javascript
function toggleFeatures(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  const text = card.querySelector('.toggle-text');
  const expanded = card.classList.toggle('expanded');
  text.textContent = expanded ? t('hideFeatures') : t('showFeatures');
}
```

- Finds card by `data-id` attribute
- Toggles `.expanded` class
- Updates button text

#### Prompt Copy

```javascript
async function copyPrompt(path) {
  try {
    const res = await fetch('./' + path);
    if (!res.ok) throw new Error('Fetch failed');
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    showToast(t('copiedToast'));
  } catch (e) {
    // Fallback: open in new tab
    window.open('./' + path, '_blank');
    showToast(t('copyError'), true);
  }
}
```

**Flow:**
1. Fetch the .md file
2. Copy text to clipboard
3. Show success toast
4. If anything fails → open file in new tab + show error toast

#### Skill Copy (similar to Prompt)

```javascript
async function copySkill(path) {
  try {
    const res = await fetch('./' + path);
    if (!res.ok) throw new Error('Fetch failed');
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    showToast(t('skillCopiedToast'));
  } catch (e) {
    window.open('./' + path, '_blank');
    showToast(t('copyError'), true);
  }
}
```

#### Language Switching

```javascript
function setLang(l) {
  lang = l;
  localStorage.setItem('sporttools-lang', l);
  
  // Update toggle buttons
  document.querySelectorAll('.lang-btn').forEach(b => 
    b.classList.toggle('active', b.dataset.lang === l)
  );
  
  // Update static text
  document.querySelectorAll('[data-i18n]').forEach(el => 
    el.textContent = t(el.dataset.i18n)
  );
  
  // Re-render dynamic content
  render();
}
```

**How it works:**
- Static text uses `data-i18n` attribute
- Dynamic content (tool cards) re-renders completely
- Language saved to localStorage

#### Toast Notifications

```javascript
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  
  document.getElementById('toastMessage').textContent = msg;
  toast.classList.toggle('error', isError);
  
  // Swap icon
  icon.innerHTML = isError 
    ? '<circle cx="12" cy="12" r="10"/>...'  // X icon
    : '<path d="M20 6L9 17l-5-5"/>';          // Checkmark
  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
```

---

### HTML Structure

```html
<body>
  <!-- Sticky header with logo, nav, and language toggle -->
  <header class="header">
    <div class="header-inner">
      <div class="header-left">
        <a class="logo">...</a>
        <nav class="nav">
          <a href="./" class="nav-link active">Tools</a>
          <a href="./about.html" class="nav-link">About</a>
        </nav>
      </div>
      <div class="header-right">
        <div class="lang-toggle">...</div>
      </div>
    </div>
  </header>
  
  <!-- Hero section with tagline -->
  <section class="hero">
    <h1 data-i18n="tagline">Simple tools. Direct solutions.</h1>
    <p data-i18n="heroDescription">...</p>
    <p data-i18n="heroActions">Use · Create · ...</p>
  </section>
  
  <!-- Main content with tool grid -->
  <main class="main">
    <div class="section-header">...</div>
    <div class="tools-grid" id="toolsGrid">
      <!-- Tool cards rendered here by JS -->
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="footer">...</footer>
  
  <!-- Toast notification (hidden by default) -->
  <div class="toast" id="toast">...</div>
  
  <script>...</script>
</body>
```

---

## About Page (docs/about.html)

### Overview

Standalone page with same header/footer as Tools page. Contains:
- Vision section
- Value proposition section
- How It Works section (4 action cards)
- Future Development section (community collaboration panel)

### Content Management

Content is **hardcoded in the HTML** inside a `content` object:

```javascript
const content = {
  en: {
    vision: `<p>...</p>`,
    value: `<p>...</p>`,
    // ...
  },
  es: {
    vision: `<p>...</p>`,
    // ...
  }
};
```

**Note:** `about-content.md` exists as a reference document but is NOT auto-loaded. Edit the `content` object in `about.html` directly.

### Sections

1. **Our Vision** — Community collaborative space, modular solutions philosophy
2. **Why It Matters** — Value of sharing, sustainability, standardization
3. **How It Works** — 4 cards: Use, Download, Prompt, AI Skill (coming soon)
4. **Future Development** — Community collaboration panel with interactive flow diagram

### Flow Diagram

Interactive CSS-based diagram showing:
```
Pain Point → Community → Solution → Share
```

- Hover states on each step
- Footnote: "Liked a solution? Hire the talent behind it"

---

## Wrapper Page (tools/[name]/index.html)

### Purpose
Provides SPORTTOOLS branding when using a tool on the site.

### Structure

```html
<body>
  <!-- Black header bar -->
  <header class="header">
    <div class="header-inner">
      <!-- Left: Back link -->
      <a href="../../" class="back-link">← Back to Tools</a>
      
      <!-- Right: SPORTTOOLS logo -->
      <a href="https://sporttools.eu" class="logo">SPORTTOOLS</a>
    </div>
  </header>
  
  <!-- Tool loads in iframe -->
  <iframe src="tool.html" class="tool-frame"></iframe>
  
  <!-- Footer -->
  <footer class="footer">
    Powered by SPORTTOOLS
  </footer>
</body>
```

### CSS Key Points

**Full height layout:**
```css
html, body {
  height: 100%;
  overflow: hidden;  /* Page doesn't scroll */
}
body {
  display: flex;
  flex-direction: column;
}
.tool-frame {
  flex: 1;  /* Takes remaining space */
}
```

**Iframe fills available space:**
```css
.tool-frame {
  flex: 1;
  width: 100%;
  border: none;
}
```

- Header and footer are fixed height
- Iframe fills remaining vertical space
- Tool scrolls inside iframe, not the page

---

## Build Script (scripts/build.js)

### Flow

```
1. Read /tools/ directory
2. For each subdirectory:
   a. Check for tool.json
   b. Parse and validate
   c. Add paths (including skill.md if exists)
   d. Copy folder to /docs/tools/
3. Sort tools (active first, newest first)
4. Write catalog.json
```

### Key Functions

**copyDir** — Recursive directory copy:
```javascript
function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);  // Recurse
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
```

**Path generation:**
```javascript
toolData.paths = {
  page: `tools/${toolDir}/`,          // Wrapper page
  tool: `tools/${toolDir}/tool.html`, // Download file
  prompt: `tools/${toolDir}/prompt.md`
};

// Check for optional skill file
const skillPath = path.join(toolPath, 'skill.md');
if (fs.existsSync(skillPath)) {
  toolData.paths.skill = `tools/${toolDir}/skill.md`;
}
```

**Sorting:**
```javascript
catalog.sort((a, b) => {
  // Active tools first
  if (a.status === 'active' && b.status !== 'active') return -1;
  if (a.status !== 'active' && b.status === 'active') return 1;
  // Then by date (newest first)
  return (b.dateAdded || '').localeCompare(a.dateAdded || '');
});
```

---

## GitHub Actions (deploy.yml)

### Workflow

```yaml
on:
  push:
    branches: [main]

jobs:
  build:
    steps:
      - Checkout repo
      - Setup Node.js
      - Run: node scripts/build.js
      - Commit changes to docs/
      - Push
  
  deploy:
    needs: build
    steps:
      - Checkout (with latest changes)
      - Deploy docs/ to GitHub Pages
```

### Why Two Jobs?

1. **build** — Updates catalog.json, commits changes
2. **deploy** — Deploys after build is complete

This ensures the deployed version has the latest catalog.

---

## Common Modifications

### Adding a New Language

1. Add translations to `i18n` object in `index.html` and `about.html`
2. Add button to `.lang-toggle`
3. Update `setLang()` if needed

### Changing Colors

Update CSS variables in `:root`:
```css
--accent-use: #NEW_COLOR;
--accent-use-hover: #DARKER_SHADE;
```

### Adding a New Metadata Field

1. Add to `tool.json` schema
2. Update validation in `build.js` (if required)
3. Add to card rendering in `render()` function
4. Add translations if needed

### Changing Card Layout

Modify `.tool-card` and child element styles in CSS.

### Adding Search/Filter

Would require:
1. Input field in HTML
2. Filter function in JS
3. Re-render on input change

---

## Debugging Tips

**Catalog not loading:**
- Check browser console for fetch errors
- Verify `catalog.json` exists in `/docs/`
- Run `node scripts/build.js`

**Styles not applying:**
- Check CSS specificity
- Verify class names match
- Check for typos in CSS variables

**Language not switching:**
- Check localStorage: `localStorage.getItem('sporttools-lang')`
- Verify `data-i18n` attributes
- Check `i18n` object has all keys

**Build script failing:**
- Check `tool.json` syntax (valid JSON?)
- Verify required fields present
- Check file permissions

**About page content not updating:**
- Remember: content is hardcoded in `about.html`
- Edit the `content` object directly, not `about-content.md`
