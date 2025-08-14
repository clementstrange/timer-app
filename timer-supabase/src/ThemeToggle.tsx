import React from 'react';
import { useTheme } from './ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();

  const toggleStyle = {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '24px',
    backgroundColor: theme === 'dark' ? colors.primary : colors.border,
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '2px'
  };

  const knobStyle = {
    position: 'absolute' as const,
    top: '2px',
    left: theme === 'dark' ? '26px' : '2px',
    width: '20px',
    height: '20px',
    backgroundColor: colors.surface,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    boxShadow: `0 2px 4px ${colors.shadow}`
  };

  return (
    <button
      style={toggleStyle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div style={knobStyle}>
        {theme === 'light' ? '☀️' : '🌙'}
      </div>
    </button>
  );
}