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
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        borderRadius: '0.75rem',
        padding: '0.45rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.25rem',
        height: '2.25rem',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
        e.currentTarget.style.background = 'var(--accent-soft)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.transform = 'scale(1)';
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
