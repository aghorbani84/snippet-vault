import type { Language } from '../types';

/** One muted dot color per language — the list's only color signal. */
export const LANGUAGE_COLORS: Record<Language, string> = {
  JavaScript: '#ca8a04',
  TypeScript: '#2563eb',
  Python: '#0891b2',
  CSS: '#db2777',
  Bash: '#65a30d',
  SQL: '#ea580c',
  HTML: '#dc2626',
};
