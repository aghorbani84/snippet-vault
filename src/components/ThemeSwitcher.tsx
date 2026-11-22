import { Landmark, Moon, Sparkles, Sun } from 'lucide-react';
import type { Theme, ThemeStyle } from '../lib/theme';
import styles from './ThemeSwitcher.module.css';

interface ThemeSwitcherProps {
  theme: Theme;
  onStyleChange: (style: ThemeStyle) => void;
  onToggleMode: () => void;
}

export default function ThemeSwitcher({
  theme,
  onStyleChange,
  onToggleMode,
}: ThemeSwitcherProps) {
  return (
    <div className={styles.switcher}>
      <div
        className={styles.segmented}
        role="group"
        aria-label="Visual style"
      >
        <button
          type="button"
          className={`${styles.segmentButton} ${theme.style === 'achaemenid' ? styles.segmentActive : ''}`}
          onClick={() => onStyleChange('achaemenid')}
          aria-pressed={theme.style === 'achaemenid'}
        >
          <Landmark size={14} strokeWidth={1.75} aria-hidden />
          <span>Achaemenid</span>
        </button>
        <button
          type="button"
          className={`${styles.segmentButton} ${theme.style === 'modern' ? styles.segmentActive : ''}`}
          onClick={() => onStyleChange('modern')}
          aria-pressed={theme.style === 'modern'}
        >
          <Sparkles size={14} strokeWidth={1.75} aria-hidden />
          <span>Modern</span>
        </button>
      </div>
      <button
        type="button"
        className={styles.modeToggle}
        onClick={onToggleMode}
        aria-label="Toggle dark mode"
        aria-pressed={theme.mode === 'dark'}
        title={theme.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme.mode === 'dark' ? (
          <Sun size={15} strokeWidth={1.75} aria-hidden />
        ) : (
          <Moon size={15} strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </div>
  );
}
