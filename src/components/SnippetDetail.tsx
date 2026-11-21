import { useState } from 'react';
import { Check, Copy, Pencil, Star, Trash2 } from 'lucide-react';
import type { Snippet } from '../types';
import { LANGUAGE_COLORS } from '../lib/languageColors';
import CodeBlock from './CodeBlock';
import styles from './SnippetDetail.module.css';

interface SnippetDetailProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTagClick: (tag: string) => void;
}

export default function SnippetDetail({
  snippet,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: SnippetDetailProps) {
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
    <div className={styles.detail} key={snippet.id}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{snippet.title}</h2>
          <button
            type="button"
            className={`${styles.star} ${snippet.favorite ? styles.starred : ''}`}
            onClick={() => onToggleFavorite(snippet.id)}
            aria-label={
              snippet.favorite ? 'Remove from favorites' : 'Add to favorites'
            }
            title={snippet.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={18} strokeWidth={1.75} fill={snippet.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className={styles.description}>{snippet.description}</p>
        <div className={styles.meta}>
          <span className={styles.language}>
            <span
              className={styles.dot}
              style={{ background: LANGUAGE_COLORS[snippet.language] }}
              aria-hidden
            />
            {snippet.language}
          </span>
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
            Updated{' '}
            {new Date(snippet.updatedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </header>

      <div className={styles.actions}>
        <button type="button" className={styles.copyButton} onClick={copyCode}>
          {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.75} />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => onEdit(snippet)}
        >
          <Pencil size={15} strokeWidth={1.75} />
          Edit
        </button>
        {confirmDelete ? (
          <>
            <button
              type="button"
              className={`${styles.button} ${styles.dangerSolid}`}
              onClick={() => onDelete(snippet.id)}
            >
              <Trash2 size={15} strokeWidth={1.75} />
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
            <Trash2 size={15} strokeWidth={1.75} />
            Delete
          </button>
        )}
      </div>

      <div className={styles.codeWrap}>
        <CodeBlock code={snippet.code} language={snippet.language} />
      </div>
    </div>
  );
}
