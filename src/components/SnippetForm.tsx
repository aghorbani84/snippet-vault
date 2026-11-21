import { useState } from 'react';
import type { Language, Snippet } from '../types';
import { LANGUAGES } from '../types';
import styles from './SnippetForm.module.css';

export interface SnippetFormValues {
  title: string;
  language: Language;
  code: string;
  description: string;
  tags: string;
}

interface SnippetFormProps {
  initial?: Snippet;
  onSubmit: (values: SnippetFormValues) => void;
  onCancel: () => void;
}

export default function SnippetForm({
  initial,
  onSubmit,
  onCancel,
}: SnippetFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [language, setLanguage] = useState<Language>(
    initial?.language ?? 'TypeScript',
  );
  const [code, setCode] = useState(initial?.code ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('A title is required.');
      return;
    }
    if (!code.trim()) {
      setError('Code is required.');
      return;
    }
    onSubmit({
      title: title.trim(),
      language,
      code: code.replace(/\n+$/, ''),
      description: description.trim(),
      tags,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>
        {initial ? 'Edit snippet' : 'New snippet'}
      </h2>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <label className={styles.field}>
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Debounce a function"
          autoFocus
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Tags (comma-separated)</span>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="utility, performance"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>Description</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this snippet do?"
        />
      </label>

      <label className={styles.field}>
        <span>Code</span>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here…"
          rows={12}
          spellCheck={false}
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" className={styles.primary}>
          {initial ? 'Save changes' : 'Add snippet'}
        </button>
        <button type="button" className={styles.secondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
