import { useState, useEffect } from 'react';
import { SimulationInput, SimulationResult, Coin } from '../lib/types';
import { calculateDCA } from '../lib/calculator';
import { getHistoricalPrices } from '../lib/api';
import { subYears } from 'date-fns';

export function useSimulator() {
  const [input, setInput] = useState<SimulationInput>({
    assetId: 'bitcoin',
    amount: 100,
    frequency: 'monthly',
    startDate: subYears(new Date(), 4), // 4 years ago by default
    endDate: new Date(),
  });

  const [selectedCoin, setSelectedCoin] = useState<Coin | null>({
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function runSimulation() {
      if (!input.assetId || input.amount <= 0 || !input.startDate || !input.endDate) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const prices = await getHistoricalPrices(input.assetId, input.startDate, input.endDate);

        if (prices.length === 0) {
          throw new Error('Aucune donnée historique trouvée pour cette période.');
        }

        if (isMounted) {
          const simulationResult = calculateDCA(prices, input);
          setResult(simulationResult);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Une erreur est survenue lors de la simulation';
          setError(errorMessage);
          setResult(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const debounceTimeout = setTimeout(runSimulation, 500);
    return () => {
      isMounted = false;
      clearTimeout(debounceTimeout);
    };
  }, [input]);

  const updateInput = (newInput: Partial<SimulationInput>) => {
    setInput((prev) => ({ ...prev, ...newInput }));
  };

  return {
    input,
    updateInput,
    selectedCoin,
    setSelectedCoin,
    result,
    loading,
    error,
  };
}
