'use client';
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sinvestir-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lire depuis localStorage ou préférence système
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const preferred: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initial = saved ?? preferred;
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return { theme, toggle, mounted };
}
