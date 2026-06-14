/**
 * Master Simulation Orchestrator
 * Thin monthly loop that delegates to sub-models in the documented order.
 * Mirrors modelo.md §3 "Ciclo de simulación mensual" exactly.
 */

import type {
  SimulationParams, SimulationHistory, SimulationState,
  MonthContext, WealthDimension, SimulationEvent,
} from '../types/simulation';
import { WEALTH_DIMENSIONS, WEALTH_INDEX_WEIGHTS } from '../constants/model';
import { getLifeStage } from './financial';
import { mulberry32 } from './prng';
import { processLifeEvents } from './submodels/lifeEvents';
import { processStochasticEvents } from './submodels/stochasticEvents';
import { allocateTime } from './submodels/timeAllocation';
import { computePartnerMultiplier } from './submodels/partnerEffect';
import { applyWealthBehaviors } from './submodels/wealthBehaviors';
import { applyWealthGrowth } from './submodels/wealthGrowth';
import { updateFinances } from './submodels/finance';

// ─── State Factory ───────────────────────────────────────────

/** Create initial mutable simulation state from params */
function createInitialState(params: SimulationParams): SimulationState {
  return {
    wealthLevels: {
      crecimiento: params.initialValues.crecimiento,
      bienestar: params.initialValues.bienestar,
      familia: params.initialValues.familia,
      trabajo: params.initialValues.trabajo,
      dinero: 10,
      comunidad: params.initialValues.comunidad,
      aventura: params.initialValues.aventura,
      servicio: params.initialValues.servicio,
    },
    portfolio: Math.max(0, params.initialWealth - Math.min(params.currentExpenses * params.emergencyMonths, params.initialWealth)),
    emergencyFund: Math.min(params.currentExpenses * params.emergencyMonths, params.initialWealth),
    propertyValue: 0,
    mortgageBalance: 0,
    mortgagePayment: 0,
    carValue: 0,
    carLoanBalance: 0,
    carPayment: 0,
    ownsHouse: false,
    ownsCar: false,
    isEntrepreneur: false,
    entrepreneurYears: 0,
    childrenAges: [],
    yearsExperience: 0,
    careerStage: 'junior',
    jobSatisfaction: 50,
    entrepreneurFailed: false,
    currentBaseIncome: params.baseIncome,
    hasPartnerActive: params.hasPartner,
    currentPartnerQuality: params.partnerQuality,
    breakupCooldown: 0,
    illnessCooldown: 0,
    crisisCooldown: 0,
  };
}

/** Create empty history structure */
function createEmptyHistory(): SimulationHistory {
  return {
    ages: [],
    wealth: {
      crecimiento: [], bienestar: [], familia: [], trabajo: [],
      dinero: [], comunidad: [], aventura: [], servicio: [],
    },
    netWorth: [],
    passiveIncome: [],
    wealthIndex: [],
    securityAge: null,
    independenceAge: null,
    freedomAge: null,
    events: [],
  };
}

// ─── Context Builder ─────────────────────────────────────────

/** Build derived month context from month index and params */
function buildMonthContext(month: number, params: SimulationParams): MonthContext {
  const age = params.currentAge + month / 12;
  return {
    month,
    age,
    ageFloor: Math.floor(age),
    stage: getLifeStage(age),
    monthOfYear: month % 12,
  };
}

// ─── Snapshot Recorder ───────────────────────────────────────

/** Record a quarterly snapshot into history */
function recordSnapshot(
  ctx: MonthContext,
  state: SimulationState,
  history: SimulationHistory,
): void {
  history.ages.push(ctx.age);
  for (const dimension of WEALTH_DIMENSIONS) {
    history.wealth[dimension].push(state.wealthLevels[dimension]);
  }
  history.netWorth.push((state as any)._lastNetWorth ?? 0);
  history.passiveIncome.push((state as any)._lastPassiveIncome ?? 0);

  // Composite wealth index (modelo.md §6)
  const wealthIndex = WEALTH_DIMENSIONS.reduce(
    (sum, dim) => sum + state.wealthLevels[dim] * WEALTH_INDEX_WEIGHTS[dim], 0,
  );
  history.wealthIndex.push(wealthIndex);
}

// ─── Main Simulation ─────────────────────────────────────────

/**
 * Run the full life simulation month-by-month.
 * Each iteration follows the documented cycle from modelo.md §3:
 *
 * 1. Process life events (deterministic decisions)
 * 2. Process stochastic events (random)
 * 3. Allocate time (112h/week across 8 dimensions)
 * 4. Compute partner multiplier
 * 5. Apply dimension-specific behaviors (aging, obsolescence, decay)
 * 6. Apply wealth growth (hours → logarithmic growth + transfer matrix)
 * 7. Update finances (income, expenses, portfolio, net worth, thresholds)
 * 8. Record quarterly snapshot
 */
export function simulate(params: SimulationParams): SimulationHistory {
  const totalMonths = (params.endAge - params.currentAge) * 12;
  const state = createInitialState(params);
  const history = createEmptyHistory();
  const events: SimulationEvent[] = [];
  const rng = params.stochasticEnabled ? mulberry32(params.randomSeed) : () => 2;

  for (let month = 0; month < totalMonths; month++) {
    const ctx = buildMonthContext(month, params);

    // Step 1: Deterministic life events
    processLifeEvents(ctx, state, params, events);

    // Step 2: Stochastic events
    processStochasticEvents(ctx, state, params, events, rng);

    // Step 3: Time allocation
    const weeklyHours = allocateTime(ctx, state, params);

    // Step 4: Partner effect
    const partnerMultiplier = computePartnerMultiplier(ctx, state, params, events);

    // Step 5: Dimension-specific behaviors (includes career progression + entrepreneur failure)
    applyWealthBehaviors(ctx, state, params, weeklyHours, events, rng);

    // Step 6: Wealth growth from hours + transfer matrix
    applyWealthGrowth(state, weeklyHours, partnerMultiplier);

    // Step 7: Finance (income, expenses, portfolio, thresholds)
    updateFinances(ctx, state, params, history, events);

    // Step 8: Record snapshot every 3 months
    if (month % 3 === 0) {
      recordSnapshot(ctx, state, history);
    }
  }

  history.events = events;
  return history;
}
