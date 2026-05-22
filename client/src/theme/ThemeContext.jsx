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

  aurora: {
    id: 'aurora', label: 'Aurora', emoji: '🌌',
    description: 'Northern lights gradient', group: 'classic',
    vars: {
      '--bg-base':        '#030712',
      '--bg-surface':     '#0a0f1e',
      '--bg-elevated':    '#111827',
      '--border':         '#1e3a3a',
      '--text-primary':   '#ecfdf5',
      '--text-secondary': '#6ee7b7',
      '--accent':         '#10b981',
      '--accent-glow':    'rgba(16,185,129,0.35)',
      '--accent-soft':    'rgba(16,185,129,0.12)',
      '--sidebar-bg':     '#020a10',
      '--sidebar-border': '#152828',
      '--card-shadow':    '0 4px 24px rgba(16,185,129,0.2)',
      '--anime-glow':     'rgba(0,0,0,0)',
      '--energy-color':   '#10b981',
      '--card-radius':    '1rem',
      '--btn-radius':     '0.75rem',
      '--input-radius':   '0.75rem',
      '--font-display':   "'Space Grotesk', sans-serif",
      '--font-body':      "'Inter', system-ui, sans-serif",
      '--border-width':   '1px',
      '--card-style':     'standard',
    },
  },

  // ═══════════════════════════
  // ANIME THEMES
  // ═══════════════════════════

  dragonball: {
    id: 'dragonball', label: 'Dragon Ball', emoji: '🔥',
    description: 'Saiyan power — orange fire & electric aura', group: 'anime',
    // Font: Bangers — comic book bold, perfect for Dragon Ball's bold style
    // Shape: Sharp diagonal-cut corners (like power level panels), thick borders
    // Personality: Electric, bold, chunky, MAXIMUM POWER
    vars: {
      '--bg-base':        '#0d0800',
      '--bg-surface':     '#1a1000',
      '--bg-elevated':    '#261800',
      '--border':         '#4a2c00',
      '--text-primary':   '#fff8e7',
      '--text-secondary': '#f59e0b',
      '--accent':         '#f97316',
      '--accent-glow':    'rgba(249,115,22,0.55)',
      '--accent-soft':    'rgba(249,115,22,0.15)',
      '--sidebar-bg':     '#0a0600',
      '--sidebar-border': '#3d2200',
      '--card-shadow':    '0 4px 32px rgba(249,115,22,0.35)',
      '--anime-glow':     'rgba(249,115,22,0.6)',
      '--energy-color':   '#fbbf24',
      // Sharp diagonal-cut panels like Dragon Ball Z power readings
      '--card-radius':    '0px',
      '--btn-radius':     '0px',
      '--input-radius':   '0px',
      '--font-display':   "'Bangers', 'Impact', cursive",
      '--font-body':      "'Oswald', 'Inter', sans-serif",
      '--border-width':   '2px',
      '--card-style':     'dragonball',
    },
  },

  onepiece: {
    id: 'onepiece', label: 'One Piece', emoji: '☠️',
    description: "Grand Line — ocean blue & pirate gold", group: 'anime',
    // Font: Pirata One — pirate/treasure map style font
    // Shape: Rounded with double border (like treasure chests / ships)
    // Personality: Adventure, bold, golden treasure, sea breeze
    vars: {
      '--bg-base':        '#020c1b',
      '--bg-surface':     '#041530',
      '--bg-elevated':    '#072044',
      '--border':         '#0e3a6e',
      '--text-primary':   '#e0f2fe',
      '--text-secondary': '#93c5fd',
      '--accent':         '#f59e0b',
      '--accent-glow':    'rgba(245,158,11,0.5)',
      '--accent-soft':    'rgba(245,158,11,0.12)',
      '--sidebar-bg':     '#010a16',
      '--sidebar-border': '#0a2d54',
      '--card-shadow':    '0 4px 32px rgba(245,158,11,0.25)',
      '--anime-glow':     'rgba(245,158,11,0.5)',
      '--energy-color':   '#fbbf24',
      // Chunky rounded — like the jolly roger flag, treasure chests
      '--card-radius':    '1.5rem',
      '--btn-radius':     '2rem',
      '--input-radius':   '1rem',
      '--font-display':   "'Pirata One', 'Cinzel', serif",
      '--font-body':      "'Crimson Pro', 'Georgia', serif",
      '--border-width':   '2px',
      '--card-style':     'onepiece',
    },
  },

  naruto: {
    id: 'naruto', label: 'Naruto', emoji: '🍃',
    description: 'Hidden Leaf — chakra seals & ninja scrolls', group: 'anime',
    // Font: Noto Serif JP — Japanese scroll/seal aesthetic
    // Shape: Rectangular with subtle corner marks like ninja seals/scrolls
    // Personality: Traditional Japan, scrolls, seals, determination
    vars: {
      '--bg-base':        '#0a0d00',
      '--bg-surface':     '#141800',
      '--bg-elevated':    '#1e2500',
      '--border':         '#3a4500',
      '--text-primary':   '#fef9ec',
      '--text-secondary': '#a3be50',
      '--accent':         '#f97316',
      '--accent-glow':    'rgba(249,115,22,0.45)',
      '--accent-soft':    'rgba(249,115,22,0.12)',
      '--sidebar-bg':     '#070900',
      '--sidebar-border': '#2c3600',
      '--card-shadow':    '0 4px 32px rgba(249,115,22,0.2)',
      '--anime-glow':     'rgba(163,190,80,0.5)',
      '--energy-color':   '#a3be50',
      // Scroll-like: slight radius, with seal marks on corners via CSS
      '--card-radius':    '0.25rem',
      '--btn-radius':     '0.25rem',
      '--input-radius':   '0.125rem',
      '--font-display':   "'Noto Serif JP', 'Sawarabi Mincho', serif",
      '--font-body':      "'Noto Sans JP', 'Inter', sans-serif",
      '--border-width':   '1px',
      '--card-style':     'naruto',
    },
  },

  deathnote: {
    id: 'deathnote', label: 'Death Note', emoji: '📓',
    description: "Kira's domain — black ink & gothic elegance", group: 'anime',
    // Font: Playfair Display — elegant gothic serif, like the Death Note itself
    // Shape: Zero radius, razor sharp rectangular — clinical precision
    // Personality: Elegant, minimal, gothic, precise, mysterious
    vars: {
      '--bg-base':        '#050505',
      '--bg-surface':     '#0d0d0d',
      '--bg-elevated':    '#141414',
      '--border':         '#2a2a2a',
      '--text-primary':   '#f5f5f5',
      '--text-secondary': '#a0a0a0',
      '--accent':         '#ffffff',
      '--accent-glow':    'rgba(255,255,255,0.2)',
      '--accent-soft':    'rgba(255,255,255,0.07)',
      '--sidebar-bg':     '#030303',
      '--sidebar-border': '#1a1a1a',
      '--card-shadow':    '0 4px 40px rgba(0,0,0,0.9)',
      '--anime-glow':     'rgba(255,255,255,0.12)',
      '--energy-color':   '#e5e5e5',
      // Sharp rectangular — like notebook pages, clinical precision
      '--card-radius':    '0px',
      '--btn-radius':     '0px',
      '--input-radius':   '0px',
      '--font-display':   "'Playfair Display', 'Didact Gothic', serif",
      '--font-body':      "'EB Garamond', 'Georgia', serif",
      '--border-width':   '1px',
      '--card-style':     'deathnote',
    },
  },

  jujutsu: {
    id: 'jujutsu', label: 'Jujutsu Kaisen', emoji: '👁️',
    description: 'Cursed energy — dark violet & fractured neon', group: 'anime',
    // Font: Rajdhani — modern sharp angular, fits the contemporary action feel
    // Shape: Slight asymmetric cuts, fractured border style
    // Personality: Dark, modern, sharp, cursed energy crackling
    vars: {
      '--bg-base':        '#08020f',
      '--bg-surface':     '#110520',
      '--bg-elevated':    '#1a0830',
      '--border':         '#3b1060',
      '--text-primary':   '#f0e6ff',
      '--text-secondary': '#c084fc',
      '--accent':         '#a855f7',
      '--accent-glow':    'rgba(168,85,247,0.55)',
      '--accent-soft':    'rgba(168,85,247,0.15)',
      '--sidebar-bg':     '#060010',
      '--sidebar-border': '#2d0a4e',
      '--card-shadow':    '0 4px 32px rgba(168,85,247,0.3)',
      '--anime-glow':     'rgba(168,85,247,0.6)',
      '--energy-color':   '#c084fc',
      // Slightly cut corners — like cursed spirit domain expansion
      '--card-radius':    '0.25rem',
      '--btn-radius':     '0.375rem',
      '--input-radius':   '0.25rem',
      '--font-display':   "'Rajdhani', 'Exo 2', sans-serif",
      '--font-body':      "'Rajdhani', 'Inter', sans-serif",
      '--border-width':   '1px',
      '--card-style':     'jujutsu',
    },
  },

  titan: {
    id: 'titan', label: 'Attack on Titan', emoji: '⚔️',
    description: 'Survey Corps — military steel & iron walls', group: 'anime',
    // Font: Bebas Neue — military stencil/poster style
    // Shape: 0 radius, thick borders, military form
    // Personality: Tactical, military, iron, disciplined
    vars: {
      '--bg-base':        '#0c0f0a',
      '--bg-surface':     '#151a10',
      '--bg-elevated':    '#1e2518',
      '--border':         '#374832',
      '--text-primary':   '#e8ead4',
      '--text-secondary': '#8fa88a',
      '--accent':         '#84cc16',
      '--accent-glow':    'rgba(132,204,22,0.4)',
      '--accent-soft':    'rgba(132,204,22,0.12)',
      '--sidebar-bg':     '#090c08',
      '--sidebar-border': '#2a3524',
      '--card-shadow':    '0 4px 32px rgba(0,0,0,0.7)',
      '--anime-glow':     'rgba(132,204,22,0.35)',
      '--energy-color':   '#a3e635',
      // Military rectangular — no curves, stencil discipline
      '--card-radius':    '0px',
      '--btn-radius':     '0px',
      '--input-radius':   '0px',
      '--font-display':   "'Bebas Neue', 'Impact', sans-serif",
      '--font-body':      "'Oswald', 'Inter', sans-serif",
      '--border-width':   '2px',
      '--card-style':     'titan',
    },
  },

  demonslayer: {
    id: 'demonslayer', label: 'Demon Slayer', emoji: '🌊',
    description: 'Water Breathing — flowing cyan & crimson elegance', group: 'anime',
    // Font: Noto Serif JP — Japanese traditional elegance
    // Shape: Elegant flowing curves with gradient borders
    // Personality: Traditional Japan, flowing water, elegant beauty
    vars: {
      '--bg-base':        '#010c12',
      '--bg-surface':     '#031622',
      '--bg-elevated':    '#052035',
      '--border':         '#0a3a52',
      '--text-primary':   '#e0f7fa',
      '--text-secondary': '#67e8f9',
      '--accent':         '#06b6d4',
      '--accent-glow':    'rgba(6,182,212,0.5)',
      '--accent-soft':    'rgba(6,182,212,0.12)',
      '--sidebar-bg':     '#010a10',
      '--sidebar-border': '#072c3f',
      '--card-shadow':    '0 4px 32px rgba(6,182,212,0.25)',
      '--anime-glow':     'rgba(220,38,38,0.35)',
      '--energy-color':   '#06b6d4',
      // Elegant flowing curves — like water breathing forms
      '--card-radius':    '1.25rem',
      '--btn-radius':     '2rem',
      '--input-radius':   '1rem',
      '--font-display':   "'Noto Serif JP', 'Sawarabi Mincho', serif",
      '--font-body':      "'Noto Sans JP', 'Inter', sans-serif",
      '--border-width':   '1px',
      '--card-style':     'demonslayer',
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
