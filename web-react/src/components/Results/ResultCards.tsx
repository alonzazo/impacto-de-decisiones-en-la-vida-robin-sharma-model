import React from 'react';
import type { SimulationHistory } from '../../types/simulation';

interface Props {
  history: SimulationHistory;
}

export const ResultCards: React.FC<Props> = ({ history }) => {
  const lastIndex = history.netWorth.length - 1;
  if (lastIndex < 0) return null;

  return (
    <div className="results">
      <div className="result-card">
        <div className="label">Patrimonio Neto Final</div>
        <div className="value gold">${(history.netWorth[lastIndex] / 1e3).toFixed(1)}K</div>
      </div>
      <div className="result-card">
        <div className="label">Ingresos Pasivos/mes</div>
        <div className="value green">${history.passiveIncome[lastIndex].toFixed(0)}/mes</div>
      </div>
      <div className="result-card">
        <div className="label">Riqueza Total</div>
        <div className="value">{history.wealthIndex[lastIndex].toFixed(1)}/100</div>
      </div>
      <div className="result-card">
        <div className="label">Umbrales Financieros</div>
        <div className="umbrales">
          <span className={`umbral ${history.securityAge ? 'reached' : 'not-reached'}`}>
            Seg: {history.securityAge ? history.securityAge.toFixed(1) : 'x'}
          </span>
          <span className={`umbral ${history.independenceAge ? 'reached' : 'not-reached'}`}>
            Ind: {history.independenceAge ? history.independenceAge.toFixed(1) : 'x'}
          </span>
          <span className={`umbral ${history.freedomAge ? 'reached' : 'not-reached'}`}>
            Lib: {history.freedomAge ? history.freedomAge.toFixed(1) : 'x'}
          </span>
        </div>
      </div>
    </div>
  );
};
