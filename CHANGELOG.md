# SPORTTOOLS — Changelog

All notable changes to this project.

---

## [0.2.0] — 2025-03

### About Page & Navigation

**New Features:**
- About page with vision, value proposition, how it works, future development
- Navigation header (Tools | About) on all pages
- Updated hero section with new tagline structure
- `createdWith` field in tool.json to show which AI model built the tool
- Support for AI Skill files (skill.md) — button coming soon
- HOW-TO-UPDATE.md guide for PyCharm workflow

**Content:**
- Hero tagline: "Simple tools. Direct solutions."
- Hero subtitle: "Ready-to-use sports tools built with AI. Community-driven."
- Hero actions: "Use · Create · Customize · Improve · Share · Learn"
- About page sections: Vision, Why It Matters, How It Works, Future Development
- Community collaboration panel concept with interactive flow diagram

**Technical:**
- build.js now detects and includes skill.md paths
- build.js shows createdWith info during build
- New CSS variable: `--accent-skill: #0a0a0a` for future AI Skill button

---

## [0.1.0] — 2025-02-26

### Initial Release

**Core Features:**
- Landing page with tool catalog
- Bilingual support (EN/ES)
- Tool card display with metadata
- Click-to-expand features
- Three action buttons: Use, Download, Prompt

**Architecture:**
- Static site hosted on GitHub Pages
- Build script generates catalog from tool folders
- GitHub Actions auto-deploy on push

**Tools:**
- Tournament Manager (active)
- Bracket Generator (coming soon placeholder)

**Documentation:**
- README.md — Setup guide
- TOOL-TEMPLATE.md — Guide for creating tools
- PROJECT.md — Vision and architecture
- TECHNICAL.md — Code documentation
- CHANGELOG.md — This file

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 0.2.0 | 2025-03 | About page, navigation, createdWith field |
| 0.1.0 | 2025-02-26 | Initial release |

---

## Upcoming

- [ ] AI Skill button implementation
- [ ] Add more tools
- [ ] Search/filter functionality
- [ ] Category tags
- [ ] Community collaboration panel
- [ ] Custom domain setup
