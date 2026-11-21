import type { Snippet } from '../types';
import { createSnippet } from '../types';

export const SEED_SNIPPETS: Snippet[] = [
  createSnippet({
    title: 'Debounce a function',
    language: 'TypeScript',
    description:
      'Delays invoking fn until wait ms have passed since the last call. Ideal for search inputs and window resize handlers.',
    tags: ['utility', 'performance', 'events'],
    code: `export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait = 300,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

// Usage: run the search only after the user stops typing.
const onSearch = debounce((query: string) => {
  console.log('Searching for:', query);
}, 400);`,
  }),
  createSnippet({
    title: 'Fetch with timeout',
    language: 'JavaScript',
    description:
      'Wraps fetch() with an AbortController so a slow request fails fast instead of hanging forever.',
    tags: ['fetch', 'async', 'network'],
    code: `async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Usage
const data = await fetchWithTimeout(
  'https://api.example.com/users',
  {},
  3000,
).catch((err) => console.error('Request failed:', err.name));`,
  }),
  createSnippet({
    title: 'Quicksort in Python',
    language: 'Python',
    description:
      'A concise recursive quicksort. Picks the middle element as pivot, partitions the rest, and recurses on both sides.',
    tags: ['algorithm', 'sorting', 'recursion'],
    code: `def quicksort(items: list[int]) -> list[int]:
    """Return a new sorted list using quicksort."""
    if len(items) <= 1:
        return items

    pivot = items[len(items) // 2]
    left = [x for x in items if x < pivot]
    middle = [x for x in items if x == pivot]
    right = [x for x in items if x > pivot]

    return quicksort(left) + middle + quicksort(right)


# Usage
print(quicksort([9, 3, 7, 1, 8, 2]))  # [1, 2, 3, 7, 8, 9]`,
  }),
  createSnippet({
    title: 'Throttle scroll handler',
    language: 'JavaScript',
    description:
      'Runs fn at most once per limit ms, using requestAnimationFrame when available so scroll-driven UI stays smooth.',
    tags: ['utility', 'performance', 'scroll'],
    code: `function throttle(fn, limit = 100) {
  let inThrottle = false;
  let lastArgs = null;

  return function (...args) {
    if (inThrottle) {
      lastArgs = args;
      return;
    }
    fn.apply(this, args);
    inThrottle = true;
    setTimeout(() => {
      inThrottle = false;
      if (lastArgs) {
        fn.apply(this, lastArgs);
        lastArgs = null;
      }
    }, limit);
  };
}

// Usage
window.addEventListener(
  'scroll',
  throttle(() => console.log(window.scrollY), 150),
);`,
  }),
  createSnippet({
    title: 'Deep clone with structuredClone',
    language: 'TypeScript',
    description:
      'Deep-copies plain objects, arrays, Dates, Maps and Sets without a library. Falls back to JSON round-tripping for older runtimes.',
    tags: ['utility', 'objects', 'clone'],
    code: `export function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  // Fallback: loses Dates, Maps, functions and undefined values.
  return JSON.parse(JSON.stringify(value));
}

// Usage
const original = { user: { name: 'Ada', tags: ['a', 'b'] } };
const copy = deepClone(original);
copy.user.tags.push('c');
console.log(original.user.tags); // ['a', 'b'] — untouched`,
  }),
  createSnippet({
    title: 'Center a div with CSS Grid',
    language: 'CSS',
    description:
      'The shortest reliable way to center content both horizontally and vertically — one property on the parent.',
    tags: ['css', 'layout', 'centering'],
    code: `.centered {
  display: grid;
  place-items: center;
  min-height: 100vh;
}

/* The same trick works for a single child of any size:
   no margins, no transforms, no absolute positioning. */`,
  }),
  createSnippet({
    title: 'Retry an async operation',
    language: 'TypeScript',
    description:
      'Retries a promise-returning function with exponential backoff. Useful for flaky network calls and rate-limited APIs.',
    tags: ['async', 'retry', 'network'],
    code: `export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 500,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelayMs * 2 ** attempt),
      );
    }
  }
  throw lastError;
}

// Usage
const user = await retry(() => fetchUser(42), 4);`,
  }),
  createSnippet({
    title: 'Find files changed in the last day',
    language: 'Bash',
    description:
      'Lists files modified in the last 24 hours under the current directory, newest first. Handy before a commit or a backup.',
    tags: ['shell', 'files', 'productivity'],
    code: `#!/usr/bin/env bash
# Files modified in the last 24 hours, newest first.
find . -type f -mtime -1 -printf '%T@ %p\\n' \\
  | sort -nr \\
  | cut -d' ' -f2- \\
  | head -50`,
  }),
];
