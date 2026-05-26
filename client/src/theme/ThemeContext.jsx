import { createContext, useContext, useEffect, useState } from 'react';

// ──────────────────────────────────────────────────────────────
// 10 Premium Themes: 3 Classic + 7 Full Anime Identity Themes
// Each anime theme has unique: colors + font + shape + personality
// ──────────────────────────────────────────────────────────────
export const THEMES = {

  // ═══════════════════════════
  // CLASSIC THEMES
  // ═══════════════════════════

  dark: {
    id: 'dark', label: 'Dark Mode', emoji: '🌑',
    description: 'Classic deep-space dark', group: 'classic',
    vars: {
      '--bg-base':        '#0f172a',
      '--bg-surface':     '#1e293b',
      '--bg-elevated':    '#263347',
      '--border':         '#334155',
      '--text-primary':   '#f1f5f9',
      '--text-secondary': '#94a3b8',
      '--accent':         '#ef4444',
      '--accent-glow':    'rgba(239,68,68,0.35)',
      '--accent-soft':    'rgba(239,68,68,0.1)',
      '--sidebar-bg':     '#111827',
      '--sidebar-border': '#1f2937',
      '--card-shadow':    '0 4px 24px rgba(0,0,0,0.4)',
      '--anime-glow':     'rgba(0,0,0,0)',
      '--energy-color':   '#ef4444',
      // Shape & Font
      '--card-radius':    '1rem',
      '--btn-radius':     '0.75rem',
      '--input-radius':   '0.75rem',
      '--font-display':   "'Space Grotesk', sans-serif",
      '--font-body':      "'Inter', system-ui, sans-serif",
      '--border-width':   '1px',
      '--card-style':     'standard',
    },
  },

  light: {
    id: 'light', label: 'Light Mode', emoji: '☀️',
    description: 'Clean minimal light', group: 'classic',
    vars: {
      '--bg-base':        '#f8fafc',
      '--bg-surface':     '#ffffff',
      '--bg-elevated':    '#f1f5f9',
      '--border':         '#e2e8f0',
      '--text-primary':   '#0f172a',
      '--text-secondary': '#64748b',
      '--accent':         '#dc2626',
      '--accent-glow':    'rgba(220,38,38,0.15)',
      '--accent-soft':    'rgba(220,38,38,0.07)',
      '--sidebar-bg':     '#ffffff',
      '--sidebar-border': '#e2e8f0',
      '--card-shadow':    '0 4px 24px rgba(0,0,0,0.06)',
      '--anime-glow':     'rgba(0,0,0,0)',
      '--energy-color':   '#dc2626',
      '--card-radius':    '1rem',
      '--btn-radius':     '0.75rem',
      '--input-radius':   '0.75rem',
      '--font-display':   "'Space Grotesk', sans-serif",
      '--font-body':      "'Inter', system-ui, sans-serif",
      '--border-width':   '1px',
      '--card-style':     'standard',
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const savedTheme = localStorage.getItem('bbms-theme') || 'dark';
  const [themeId, setThemeId] = useState(THEMES[savedTheme] ? savedTheme : 'dark');
  const theme = THEMES[themeId] || THEMES.dark;

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    Object.keys(THEMES).forEach(id => root.classList.remove(`theme-${id}`));
    root.classList.add(`theme-${themeId}`);

    // Inject all CSS variables
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // Body class for anime/classic differentiation
    document.body.classList.remove('theme-anime', 'theme-classic');
    document.body.classList.add(theme.group === 'anime' ? 'theme-anime' : 'theme-classic');

    // Apply body font
    document.body.style.fontFamily = theme.vars['--font-body'] || "'Inter', system-ui, sans-serif";

    localStorage.setItem('bbms-theme', themeId);
  }, [themeId, theme]);

  const setTheme = (id) => {
    if (THEMES[id]) setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
