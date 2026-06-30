import React from 'react';
import { Frequency } from '../../lib/types';
import { Select } from '../ui/Select';

interface FrequencySelectorProps {
  value: Frequency;
  onChange: (value: Frequency) => void;
}

export function FrequencySelector({ value, onChange }: FrequencySelectorProps) {
  return (
    <Select label="Fréquence" value={value} onChange={(e) => onChange(e.target.value as Frequency)}>
      <option value="once" className="bg-slate-900">
        Une fois
      </option>
      <option value="daily" className="bg-slate-900">
        Par jour
      </option>
      <option value="weekly" className="bg-slate-900">
        Par semaine
      </option>
      <option value="monthly" className="bg-slate-900">
        Par mois
      </option>
    </Select>
  );
}
