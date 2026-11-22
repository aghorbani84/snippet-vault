import type { Theme } from './theme';
import githubCss from 'highlight.js/styles/github.css?inline';
import githubDarkCss from 'highlight.js/styles/github-dark.css?inline';
import kimbieLightCss from 'highlight.js/styles/kimbie-light.css?inline';
import anOldHopeCss from 'highlight.js/styles/an-old-hope.css?inline';

/**
 * One highlight.js theme per style × mode combination:
 * - modern-light:      github        (clean white, indigo/blue tokens)
 * - modern-dark:       github-dark   (GitHub's dark code surface)
 * - achaemenid-light:  kimbie-light  (warm parchment #fbebd4, brown/gold)
 * - achaemenid-dark:   an-old-hope   (warm charcoal #1C1D21, muted gold)
 * The active theme's CSS text is injected into a single <style> tag and
 * swapped on every theme change — no reload, no competing stylesheets.
 */
const HLJS_THEMES: Record<`${Theme['style']}-${Theme['mode']}`, string> = {
  'modern-light': githubCss,
  'modern-dark': githubDarkCss,
  'achaemenid-light': kimbieLightCss,
  'achaemenid-dark': anOldHopeCss,
};

const STYLE_ID = 'hljs-theme';

export function applyHljsTheme(theme: Theme): void {
  const css = HLJS_THEMES[`${theme.style}-${theme.mode}`];
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
}
