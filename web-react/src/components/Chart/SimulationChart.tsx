import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import type { SimulationHistory } from '../../types/simulation';
import type { MonteCarloBands } from '../../engine/monteCarlo';
import { WEALTH_DIMENSIONS, DIMENSION_COLORS, DIMENSION_NAMES } from '../../constants/model';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin);

interface Props {
  history: SimulationHistory;
  showExito: boolean;
  mcBands?: MonteCarloBands | null;
}

export const SimulationChart: React.FC<Props> = ({ history, showExito, mcBands }) => {
  const { data, options } = useMemo(() => {
    const labels = history.ages.map(age => age.toFixed(1));

    const datasets: any[] = [];

    // ── Monte Carlo bands (rendered first = behind everything) ──
    if (mcBands) {
      // P5-P95 outer band (very translucent)
      datasets.push({
        label: 'MC P95',
        data: mcBands.p95,
        borderColor: 'transparent',
        backgroundColor: 'rgba(155, 89, 182, 0.08)',
        borderWidth: 0,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
        fill: '+4', // fill down to P5
        order: 10,
      });
      datasets.push({
        label: 'MC P75',
        data: mcBands.p75,
        borderColor: 'transparent',
        backgroundColor: 'rgba(155, 89, 182, 0.12)',
        borderWidth: 0,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
        fill: '+2', // fill down to P25
        order: 10,
      });
      datasets.push({
        label: 'MC Mediana',
        data: mcBands.p50,
        borderColor: 'rgba(155, 89, 182, 0.7)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
        fill: false,
        order: 9,
      });
      datasets.push({
        label: 'MC P25',
        data: mcBands.p25,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        borderWidth: 0,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
        fill: false,
        order: 10,
      });
      datasets.push({
        label: 'MC P5',
        data: mcBands.p5,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        borderWidth: 0,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
        fill: false,
        order: 10,
      });
    }

    // ── Wealth dimension lines ──
    for (const dim of WEALTH_DIMENSIONS) {
      datasets.push({
        label: DIMENSION_NAMES[dim],
        data: history.wealth[dim],
        borderColor: showExito ? DIMENSION_COLORS[dim] + '40' : DIMENSION_COLORS[dim],
        backgroundColor: DIMENSION_COLORS[dim] + '08',
        borderWidth: showExito ? 1 : 2,
        pointRadius: 0, tension: 0.3, yAxisID: 'y',
        order: 5,
      });
    }

    // ── EXITO index ──
    if (showExito) {
      datasets.push({
        label: 'EXITO', data: history.wealthIndex, borderColor: '#ffffff',
        borderWidth: 3, pointRadius: 0, tension: 0.3, yAxisID: 'y', borderDash: [2, 2],
        order: 1,
      });
    }

    // ── Patrimonio Neto ──
    datasets.push({
      label: 'Patrimonio Neto', data: history.netWorth, borderColor: '#ffd700',
      borderWidth: 2.5, borderDash: [6, 3], pointRadius: 0, tension: 0.3, yAxisID: 'y1', fill: false,
      order: 2,
    });

    // ── Event annotations ──
    const annotations: Record<string, any> = {};
    history.events.forEach((event, i) => {
      annotations[`l${i}`] = {
        type: 'line' as const,
        xMin: event.age.toFixed(1), xMax: event.age.toFixed(1),
        borderColor: '#ffffff30', borderWidth: 1, borderDash: [4, 4],
        label: {
          display: true, content: `${event.icon} ${event.text}`,
          position: 'start' as const, backgroundColor: '#1a1a3ecc',
          color: '#c8d6e5', font: { size: 9 }, padding: 2, rotation: -45,
        },
      };
    });

    const maxNetWorth = Math.max(...history.netWorth, 1);
    const yAxisMax = Math.ceil(maxNetWorth / 10000) * 10000;

    const opts: any = {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#c8d6e5', boxWidth: 12, font: { size: 10 }, usePointStyle: true,
            filter: (item: any) => !item.text.startsWith('MC P') || item.text === 'MC Mediana',
          },
        },
        annotation: { annotations },
        tooltip: {
          backgroundColor: '#1a1a3ef0', titleColor: '#fff', bodyColor: '#c8d6e5',
          callbacks: {
            title: (items: any[]) => `Edad: ${history.ages[items[0].dataIndex].toFixed(1)}`,
            label: (item: any) => {
              if (item.dataset.label?.startsWith('MC P') && item.dataset.label !== 'MC Mediana') return '';
              return item.dataset.yAxisID === 'y1'
                ? `${item.dataset.label}: $${(item.raw / 1e3).toFixed(1)}K`
                : `${item.dataset.label}: ${item.raw.toFixed(1)}/100`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Edad', color: '#c8d6e5' },
          ticks: { color: '#c8d6e5', maxTicksLimit: 15, callback: (_v: any, i: number) => history.ages[i] ? Math.floor(history.ages[i]) : '' },
          grid: { color: '#2a2a4a40' },
        },
        y: { position: 'left', min: 0, max: 100, title: { display: true, text: 'Indice (0-100)', color: '#c8d6e5' }, ticks: { color: '#c8d6e5' }, grid: { color: '#2a2a4a40' } },
        y1: {
          position: 'right', min: Math.min(0, ...history.netWorth), max: yAxisMax,
          title: { display: true, text: 'Patrimonio ($)', color: '#ffd700' },
          ticks: { color: '#ffd700', callback: (v: number) => `$${(v / 1e3).toFixed(0)}K` },
          grid: { drawOnChartArea: false },
        },
      },
    };

    return { data: { labels, datasets }, options: opts };
  }, [history, showExito, mcBands]);

  return (
    <div className="chart-container">
      <Line data={data} options={options} plugins={[{
        id: 'bg',
        beforeDraw: (chart: any) => { chart.ctx.save(); chart.ctx.fillStyle = '#0f0f23'; chart.ctx.fillRect(0, 0, chart.width, chart.height); chart.ctx.restore(); },
      }]} />
    </div>
  );
};
