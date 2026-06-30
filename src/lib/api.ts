import { Coin } from './types';
import { getUnixTime } from 'date-fns';

/**
 * Toutes les requêtes passent par les routes API Next.js (/api/*)
 * qui font les vrais appels CoinGecko côté serveur.
 * → Pas de problèmes CORS, pas de rate-limit navigateur, cache côté serveur.
 */

// ─── Coins ───────────────────────────────────────────────────────────────────

export async function searchCoins(query: string): Promise<Coin[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`/api/coins?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.coins ?? [];
  } catch (err) {
    console.error('[api] searchCoins:', err);
    return [];
  }
}

export async function getTopCoins(): Promise<Coin[]> {
  try {
    const res = await fetch('/api/coins');
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.coins ?? [];
  } catch (err) {
    console.error('[api] getTopCoins:', err);
    // Fallback minimal si même la route interne échoue
    return [
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
    ];
  }
}

// ─── Prix historiques ─────────────────────────────────────────────────────────

export async function getHistoricalPrices(
  coinId: string,
  startDate: Date,
  endDate: Date
): Promise<[number, number][]> {
  // Légère marge pour s'assurer de couvrir toute la plage
  const from = getUnixTime(startDate) - 86400;
  const to = getUnixTime(endDate) + 86400;

  try {
    const url = `/api/prices?coinId=${encodeURIComponent(coinId)}&from=${from}&to=${to}`;
    const res = await fetch(url);

    if (res.status === 429) {
      throw new Error('Limite de requêtes atteinte. Attends quelques secondes et réessaie.');
    }
    if (res.status === 404) {
      throw new Error(
        "Cette cryptomonnaie n'existait pas encore à la date de début sélectionnée. Essaie une date plus récente."
      );
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error || `Erreur serveur (${res.status})`);
    }

    const data = await res.json();

    if (!data.prices || data.prices.length === 0) {
      throw new Error(`Aucune donnée disponible pour ${coinId} sur cette période.`);
    }

    return data.prices as [number, number][];
  } catch (err) {
    // On relance l'erreur pour que useSimulator l'affiche à l'utilisateur
    // plutôt que de retourner silencieusement des données fictives
    throw err instanceof Error ? err : new Error('Impossible de récupérer les prix historiques.');
  }
}
