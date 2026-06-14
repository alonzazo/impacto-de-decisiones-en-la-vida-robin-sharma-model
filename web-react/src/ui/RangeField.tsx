import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color?: string;
  tooltip?: string;
}

export const RangeField: React.FC<Props> = ({ label, value, onChange, color, tooltip }) => (
  <div className="field">
    <label style={color ? { color } : undefined}>{label}{tooltip && <InfoTooltip text={tooltip} />}</label>
    <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: 60 }} />
    <span style={{ fontSize: '.75em', width: 25, textAlign: 'right' }}>{value}</span>
  </div>
);
