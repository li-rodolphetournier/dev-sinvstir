'use client';

import { useState } from 'react';

import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { SimulatorForm } from '../components/simulator/SimulatorForm';
import { SimulatorResults } from '../components/simulator/SimulatorResults';
import dynamic from 'next/dynamic';

const HistoryChart = dynamic(
  () => import('../components/simulator/HistoryChart').then((mod) => mod.HistoryChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full animate-pulse rounded-lg bg-slate-800/10 flex items-center justify-center text-muted">
        Chargement du graphique...
      </div>
    ),
  }
);
import { useSimulator } from '../hooks/useSimulator';

export default function Home() {
  const { input, updateInput, selectedCoin, setSelectedCoin, result, loading, error } =
    useSimulator();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header mobile */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold text-primary mb-2">Simulateur Crypto</h1>
              <p className="text-sm text-muted">
                Calculez vos gains et performances pour un investissement crypto.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <SimulatorForm
                  input={input}
                  selectedCoin={selectedCoin}
                  onUpdateInput={updateInput}
                  onSelectCoin={setSelectedCoin}
                />
              </div>

              <div className="lg:col-span-7">
                <SimulatorResults result={result} loading={loading} selectedCoin={selectedCoin} />
              </div>
            </div>

            <div className="w-full">
              <HistoryChart result={result} loading={loading} />
            </div>

            <div
              className="p-6 text-sm text-muted"
              style={{
                backgroundColor: 'rgba(226,232,240,0.5)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <h4 className="font-bold mb-2">Avertissement</h4>
              <p>
                L&apos;évolution graphique et les résultats présentés par ce simulateur ne
                constituent pas un indicateur fiable des performances futures. Ils ont uniquement
                pour objectif d&apos;illustrer les mécanismes d&apos;un investissement sur une
                période donnée.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
