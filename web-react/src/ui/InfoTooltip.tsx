import React from 'react';

interface Props {
  text: string;
}

export const InfoTooltip: React.FC<Props> = ({ text }) => (
  <span className="info-tooltip-wrapper">
    <span className="info-tooltip-icon">ⓘ</span>
    <span className="info-tooltip-popup">{text}</span>
  </span>
);
