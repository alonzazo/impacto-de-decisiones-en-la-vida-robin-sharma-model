/**
 * Multifactorial Sensitivity Analysis
 * Measures how much each decision parameter impacts the Wealth Index.
 * Uses one-at-a-time (OAT) analysis + pairwise interaction detection.
 */

import type { SimulationParams, CareerType } from '../types/simulation';
import { simulate } from './simulation';

// ─── Factor Definitions ──────────────────────────────────────

interface Factor {
  name: string;
  icon: string;
  low: (p: SimulationParams) => void;
  high: (p: SimulationParams) => void;
  lowLabel: string;
  highLabel: string;
}

function buildFactors(base: SimulationParams): Factor[] {
  return [
    { name: 'Calidad pareja', icon: '💑', lowLabel: '30', highLabel: '95',
      low: p => { p.partnerQuality = 30; }, high: p => { p.partnerQuality = 95; } },
    { name: 'Gastos actuales', icon: '💸', lowLabel: '$800', highLabel: '$3500',
      low: p => { p.currentExpenses = 800; }, high: p => { p.currentExpenses = 3500; } },
    { name: 'Comprar casa', icon: '🏠', lowLabel: 'No', highLabel: 'Sí @32',
      low: p => { p.wantsHouse = false; }, high: p => { p.wantsHouse = true; p.housePurchaseAge = 32; } },
    { name: 'Educación', icon: '🎓', lowLabel: 'Secundaria', highLabel: 'Maestría',
      low: p => { p.formalEducation = 20; }, high: p => { p.formalEducation = 85; } },
    { name: 'Seguro médico', icon: '🏥', lowLabel: 'No', highLabel: 'Sí',
      low: p => { p.hasInsurance = false; }, high: p => { p.hasInsurance = true; } },
    { name: 'Tener hijos', icon: '👶', lowLabel: '0', highLabel: '2 @30',
      low: p => { p.childrenBirthAges = []; }, high: p => { p.childrenBirthAges = [30, 33]; } },
    { name: 'Comprar carro', icon: '🚗', lowLabel: 'No', highLabel: 'Sí @26',
      low: p => { p.wantsCar = false; }, high: p => { p.wantsCar = true; p.carPurchaseAge = 26; } },
    { name: 'Emprender', icon: '🚀', lowLabel: 'Empleo', highLabel: 'Mixto @34',
      low: p => { p.careerType = 'empleo' as CareerType; }, high: p => { p.careerType = 'mixto' as CareerType; p.entrepreneurshipAge = 34; } },
    { name: 'Edad retiro', icon: '⏰', lowLabel: '55', highLabel: '70',
      low: p => { p.retirementAge = 55; }, high: p => { p.retirementAge = 70; } },
    { name: 'Fondo emergencia', icon: '🛡️', lowLabel: '3 meses', highLabel: '12 meses',
      low: p => { p.emergencyMonths = 3; }, high: p => { p.emergencyMonths = 12; } },
    { name: 'Precio casa', icon: '🏘️', lowLabel: '$80K', highLabel: '$300K',
      low: p => { p.housePrice = 80000; }, high: p => { p.housePrice = 300000; } },
    { name: 'Edad pareja', icon: '💕', lowLabel: '22', highLabel: '35',
      low: p => { p.partnerStartAge = 22; }, high: p => { p.partnerStartAge = 35; } },
  ];
}

// ─── Evaluation Helper ───────────────────────────────────────

function evalAvg(params: SimulationParams, seeds: number): number {
  let sum = 0;
  for (let s = 1; s <= seeds; s++) {
    const p: SimulationParams = JSON.parse(JSON.stringify(params));
    p.randomSeed = s;
    p.stochasticEnabled = true;
    const h = simulate(p);
    sum += h.wealthIndex[h.wealthIndex.length - 1];
  }
  return sum / seeds;
}

// ─── Public Interface ────────────────────────────────────────

export interface FactorImpact {
  name: string;
  icon: string;
  lowLabel: string;
  highLabel: string;
  lowScore: number;
  highScore: number;
  impact: number;       // high - low (positive = high is better)
  absImpact: number;
}

export interface Interaction {
  factorA: string;
  factorB: string;
  synergy: number;  // positive = they amplify each other
}

export interface SensitivityResult {
  baseline: number;
  factors: FactorImpact[];
  interactions: Interaction[];
  totalSims: number;
}

/**
 * Run multifactorial sensitivity analysis.
 * Phase 1: OAT — vary each factor low/high
 * Phase 2: Top interactions — test pairs of top factors
 */
export function runSensitivityAnalysis(baseParams: SimulationParams): SensitivityResult {
  const factors = buildFactors(baseParams);
  const SEEDS = 8;
  let totalSims = 0;

  // Baseline
  const baseline = evalAvg(baseParams, SEEDS);
  totalSims += SEEDS;

  // Phase 1: One-at-a-time
  const results: FactorImpact[] = [];
  const lowScores: number[] = [];
  const highScores: number[] = [];

  for (const factor of factors) {
    const pLow: SimulationParams = JSON.parse(JSON.stringify(baseParams));
    factor.low(pLow);
    const scoreLow = evalAvg(pLow, SEEDS);
    totalSims += SEEDS;

    const pHigh: SimulationParams = JSON.parse(JSON.stringify(baseParams));
    factor.high(pHigh);
    const scoreHigh = evalAvg(pHigh, SEEDS);
    totalSims += SEEDS;

    const impact = scoreHigh - scoreLow;
    lowScores.push(scoreLow);
    highScores.push(scoreHigh);

    results.push({
      name: factor.name,
      icon: factor.icon,
      lowLabel: factor.lowLabel,
      highLabel: factor.highLabel,
      lowScore: scoreLow,
      highScore: scoreHigh,
      impact,
      absImpact: Math.abs(impact),
    });
  }

  // Sort by absolute impact
  results.sort((a, b) => b.absImpact - a.absImpact);

  // Phase 2: Interaction detection (top 6 pairs)
  const interactions: Interaction[] = [];
  const topN = Math.min(6, factors.length);
  const topFactors = results.slice(0, topN);

  for (let i = 0; i < topN; i++) {
    for (let j = i + 1; j < topN; j++) {
      const fA = factors.find(f => f.name === topFactors[i].name)!;
      const fB = factors.find(f => f.name === topFactors[j].name)!;

      // Both high
      const pBoth: SimulationParams = JSON.parse(JSON.stringify(baseParams));
      fA.high(pBoth);
      fB.high(pBoth);
      const scoreBoth = evalAvg(pBoth, SEEDS);
      totalSims += SEEDS;

      // Expected (additive): baseline + impactA + impactB
      const impactA = topFactors[i].impact;
      const impactB = topFactors[j].impact;
      const expected = baseline + impactA + impactB;
      const synergy = scoreBoth - expected;

      if (Math.abs(synergy) > 0.5) {
        interactions.push({
          factorA: `${fA.icon} ${fA.name}`,
          factorB: `${fB.icon} ${fB.name}`,
          synergy: Math.round(synergy * 10) / 10,
        });
      }
    }
  }

  interactions.sort((a, b) => Math.abs(b.synergy) - Math.abs(a.synergy));

  return { baseline, factors: results, interactions, totalSims };
}
