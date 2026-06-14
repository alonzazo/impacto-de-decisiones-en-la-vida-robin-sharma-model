import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { SimulationParams, SimulationHistory } from './types/simulation';
import { DEFAULT_PARAMS } from './constants/profiles';
import { simulate } from './engine/simulation';
import { runMonteCarlo, type MonteCarloSummary, type MonteCarloBands } from './engine/monteCarlo';
import { runOptimizer, type OptimizerResult } from './engine/optimizer';
import { runSensitivityAnalysis, type SensitivityResult } from './engine/sensitivityAnalysis';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SimulationChart } from './components/Chart/SimulationChart';
import { D3SimulationChart } from './components/Chart/D3SimulationChart';
import { PlotlySimulationChart } from './components/Chart/PlotlySimulationChart';
import { ResultCards } from './components/Results/ResultCards';
import { EventsList } from './components/Results/EventsList';
import './App.scss';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [history, setHistory] = useState<SimulationHistory | null>(null);
  const [showExito, setShowExito] = useState(true);
  const [mcResults, setMcResults] = useState<string | null>(null);
  const [mcBands, setMcBands] = useState<MonteCarloBands | null>(null);
  const [chartEngine, setChartEngine] = useState<'d3' | 'chartjs' | 'plotly'>('d3');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSimulate = useCallback(() => {
    const result = simulate(params);
    setHistory(result);
  }, [params]);

  // Auto-simulate on param changes (debounced 300ms)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSimulate, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [doSimulate]);

  const handleMonteCarlo = useCallback(() => {
    setMcResults('Corriendo 200 simulaciones...');
    setTimeout(() => {
      const mc: MonteCarloSummary = runMonteCarlo(params, 100);
      setMcBands(mc.bands);
      const html =
        `<b>🎰 Monte Carlo: ${mc.n} vidas simuladas</b><br/><br/>` +
        `<b>Indice Exito:</b><br/>` +
        `Peor (P5): ${mc.p5.wealthIndex.toFixed(1)} | P25: ${mc.p25.wealthIndex.toFixed(1)} | <b>Mediana: ${mc.p50.wealthIndex.toFixed(1)}</b> | P75: ${mc.p75.wealthIndex.toFixed(1)} | Mejor (P95): ${mc.p95.wealthIndex.toFixed(1)}<br/>` +
        `Promedio: ${mc.avg.toFixed(1)} | Rango: ${mc.worst.wealthIndex.toFixed(1)} - ${mc.best.wealthIndex.toFixed(1)}<br/><br/>` +
        `<b>Patrimonio:</b><br/>` +
        `P5: $${(mc.p5.netWorth / 1e3).toFixed(0)}K | <b>Mediana: $${(mc.p50.netWorth / 1e3).toFixed(0)}K</b> | P95: $${(mc.p95.netWorth / 1e3).toFixed(0)}K<br/><br/>` +
        `<b>Mejor vida:</b> Seed ${mc.best.seed} (Exito ${mc.best.wealthIndex.toFixed(1)}, $${(mc.best.netWorth / 1e3).toFixed(0)}K)<br/>` +
        `<b>Peor vida:</b> Seed ${mc.worst.seed} (Exito ${mc.worst.wealthIndex.toFixed(1)}, $${(mc.worst.netWorth / 1e3).toFixed(0)}K)<br/><br/>` +
        `<span style="opacity:.6">Tip: usa seed ${mc.best.seed} para ver la mejor vida</span>`;
      setMcResults(html);
    }, 50);
  }, [params]);

  const handleOptimize = useCallback(() => {
    setMcResults('🧬 CMA-ES optimizando 23 parámetros (esto toma ~10-20s)...');
    setTimeout(() => {
      const opt: OptimizerResult = runOptimizer(params);
      const paramLines = Object.entries(opt.best.params).map(([k, v]) => `${k}: ${v}`).join('<br/>');
      const html =
        `<b>🧬 CMA-ES: ${opt.generations} generaciones × ${opt.tried} evaluaciones × ${opt.seeds} seeds</b><br/><br/>` +
        `<b>Mejor configuración (Éxito: ${opt.best.wealthIndex.toFixed(1)}/100):</b><br/>` +
        paramLines + '<br/><br/>' +
        `<b>Convergencia:</b> ${opt.convergence.map(c => c.toFixed(1)).slice(-5).join(' → ')}<br/>` +
        `<span style="opacity:.6">✅ Parámetros óptimos aplicados al simulador</span>`;
      setMcResults(html);
      // Apply optimal params to sidebar → triggers re-simulation → chart updates
      setParams(opt.bestSimParams);
    }, 50);
  }, [params]);

  const handleSensitivity = useCallback(() => {
    setMcResults('🔬 Análisis multifactorial en progreso (~5s)...');
    setTimeout(() => {
      const sa: SensitivityResult = runSensitivityAnalysis(params);
      const maxAbs = Math.max(...sa.factors.map(f => f.absImpact), 1);
      const barLen = 16;
      const factorLines = sa.factors.map((f, i) => {
        const filled = Math.round((f.absImpact / maxAbs) * barLen);
        const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
        const sign = f.impact >= 0 ? '+' : '';
        return `#${i + 1} ${f.icon} ${f.name.padEnd(18)} ${bar} ${sign}${f.impact.toFixed(1)} pts  (${f.lowLabel}→${f.highLabel})`;
      }).join('<br/>');

      let interactionHtml = '';
      if (sa.interactions.length > 0) {
        const intLines = sa.interactions.slice(0, 5).map(int => {
          const sign = int.synergy > 0 ? '+' : '';
          const label = int.synergy > 0 ? 'sinergia' : 'conflicto';
          return `• ${int.factorA} + ${int.factorB} = ${sign}${int.synergy} pts (${label})`;
        }).join('<br/>');
        interactionHtml = `<br/><b>INTERACCIONES:</b><br/>${intLines}`;
      }

      const html =
        `<b>🔬 Análisis Multifactorial (${sa.totalSims} simulaciones)</b><br/>` +
        `<span style="opacity:.6">Baseline: ${sa.baseline.toFixed(1)}/100</span><br/><br/>` +
        `<b>RANKING DE IMPACTO:</b><br/>` +
        `<pre style="font-size:.7em;line-height:1.4;margin:4px 0">${factorLines}</pre>` +
        interactionHtml;
      setMcResults(html);
    }, 50);
  }, [params]);

  return (
    <div className="layout">
      <div className="header">
        <h1>🏆 Simulador — 8 Formas de Riqueza</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={chartEngine}
            onChange={e => setChartEngine(e.target.value as any)}
            style={{ background: '#1a1a3e', color: '#c8d6e5', border: '1px solid #2a2a4a', borderRadius: 4, padding: '4px 8px', fontSize: '.75em', cursor: 'pointer' }}
          >
            <option value="d3">📊 D3</option>
            <option value="chartjs">📈 Chart.js</option>
            <option value="plotly">🔬 Plotly</option>
          </select>
          <span style={{ fontSize: '.8em', opacity: 0.5 }}>Modelo Robin Sharma</span>
        </div>
      </div>

      <Sidebar
        params={params}
        onChange={setParams}
        onSimulate={doSimulate}
        onMonteCarlo={handleMonteCarlo}
        onOptimize={handleOptimize}
        onSensitivity={handleSensitivity}
        showExito={showExito}
        onShowExitoChange={setShowExito}
      />

      <div className="main">
        {history && (
          <>
            {chartEngine === 'd3' && <D3SimulationChart history={history} showExito={showExito} mcBands={mcBands} />}
            {chartEngine === 'chartjs' && <SimulationChart history={history} showExito={showExito} mcBands={mcBands} />}
            {chartEngine === 'plotly' && <PlotlySimulationChart history={history} showExito={showExito} mcBands={mcBands} />}
            <ResultCards history={history} />
            {mcResults && (
              <div className="mc-results" dangerouslySetInnerHTML={{ __html: mcResults }} />
            )}
            <EventsList events={history.events} />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
