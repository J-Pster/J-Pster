/**
 * Design tokens shared by every generated SVG card.
 *
 * Two palettes are rendered for each card so the README can use <picture>
 * with prefers-color-scheme and look native in both GitHub themes.
 */

const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const FONT_MONO =
  "ui-monospace, 'SF Mono', SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, monospace";

const THEMES = {
  dark: {
    id: 'dark',
    bg: '#0B0F14',
    surface: '#0F1620',
    surfaceAlt: '#141D28',
    border: '#1D2B3A',
    grid: '#16212D',
    text: '#E6EDF3',
    textStrong: '#FFFFFF',
    muted: '#7D8DA1',
    faint: '#4A5A6B',
    accent: '#22D3EE',
    accent2: '#A78BFA',
    accent3: '#34D399',
    warn: '#FBBF24',
    heat: ['#141D28', '#0E4A5B', '#12768C', '#19A6BF', '#22D3EE'],
    shadow: '#000000',
    shadowOpacity: 0.45,
  },
  light: {
    id: 'light',
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F2F6FA',
    border: '#D8E0E8',
    grid: '#EAF0F6',
    text: '#0B0F14',
    textStrong: '#04070A',
    muted: '#57646F',
    faint: '#9AA7B4',
    accent: '#0891B2',
    accent2: '#7C3AED',
    accent3: '#059669',
    warn: '#B45309',
    heat: ['#EAF0F6', '#BAE6F0', '#7DD3E5', '#2FA9C7', '#0E7490'],
    shadow: '#0B0F14',
    shadowOpacity: 0.12,
  },
};

/** Language brand colors, falling back to a rotating accent ramp. */
const LANGUAGE_COLORS = {
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Python: '#3572A5',
  Kotlin: '#A97BFF',
  Rust: '#DEA584',
  Go: '#00ADD8',
  'C#': '#178600',
  Java: '#B07219',
  HTML: '#E34C26',
  CSS: '#563D7C',
  SCSS: '#C6538C',
  Sass: '#CC6699',
  Vue: '#41B883',
  Dart: '#00B4AB',
  Shell: '#89E051',
  Bash: '#89E051',
  Markdown: '#8B93A1',
  JSON: '#6BA539',
  YAML: '#CB171E',
  SQL: '#E38C00',
  Docker: '#2496ED',
  'Git Config': '#F05032',
  Text: '#8B93A1',
  Other: '#5A6876',
};

const FALLBACK_RAMP = ['#22D3EE', '#A78BFA', '#34D399', '#FBBF24', '#F472B6', '#60A5FA'];

function languageColor(name, index = 0) {
  return LANGUAGE_COLORS[name] || FALLBACK_RAMP[index % FALLBACK_RAMP.length];
}

/** Escapes a string for safe inclusion in SVG text nodes and attributes. */
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Truncates a label so it cannot overflow its column. */
function clamp(value, maxChars) {
  const text = String(value ?? '');
  return text.length <= maxChars ? text : `${text.slice(0, maxChars - 1)}…`;
}

module.exports = {
  FONT_SANS,
  FONT_MONO,
  THEMES,
  languageColor,
  esc,
  clamp,
};
