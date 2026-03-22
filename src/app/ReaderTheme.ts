export const LIGHT_THEME: Record<string, string> = {
  '--reader-bg': '#ffffff',
  '--reader-bg-overlay': '#ffffffbf',
  '--reader-text': '#333333',
  '--reader-text-secondary': '#7575759f',
  '--reader-toc-bg': '#ffffff',
  '--reader-toc-text': 'black',
};

export const DARK_THEME: Record<string, string> = {
  '--reader-bg': '#1a1a1a',
  '--reader-bg-overlay': '#2a2a2abf',
  '--reader-text': '#e8e8e8',
  '--reader-text-secondary': '#a0a0a09f',
  '--reader-toc-bg': '#2a2a2a',
  '--reader-toc-text': '#e8e8e8',
};

export function getThemeVars(isDark: boolean) {
  return isDark ? DARK_THEME : LIGHT_THEME;
}
