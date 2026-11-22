import { Star } from 'lucide-react';
import type { Snippet } from '../types';
import { LANGUAGE_COLORS } from '../lib/languageColors';
import styles from './SnippetRow.module.css';

interface SnippetRowProps {
  snippet: Snippet;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function SnippetRow({
  snippet,
  selected,
  onSelect,
  onToggleFavorite,
}: SnippetRowProps) {
  // Real line count: number of newline-separated lines in the code.
  const lineCount = snippet.code.split('\n').length;
  return (
    <div
      className={`${styles.row} ${selected ? styles.selected : ''}`}
      role="button"
      tabIndex={0}
      aria-current={selected}
      onClick={() => onSelect(snippet.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(snippet.id);
        }
      }}
    >
      <span
        className={styles.dot}
        style={{ background: LANGUAGE_COLORS[snippet.language] }}
        aria-hidden
      />
      <span className={styles.text}>
        <span className={styles.title}>{snippet.title}</span>
        <span className={styles.subtitle}>
          {snippet.language} · {lineCount} line{lineCount === 1 ? '' : 's'} ·{' '}
          {new Date(snippet.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        {snippet.tags.length > 0 && (
          <span className={styles.tags}>
            {snippet.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </span>
        )}
      </span>
      <button
        type="button"
        className={`${styles.star} ${snippet.favorite ? styles.starred : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(snippet.id);
        }}
        aria-label={
          snippet.favorite ? 'Remove from favorites' : 'Add to favorites'
        }
        title={snippet.favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star size={15} strokeWidth={1.75} fill={snippet.favorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
