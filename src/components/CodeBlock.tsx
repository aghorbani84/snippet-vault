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

  const lineCount = code.split('\n').length;

  return (
    <div className={styles.editor}>
      <div className={styles.chrome}>
        <span className={styles.lights} aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.language}>{language}</span>
        <span className={styles.lines}>
          {lineCount} line{lineCount === 1 ? '' : 's'}
        </span>
      </div>
      <pre className={styles.pre}>
        <code
          className={`hljs ${styles.code}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
