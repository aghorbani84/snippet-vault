import { useMemo } from 'react';
import hljs from 'highlight.js';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  code: string;
  language: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  CSS: 'css',
  Bash: 'bash',
  SQL: 'sql',
  HTML: 'xml',
};

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const highlighted = useMemo(() => {
    const lang = LANGUAGE_MAP[language] ?? 'plaintext';
    try {
      return hljs.highlight(code, { language: lang }).value;
    } catch {
      return hljs.highlightAuto(code).value;
    }
  }, [code, language]);

  return (
    <pre className={styles.pre}>
      <code
        className={`hljs ${styles.code}`}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </pre>
  );
}
