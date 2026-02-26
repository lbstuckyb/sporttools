# SPORTTOOLS Tool Template

> Standard template for creating tools for SPORTTOOLS.

---

## Required Structure

Every tool needs these files in its folder:

```
tools/
└── your-tool-name/
    ├── tool.json         ← Metadata
    ├── index.html        ← Wrapper page (SPORTTOOLS header + iframe)
    ├── tool.html         ← The actual tool (with optional footer)
    └── prompt.md         ← Generation prompt
```

---

## File Details

### 1. tool.json — Metadata

```json
{
  "id": "your-tool-name",
  "name": {
    "en": "Your Tool Name",
    "es": "Nombre de tu Herramienta"
  },
  "description": {
    "en": "Brief description of what the tool does.",
    "es": "Descripción breve de lo que hace la herramienta."
  },
  "problem": {
    "en": "The problem this solves",
    "es": "El problema que resuelve"
  },
  "features": {
    "en": ["Feature 1", "Feature 2", "Feature 3"],
    "es": ["Característica 1", "Característica 2", "Característica 3"]
  },
  "languages": ["EN", "ES"],
  "author": "Your Name",
  "dateAdded": "2025-02",
  "downloads": 0,
  "rating": 0,
  "status": "active"
}
```

**Status options:**
- `"active"` — Tool is ready to use
- `"coming-soon"` — Placeholder, shows grayed out card

---

### 2. index.html — Wrapper Page

This provides SPORTTOOLS branding and navigation when using the tool on the site.

Copy this template (no changes needed — it's generic):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPORTTOOLS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    html, body { height: 100%; overflow: hidden; }
    body {
      font-family: var(--font-display);
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #0a0a0a;
      padding: 0 20px;
      flex-shrink: 0;
    }
    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .back-link {
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      color: #888;
      font-size: 13px;
      font-weight: 500;
      transition: color 0.15s ease;
    }
    .back-link:hover { color: white; }
    .back-link svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: white;
    }
    .logo svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
    }
    .logo-text { font-size: 14px; font-weight: 600; }
    .tool-frame {
      flex: 1;
      width: 100%;
      border: none;
      display: block;
    }
    .footer {
      background: #ffffff;
      border-top: 1px solid #e8e8e8;
      padding: 12px 20px;
      text-align: center;
      flex-shrink: 0;
    }
    .footer-text { font-size: 12px; color: #888; }
    .footer-link {
      color: #0a0a0a;
      text-decoration: none;
      font-weight: 500;
    }
    .footer-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="../../" class="back-link">
        <svg viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Tools
      </a>
      <a href="https://sporttools.io" target="_blank" class="logo">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a10 10 0 0 1 0 20"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
        <span class="logo-text">SPORTTOOLS</span>
      </a>
    </div>
  </header>

  <iframe src="tool.html" class="tool-frame" title="Tool"></iframe>

  <footer class="footer">
    <p class="footer-text">
      Powered by <a href="https://sporttools.io" class="footer-link" target="_blank">SPORTTOOLS</a>
    </p>
  </footer>
</body>
</html>
```

**Note:** This wrapper is generic — no tool-specific text needed. Just copy it as-is for any new tool.

---

### 3. tool.html — The Actual Tool

Your tool code goes here. It should be a fully functional standalone HTML file.

**Optional footer** (recommended for downloaded versions):

Add this at the bottom of your tool, just before `</body>`:

```html
<!-- SPORTTOOLS Footer (optional) -->
<div style="
  background: #fafafa;
  border-top: 1px solid #e5e5e5;
  padding: 12px 20px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  color: #999;
">
  Powered by <a href="https://sporttools.io" target="_blank" style="color: #666; text-decoration: none;">SPORTTOOLS</a>
</div>
```

This footer is optional — the wrapper page (`index.html`) provides branding when using on the site. But it's nice to have for downloaded versions.

---

### 4. prompt.md — Generation Prompt

The full prompt used to generate this tool. Users can copy this to recreate or customize the tool.

Include:
- Project overview
- Requirements and constraints
- Technical specifications
- Any special instructions

---

## How It Works

| Action | What happens |
|--------|--------------|
| **Use** button | Opens `index.html` (wrapper with SPORTTOOLS header) |
| **Download** button | Downloads `tool.html` (standalone tool) |
| **Prompt** button | Copies `prompt.md` to clipboard |

---

## Checklist Before Adding a Tool

- [ ] `tool.json` has all required fields
- [ ] `index.html` wrapper page exists with correct tool name
- [ ] `tool.html` works standalone when opened directly
- [ ] `prompt.md` contains the full generation prompt
- [ ] Run `node scripts/build.js` — no errors
- [ ] Test locally with `python -m http.server 8000`
