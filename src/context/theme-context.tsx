'use client';

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'proedge_theme';

const themeListeners = new Set<() => void>();

function emitThemeChange() {
  themeListeners.forEach((listener) => listener());
}

function subscribeToTheme(callback: () => void) {
  themeListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function getThemeSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function getThemeServerSnapshot(): Theme {
  return 'dark';
}

function applyThemeToDocument(newTheme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (newTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  // Synchronize document classes whenever the theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore local storage errors (e.g. private mode quota)
    }
    applyThemeToDocument(newTheme);
    emitThemeChange();
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
