import React, { useState, useEffect, useRef } from 'react';
import { searchCoins, getTopCoins } from '../../lib/api';
import { Coin } from '../../lib/types';
import { Search, ChevronDown, Check } from 'lucide-react';

interface AssetSelectorProps {
  selectedCoin: Coin | null;
  onSelect: (coin: Coin) => void;
}

export function AssetSelector({ selectedCoin, onSelect }: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const labelId = React.useId();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch coins based on search query
  useEffect(() => {
    let isMounted = true;

    async function fetchCoins() {
      setLoading(true);
      try {
        let results: Coin[] = [];
        if (searchQuery.length === 0) {
          results = await getTopCoins();
        } else if (searchQuery.length >= 2) {
          results = await searchCoins(searchQuery);
        }

        if (isMounted && results.length > 0) {
          setCoins(results);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timeoutId = setTimeout(fetchCoins, searchQuery ? 300 : 0);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
      <label id={labelId} className="text-sm text-primary font-medium">
        Actif numérique
      </label>

      <div
        id="main-content"
        role="combobox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        aria-controls="asset-listbox"
        tabIndex={0}
        className="flex items-center justify-between bg-transparent border rounded-md px-4 py-2 cursor-pointer transition-colors"
        style={{ borderColor: isOpen ? 'var(--border-active)' : 'var(--border-subtle)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCoin ? (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedCoin.thumb}
              alt={selectedCoin.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-primary">
              {selectedCoin.name} ({selectedCoin.symbol})
            </span>
          </div>
        ) : (
          <span className="text-muted">Sélectionner une crypto...</span>
        )}
        <ChevronDown size={16} className="text-muted" />
      </div>

      {isOpen && (
        <div
          className="absolute z-10 top-[70px] left-0 w-full rounded-md shadow-lg overflow-hidden animate-fade-in"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="p-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Rechercher (ex: Bitcoin, ETH...)"
                className="w-full bg-transparent border-none text-sm px-8 py-2 text-primary focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <ul id="asset-listbox" role="listbox" className="max-h-60 overflow-y-auto">
            {loading ? (
              <li className="p-4 text-center text-sm text-muted">Chargement...</li>
            ) : coins.length === 0 ? (
              <li className="p-4 text-center text-sm text-muted">Aucun résultat</li>
            ) : (
              coins.map((coin) => (
                <li
                  key={coin.id}
                  className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
                  onClick={() => {
                    onSelect(coin);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coin.thumb} alt={coin.name} className="w-5 h-5 rounded-full" />
                    <span className="text-sm font-medium">{coin.name}</span>
                    <span className="text-xs text-muted ml-1">{coin.symbol}</span>
                  </div>
                  {selectedCoin?.id === coin.id && <Check size={14} className="text-blue-500" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
