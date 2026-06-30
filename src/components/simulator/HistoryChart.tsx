'use client';

import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { SimulationResult } from '../../lib/types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoryChartProps {
  result: SimulationResult | null;
  loading: boolean;
}

export function HistoryChart({ result, loading }: HistoryChartProps) {
  const data = useMemo(() => {
    if (!result?.history) return [];
    const maxPoints = 150;
    const step = Math.max(1, Math.floor(result.history.length / maxPoints));
    return result.history
      .filter((_, i) => i % step === 0 || i === result.history.length - 1)
      .map((p) => ({
        ...p,
        pnl: p.capitalValue - p.invested,
        dateFormatted: format(parseISO(p.date), 'MMM yy', { locale: fr }),
      }));
  }, [result]);

  // Position du zéro dans le gradient du graphique PNL
  const zeroPct = useMemo(() => {
    const pnls = data.map((d) => d.pnl);
    const maxPnl = Math.max(0, ...pnls);
    const minPnl = Math.min(0, ...pnls);
    const range = maxPnl - minPnl;
    if (range === 0) return '50%';
    return `${((maxPnl / range) * 100).toFixed(1)}%`;
  }, [data]);

  if (!result || data.length === 0) return null;

  const fEur = (v: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(v);
  const fCrypto = (v: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 }).format(v);
  const fKeur = (v: number) => `${(v / 1000).toFixed(0)}k`;

  const axisProps = {
    tick: { fill: 'var(--text-muted)', fontSize: 11 },
    tickLine: false,
    axisLine: false as const,
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: {
      payload: { date: string; [key: string]: unknown };
      dataKey: string;
      name: string;
      value: number;
      stroke?: string;
      fill?: string;
    }[];
  }) => {
    if (!active || !payload?.length) return null;
    const pt = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p
          className="font-semibold text-sm mb-2"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 6,
            color: 'var(--text-primary)',
          }}
        >
          {format(parseISO(pt.date), 'dd MMM yyyy', { locale: fr })}
        </p>
        {payload.map((e) => (
          <p
            key={e.dataKey}
            style={{ color: e.stroke ?? e.fill ?? '#666', margin: '2px 0', fontSize: 12 }}
          >
            <span style={{ opacity: 0.8 }}>{e.name} : </span>
            <strong>{e.dataKey === 'acquired' ? fCrypto(e.value) : fEur(e.value)}</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col gap-6 relative transition-all duration-300 ${loading ? 'opacity-40 pointer-events-none blur-[1px]' : ''}`}
    >
      {/* ── Graphique 1 : Historique ── */}
      <Card className="w-full flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold">Historique</h3>
          <p className="text-sm text-muted">
            Valeur du portefeuille, montant investi et volume acquis
          </p>
        </div>
        <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="valeurGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0049C6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0049C6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="dateFormatted"
                {...axisProps}
                axisLine={{ stroke: 'var(--border-subtle)' }}
                minTickGap={30}
              />
              {/* Axe gauche : quantité crypto */}
              <YAxis
                yAxisId="crypto"
                orientation="left"
                {...axisProps}
                tickFormatter={fCrypto}
                width={60}
              />
              {/* Axe droit : EUR */}
              <YAxis
                yAxisId="eur"
                orientation="right"
                {...axisProps}
                tickFormatter={fKeur}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
              {/* Investi — ligne pointillée violette */}
              <Line
                yAxisId="eur"
                type="monotone"
                dataKey="invested"
                name="Investi (€)"
                stroke="#7c3aed"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
              />
              {/* Valeur — zone bleue */}
              <Area
                yAxisId="eur"
                type="monotone"
                dataKey="capitalValue"
                name="Valeur (€)"
                fill="url(#valeurGrad)"
                stroke="#0049C6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#0049C6', stroke: '#fff', strokeWidth: 2 }}
              />
              {/* Acquis — quantité crypto (axe gauche) */}
              <Line
                yAxisId="crypto"
                type="monotone"
                dataKey="acquired"
                name="Acquis (crypto)"
                stroke="#c9a800"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Graphique 2 : Gains et Pertes ── */}
      <Card className="w-full flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold">Gains et Pertes</h3>
          <p className="text-sm text-muted">Plus-value ou moins-value latente · Valeur − Investi</p>
        </div>
        <div style={{ width: '100%', height: 280, minWidth: 0, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <defs>
                {/* Gradient qui change de couleur exactement à la ligne zéro */}
                <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                  <stop offset={zeroPct} stopColor="#22c55e" stopOpacity={0.08} />
                  <stop offset={zeroPct} stopColor="#ef4444" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="dateFormatted"
                {...axisProps}
                axisLine={{ stroke: 'var(--border-subtle)' }}
                minTickGap={30}
              />
              <YAxis
                yAxisId="eur"
                {...axisProps}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
              {/* Ligne zéro de référence */}
              <ReferenceLine
                yAxisId="eur"
                y={0}
                stroke="var(--border-hover)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              {/* Investi — pointillé violet */}
              <Line
                yAxisId="eur"
                type="monotone"
                dataKey="invested"
                name="Investi (€)"
                stroke="#7c3aed"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
              />
              {/* Valeur — ligne bleue */}
              <Line
                yAxisId="eur"
                type="monotone"
                dataKey="capitalValue"
                name="Valeur (€)"
                stroke="#0049C6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#0049C6', stroke: '#fff', strokeWidth: 2 }}
              />
              {/* Gain/Perte — zone verte/rouge */}
              <Area
                yAxisId="eur"
                type="monotone"
                dataKey="pnl"
                name="Gain / Perte (€)"
                fill="url(#pnlFill)"
                stroke="#475569"
                strokeWidth={1}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
