export type Frequency = 'once' | 'daily' | 'weekly' | 'monthly';

export interface SimulationInput {
  assetId: string;
  amount: number;
  frequency: Frequency;
  startDate: Date;
  endDate: Date;
}

export interface SimulationResult {
  totalInvested: number;
  totalAcquired: number;
  averagePrice: number;
  finalCapital: number;
  performance: number;
  periodCount: number;
  periodLabel: string;
  history: HistoryPoint[];
}

export interface HistoryPoint {
  date: string;
  acquired: number;
  capitalValue: number;
  invested: number;
  price: number;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
}
