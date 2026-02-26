# SPORTTOOLS

> Simple tools. Direct solutions.

Ready-to-use sports administration tools — scheduling, rankings, management — plus the prompts to customize them.

## 🏗️ Architecture

```
sporttools/
├── docs/                     ← GitHub Pages serves from here
│   ├── index.html            ← Landing page
│   ├── catalog.json          ← Auto-generated tool catalog
│   └── tools/                ← Tool files (copied from /tools on build)
│
├── tools/                    ← Source of truth for all tools
│   └── [tool-name]/
│       ├── tool.json         ← Metadata (you edit this)
│       ├── tool.html         ← The actual tool (with branding)
│       └── prompt.md         ← Generation prompt
│
├── scripts/
│   └── build.js              ← Generates catalog.json
│
├── TOOL-TEMPLATE.md          ← Guide for creating new tools
│
└── .github/workflows/
    └── deploy.yml            ← Auto-build on push
```

## 🚀 Quick Start

### 1. Clone and setup
```bash
git clone https://github.com/YOUR_USERNAME/sporttools.git
cd sporttools
```

### 2. Run build locally
```bash
node scripts/build.js
```

### 3. Preview locally
```bash
cd docs
python -m http.server 8000
# Open http://localhost:8000
```

### 4. Deploy
Push to GitHub. The workflow will:
1. Run the build script
2. Commit updated `catalog.json`
3. Deploy to GitHub Pages

## ➕ Adding a New Tool

See **[TOOL-TEMPLATE.md](TOOL-TEMPLATE.md)** for the complete guide.

Quick summary:

1. Create a folder in `/tools/`:
```
tools/
└── my-new-tool/
    ├── tool.json         ← Metadata
    ├── tool.html         ← Tool with SPORTTOOLS branding
    └── prompt.md         ← Generation prompt
```

2. Include SPORTTOOLS branding in `tool.html` (header + footer)

3. Run `node scripts/build.js`

4. Push to GitHub

## 🏷️ Tool Branding

All tools include SPORTTOOLS branding:

- **Header:** Black bar with logo, links to sporttools.io
- **Footer:** "Made with SPORTTOOLS"
- **Offline mode:** Branding auto-hides when running from `file://`

See [TOOL-TEMPLATE.md](TOOL-TEMPLATE.md) for the exact code snippet.

## 📋 tool.json Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | URL-safe identifier (lowercase, hyphens) |
| `name` | ✅ | Object with `en` and `es` keys |
| `description` | ✅ | Object with `en` and `es` keys |
| `problem` | ✅ | What problem this solves |
| `features` | ✅ | Array of feature strings per language |
| `languages` | ✅ | Array of language codes the tool supports |
| `author` | ✅ | Author name |
| `dateAdded` | ✅ | YYYY-MM format |
| `downloads` | | Manual placeholder count |
| `rating` | | Manual placeholder (0-5) |
| `status` | ✅ | `"active"` or `"coming-soon"` |

## 🔧 GitHub Pages Setup

1. Go to repo Settings → Pages
2. Source: "GitHub Actions"
3. The workflow handles deployment automatically

## 🌐 Custom Domain

1. Buy domain (sporttools.io, sporttools.app, etc.)
2. Add `CNAME` file to `/docs/` with your domain
3. Configure DNS:
   - For apex domain: A records pointing to GitHub's IPs
   - For subdomain: CNAME record pointing to `YOUR_USERNAME.github.io`

See: [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## 📄 License

MIT
