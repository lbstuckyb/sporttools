# SPORTTOOLS — Development Guide

> Setup, build, and deployment instructions.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- Git
- Python 3 (for local testing)

---

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/sporttools.git
cd sporttools
```

---

## Project Structure

```
sporttools/
├── docs/                     ← GitHub Pages serves from here
│   ├── index.html            ← Landing page
│   ├── catalog.json          ← Auto-generated
│   └── tools/                ← Copied from /tools on build
│
├── tools/                    ← Source of truth
│   └── [tool-name]/
│       ├── tool.json         ← Metadata
│       ├── index.html        ← Wrapper page
│       ├── tool.html         ← Actual tool
│       └── prompt.md         ← Generation prompt
│
├── scripts/
│   └── build.js              ← Build script
│
└── .github/workflows/
    └── deploy.yml            ← Auto-deploy
```

---

## Build

```bash
node scripts/build.js
```

This:
1. Scans `/tools/` for tool folders
2. Validates each `tool.json`
3. Copies tools to `/docs/tools/`
4. Generates `/docs/catalog.json`

---

## Test Locally

```bash
cd docs
python -m http.server 8000
```

Open: http://localhost:8000

---

## Deploy

Push to GitHub. The workflow auto-deploys to GitHub Pages.

```bash
git add .
git commit -m "Your message"
git push
```

### First-time setup:
1. Go to repo **Settings** → **Pages**
2. Set Source to **"GitHub Actions"**

---

## Adding a New Tool

See [TOOL-TEMPLATE.md](TOOL-TEMPLATE.md) for the complete guide.

Quick steps:
1. Create folder: `tools/your-tool-name/`
2. Add files: `tool.json`, `index.html`, `tool.html`, `prompt.md`
3. Run `node scripts/build.js`
4. Test locally
5. Push

---

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Public-facing overview |
| `DEVELOPMENT.md` | This file — setup & build |
| `TOOL-TEMPLATE.md` | Guide for creating tools |
| `PROJECT.md` | Architecture & decisions |
| `TECHNICAL.md` | Code documentation |
| `CHANGELOG.md` | Version history |

---

## Custom Domain

1. Buy domain (sporttools.io, etc.)
2. Create `docs/CNAME` with your domain:
   ```
   sporttools.io
   ```
3. Configure DNS at your registrar:
   - **Apex domain:** A records → GitHub IPs
   - **Subdomain:** CNAME → `username.github.io`

See: [GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
