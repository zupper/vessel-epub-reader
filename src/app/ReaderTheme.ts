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
      '--reader-bg-overlay': '#fffffff2',
      '--reader-text': '#333333',
      '--reader-text-secondary': '#7575759f',
      '--reader-toc-bg': '#ffffff',
      '--reader-toc-text': '#333333',
      '--reader-highlight': '#FFEB3B',
    },
  },
  sepia: {
    id: 'sepia',
    label: 'Sepia',
    isDark: false,
    vars: {
      '--reader-bg': '#FBF0D9',
      '--reader-bg-overlay': '#FBF0D9f2',
      '--reader-text': '#5F4B32',
      '--reader-text-secondary': '#8a7a669f',
      '--reader-toc-bg': '#F4ECD8',
      '--reader-toc-text': '#5F4B32',
      '--reader-highlight': '#E6C97A',
    },
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    isDark: false,
    vars: {
      '--reader-bg': '#C8E6C9',
      '--reader-bg-overlay': '#C8E6C9f2',
      '--reader-text': '#1B4332',
      '--reader-text-secondary': '#3566509f',
      '--reader-toc-bg': '#B9DDB9',
      '--reader-toc-text': '#1B4332',
      '--reader-highlight': '#81C784',
    },
  },
  'warm-night': {
    id: 'warm-night',
    label: 'Warm Night',
    isDark: true,
    vars: {
      '--reader-bg': '#1A0D00',
      '--reader-bg-overlay': '#2a1a0af2',
      '--reader-text': '#FFD580',
      '--reader-text-secondary': '#cc9f509f',
      '--reader-toc-bg': '#241400',
      '--reader-toc-text': '#FFD580',
      '--reader-highlight': '#8B6914',
    },
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    isDark: true,
    vars: {
      '--reader-bg': '#1C1C1E',
      '--reader-bg-overlay': '#2c2c2ef2',
      '--reader-text': '#E5E5EA',
      '--reader-text-secondary': '#a0a0a59f',
      '--reader-toc-bg': '#2c2c2e',
      '--reader-toc-text': '#E5E5EA',
      '--reader-highlight': '#5856D6',
    },
  },
  amoled: {
    id: 'amoled',
    label: 'AMOLED',
    isDark: true,
    vars: {
      '--reader-bg': '#000000',
      '--reader-bg-overlay': '#1a1a1af2',
      '--reader-text': '#E8E8E8',
      '--reader-text-secondary': '#a0a0a09f',
      '--reader-toc-bg': '#0a0a0a',
      '--reader-toc-text': '#E8E8E8',
      '--reader-highlight': '#BB86FC',
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

// --- Font Size ---

export const FONT_SIZES = [80, 90, 100, 110, 120, 130, 150, 175, 200] as const;
export type FontSize = (typeof FONT_SIZES)[number];
export const DEFAULT_FONT_SIZE: FontSize = 100;

export function getNextFontSize(current: FontSize): FontSize | null {
  const idx = FONT_SIZES.indexOf(current);
  return idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : null;
}

export function getPrevFontSize(current: FontSize): FontSize | null {
  const idx = FONT_SIZES.indexOf(current);
  return idx > 0 ? FONT_SIZES[idx - 1] : null;
}

export function isValidFontSize(value: number): value is FontSize {
  return (FONT_SIZES as readonly number[]).includes(value);
}

// --- Font Family ---

export type FontFamilyId =
  | 'default'
  | 'georgia' | 'palatino' | 'garamond' | 'times'
  | 'helvetica' | 'verdana' | 'trebuchet' | 'tahoma'
  | 'monospace';

export type FontFamilyConfig = {
  id: FontFamilyId;
  label: string;
  value: string;
};

const FONT_FAMILY_ORDER: FontFamilyId[] = [
  'default',
  'georgia', 'palatino', 'garamond', 'times',
  'helvetica', 'verdana', 'trebuchet', 'tahoma',
  'monospace',
];

const FONT_FAMILIES: Record<FontFamilyId, FontFamilyConfig> = {
  default: { id: 'default', label: 'Default', value: '' },
  georgia: { id: 'georgia', label: 'Georgia', value: 'Georgia, serif' },
  palatino: { id: 'palatino', label: 'Palatino', value: 'Palatino Linotype, Palatino, Book Antiqua, serif' },
  garamond: { id: 'garamond', label: 'Garamond', value: 'Garamond, EB Garamond, serif' },
  times: { id: 'times', label: 'Times', value: 'Times New Roman, Times, serif' },
  helvetica: { id: 'helvetica', label: 'Helvetica', value: 'Helvetica Neue, Helvetica, Arial, sans-serif' },
  verdana: { id: 'verdana', label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  trebuchet: { id: 'trebuchet', label: 'Trebuchet', value: 'Trebuchet MS, Lucida Grande, sans-serif' },
  tahoma: { id: 'tahoma', label: 'Tahoma', value: 'Tahoma, Segoe UI, sans-serif' },
  monospace: { id: 'monospace', label: 'Mono', value: 'SFMono-Regular, Menlo, Consolas, monospace' },
};

export const DEFAULT_FONT_FAMILY: FontFamilyId = 'default';

export function getFontFamily(id: FontFamilyId): FontFamilyConfig {
  return FONT_FAMILIES[id] ?? FONT_FAMILIES[DEFAULT_FONT_FAMILY];
}

export function getNextFontFamily(current: FontFamilyId): FontFamilyId {
  const idx = FONT_FAMILY_ORDER.indexOf(current);
  return FONT_FAMILY_ORDER[(idx + 1) % FONT_FAMILY_ORDER.length];
}

export function getPrevFontFamily(current: FontFamilyId): FontFamilyId {
  const idx = FONT_FAMILY_ORDER.indexOf(current);
  return FONT_FAMILY_ORDER[(idx - 1 + FONT_FAMILY_ORDER.length) % FONT_FAMILY_ORDER.length];
}

export function isValidFontFamilyId(value: string): value is FontFamilyId {
  return value in FONT_FAMILIES;
}

// --- TTS Speed ---

export const TTS_SPEEDS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5, 1.75, 2.0] as const;
export type TtsSpeed = (typeof TTS_SPEEDS)[number];
export const DEFAULT_TTS_SPEED: TtsSpeed = 1.0;

export function getNextTtsSpeed(current: TtsSpeed): TtsSpeed | null {
  const idx = TTS_SPEEDS.indexOf(current);
  return idx < TTS_SPEEDS.length - 1 ? TTS_SPEEDS[idx + 1] : null;
}

export function getPrevTtsSpeed(current: TtsSpeed): TtsSpeed | null {
  const idx = TTS_SPEEDS.indexOf(current);
  return idx > 0 ? TTS_SPEEDS[idx - 1] : null;
}

export function isValidTtsSpeed(value: number): value is TtsSpeed {
  return (TTS_SPEEDS as readonly number[]).includes(value);
}
