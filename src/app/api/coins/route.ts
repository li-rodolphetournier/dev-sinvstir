import { NextRequest, NextResponse } from 'next/server';

export const preferredRegion = 'cdg1'; // Force le déploiement sur Vercel à Paris pour éviter le blocage IP US de Binance

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.COINGECKO_API_KEY ?? '';

function buildHeaders(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (API_KEY) h['x-cg-demo-api-key'] = API_KEY;
  return h;
}

// Cache top-coins (stable)
let topCoinsCache: { data: unknown[]; expiry: number } | null = null;
const TOP_COINS_TTL = 30 * 60 * 1000; // 30 min

interface RawCoin {
  id: string;
  symbol: string;
  name: string;
  thumb?: string;
  large?: string;
  image?: string;
}

function normalizeCoin(c: RawCoin) {
  return {
    id: c.id,
    symbol: (c.symbol ?? '').toUpperCase(),
    name: c.name,
    thumb: c.large ?? c.image ?? c.thumb ?? '',
  };
}

const FALLBACK_COINS = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    thumb: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    thumb: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    thumb: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    thumb: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    thumb: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // ── Recherche ───────────────────────────────────────────────────────────────
  if (query && query.length >= 2) {
    // ── Validation de Sécurité (Sanitization) ────────────────────────────────
    // Autorise uniquement lettres (avec accents), chiffres, espaces et tirets basiques. Rejette toute tentative d'injection.
    if (!/^[a-zA-Z0-9\s\-\u00C0-\u017F]+$/.test(query)) {
      return NextResponse.json(
        { error: 'Caractères invalides dans la recherche.' },
        { status: 400 }
      );
    }

    try {
      const res = await fetch(`${COINGECKO_BASE}/search?query=${encodeURIComponent(query)}`, {
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const coins = ((data.coins ?? []) as RawCoin[]).slice(0, 20).map(normalizeCoin);
      return NextResponse.json({ coins });
    } catch (err) {
      console.error('[/api/coins] search:', err);
      return NextResponse.json({ coins: [] });
    }
  }

  // ── Top coins ───────────────────────────────────────────────────────────────
  if (topCoinsCache && topCoinsCache.expiry > Date.now()) {
    return NextResponse.json({ coins: topCoinsCache.data, source: 'cache' });
  }

  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=30&page=1&sparkline=false`,
      { headers: buildHeaders() }
    );
    if (!res.ok) throw new Error(`${res.status}`);
    const markets = await res.json();
    const coins = (markets as RawCoin[]).map(normalizeCoin);
    topCoinsCache = { data: coins, expiry: Date.now() + TOP_COINS_TTL };
    return NextResponse.json({ coins, source: 'coingecko' });
  } catch (err) {
    console.error('[/api/coins] top coins:', err);
    return NextResponse.json({ coins: FALLBACK_COINS, source: 'fallback' });
  }
}
