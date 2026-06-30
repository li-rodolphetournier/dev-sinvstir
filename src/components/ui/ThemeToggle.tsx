'use client';
import { useTheme } from '../../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();

  // Évite l'hydratation mismatch
  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10 ${
        isDark
          ? 'bg-slate-800 text-blue-400 hover:bg-slate-700'
          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
      }`}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {isDark ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
