import { useCallback, useEffect, useState } from 'react';

export type ThemeStyle = 'achaemenid' | 'modern';
export type ThemeMode = 'light' | 'dark';

export interface Theme {
  style: ThemeStyle;
  mode: ThemeMode;
}

export const STYLE_KEY = 'showcase-style';
export const MODE_KEY = 'showcase-mode';

function readStoredStyle(): ThemeStyle {
  try {
    return localStorage.getItem(STYLE_KEY) === 'achaemenid'
      ? 'achaemenid'
      : 'modern';
  } catch {
    return 'modern';
  }
}

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable — fall through to the media query */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function readInitialTheme(): Theme {
  return { style: readStoredStyle(), mode: readStoredMode() };
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.setAttribute('data-style', theme.style);
  root.setAttribute('data-mode', theme.mode);
  try {
    localStorage.setItem(STYLE_KEY, theme.style);
    localStorage.setItem(MODE_KEY, theme.mode);
  } catch {
    /* storage unavailable — attributes still apply for this session */
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setStyle = useCallback((style: ThemeStyle) => {
    setTheme((prev) => ({ ...prev, style }));
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }));
  }, []);

  const toggleMode = useCallback(() => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  return { theme, setStyle, setMode, toggleMode };
}
