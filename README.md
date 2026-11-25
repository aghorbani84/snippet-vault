# Snippet Vault

**A fast, local-first code snippet manager with syntax highlighting, tags, search, and JSON import/export.**

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f)](https://aghorbani84.github.io/snippet-vault/)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
[![GitHub stars](https://img.shields.io/github/stars/aghorbani84/snippet-vault?style=flat)](https://github.com/aghorbani84/snippet-vault/stargazers)

**Live demo:** https://aghorbani84.github.io/snippet-vault/

## Overview

Snippet Vault keeps the code you reuse in one searchable place. Snippets live in your browser's
`localStorage`; there is no backend and no account. Export to JSON whenever you want a backup.

## Features

- **Create, edit, and delete snippets** with a title, language, code, description, and tags.
- **Syntax highlighting** via highlight.js for JavaScript, TypeScript, Python, CSS, Bash, SQL, and HTML, with a code theme matched to the app theme.
- **Multi-word search** across title, code, description, and tags.
- **Filters** by language and a favorites-only view.
- **Copy to clipboard**, with a fallback for non-secure contexts.
- **JSON export and import**; invalid files are rejected.
- **Seed snippets** on first run (debounce, fetch with timeout, retry with backoff, and more).
- **Themes**: Achaemenid and Modern styles, each in light and dark.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19, TypeScript |
| Build | Vite 8 |
| State | React `useState` / `useMemo` |
| Highlighting | highlight.js |
| Styling | CSS Modules |
| Icons | lucide-react |
| Deploy | GitHub Actions → GitHub Pages |

## Getting started

Requires Node.js 20 or newer and npm.

```bash
git clone https://github.com/aghorbani84/snippet-vault.git
cd snippet-vault
npm install
npm run dev        # http://localhost:5173/snippet-vault/
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Project structure

```
src/
  App.tsx            shell: state, search and filters, import/export
  types.ts           Snippet type and supported languages
  data/seed.ts       first-run seed snippets
  lib/               filter.ts, theme.ts, hljsThemes.ts, languageColors.ts
  components/        SnippetRow, SnippetDetail, SnippetForm, CodeBlock, ThemeSwitcher (+ .module.css)
.github/workflows/   GitHub Pages deploy
```

Data is stored under the `snippet-vault:snippets:v1` key and never leaves the browser.

## Author

Built by [Abolfazl Ghorbani](https://github.com/aghorbani84).
