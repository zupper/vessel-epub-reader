export type ThemeId = 'light' | 'sepia' | 'forest' | 'warm-night' | 'slate' | 'amoled';

export type ReaderThemeConfig = {
  id: ThemeId;
  label: string;
  isDark: boolean;
  vars: Record<string, string>;
};

const CYCLE_ORDER: ThemeId[] = ['light', 'sepia', 'forest', 'warm-night', 'slate', 'amoled'];

const THEMES: Record<ThemeId, ReaderThemeConfig> = {
  light: {
    id: 'light',
    label: 'Light',
    isDark: false,
    vars: {
      '--reader-bg': '#fafafa',
      '--reader-bg-overlay': '#ffffffbf',
      '--reader-text': '#333333',
      '--reader-text-secondary': '#7575759f',
      '--reader-toc-bg': '#ffffff',
      '--reader-toc-text': '#333333',
    },
  },
  sepia: {
    id: 'sepia',
    label: 'Sepia',
    isDark: false,
    vars: {
      '--reader-bg': '#FBF0D9',
      '--reader-bg-overlay': '#FBF0D9bf',
      '--reader-text': '#5F4B32',
      '--reader-text-secondary': '#8a7a669f',
      '--reader-toc-bg': '#F4ECD8',
      '--reader-toc-text': '#5F4B32',
    },
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    isDark: false,
    vars: {
      '--reader-bg': '#C8E6C9',
      '--reader-bg-overlay': '#C8E6C9bf',
      '--reader-text': '#1B4332',
      '--reader-text-secondary': '#3566509f',
      '--reader-toc-bg': '#B9DDB9',
      '--reader-toc-text': '#1B4332',
    },
  },
  'warm-night': {
    id: 'warm-night',
    label: 'Warm Night',
    isDark: true,
    vars: {
      '--reader-bg': '#1A0D00',
      '--reader-bg-overlay': '#2a1a0abf',
      '--reader-text': '#FFD580',
      '--reader-text-secondary': '#cc9f509f',
      '--reader-toc-bg': '#241400',
      '--reader-toc-text': '#FFD580',
    },
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    isDark: true,
    vars: {
      '--reader-bg': '#1C1C1E',
      '--reader-bg-overlay': '#2c2c2ebf',
      '--reader-text': '#E5E5EA',
      '--reader-text-secondary': '#a0a0a59f',
      '--reader-toc-bg': '#2c2c2e',
      '--reader-toc-text': '#E5E5EA',
    },
  },
  amoled: {
    id: 'amoled',
    label: 'AMOLED',
    isDark: true,
    vars: {
      '--reader-bg': '#000000',
      '--reader-bg-overlay': '#1a1a1abf',
      '--reader-text': '#E8E8E8',
      '--reader-text-secondary': '#a0a0a09f',
      '--reader-toc-bg': '#0a0a0a',
      '--reader-toc-text': '#E8E8E8',
    },
  },
};

export const DEFAULT_THEME: ThemeId = 'light';

export function getTheme(id: ThemeId): ReaderThemeConfig {
  return THEMES[id] ?? THEMES[DEFAULT_THEME];
}

export function getThemeVars(id: ThemeId): Record<string, string> {
  return getTheme(id).vars;
}

export function getNextThemeId(current: ThemeId): ThemeId {
  const idx = CYCLE_ORDER.indexOf(current);
  return CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
}

export function isValidThemeId(value: string): value is ThemeId {
  return value in THEMES;
}
