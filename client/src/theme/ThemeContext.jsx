import { createContext, useContext, useEffect, useState } from 'react';

// ──────────────────────────────────────────────────────────────
// Premium Themes: Dark & Light
// Sui.io-inspired futuristic design language
// ──────────────────────────────────────────────────────────────
export const THEMES = {

  // ═══════════════════════════
  // DARK THEME — Sui-inspired deep space
  // ═══════════════════════════
  dark: {
    id: 'dark', label: 'Dark Mode', emoji: '🌑',
    description: 'Futuristic deep-space dark', group: 'classic',
    vars: {
      // Core Colors — Sui-inspired deep dark
      '--bg-base':        '#030A14',
      '--bg-surface':     'rgba(255, 255, 255, 0.04)',
      '--bg-elevated':    'rgba(255, 255, 255, 0.08)',
      '--border':         'rgba(255, 255, 255, 0.08)',
      '--text-primary':   '#F1F5F9',
      '--text-secondary': '#94A3B8',

      // Accent System
      '--accent':         '#EF4444',
      '--accent-secondary': '#EC4899',
      '--accent-glow':    'rgba(239, 68, 68, 0.35)',
      '--accent-soft':    'rgba(239, 68, 68, 0.1)',
      '--energy-color':   '#EC4899',

      // Glassmorphism
      '--glass-bg':       'rgba(255, 255, 255, 0.05)',
      '--glass-bg-hover': 'rgba(255, 255, 255, 0.08)',
      '--glass-border':   'rgba(255, 255, 255, 0.1)',
      '--glass-border-hover': 'rgba(255, 255, 255, 0.2)',
      '--glass-blur':     '16px',
      '--glass-shadow':   '0 8px 32px rgba(0, 0, 0, 0.3)',

      // Gradient Orbs
      '--gradient-orb-1': 'rgba(239, 68, 68, 0.15)',
      '--gradient-orb-2': 'rgba(236, 72, 153, 0.12)',
      '--gradient-orb-3': 'rgba(168, 85, 247, 0.08)',

      // Sidebar
      '--sidebar-bg':     'rgba(3, 10, 20, 0.85)',
      '--sidebar-border': 'rgba(255, 255, 255, 0.06)',

      // Shadows & Glows
      '--card-shadow':    '0 4px 24px rgba(0, 0, 0, 0.4)',
      '--anime-glow':     'rgba(0, 0, 0, 0)',

      // Shape & Font
      '--card-radius':    '1rem',
      '--btn-radius':     '50px',
      '--input-radius':   '0.75rem',
      '--font-display':   "'Space Grotesk', sans-serif",
      '--font-body':      "'Inter', system-ui, sans-serif",
      '--border-width':   '1px',
      '--card-style':     'standard',
    },
  },

  // ═══════════════════════════
  // LIGHT THEME — Clean glass light
  // ═══════════════════════════
  light: {
    id: 'light', label: 'Light Mode', emoji: '☀️',
    description: 'Clean minimal light', group: 'classic',
    vars: {
      // Core Colors
      '--bg-base':        '#F0F4F8',
      '--bg-surface':     'rgba(255, 255, 255, 0.85)',
      '--bg-elevated':    'rgba(255, 255, 255, 0.95)',
      '--border':         'rgba(15, 23, 42, 0.08)',
      '--text-primary':   '#0F172A',
      '--text-secondary': '#64748B',

      // Accent System
      '--accent':         '#DC2626',
      '--accent-secondary': '#DB2777',
      '--accent-glow':    'rgba(220, 38, 38, 0.15)',
      '--accent-soft':    'rgba(220, 38, 38, 0.07)',
      '--energy-color':   '#DB2777',

      // Glassmorphism
      '--glass-bg':       'rgba(255, 255, 255, 0.7)',
      '--glass-bg-hover': 'rgba(255, 255, 255, 0.85)',
      '--glass-border':   'rgba(15, 23, 42, 0.08)',
      '--glass-border-hover': 'rgba(15, 23, 42, 0.15)',
      '--glass-blur':     '12px',
      '--glass-shadow':   '0 4px 24px rgba(0, 0, 0, 0.06)',

      // Gradient Orbs
      '--gradient-orb-1': 'rgba(239, 68, 68, 0.06)',
      '--gradient-orb-2': 'rgba(219, 39, 119, 0.04)',
      '--gradient-orb-3': 'rgba(168, 85, 247, 0.03)',

      // Sidebar
      '--sidebar-bg':     'rgba(255, 255, 255, 0.9)',
      '--sidebar-border': 'rgba(15, 23, 42, 0.06)',

      // Shadows
      '--card-shadow':    '0 4px 24px rgba(0, 0, 0, 0.06)',
      '--anime-glow':     'rgba(0, 0, 0, 0)',

      // Shape & Font
      '--card-radius':    '1rem',
      '--btn-radius':     '50px',
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

    // Body class for classic differentiation
    document.body.classList.remove('theme-anime', 'theme-classic');
    document.body.classList.add('theme-classic');

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
