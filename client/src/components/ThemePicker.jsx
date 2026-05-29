import { useTheme } from '../theme/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const ThemePicker = () => {
  const { themeId, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(themeId === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      title={themeId === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-secondary)',
        borderRadius: '0.75rem',
        padding: '0.45rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.25rem',
        height: '2.25rem',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = themeId === 'dark' ? '#FBBF24' : '#6366F1';
        e.currentTarget.style.background = 'var(--accent-soft)';
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = '0 0 16px var(--accent-glow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.background = 'var(--glass-bg)';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.25rem',
        height: '1.25rem',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: themeId === 'dark' ? 'rotate(0deg)' : 'rotate(360deg)',
      }}>
        {themeId === 'dark' ? (
          <HiOutlineSun style={{ width: '100%', height: '100%' }} />
        ) : (
          <HiOutlineMoon style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </button>
  );
};

export default ThemePicker;
