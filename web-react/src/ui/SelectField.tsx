import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  tooltip?: string;
}

export const SelectField: React.FC<Props> = ({ label, value, options, onChange, tooltip }) => (
  <div className="field">
    <label>{label}{tooltip && <InfoTooltip text={tooltip} />}</label>
    <select value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
