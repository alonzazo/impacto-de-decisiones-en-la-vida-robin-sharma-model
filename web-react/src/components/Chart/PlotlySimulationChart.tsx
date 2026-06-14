/**
 * Plotly-based simulation chart.
 * Features: built-in zoom, pan, hover, crosshair, export to PNG.
 * Dual Y-axis: left = wealth indices (0-100), right = net worth ($).
 */
import React, { useMemo } from 'react';
// @ts-ignore — types resolve after npm install
import Plot from 'react-plotly.js';
import type { SimulationHistory } from '../../types/simulation';
import type { MonteCarloBands } from '../../engine/monteCarlo';
import { WEALTH_DIMENSIONS, DIMENSION_COLORS, DIMENSION_NAMES } from '../../constants/model';

interface Props {
  history: SimulationHistory;
  showExito: boolean;
  mcBands?: MonteCarloBands | null;
}

export const PlotlySimulationChart: React.FC<Props> = ({ history, showExito, mcBands }) => {
  const { data, layout, shapes, annotations } = useMemo(() => {
    const ages = history.ages;
    const traces: any[] = [];

    // ── Monte Carlo bands ──
    if (mcBands) {
      // P5-P95 fill
      traces.push({
        x: [...ages, ...ages.slice().reverse()],
        y: [...mcBands.p95, ...mcBands.p5.slice().reverse()],
        fill: 'toself',
        fillcolor: 'rgba(155, 89, 182, 0.08)',
        line: { color: 'transparent' },
        showlegend: false,
        name: 'MC P5-P95',
        yaxis: 'y',
        hoverinfo: 'skip',
      } as any);
      // P25-P75 fill
      traces.push({
        x: [...ages, ...ages.slice().reverse()],
        y: [...mcBands.p75, ...mcBands.p25.slice().reverse()],
        fill: 'toself',
        fillcolor: 'rgba(155, 89, 182, 0.15)',
        line: { color: 'transparent' },
        showlegend: false,
        name: 'MC P25-P75',
        yaxis: 'y',
        hoverinfo: 'skip',
      } as any);
      // Median line
      traces.push({
        x: ages,
        y: mcBands.p50,
        mode: 'lines',
        name: 'MC Mediana',
        line: { color: 'rgba(155, 89, 182, 0.7)', width: 2, dash: 'dash' },
        yaxis: 'y',
      } as any);
    }

    // ── 8 Wealth dimension lines ──
    for (const dim of WEALTH_DIMENSIONS) {
      traces.push({
        x: ages,
        y: history.wealth[dim],
        mode: 'lines',
        name: DIMENSION_NAMES[dim],
        line: {
          color: showExito ? DIMENSION_COLORS[dim] + '66' : DIMENSION_COLORS[dim],
          width: showExito ? 1 : 2,
        },
        yaxis: 'y',
        hovertemplate: `%{y:.1f}/100<extra>${DIMENSION_NAMES[dim]}</extra>`,
      } as any);
    }

    // ── EXITO index ──
    if (showExito) {
      traces.push({
        x: ages,
        y: history.wealthIndex,
        mode: 'lines',
        name: 'EXITO',
        line: { color: '#ffffff', width: 3, dash: 'dot' },
        yaxis: 'y',
        hovertemplate: '%{y:.1f}/100<extra>EXITO</extra>',
      } as any);
    }

    // ── Net Worth (right axis) ──
    traces.push({
      x: ages,
      y: history.netWorth,
      mode: 'lines',
      name: 'Patrimonio Neto',
      line: { color: '#ffd700', width: 2.5, dash: 'dashdot' },
      yaxis: 'y2',
      hovertemplate: '$%{y:,.0f}<extra>Patrimonio</extra>',
    } as any);

    // ── Event vertical lines ──
    const eventShapes: any[] = history.events.map(event => ({
      type: 'line' as const,
      x0: event.age,
      x1: event.age,
      y0: 0,
      y1: 1,
      yref: 'paper' as const,
      line: { color: 'rgba(255,255,255,0.15)', width: 1, dash: 'dot' as const },
    }));

    const eventAnnotations: any[] = history.events.map((event, i) => ({
      x: event.age,
      y: 1 - (i % 5) * 0.06,
      yref: 'paper' as const,
      text: `${event.icon} ${event.text}`,
      showarrow: false,
      font: { size: 8, color: '#c8d6e5' },
      bgcolor: '#1a1a3ecc',
      borderpad: 2,
    }));

    const maxNW = Math.max(...history.netWorth, 1);
    const plotLayout: any = {
      paper_bgcolor: '#0f0f23',
      plot_bgcolor: '#0f0f23',
      font: { color: '#c8d6e5', size: 11 },
      margin: { t: 30, r: 60, b: 50, l: 50 },
      hovermode: 'x unified' as any,
      dragmode: 'zoom',
      legend: {
        orientation: 'h' as const,
        y: 1.12,
        x: 0.5,
        xanchor: 'center' as const,
        font: { size: 9 },
        bgcolor: 'transparent',
      },
      xaxis: {
        title: 'Edad',
        color: '#c8d6e5',
        gridcolor: '#2a2a4a40',
        zeroline: false,
      },
      yaxis: {
        title: 'Índice (0-100)',
        range: [0, 100],
        color: '#c8d6e5',
        gridcolor: '#2a2a4a40',
        zeroline: false,
      },
      yaxis2: {
        title: 'Patrimonio ($)',
        overlaying: 'y' as const,
        side: 'right' as const,
        range: [Math.min(0, ...history.netWorth), maxNW * 1.1],
        color: '#ffd700',
        gridcolor: 'transparent',
        zeroline: false,
        tickformat: '$,.0f',
      },
      shapes: eventShapes,
      annotations: eventAnnotations,
    };

    return { data: traces, layout: plotLayout, shapes: eventShapes, annotations: eventAnnotations };
  }, [history, showExito, mcBands]);

  return (
    <div className="chart-container">
      <Plot
        data={data}
        layout={layout}
        config={{
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          displaylogo: false,
          toImageButtonOptions: { format: 'png', filename: 'simulacion-8-riquezas', scale: 2 },
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  );
};
