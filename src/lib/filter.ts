import type { Snippet } from '../types';

/**
 * Pure filter used by the app and verified by a small node check.
 * Matches the query against title, code, description and tags;
 * optionally narrows to one language and/or favorites only.
 */
export function filterSnippets(
  snippets: Snippet[],
  query: string,
  language: string,
  favoritesOnly: boolean,
): Snippet[] {
  const q = query.trim().toLowerCase();
  return snippets.filter((s) => {
    if (favoritesOnly && !s.favorite) return false;
    if (language !== 'All' && s.language !== language) return false;
    if (!q) return true;
    const haystack = [s.title, s.code, s.description, ...s.tags]
      .join('\n')
      .toLowerCase();
    return q.split(/\s+/).every((word) => haystack.includes(word));
  });
}
