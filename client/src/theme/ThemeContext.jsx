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
    description: 'Aura-inspired premium dark', group: 'classic',
    vars: {
      // Core Colors — Aura premium dark
      '--bg-base':        '#0c0c0c',
      '--bg-surface':     'rgba(255, 255, 255, 0.03)',
      '--bg-elevated':    'rgba(255, 255, 255, 0.05)',
      '--border':         'rgba(255, 255, 255, 0.08)',
      '--text-primary':   '#ffffff',
      '--text-secondary': 'rgba(255, 255, 255, 0.65)',
      '--text-muted':     'rgba(255, 255, 255, 0.4)',
      '--gradient-text':  'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)',

      // Accent System
      '--accent':           '#E53935', // Blood Red
      '--accent-secondary': '#4FC3F7', // Secondary
      '--accent-success':   '#22C55E',
      '--accent-warning':   '#F59E0B',
      '--accent-emergency': '#DC2626',
      '--accent-info':      '#60A5FA',
      '--accent-inventory': '#8B5CF6',
      '--accent-glow':      'rgba(229, 57, 53, 0.25)',
      '--accent-soft':      'rgba(229, 57, 53, 0.06)',
      '--energy-color':     '#E53935',

      // Glassmorphism
      '--glass-bg':           'rgba(255, 255, 255, 0.03)',
      '--glass-bg-hover':     'rgba(255, 255, 255, 0.05)',
      '--glass-border':       'rgba(255, 255, 255, 0.08)',
      '--glass-border-hover': 'rgba(255, 255, 255, 0.16)',
      '--glass-blur':         '20px',
      '--glass-shadow':       '0 8px 32px rgba(0, 0, 0, 0.5)',

      // Gradient Orbs
      '--gradient-orb-1': 'rgba(229, 57, 53, 0.1)',
      '--gradient-orb-2': 'rgba(79, 195, 247, 0.08)',
      '--gradient-orb-3': 'rgba(139, 92, 246, 0.06)',

      // Sidebar
      '--sidebar-bg':     'rgba(12, 12, 12, 0.85)',
      '--sidebar-border': 'rgba(255, 255, 255, 0.06)',

      // Shadows & Glows
      '--card-shadow':    '0 8px 32px rgba(0, 0, 0, 0.5)',
      '--anime-glow':     'rgba(0, 0, 0, 0)',

      // Shape & Font
      '--card-radius':    '1.5rem',
      '--btn-radius':     '50px',
      '--input-radius':   '0.875rem',
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
      '--gradient-text':  'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',

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
  const savedTheme = localStorage.getItem('bbms-theme') || 'light';
  const [themeId, setThemeId] = useState(THEMES[savedTheme] ? savedTheme : 'light');
  const theme = THEMES[themeId] || THEMES.light;

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
