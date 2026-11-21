export type Language =
  | 'JavaScript'
  | 'TypeScript'
  | 'Python'
  | 'CSS'
  | 'Bash'
  | 'SQL'
  | 'HTML';

export interface Snippet {
  id: string;
  title: string;
  language: Language;
  code: string;
  description: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export const LANGUAGES: Language[] = [
  'JavaScript',
  'TypeScript',
  'Python',
  'CSS',
  'Bash',
  'SQL',
  'HTML',
];

export function createSnippet(
  data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'favorite'> & {
    favorite?: boolean;
  },
): Snippet {
  const now = Date.now();
  return {
    ...data,
    favorite: data.favorite ?? false,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}
