import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tooltip?: string;
}

export const CheckboxField: React.FC<Props> = ({ label, checked, onChange, tooltip }) => (
  <div className="field">
    <label>{label}{tooltip && <InfoTooltip text={tooltip} />}</label>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
  </div>
);
