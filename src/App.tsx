import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Code2,
  Download,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  Star,
  Upload,
} from 'lucide-react';
import type { Language, Snippet } from './types';
import { LANGUAGES, createSnippet } from './types';
import { SEED_SNIPPETS } from './data/seed';
import { filterSnippets } from './lib/filter';
import { LANGUAGE_COLORS } from './lib/languageColors';
import { applyHljsTheme } from './lib/hljsThemes';
import { useTheme } from './lib/theme';
import SnippetRow from './components/SnippetRow';
import SnippetDetail from './components/SnippetDetail';
import SnippetForm, { type SnippetFormValues } from './components/SnippetForm';
import ThemeSwitcher from './components/ThemeSwitcher';
import styles from './App.module.css';

const STORAGE_KEY = 'snippet-vault:snippets:v1';

function loadSnippets(): Snippet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_SNIPPETS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED_SNIPPETS;
    return parsed as Snippet[];
  } catch {
    return SEED_SNIPPETS;
  }
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i);
}

export default function App() {
  const { theme, setStyle, toggleMode } = useTheme();
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<string>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [notice, setNotice] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  }, [snippets]);

  // Swap the highlight.js theme whenever the style/mode combination changes.
  useEffect(() => {
    applyHljsTheme(theme);
  }, [theme]);

  const visibleSnippets = useMemo(
    () => filterSnippets(snippets, query, language, favoritesOnly),
    [snippets, query, language, favoritesOnly],
  );

  // One memoized stats object drives the language index bar, the proof
  // strip, the datasheet title and the totals row. Line counts count real
  // newlines in each snippet's code — no invented numbers.
  const stats = useMemo(() => {
    const perLanguage = new Map<string, number>();
    let totalLines = 0;
    let favorites = 0;
    for (const s of snippets) {
      perLanguage.set(s.language, (perLanguage.get(s.language) ?? 0) + 1);
      totalLines += s.code.split('\n').length;
      if (s.favorite) favorites += 1;
    }
    return {
      total: snippets.length,
      languages: perLanguage.size,
      totalLines,
      favorites,
      perLanguage,
    };
  }, [snippets]);

  const visibleStats = useMemo(() => {
    let lines = 0;
    let favorites = 0;
    for (const s of visibleSnippets) {
      lines += s.code.split('\n').length;
      if (s.favorite) favorites += 1;
    }
    return { lines, favorites };
  }, [visibleSnippets]);

  const datasheetTitle = `Snippet Vault v2 — ${stats.total} snippets · ${stats.languages} languages · ${stats.totalLines} lines`;

  useEffect(() => {
    document.title = datasheetTitle;
  }, [datasheetTitle]);

  // The detail pane follows the first visible snippet unless the user
  // picked one that is still visible.
  const selectedSnippet = useMemo(
    () =>
      visibleSnippets.find((s) => s.id === selectedId) ??
      visibleSnippets[0] ??
      null,
    [visibleSnippets, selectedId],
  );

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };

  const handleFormSubmit = (values: SnippetFormValues) => {
    const tags = parseTags(values.tags);
    if (editing) {
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? {
                ...s,
                title: values.title,
                language: values.language,
                code: values.code,
                description: values.description,
                tags,
                updatedAt: Date.now(),
              }
            : s,
        ),
      );
      flash(`Updated "${values.title}".`);
    } else {
      const snippet = createSnippet({ ...values, tags });
      setSnippets((prev) => [snippet, ...prev]);
      setSelectedId(snippet.id);
      flash(`Added "${values.title}".`);
    }
    setEditing(null);
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
    flash('Snippet deleted.');
  };

  const handleToggleFavorite = (id: string) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)),
    );
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(snippets, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippets.json';
    a.click();
    URL.revokeObjectURL(url);
    flash(`Exported ${snippets.length} snippet(s) as JSON.`);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) {
          throw new Error('Expected a JSON array of snippets.');
        }
        const imported: Snippet[] = parsed
          .filter(
            (item): item is Snippet =>
              !!item &&
              typeof item === 'object' &&
              typeof (item as Snippet).title === 'string' &&
              typeof (item as Snippet).code === 'string',
          )
          .map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            language: (LANGUAGES as string[]).includes(item.language)
              ? (item.language as Language)
              : 'JavaScript',
            tags: Array.isArray(item.tags) ? item.tags : [],
            favorite: Boolean(item.favorite),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }));
        if (imported.length === 0) {
          flash('Import failed: no valid snippets found in the file.');
          return;
        }
        setSnippets((prev) => [...imported, ...prev]);
        flash(`Imported ${imported.length} snippet(s).`);
      } catch {
        flash('Import failed: the file is not valid snippet JSON.');
      }
    };
    reader.readAsText(file);
  };

  const resetToSeed = () => {
    setSnippets(SEED_SNIPPETS);
    setQuery('');
    setLanguage('All');
    setFavoritesOnly(false);
    flash('Restored the built-in example snippets.');
  };

  const clearFilters = () => {
    setQuery('');
    setLanguage('All');
    setFavoritesOnly(false);
  };

  return (
    <div className={styles.window}>
      <header className={styles.chrome}>
        <span className={styles.lights} aria-hidden>
          <span />
          <span />
          <span />
        </span>
        {theme.style === 'achaemenid' && (
          <svg
            className={styles.faravahar}
            viewBox="0 0 32 24"
            width="30"
            height="22"
            aria-hidden
          >
            <g fill="currentColor">
              <circle cx="16" cy="8" r="2.6" />
              <path d="M13.5 6.5 3 2.5l1.6 4.4 8.9 1.1z" />
              <path d="M13.5 9.5 4.6 8.4l2 4 6.9.6z" />
              <path d="M18.5 6.5 29 2.5l-1.6 4.4-8.9 1.1z" />
              <path d="M18.5 9.5l8.9-1.1-2 4-6.9.6z" />
              <path d="M16 11.5 13.5 21l2.5-1.8L18.5 21z" />
            </g>
            <circle
              cx="16"
              cy="8"
              r="4.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        )}
        <h1 className={styles.windowTitle} title={datasheetTitle}>
          {datasheetTitle}
        </h1>
        <ThemeSwitcher
          theme={theme}
          onStyleChange={setStyle}
          onToggleMode={toggleMode}
        />
      </header>
      {theme.style === 'achaemenid' && (
        <div className={styles.doubleRule} aria-hidden />
      )}

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Library">
          <nav className={styles.navSection} aria-label="Collections">
            <p className={styles.navLabel}>Library</p>
            <button
              type="button"
              className={`${styles.navItem} ${language === 'All' && !favoritesOnly ? styles.navItemActive : ''}`}
              onClick={() => {
                setLanguage('All');
                setFavoritesOnly(false);
              }}
            >
              <Code2 size={16} strokeWidth={1.75} />
              All snippets
              <span className={styles.navItemCount}>{snippets.length}</span>
            </button>
            <button
              type="button"
              className={`${styles.navItem} ${favoritesOnly ? styles.navItemActive : ''}`}
              onClick={() => setFavoritesOnly((v) => !v)}
              aria-pressed={favoritesOnly}
            >
              <Star size={16} strokeWidth={1.75} />
              Favorites
              <span className={styles.navItemCount}>{stats.favorites}</span>
            </button>
          </nav>

          <nav className={styles.navSection} aria-label="Filter by language">
            <p className={styles.navLabel}>Languages</p>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                className={`${styles.navItem} ${language === lang && !favoritesOnly ? styles.navItemActive : ''}`}
                onClick={() => {
                  setLanguage(lang);
                  setFavoritesOnly(false);
                }}
              >
                <span
                  className={styles.langDot}
                  style={{ background: LANGUAGE_COLORS[lang] }}
                  aria-hidden
                />
                {lang}
                <span className={styles.navItemCount}>
                  {stats.perLanguage.get(lang) ?? 0}
                </span>
              </button>
            ))}
          </nav>

          <div className={styles.sidebarFoot}>
            <button type="button" className={styles.toolItem} onClick={handleExport}>
              <Download size={16} strokeWidth={1.75} />
              Export JSON
            </button>
            <button
              type="button"
              className={styles.toolItem}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} strokeWidth={1.75} />
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = '';
              }}
            />
            <button type="button" className={styles.toolItem} onClick={resetToSeed}>
              <RotateCcw size={16} strokeWidth={1.75} />
              Restore examples
            </button>
            <p className={styles.storageNote}>
              Snippets are stored only in your browser (localStorage). Export
              JSON to back them up.
            </p>
          </div>
        </aside>

        <section className={styles.list} aria-label="Snippets">
          <div className={styles.listToolbar}>
            <div className={styles.searchWrap}>
              <Search size={15} strokeWidth={1.75} />
              <input
                type="search"
                className={styles.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, code, description or tags…"
                aria-label="Search snippets"
              />
            </div>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus size={15} strokeWidth={2} />
              New snippet
            </button>
          </div>

          <div
            className={styles.indexBar}
            aria-label="Language index — click to filter"
          >
            <button
              type="button"
              className={`${styles.indexChip} ${language === 'All' && !favoritesOnly ? styles.indexChipActive : ''}`}
              onClick={() => {
                setLanguage('All');
                setFavoritesOnly(false);
              }}
              aria-pressed={language === 'All' && !favoritesOnly}
            >
              All <span>{stats.total}</span>
            </button>
            {[...stats.perLanguage.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([lang, count]) => (
                <button
                  key={lang}
                  type="button"
                  className={`${styles.indexChip} ${language === lang && !favoritesOnly ? styles.indexChipActive : ''}`}
                  onClick={() => {
                    setLanguage(lang);
                    setFavoritesOnly(false);
                  }}
                  aria-pressed={language === lang && !favoritesOnly}
                >
                  <span
                    className={styles.indexDot}
                    style={{
                      background:
                        LANGUAGE_COLORS[lang as keyof typeof LANGUAGE_COLORS],
                    }}
                    aria-hidden
                  />
                  {lang} <span>{count}</span>
                </button>
              ))}
          </div>

          <p className={styles.proofStrip} aria-label="Library totals">
            <strong>{stats.total}</strong> snippets ·{' '}
            <strong>{stats.languages}</strong> languages ·{' '}
            <strong>{stats.totalLines}</strong> lines ·{' '}
            <strong>{stats.favorites}</strong> favorite
            {stats.favorites === 1 ? '' : 's'}
          </p>

          <p className={styles.resultCount}>
            {visibleSnippets.length === 0
              ? 'No snippets match'
              : `Showing ${visibleSnippets.length} of ${snippets.length} snippet${snippets.length === 1 ? '' : 's'}`}
          </p>

          <div className={styles.rows}>
            {visibleSnippets.map((snippet) => (
              <SnippetRow
                key={snippet.id}
                snippet={snippet}
                selected={selectedSnippet?.id === snippet.id}
                onSelect={setSelectedId}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>

          <p className={styles.totalsRow}>
            In view: <strong>{visibleSnippets.length}</strong> snippet
            {visibleSnippets.length === 1 ? '' : 's'} ·{' '}
            <strong>{visibleStats.lines}</strong> lines ·{' '}
            <strong>{visibleStats.favorites}</strong> favorite
            {visibleStats.favorites === 1 ? '' : 's'}
          </p>
        </section>

        <main className={styles.detail}>
          {formOpen ? (
            <div className={styles.detailScroll}>
              <SnippetForm
                initial={editing ?? undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              />
            </div>
          ) : selectedSnippet ? (
            <SnippetDetail
              snippet={selectedSnippet}
              onEdit={(s) => {
                setEditing(s);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onTagClick={(tag) => setQuery(tag)}
            />
          ) : (
            <div className={styles.empty}>
              <SearchX size={34} strokeWidth={1.5} />
              <h2>No snippets match</h2>
              <p>
                Try a different search term, clear the language filter, or add
                your first snippet.
              </p>
              <button
                type="button"
                className={styles.primary}
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </main>
      </div>

      {notice && (
        <span className={styles.notice} role="status">
          <CheckCircle2 size={16} strokeWidth={2} />
          {notice}
        </span>
      )}
    </div>
  );
}
