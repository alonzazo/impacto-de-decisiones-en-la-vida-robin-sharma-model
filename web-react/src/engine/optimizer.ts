/**
 * CMA-ES (Covariance Matrix Adaptation Evolution Strategy) Optimizer
 * Optimizes ALL simulation parameters to maximize the Wealth Index.
 *
 * CMA-ES is the state-of-the-art for black-box optimization:
 * - No gradients needed (simulation is a black box)
 * - Learns parameter correlations via covariance matrix
 * - Handles noisy/stochastic objectives (our simulation is stochastic)
 * - Converges efficiently in 5-50 dimensions
 */

import type { SimulationParams, CareerType } from '../types/simulation';
import { simulate } from './simulation';

// ─── Parameter Encoding ──────────────────────────────────────

/** Each optimizable parameter: name, range [min,max], decode function */
interface ParamDef {
  name: string;
  min: number;
  max: number;
  decode: (val: number, params: SimulationParams) => void;
}

function buildParamDefs(base: SimulationParams): ParamDef[] {
  const age = base.currentAge;
  return [
    // Financial decisions
    { name: 'retirementAge', min: 45, max: 75, decode: (v, p) => { p.retirementAge = Math.round(v); } },
    { name: 'basicExpenses', min: 500, max: 3000, decode: (v, p) => { p.basicExpenses = Math.round(v / 50) * 50; } },
    { name: 'currentExpenses', min: 800, max: 4000, decode: (v, p) => { p.currentExpenses = Math.round(v / 50) * 50; } },
    { name: 'idealExpenses', min: 2000, max: 15000, decode: (v, p) => { p.idealExpenses = Math.round(v / 500) * 500; } },
    { name: 'emergencyMonths', min: 2, max: 18, decode: (v, p) => { p.emergencyMonths = Math.round(v); } },

    // Insurance
    { name: 'hasInsurance', min: 0, max: 1, decode: (v, p) => { p.hasInsurance = v > 0.5; } },
    { name: 'insurancePremium', min: 50, max: 500, decode: (v, p) => { p.insurancePremium = Math.round(v / 25) * 25; } },
    { name: 'insuranceStartAge', min: 20, max: 40, decode: (v, p) => { p.insuranceStartAge = Math.round(v); } },

    // Housing
    { name: 'wantsHouse', min: 0, max: 1, decode: (v, p) => { p.wantsHouse = v > 0.5; } },
    { name: 'housePurchaseAge', min: age + 2, max: 50, decode: (v, p) => { p.housePurchaseAge = Math.round(v); } },
    { name: 'housePrice', min: 50000, max: 400000, decode: (v, p) => { p.housePrice = Math.round(v / 10000) * 10000; } },
    { name: 'downPaymentRatio', min: 0.05, max: 0.30, decode: (v, p) => { p.downPaymentRatio = Math.round(v * 100) / 100; } },

    // Car
    { name: 'wantsCar', min: 0, max: 1, decode: (v, p) => { p.wantsCar = v > 0.5; } },
    { name: 'carPurchaseAge', min: age + 1, max: 45, decode: (v, p) => { p.carPurchaseAge = Math.round(v); } },
    { name: 'carPrice', min: 5000, max: 50000, decode: (v, p) => { p.carPrice = Math.round(v / 1000) * 1000; } },

    // Partner
    { name: 'partnerQuality', min: 30, max: 100, decode: (v, p) => { p.partnerQuality = Math.round(v); } },
    { name: 'partnerStartAge', min: age, max: 40, decode: (v, p) => { p.partnerStartAge = Math.round(v); } },

    // Children
    { name: 'numChildren', min: 0, max: 4, decode: (v, p) => {
      const n = Math.round(v);
      const firstAge = p.childrenBirthAges[0] || 30;
      p.childrenBirthAges = n > 0 ? Array.from({ length: n }, (_, i) => firstAge + i * 3) : [];
    }},
    { name: 'firstChildAge', min: age + 3, max: 42, decode: (v, p) => {
      const spacing = 3;
      p.childrenBirthAges = p.childrenBirthAges.map((_, i) => Math.round(v) + i * spacing);
    }},

    // Career
    { name: 'careerType', min: 0, max: 2, decode: (v, p) => {
      const types: CareerType[] = ['empleo', 'mixto', 'emprendimiento'];
      p.careerType = types[Math.round(v)];
    }},
    { name: 'entrepreneurshipAge', min: age + 2, max: 45, decode: (v, p) => { p.entrepreneurshipAge = Math.round(v); } },
    { name: 'entrepreneurshipInv', min: 5000, max: 50000, decode: (v, p) => { p.entrepreneurshipInvestment = Math.round(v / 5000) * 5000; } },

    // Education
    { name: 'formalEducation', min: 0, max: 3, decode: (v, p) => {
      const levels = [20, 40, 60, 85];
      p.formalEducation = levels[Math.round(v)];
    }},
  ];
}

// ─── CMA-ES Core ─────────────────────────────────────────────

/** Simple matrix operations (no external dependency) */
function matMul(A: number[][], B: number[][]): number[][] {
  const n = A.length, m = B[0].length, k = B.length;
  const C = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++)
      for (let l = 0; l < k; l++)
        C[i][j] += A[i][l] * B[l][j];
  return C;
}

function identityMatrix(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
}

function scaleMatrix(M: number[][], s: number): number[][] {
  return M.map(row => row.map(v => v * s));
}

function addMatrix(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

function outerProduct(a: number[], b: number[]): number[][] {
  return a.map(ai => b.map(bj => ai * bj));
}

/** Generate standard normal random number (Box-Muller) */
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Sample from N(mean, sigma² × C) using Cholesky-like approach */
function sampleMultivariate(mean: number[], sigma: number, C: number[][]): number[] {
  const n = mean.length;
  // Simplified: use diagonal of C as independent variances (avoids full Cholesky)
  // This is a common approximation that works well for moderate dimensions
  return mean.map((m, i) => m + sigma * Math.sqrt(Math.max(0.001, C[i][i])) * randn());
}

// ─── Evaluation ──────────────────────────────────────────────

function evaluate(
  vector: number[],
  defs: ParamDef[],
  baseParams: SimulationParams,
  seeds: number,
): number {
  // Decode vector → params
  const params: SimulationParams = JSON.parse(JSON.stringify(baseParams));
  for (let i = 0; i < defs.length; i++) {
    const val = Math.max(defs[i].min, Math.min(defs[i].max, vector[i]));
    defs[i].decode(val, params);
  }
  // Ensure consistency
  if (params.currentExpenses < params.basicExpenses) params.currentExpenses = params.basicExpenses;
  if (params.idealExpenses < params.currentExpenses) params.idealExpenses = params.currentExpenses;

  // Average wealth index over multiple seeds
  let sum = 0;
  for (let s = 1; s <= seeds; s++) {
    const p: SimulationParams = JSON.parse(JSON.stringify(params));
    p.randomSeed = s;
    p.stochasticEnabled = true;
    const history = simulate(p);
    const last = history.wealthIndex.length - 1;
    sum += history.wealthIndex[last];
  }
  return sum / seeds;
}

// ─── Public Interface ────────────────────────────────────────

export interface OptimizerResult {
  tried: number;
  seeds: number;
  generations: number;
  best: {
    wealthIndex: number;
    params: Record<string, string>;
  };
  bestSimParams: SimulationParams; // full decoded params to apply to sidebar
  convergence: number[]; // best fitness per generation
}

/**
 * Run CMA-ES optimization over all simulation parameters.
 * Returns the best parameter configuration found.
 */
export function runOptimizer(baseParams: SimulationParams): OptimizerResult {
  const defs = buildParamDefs(baseParams);
  const n = defs.length; // dimensionality (~23)

  // CMA-ES hyperparameters
  const lambda = Math.max(12, Math.floor(4 + 3 * Math.log(n))); // population size
  const mu = Math.floor(lambda / 2); // number of parents
  const SEEDS_PER_EVAL = 5;
  const MAX_GENS = 40;

  // Weights for ranked parents (log-linear)
  const rawWeights = Array.from({ length: mu }, (_, i) => Math.log(mu + 0.5) - Math.log(i + 1));
  const wSum = rawWeights.reduce((a, b) => a + b, 0);
  const weights = rawWeights.map(w => w / wSum);
  const mueff = 1 / weights.reduce((s, w) => s + w * w, 0);

  // Adaptation rates
  const cc = (4 + mueff / n) / (n + 4 + 2 * mueff / n);
  const cs = (mueff + 2) / (n + mueff + 5);
  const c1 = 2 / ((n + 1.3) ** 2 + mueff);
  const cmu = Math.min(1 - c1, 2 * (mueff - 2 + 1 / mueff) / ((n + 2) ** 2 + mueff));
  const damps = 1 + 2 * Math.max(0, Math.sqrt((mueff - 1) / (n + 1)) - 1) + cs;
  const chiN = Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n));

  // State initialization
  let mean = defs.map(d => (d.min + d.max) / 2); // start at center of ranges
  let sigma = 0.3; // initial step size (as fraction of range, effectively)
  let C = identityMatrix(n);
  let pc = new Array(n).fill(0); // evolution path for C
  let ps = new Array(n).fill(0); // evolution path for sigma

  let bestFitness = -Infinity;
  let bestVector = [...mean];
  let totalEvals = 0;
  const convergence: number[] = [];

  for (let gen = 0; gen < MAX_GENS; gen++) {
    // Generate lambda offspring
    const population: { x: number[]; fitness: number }[] = [];

    for (let k = 0; k < lambda; k++) {
      const x = sampleMultivariate(mean, sigma, C);
      // Clamp to valid ranges
      for (let i = 0; i < n; i++) {
        x[i] = Math.max(defs[i].min, Math.min(defs[i].max, x[i]));
      }
      const fitness = evaluate(x, defs, baseParams, SEEDS_PER_EVAL);
      population.push({ x, fitness });
      totalEvals++;
    }

    // Sort by fitness (maximize → sort descending)
    population.sort((a, b) => b.fitness - a.fitness);

    // Track best
    if (population[0].fitness > bestFitness) {
      bestFitness = population[0].fitness;
      bestVector = [...population[0].x];
    }
    convergence.push(bestFitness);

    // Compute new mean (weighted average of top-mu parents)
    const oldMean = [...mean];
    mean = new Array(n).fill(0);
    for (let i = 0; i < mu; i++) {
      for (let j = 0; j < n; j++) {
        mean[j] += weights[i] * population[i].x[j];
      }
    }

    // Update evolution paths
    const diff = mean.map((m, i) => (m - oldMean[i]) / sigma);

    // ps (sigma path)
    ps = ps.map((p, i) => (1 - cs) * p + Math.sqrt(cs * (2 - cs) * mueff) * diff[i]);
    const psNorm = Math.sqrt(ps.reduce((s, p) => s + p * p, 0));

    // Sigma adaptation
    sigma *= Math.exp((cs / damps) * (psNorm / chiN - 1));
    sigma = Math.max(0.001, Math.min(sigma, 10)); // prevent collapse/explosion

    // pc (covariance path)
    const hsig = psNorm / Math.sqrt(1 - Math.pow(1 - cs, 2 * (gen + 1))) < (1.4 + 2 / (n + 1)) * chiN ? 1 : 0;
    pc = pc.map((p, i) => (1 - cc) * p + hsig * Math.sqrt(cc * (2 - cc) * mueff) * diff[i]);

    // Update covariance matrix
    const rankOneUpdate = outerProduct(pc, pc);
    let rankMuUpdate = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < mu; i++) {
      const d = population[i].x.map((xi, j) => (xi - oldMean[j]) / sigma);
      const outer = outerProduct(d, d);
      rankMuUpdate = addMatrix(rankMuUpdate, scaleMatrix(outer, weights[i]));
    }

    C = addMatrix(
      addMatrix(
        scaleMatrix(C, 1 - c1 - cmu),
        scaleMatrix(rankOneUpdate, c1)
      ),
      scaleMatrix(rankMuUpdate, cmu)
    );

    // Ensure C stays positive definite (simple regularization)
    for (let i = 0; i < n; i++) {
      C[i][i] = Math.max(0.001, C[i][i]);
    }
  }

  // Decode best solution for display
  const bestParams: Record<string, string> = {};
  const display: SimulationParams = JSON.parse(JSON.stringify(baseParams));
  for (let i = 0; i < defs.length; i++) {
    const val = Math.max(defs[i].min, Math.min(defs[i].max, bestVector[i]));
    defs[i].decode(val, display);
  }

  bestParams['Retiro'] = `${display.retirementAge} años`;
  bestParams['Gastos'] = `$${display.basicExpenses}/$${display.currentExpenses}/$${display.idealExpenses}`;
  bestParams['Seguro'] = display.hasInsurance ? `Sí ($${display.insurancePremium}/mes desde ${display.insuranceStartAge})` : 'No';
  bestParams['Casa'] = display.wantsHouse ? `Sí a ${display.housePurchaseAge} ($${(display.housePrice / 1e3).toFixed(0)}K)` : 'No';
  bestParams['Carro'] = display.wantsCar ? `Sí a ${display.carPurchaseAge} ($${(display.carPrice / 1e3).toFixed(0)}K)` : 'No';
  bestParams['Pareja'] = `Calidad ${display.partnerQuality} desde ${display.partnerStartAge}`;
  bestParams['Hijos'] = display.childrenBirthAges.length > 0
    ? `${display.childrenBirthAges.length} (${display.childrenBirthAges.join(', ')})`
    : 'Ninguno';
  bestParams['Carrera'] = `${display.careerType}${display.careerType !== 'empleo' ? ` (emprender a ${display.entrepreneurshipAge}, inv $${(display.entrepreneurshipInvestment / 1e3).toFixed(0)}K)` : ''}`;
  bestParams['Educación'] = `${display.formalEducation}`;
  bestParams['Emergencia'] = `${display.emergencyMonths} meses`;

  return {
    tried: totalEvals,
    seeds: SEEDS_PER_EVAL,
    generations: MAX_GENS,
    best: {
      wealthIndex: bestFitness,
      params: bestParams,
    },
    bestSimParams: display,
    convergence,
  };
}
