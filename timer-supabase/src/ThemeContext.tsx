import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    success: string;
    danger: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme = {
  background: '#e9ecef',
  surface: '#ffffff',
  primary: '#007bff',
  secondary: '#6c757d',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e9ecef',
  shadow: 'rgba(0,0,0,0.1)',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107'
};

const darkTheme = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#4dabf7',
  secondary: '#9ca3af',
  text: '#ffffff',
  textSecondary: '#d1d5db',
  border: '#374151',
  shadow: 'rgba(0,0,0,0.4)',
  success: '#51cf66',
  danger: '#ff6b6b',
  warning: '#ffd43b'
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Update data-theme attribute when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}