import { useEffect, useMemo, useRef, useState } from 'react';
import type { Language, Snippet } from './types';
import { LANGUAGES, createSnippet } from './types';
import { SEED_SNIPPETS } from './data/seed';
import { filterSnippets } from './lib/filter';
import SnippetCard from './components/SnippetCard';
import SnippetForm, { type SnippetFormValues } from './components/SnippetForm';
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
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<string>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Snippet | null>(null);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  }, [snippets]);

  const visibleSnippets = useMemo(
    () => filterSnippets(snippets, query, language, favoritesOnly),
    [snippets, query, language, favoritesOnly],
  );

  const favoriteCount = useMemo(
    () => snippets.filter((s) => s.favorite).length,
    [snippets],
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Snippet Vault</h1>
          <p className={styles.subtitle}>
            Save, search and reuse the code you keep coming back to.
          </p>
        </div>
        <div className={styles.stats}>
          <span>
            <strong>{snippets.length}</strong> snippets
          </span>
          <span>
            <strong>{favoriteCount}</strong> favorites
          </span>
        </div>
      </header>

      <section className={styles.toolbar} aria-label="Snippet controls">
        <input
          type="search"
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, code, description or tags…"
          aria-label="Search snippets"
        />
        <select
          className={styles.select}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Filter by language"
        >
          <option value="All">All languages</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${styles.toggle} ${favoritesOnly ? styles.toggleActive : ''}`}
          onClick={() => setFavoritesOnly((v) => !v)}
          aria-pressed={favoritesOnly}
        >
          ★ Favorites
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + New snippet
        </button>
      </section>

      <section className={styles.utilityBar} aria-label="Data tools">
        <button type="button" className={styles.tool} onClick={handleExport}>
          Export JSON
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={() => fileInputRef.current?.click()}
        >
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
        <button type="button" className={styles.tool} onClick={resetToSeed}>
          Restore examples
        </button>
        {notice && (
          <span className={styles.notice} role="status">
            {notice}
          </span>
        )}
      </section>

      {formOpen && (
        <SnippetForm
          initial={editing ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      <main>
        {visibleSnippets.length === 0 ? (
          <div className={styles.empty}>
            <h2>No snippets match</h2>
            <p>
              Try a different search term, clear the language filter, or add
              your first snippet.
            </p>
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                setQuery('');
                setLanguage('All');
                setFavoritesOnly(false);
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <p className={styles.resultCount}>
            Showing {visibleSnippets.length} of {snippets.length} snippet(s)
          </p>
        )}

        <div className={styles.grid}>
          {visibleSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={(s) => {
                setEditing(s);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onTagClick={(tag) => setQuery(tag)}
            />
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        Snippets are stored only in your browser (localStorage). Export JSON
        to back them up.
      </footer>
    </div>
  );
}
