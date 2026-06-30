import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { AssetSelector } from './AssetSelector';
import { FrequencySelector } from './FrequencySelector';
import { SimulationInput, Coin } from '../../lib/types';
import { format } from 'date-fns';

interface SimulatorFormProps {
  input: SimulationInput;
  selectedCoin: Coin | null;
  onUpdateInput: (newInput: Partial<SimulationInput>) => void;
  onSelectCoin: (coin: Coin) => void;
}

export function SimulatorForm({
  input,
  selectedCoin,
  onUpdateInput,
  onSelectCoin,
}: SimulatorFormProps) {
  // Format dates for input type="date" (YYYY-MM-DD)
  const startDateStr = format(input.startDate, 'yyyy-MM-dd');
  const endDateStr = format(input.endDate, 'yyyy-MM-dd');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onUpdateInput({ startDate: newDate });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onUpdateInput({ endDate: newDate });
    }
  };

  return (
    <Card className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-xl font-bold mb-1">Simulateur Crypto</h2>
        <p className="text-sm text-muted">Configurez votre stratégie d&apos;investissement</p>
      </div>

      <div className="flex flex-col gap-5">
        <AssetSelector
          selectedCoin={selectedCoin}
          onSelect={(coin) => {
            onSelectCoin(coin);
            onUpdateInput({ assetId: coin.id });
          }}
        />

        <Input
          label="Montant (€)"
          type="number"
          min="1"
          step="1"
          value={input.amount || ''}
          onChange={(e) => onUpdateInput({ amount: Number(e.target.value) })}
          placeholder="Ex: 100"
        />

        <FrequencySelector
          value={input.frequency}
          onChange={(freq) => onUpdateInput({ frequency: freq })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Depuis le"
            type="date"
            value={startDateStr}
            onChange={handleStartDateChange}
            max={endDateStr}
          />
          <Input
            label="Jusqu'au"
            type="date"
            value={endDateStr}
            onChange={handleEndDateChange}
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
      </div>
    </Card>
  );
}
