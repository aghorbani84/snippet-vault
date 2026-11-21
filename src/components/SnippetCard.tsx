import { useState } from 'react';
import type { Snippet } from '../types';
import CodeBlock from './CodeBlock';
import styles from './SnippetCard.module.css';

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export default function SnippetCard({
  snippet,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context): fall back
      // to a temporary textarea selection.
      const textarea = document.createElement('textarea');
      textarea.value = snippet.code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{snippet.title}</h2>
          <p className={styles.description}>{snippet.description}</p>
        </div>
        <button
          type="button"
          className={`${styles.star} ${snippet.favorite ? styles.starred : ''}`}
          onClick={() => onToggleFavorite(snippet.id)}
          aria-label={
            snippet.favorite ? 'Remove from favorites' : 'Add to favorites'
          }
          title={snippet.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {snippet.favorite ? '★' : '☆'}
        </button>
      </header>

      <div className={styles.meta}>
        <span className={styles.language}>{snippet.language}</span>
        {snippet.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={styles.tag}
            onClick={() => onTagClick(tag)}
            title={`Search for "${tag}"`}
          >
            #{tag}
          </button>
        ))}
        <span className={styles.date}>
          {new Date(snippet.updatedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      <CodeBlock code={snippet.code} language={snippet.language} />

      <footer className={styles.actions}>
        <button type="button" className={styles.button} onClick={copyCode}>
          {copied ? 'Copied!' : 'Copy code'}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => onEdit(snippet)}
        >
          Edit
        </button>
        {confirmDelete ? (
          <>
            <button
              type="button"
              className={`${styles.button} ${styles.danger}`}
              onClick={() => onDelete(snippet.id)}
            >
              Confirm delete
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className={`${styles.button} ${styles.danger}`}
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        )}
      </footer>
    </article>
  );
}
