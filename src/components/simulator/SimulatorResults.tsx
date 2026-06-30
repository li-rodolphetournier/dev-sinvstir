import React from 'react';
import { Card } from '../ui/Card';
import { SimulationResult, Coin } from '../../lib/types';
import { Info } from 'lucide-react';

interface SimulatorResultsProps {
  result: SimulationResult | null;
  loading: boolean;
  selectedCoin: Coin | null;
}

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="tooltip-container">
    {children}
    <div className="tooltip-bubble">
      {text}
      <div className="tooltip-arrow"></div>
    </div>
  </div>
);

export function SimulatorResults({ result, loading, selectedCoin }: SimulatorResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatCrypto = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 6 }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!result) {
    return (
      <div className="flex flex-col gap-4 h-full animate-pulse">
        <Card className="min-h-[250px] bg-slate-200 dark:bg-slate-800/20"></Card>
        <Card className="min-h-[160px] bg-slate-200 dark:bg-slate-800/20"></Card>
      </div>
    );
  }

  const isPositive = result.performance >= 0;
  const symbol = selectedCoin?.symbol || '';
  const gains = result.finalCapital - result.totalInvested;

  // Calculs pour la progress bar
  const totalBar = isPositive ? result.finalCapital : result.totalInvested;
  const investedPct = (result.totalInvested / totalBar) * 100;
  const gainsPct = isPositive ? (gains / totalBar) * 100 : 0;

  // Formatage du capital final pour séparer le nombre de la devise
  const formattedCapital = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(result.finalCapital);

  return (
    <div
      className={`flex flex-col gap-4 h-full transition-all duration-300 ${loading ? 'opacity-40 pointer-events-none blur-[1px]' : 'animate-fade-in'}`}
    >
      {/* Carte : Titre & Capital Final */}
      <Card className="flex flex-col justify-between p-6 flex-1 min-h-[250px]">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6 sm:gap-0">
          {/* Gauche : Titre intégré */}
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            ></div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Vos résultats
            </h2>
          </div>

          {/* Droite : Capital Final (Valeur) */}
          <div className="sm:text-right">
            <div className="flex items-center sm:justify-end gap-2 text-sm text-muted mb-2 font-medium">
              Capital final
              <Tooltip text="Valeur totale de votre investissement à la date de fin.">
                <Info size={14} className="opacity-70" />
              </Tooltip>
            </div>
            <div
              className="text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {formattedCapital} <span className="text-lg font-normal text-muted ml-1">EUR</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between text-xs sm:text-sm font-semibold mb-3">
            <span style={{ color: 'var(--accent-primary)' }}>
              Somme investie {formatCurrency(result.totalInvested)}
            </span>
            {isPositive ? (
              <span style={{ color: 'var(--text-gold)' }}>Plus-value {formatCurrency(gains)}</span>
            ) : (
              <span className="text-red-500">Moins-value {formatCurrency(gains)}</span>
            )}
          </div>

          {/* Progress bar bicolore */}
          <div
            className="h-5 flex rounded-full overflow-hidden mt-1"
            style={{ backgroundColor: 'var(--border-subtle)' }}
          >
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{ width: `${investedPct}%`, backgroundColor: '#0082FF' }}
            ></div>
            {isPositive && (
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{ width: `${gainsPct}%`, backgroundColor: '#f3cc30' }}
              ></div>
            )}
          </div>
        </div>
      </Card>

      {/* Carte : KPIs (Performance + Infos Crypto) */}
      <Card className="p-6 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
        {/* Gauche : Performance */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="flex items-center justify-center gap-2 text-sm text-muted mb-2 font-medium">
            Performance
            <Tooltip text="Pourcentage de gain ou de perte net par rapport au total investi.">
              <Info size={14} className="opacity-70" />
            </Tooltip>
          </div>
          <div
            className={`text-4xl lg:text-5xl font-bold tracking-tight ${isPositive ? 'text-green-500' : 'text-red-500'}`}
          >
            {isPositive ? '+' : ''}
            {formatPercent(result.performance)}
            <span className="text-2xl font-normal ml-1">%</span>
          </div>
        </div>

        {/* Droite : Infos additionnelles Crypto */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted mb-1 font-medium">
              Volume acquis
              <Tooltip text="Quantité totale de cryptomonnaie accumulée sur la période.">
                <Info size={14} className="opacity-70" />
              </Tooltip>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCrypto(result.totalAcquired)}{' '}
              <span className="text-sm font-normal text-muted">{symbol}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted mb-1 font-medium">
              Prix moyen d&apos;acquisition
              <Tooltip text="Prix de revient unitaire (PRU) moyen d'achat lissé dans le temps.">
                <Info size={14} className="opacity-70" />
              </Tooltip>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(result.averagePrice)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
