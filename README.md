# Snippet Vault

A code snippet manager built with React + TypeScript (Vite). Save the code you
keep coming back to, find it instantly, and take it with you as JSON.

## Features

- **Create, edit and delete snippets** — title, language, code, description and tags
- **Syntax highlighting** powered by [highlight.js](https://highlightjs.org/)
  (github-dark theme), for JavaScript, TypeScript, Python, CSS, Bash, SQL and HTML
- **Full-text search** across title, code, description and tags (multi-word)
- **Filter by language** and a favorites-only toggle
- **Favorites** — star the snippets you use most
- **Copy to clipboard** with a fallback for non-secure contexts
- **Export all snippets as JSON** and **import JSON** back (validated, bad files rejected)
- **localStorage persistence** — everything is stored in your browser, no server, no account
- **8 genuinely useful seed snippets** on first run: a TypeScript debounce, fetch
  with timeout, a Python quicksort, a scroll throttle, a deep clone, a CSS centering
  trick, an async retry with exponential backoff, and a Bash find command

## Tech used

- React 19 + TypeScript + Vite
- State: plain React `useState` + `useMemo` (no state library)
- Highlighting: `highlight.js`
- Styling: CSS Modules (plus a small global stylesheet)
- Data: `localStorage` only — no API, no keys, no backend

## How to run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the development server              |
| `npm run build`   | Typecheck (`tsc -b`) and build for production |
| `npm run preview` | Serve the production build locally        |

## Project structure

```
src/
  App.tsx                  # Main shell: state, search/filter, import/export
  types.ts                 # Snippet type + factory
  data/seed.ts             # 8 real, working seed snippets
  lib/filter.ts            # Pure search/filter function
  components/
    CodeBlock.tsx          # highlight.js rendering
    SnippetCard.tsx        # Card: meta, tags, copy, edit, delete, favorite
    SnippetForm.tsx        # Create/edit form with validation
    *.module.css           # CSS Modules for each component
```

## Data & privacy

Snippets live only in your browser under the `snippet-vault:snippets:v1`
localStorage key. Use **Export JSON** to back them up; **Import JSON** restores
them. Nothing is ever sent to a server.
