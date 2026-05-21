import { createContext, useContext, useEffect, useState } from 'react';

// ──────────────────────────────────────────────
// Theme definitions
// ──────────────────────────────────────────────
export const THEMES = {
  dark: {
    id: 'dark',
    label: 'Dark Mode',
    emoji: '🌑',
    description: 'Classic deep-space dark',
    vars: {
      '--bg-base':       '#0f172a',
      '--bg-surface':    '#1e293b',
      '--bg-elevated':   '#263347',
      '--border':        '#334155',
      '--text-primary':  '#f1f5f9',
      '--text-secondary':'#94a3b8',
      '--accent':        '#ef4444',
      '--accent-glow':   'rgba(239,68,68,0.3)',
      '--accent-soft':   'rgba(239,68,68,0.1)',
      '--sidebar-bg':    '#111827',
      '--sidebar-border':'#1f2937',
      '--card-shadow':   '0 4px 24px rgba(0,0,0,0.4)',
    },
  },
  light: {
    id: 'light',
    label: 'Light Mode',
    emoji: '☀️',
    description: 'Clean minimal light',
    vars: {
      '--bg-base':       '#f8fafc',
      '--bg-surface':    '#ffffff',
      '--bg-elevated':   '#f1f5f9',
      '--border':        '#e2e8f0',
      '--text-primary':  '#0f172a',
      '--text-secondary':'#64748b',
      '--accent':        '#dc2626',
      '--accent-glow':   'rgba(220,38,38,0.15)',
      '--accent-soft':   'rgba(220,38,38,0.07)',
      '--sidebar-bg':    '#ffffff',
      '--sidebar-border':'#e2e8f0',
      '--card-shadow':   '0 4px 24px rgba(0,0,0,0.06)',
    },
  },
  ghibli: {
    id: 'ghibli',
    label: 'Ghibli Forest',
    emoji: '🌿',
    description: 'Totoro soft greens & sky',
    vars: {
      '--bg-base':       '#1a2e1a',
      '--bg-surface':    '#1e3a22',
      '--bg-elevated':   '#254a2a',
      '--border':        '#2d5e35',
      '--text-primary':  '#e8f5e0',
      '--text-secondary':'#8cbd8c',
      '--accent':        '#4ade80',
      '--accent-glow':   'rgba(74,222,128,0.25)',
      '--accent-soft':   'rgba(74,222,128,0.1)',
      '--sidebar-bg':    '#152415',
      '--sidebar-border':'#1e3a22',
      '--card-shadow':   '0 4px 24px rgba(0,0,0,0.4)',
    },
  },
  synthwave: {
    id: 'synthwave',
    label: 'Synthwave',
    emoji: '🌆',
    description: '80s neon retro vibes',
    vars: {
      '--bg-base':       '#0d0221',
      '--bg-surface':    '#1a0438',
      '--bg-elevated':   '#240550',
      '--border':        '#3d0a8a',
      '--text-primary':  '#f5d0fe',
      '--text-secondary':'#c084fc',
      '--accent':        '#e879f9',
      '--accent-glow':   'rgba(232,121,249,0.35)',
      '--accent-soft':   'rgba(232,121,249,0.1)',
      '--sidebar-bg':    '#0a0118',
      '--sidebar-border':'#2d0770',
      '--card-shadow':   '0 4px 24px rgba(160,32,240,0.3)',
    },
  },
  ocean: {
    id: 'ocean',
    label: 'Deep Ocean',
    emoji: '🌊',
    description: 'Calm deep-sea blues',
    vars: {
      '--bg-base':       '#020f1e',
      '--bg-surface':    '#041830',
      '--bg-elevated':   '#062445',
      '--border':        '#0c3a6b',
      '--text-primary':  '#cce7ff',
      '--text-secondary':'#60a5fa',
      '--accent':        '#38bdf8',
      '--accent-glow':   'rgba(56,189,248,0.3)',
      '--accent-soft':   'rgba(56,189,248,0.1)',
      '--sidebar-bg':    '#010c18',
      '--sidebar-border':'#0a2e50',
      '--card-shadow':   '0 4px 24px rgba(0,60,120,0.5)',
    },
  },
  sakura: {
    id: 'sakura',
    label: 'Sakura',
    emoji: '🌸',
    description: 'Soft pink anime aesthetics',
    vars: {
      '--bg-base':       '#1a0a14',
      '--bg-surface':    '#2d1022',
      '--bg-elevated':   '#3d1530',
      '--border':        '#6b2050',
      '--text-primary':  '#fce4f0',
      '--text-secondary':'#f472b6',
      '--accent':        '#fb7185',
      '--accent-glow':   'rgba(251,113,133,0.3)',
      '--accent-soft':   'rgba(251,113,133,0.1)',
      '--sidebar-bg':    '#150810',
      '--sidebar-border':'#4a1535',
      '--card-shadow':   '0 4px 24px rgba(180,40,100,0.35)',
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    emoji: '⚡',
    description: 'Yellow-on-black neon city',
    vars: {
      '--bg-base':       '#0a0a0a',
      '--bg-surface':    '#111111',
      '--bg-elevated':   '#1a1a1a',
      '--border':        '#2a2a2a',
      '--text-primary':  '#fffde7',
      '--text-secondary':'#fbbf24',
      '--accent':        '#facc15',
      '--accent-glow':   'rgba(250,204,21,0.35)',
      '--accent-soft':   'rgba(250,204,21,0.08)',
      '--sidebar-bg':    '#050505',
      '--sidebar-border':'#1f1f1f',
      '--card-shadow':   '0 4px 24px rgba(250,204,21,0.15)',
    },
  },
  aurora: {
    id: 'aurora',
    label: 'Aurora',
    emoji: '🌌',
    description: 'Northern lights gradient',
    vars: {
      '--bg-base':       '#030712',
      '--bg-surface':    '#0a0f1e',
      '--bg-elevated':   '#111827',
      '--border':        '#1e3a3a',
      '--text-primary':  '#ecfdf5',
      '--text-secondary':'#6ee7b7',
      '--accent':        '#10b981',
      '--accent-glow':   'rgba(16,185,129,0.3)',
      '--accent-soft':   'rgba(16,185,129,0.1)',
      '--sidebar-bg':    '#020a10',
      '--sidebar-border':'#152828',
      '--card-shadow':   '0 4px 24px rgba(16,185,129,0.2)',
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(localStorage.getItem('bbms-theme') || 'dark');
  const theme = THEMES[themeId] || THEMES.dark;

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme class names
    Object.keys(THEMES).forEach(id => root.classList.remove(`theme-${id}`));
    root.classList.add(`theme-${themeId}`);

    // Inject CSS variables
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
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
