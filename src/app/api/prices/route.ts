import { NextRequest, NextResponse } from 'next/server';

export const preferredRegion = 'cdg1'; // Force le déploiement sur Vercel à Paris pour éviter le blocage IP US de Binance
export const dynamic = 'force-dynamic'; // Désactive le cache agressif du CDN Vercel

const BINANCE = 'https://api1.binance.com/api/v3';
const COINGECKO = 'https://api.coingecko.com/api/v3';
const CG_KEY = process.env.COINGECKO_API_KEY ?? '';

// ── Mapping CoinGecko ID → symbole Binance ──────────────────────────────────
const COIN_TO_TICKER: Record<string, string | null> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  binancecoin: 'BNB',
  ripple: 'XRP',
  cardano: 'ADA',
  dogecoin: 'DOGE',
  polkadot: 'DOT',
  'avalanche-2': 'AVAX',
  chainlink: 'LINK',
  litecoin: 'LTC',
  tron: 'TRX',
  stellar: 'XLM',
  uniswap: 'UNI',
  'matic-network': 'POL',
  'shiba-inu': 'SHIB',
  cosmos: 'ATOM',
  near: 'NEAR',
  'the-open-network': 'TON',
  aptos: 'APT',
  sui: 'SUI',
  arbitrum: 'ARB',
  optimism: 'OP',
  'wrapped-bitcoin': 'WBTC',
  'internet-computer': 'ICP',
  filecoin: 'FIL',
  'the-graph': 'GRT',
  aave: 'AAVE',
  // Stablecoins → prix fixe
  tether: null,
  'usd-coin': null,
  dai: null,
};

// ── Cache EUR/USD rate (1h) ─────────────────────────────────────────────────
let eurUsdCache: { rate: number; expiry: number } | null = null;

async function getEurRate(): Promise<number> {
  if (eurUsdCache && eurUsdCache.expiry > Date.now()) return eurUsdCache.rate;
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
      { signal: AbortSignal.timeout(5000), cache: 'no-store' }
    );
    if (!res.ok) throw new Error('rate api error');
    const data = await res.json();
    const rate: number = data?.usd?.eur ?? 0.92;
    eurUsdCache = { rate, expiry: Date.now() + 3_600_000 };
    return rate;
  } catch {
    return 0.92; // fallback statique
  }
}

// ── Binance klines → tableau [timestamp_ms, close_price] ───────────────────
async function fetchBinanceKlines(
  symbol: string,
  startMs: number,
  endMs: number
): Promise<[number, number][]> {
  const DAY_MS = 86_400_000;
  const MAX_LIMIT = 1000;
  const results: [number, number][] = [];

  let cursor = startMs;
  while (cursor < endMs) {
    const batchEnd = Math.min(cursor + MAX_LIMIT * DAY_MS, endMs);
    const url = `${BINANCE}/klines?symbol=${symbol}&interval=1d&startTime=${cursor}&endTime=${batchEnd}&limit=${MAX_LIMIT}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: 'no-store' });
    if (!res.ok) throw new Error(`Binance ${res.status} for ${symbol}`);
    const klines: unknown[][] = await res.json();
    for (const k of klines) {
      results.push([k[0] as number, parseFloat(k[4] as string)]);
    }

    // Si on a reçu des données mais moins que la limite, on a atteint la fin (le temps présent)
    if (klines.length > 0 && klines.length < MAX_LIMIT) {
      break;
    }

    // Si la crypto n'existait pas encore sur cette période, Binance retourne []
    if (klines.length === 0) {
      break;
    }

    cursor = batchEnd + 1;
  }
  return results;
}

// ── Fallback CoinGecko (365 jours max sans clé) ─────────────────────────────
async function fetchCoinGeckoPrices(
  coinId: string,
  fromSec: number,
  toSec: number
): Promise<[number, number][]> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (CG_KEY) headers['x-cg-demo-api-key'] = CG_KEY;
  const url = `${COINGECKO}/coins/${coinId}/market_chart/range?vs_currency=eur&from=${fromSec}&to=${toSec}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000), cache: 'no-store' });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data: { prices?: [number, number][] } = await res.json();
  return data.prices ?? [];
}

// ── Cache prix ──────────────────────────────────────────────────────────────
const priceCache = new Map<string, { data: [number, number][]; expiry: number }>();
const CACHE_TTL = 3_600_000; // 1h

// ── Handler ─────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get('coinId');
  const fromStr = searchParams.get('from');
  const toStr = searchParams.get('to');

  if (!coinId || !fromStr || !toStr) {
    return NextResponse.json({ error: 'Paramètres manquants: coinId, from, to' }, { status: 400 });
  }

  // ── Validation de Sécurité (Sanitization) ──────────────────────────────────
  if (!/^[a-z0-9-]+$/.test(coinId)) {
    return NextResponse.json({ error: 'Identifiant crypto invalide.' }, { status: 400 });
  }
  if (!/^\d+$/.test(fromStr) || !/^\d+$/.test(toStr)) {
    return NextResponse.json({ error: 'Format de date invalide.' }, { status: 400 });
  }

  const fromSec = parseInt(fromStr, 10);
  const toSec = parseInt(toStr, 10);
  const fromMs = fromSec * 1000;
  const toMs = toSec * 1000;

  const cacheKey = `${coinId}:${fromSec}:${toSec}`;
  const cached = priceCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json({ prices: cached.data, source: 'cache' });
  }

  // ── Stablecoin → série plate ──────────────────────────────────────────────
  const ticker = COIN_TO_TICKER[coinId];
  if (ticker === null) {
    const DAY_MS = 86_400_000;
    const stablePrices: [number, number][] = [];
    for (let t = fromMs; t <= toMs; t += DAY_MS) stablePrices.push([t, 1]);
    return NextResponse.json({ prices: stablePrices, source: 'stablecoin' });
  }

  const errorLogs: string[] = [];

  // ── Binance (source principale) ──────────────────────────────────────────
  if (ticker) {
    // 1) Essai paire EUR
    try {
      const prices = await fetchBinanceKlines(`${ticker}EUR`, fromMs, toMs);
      if (prices.length > 0) {
        priceCache.set(cacheKey, { data: prices, expiry: Date.now() + CACHE_TTL });
        return NextResponse.json({ prices, source: 'binance_eur' });
      } else {
        errorLogs.push('Binance EUR: returned 0 items');
      }
    } catch (err) {
      errorLogs.push(`Binance EUR: ${(err as Error).message}`);
    }

    // 2) Paire USDT + conversion EUR
    try {
      const [usdtPrices, eurRate] = await Promise.all([
        fetchBinanceKlines(`${ticker}USDT`, fromMs, toMs),
        getEurRate(),
      ]);
      if (usdtPrices.length > 0) {
        const prices: [number, number][] = usdtPrices.map(([t, p]) => [t, p * eurRate]);
        priceCache.set(cacheKey, { data: prices, expiry: Date.now() + CACHE_TTL });
        return NextResponse.json({ prices, source: 'binance_usdt_converted' });
      } else {
        errorLogs.push('Binance USDT: returned 0 items');
      }
    } catch (err) {
      errorLogs.push(`Binance USDT: ${(err as Error).message}`);
    }
  }

  // ── CoinGecko (fallback pour coins hors Binance) ─────────────────────────
  try {
    const prices = await fetchCoinGeckoPrices(coinId, fromSec, toSec);
    if (prices.length > 0) {
      priceCache.set(cacheKey, { data: prices, expiry: Date.now() + CACHE_TTL });
      return NextResponse.json({ prices, source: 'coingecko' });
    } else {
      errorLogs.push('CoinGecko: returned 0 items');
    }
  } catch (err) {
    errorLogs.push(`CoinGecko: ${(err as Error).message}`);
  }

  return NextResponse.json(
    {
      error: `Cette cryptomonnaie n'existait pas encore à la date de début sélectionnée. Détails techniques (Vercel): ${errorLogs.join(' | ')}`,
    },
    { status: 404 }
  );
}
