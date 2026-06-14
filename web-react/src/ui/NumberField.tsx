import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}

export const NumberField: React.FC<Props> = ({ label, value, onChange, min, max, step = 1, tooltip }) => (
  <div className="field">
    <label>{label}{tooltip && <InfoTooltip text={tooltip} />}</label>
    <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step} />
  </div>
);
