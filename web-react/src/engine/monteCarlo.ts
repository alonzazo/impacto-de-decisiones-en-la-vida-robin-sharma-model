import type { SimulationParams, MonteCarloResult } from '../types/simulation';
import { simulate } from './simulation';

/** Percentile bands over time for fan chart visualization */
export interface MonteCarloBands {
  ages: number[];
  p5: number[];
  p25: number[];
  p50: number[];
  p75: number[];
  p95: number[];
}

export interface MonteCarloSummary {
  n: number;
  results: MonteCarloResult[];
  bands: MonteCarloBands;
  p5: MonteCarloResult;
  p25: MonteCarloResult;
  p50: MonteCarloResult;
  p75: MonteCarloResult;
  p95: MonteCarloResult;
  best: MonteCarloResult;
  worst: MonteCarloResult;
  avg: number;
}

/** Run N simulations with different seeds and return summary stats + time-series percentiles */
export function runMonteCarlo(baseParams: SimulationParams, n = 100): MonteCarloSummary {
  const results: MonteCarloResult[] = [];
  const allSeries: number[][] = []; // allSeries[simIdx][timeIdx] = wealthIndex

  for (let s = 1; s <= n; s++) {
    const params: SimulationParams = JSON.parse(JSON.stringify(baseParams));
    params.randomSeed = s;
    params.stochasticEnabled = true;
    const history = simulate(params);
    const last = history.wealthIndex.length - 1;
    results.push({ seed: s, wealthIndex: history.wealthIndex[last], netWorth: history.netWorth[last] });
    allSeries.push(history.wealthIndex);
  }

  results.sort((a, b) => a.wealthIndex - b.wealthIndex);

  // Compute percentile bands over time
  const timePoints = allSeries[0]?.length ?? 0;
  const bands: MonteCarloBands = { ages: [], p5: [], p25: [], p50: [], p75: [], p95: [] };

  // Get ages from first simulation
  const firstHistory = simulate({ ...JSON.parse(JSON.stringify(baseParams)), randomSeed: 1, stochasticEnabled: true });
  bands.ages = firstHistory.ages;

  for (let t = 0; t < timePoints; t++) {
    const valuesAtT = allSeries.map(series => series[t] ?? 0).sort((a, b) => a - b);
    const len = valuesAtT.length;
    bands.p5.push(valuesAtT[Math.floor(len * 0.05)]);
    bands.p25.push(valuesAtT[Math.floor(len * 0.25)]);
    bands.p50.push(valuesAtT[Math.floor(len * 0.50)]);
    bands.p75.push(valuesAtT[Math.floor(len * 0.75)]);
    bands.p95.push(valuesAtT[Math.floor(len * 0.95)]);
  }

  return {
    n,
    results,
    bands,
    p5: results[Math.floor(n * 0.05)],
    p25: results[Math.floor(n * 0.25)],
    p50: results[Math.floor(n * 0.5)],
    p75: results[Math.floor(n * 0.75)],
    p95: results[Math.floor(n * 0.95)],
    best: results[n - 1],
    worst: results[0],
    avg: results.reduce((sum, r) => sum + r.wealthIndex, 0) / n,
  };
}
