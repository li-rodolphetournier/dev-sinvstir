import React from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 flex-shrink-0 border-r border-subtle flex flex-col h-screen fixed md:sticky top-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="p-6">
          {/* Fake Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                S
              </div>
              <span className="font-semibold text-lg tracking-wide">SIMULATEURS</span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="md:hidden p-1 text-muted hover:text-primary rounded-md"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <div className="text-xs uppercase tracking-wider text-muted mb-2 font-semibold">
              Vos outils
            </div>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, rgba(0,73,198,0.12), rgba(4,38,95,0.08))',
                color: 'var(--accent-primary)',
                borderLeft: '2px solid var(--accent-primary)',
              }}
            >
              <span className="w-5 h-5 opacity-80 text-xl flex items-center justify-center">₿</span>
              Simulateur Crypto
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted hover:text-primary transition-colors"
            >
              <span className="w-5 h-5 opacity-80 text-xl flex items-center justify-center">
                📈
              </span>
              Intérêts composés
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted hover:text-primary transition-colors"
            >
              <span className="w-5 h-5 opacity-80 text-xl flex items-center justify-center">
                📉
              </span>
              Inflation
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted hover:text-primary transition-colors"
            >
              <span className="w-5 h-5 opacity-80 text-xl flex items-center justify-center">
                🏦
              </span>
              Crédit immobilier
            </a>
          </nav>
        </div>

        <div
          className="mt-auto p-6 border-t border-subtle"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: 'var(--border-hover)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                flexShrink: 0,
              }}
            >
              RT
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Rodolphe Tournier</span>
              <span
                className="text-xs text-muted truncate"
                style={{ maxWidth: '140px', display: 'block' }}
              >
                rodolphe.tournier@gmail.com
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
