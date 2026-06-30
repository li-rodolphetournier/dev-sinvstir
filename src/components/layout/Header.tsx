import React from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header
      className="flex items-center justify-between p-4 md:px-8 md:py-6 border-b sticky top-0 z-50"
      style={{
        backgroundColor: 'var(--bg-body)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="md:hidden p-2 text-muted hover:text-primary rounded-md"
        >
          <Menu size={24} />
        </button>

        <div className="flex md:hidden items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: '#f1f5f9', color: 'var(--text-gold)' }}
          >
            S
          </div>
        </div>

        <div className="hidden md:flex flex-col">
          <h1 className="text-2xl font-bold text-primary">Simulateur Crypto</h1>
          <p className="text-sm text-muted">
            Calculez vos gains et performances pour un investissement crypto.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="#"
          className="hidden sm:flex text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          S&apos;investir Conseil
        </a>
        <ThemeToggle />
        <button
          className="px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: 'linear-gradient(135deg, #0049C6, #04265F)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          Mon espace
        </button>
      </div>
    </header>
  );
}
