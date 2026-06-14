/**
 * Finance Sub-model
 * Handles income, expenses, portfolio growth, mortgage/car amortization, net worth, and financial thresholds.
 * From 5-dinero.md and modelo.md §3 "Actualizar finanzas".
 */

import type { MonthContext, SimulationState, SimulationParams, SimulationEvent, SimulationHistory } from '../../types/simulation';
import { PORTFOLIO_BY_STAGE, CAR_DEPRECIATION_RATE, EMERGENCY_FUND_ALLOCATION } from '../../constants/model';
import { calculateChildMonthlyCost, calculatePortfolioMonthlyReturn, calculateHealthExpenses } from '../financial';

/** Update all financial state: income, expenses, portfolio, assets, liabilities, thresholds */
export function updateFinances(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
  history: SimulationHistory,
  events: SimulationEvent[],
): void {
  const energyMultiplier = Math.max(0.3, state.wealthLevels.bienestar / 75);
  const freedomTarget = params.idealExpenses * 12 / params.safeWithdrawalRate;

  // ── Income ──
  const laborIncome = calculateLaborIncome(ctx, state, params, energyMultiplier);
  const passiveIncome = ctx.age >= params.retirementAge
    ? Math.max(0, state.portfolio) * params.safeWithdrawalRate / 12
    : 0;
  if (passiveIncome > 0) state.portfolio -= passiveIncome;
  const totalIncome = laborIncome + passiveIncome;

  // ── Expenses (explicit: base + housing + car + children + health) ──
  const inflationMult = Math.pow(1 + params.inflationRate / 12, ctx.month);
  const baseExpenses = params.currentExpenses * inflationMult;

  // Housing: rent if no house, mortgage+maintenance if house, just maintenance if paid off
  let housingExpense: number;
  if (state.ownsHouse) {
    const maintenance = state.propertyValue * 0.01 / 12; // 1% of value per year
    housingExpense = (state.mortgageBalance > 0 ? state.mortgagePayment : 0) + maintenance;
  } else {
    housingExpense = params.rentAmount * inflationMult;
  }

  const carExpenses = state.ownsCar
    ? (state.carLoanBalance > 0 ? state.carPayment + params.carMaintenance : params.carMaintenance)
    : 0;
  let childrenExpenses = 0;
  for (const childBirthAge of state.childrenAges) {
    childrenExpenses += calculateChildMonthlyCost(ctx.age - childBirthAge, params.childBaseCost);
  }
  const healthExpenses = (params.hasInsurance && ctx.age >= params.insuranceStartAge)
    ? params.insurancePremium
    : calculateHealthExpenses(ctx.age, state.wealthLevels.bienestar);
  const totalExpenses = baseExpenses + housingExpense + carExpenses + childrenExpenses + healthExpenses;

  // ── Cash flow → savings/investment ──
  let cashFlow = totalIncome - totalExpenses;
  const emergencyTarget = params.currentExpenses * params.emergencyMonths;
  if (cashFlow > 0) {
    if (state.emergencyFund < emergencyTarget) {
      const toEmergency = Math.min(cashFlow * EMERGENCY_FUND_ALLOCATION, emergencyTarget - state.emergencyFund);
      state.emergencyFund += toEmergency;
      cashFlow -= toEmergency;
    }
    if (params.investSavings) {
      state.portfolio += Math.max(0, cashFlow); // Invested → grows with market
    } else {
      state.emergencyFund += Math.max(0, cashFlow); // Cash savings → no growth
    }
  } else {
    const deficit = -cashFlow;
    if (state.emergencyFund >= deficit) {
      state.emergencyFund -= deficit;
    } else {
      state.emergencyFund = 0;
      state.portfolio -= deficit;
    }
  }

  // ── Portfolio growth ──
  state.portfolio *= (1 + calculatePortfolioMonthlyReturn(PORTFOLIO_BY_STAGE[ctx.stage]));
  state.portfolio = Math.max(0, state.portfolio);

  // ── Property appreciation ──
  if (state.ownsHouse) {
    state.propertyValue *= (1 + params.propertyAppreciation / 12);
    if (state.mortgageBalance > 0) {
      const interest = state.mortgageBalance * params.mortgageRate / 12;
      state.mortgageBalance = Math.max(0, state.mortgageBalance - (state.mortgagePayment - interest));
    }
  }

  // ── Car depreciation ──
  if (state.ownsCar) {
    state.carValue *= (1 - CAR_DEPRECIATION_RATE / 12);
    if (state.carLoanBalance > 0) {
      const interest = state.carLoanBalance * params.carLoanRate / 12;
      state.carLoanBalance = Math.max(0, state.carLoanBalance - (state.carPayment - interest));
    }
  }

  state.yearsExperience += 1 / 12;

  // ── Net worth ──
  const netWorth = state.portfolio + state.emergencyFund + state.propertyValue + state.carValue
    - state.mortgageBalance - state.carLoanBalance;

  // ── Normalize dinero to 0-100 scale (modelo.md §7) ──
  state.wealthLevels.dinero = Math.min(100, Math.max(0, netWorth / freedomTarget * 100));

  // ── Financial thresholds using REAL total expenses (not just base) ──
  const monthlyPassiveIncome = Math.max(0, state.portfolio) * params.safeWithdrawalRate / 12;

  // Security: passive income covers basic needs + housing
  const securityTarget = params.basicExpenses + housingExpense;
  if (history.securityAge === null && monthlyPassiveIncome >= securityTarget) {
    history.securityAge = ctx.age;
    events.push({ age: ctx.age, icon: '🛡️', text: `Seguridad financiera ($${securityTarget.toFixed(0)}/mes)` });
  }
  // Independence: passive income covers current total expenses
  if (history.independenceAge === null && monthlyPassiveIncome >= totalExpenses) {
    history.independenceAge = ctx.age;
    events.push({ age: ctx.age, icon: '⚖️', text: `Independencia financiera ($${totalExpenses.toFixed(0)}/mes)` });
  }
  // Freedom: passive income covers ideal lifestyle + housing
  const freedomExpenses = params.idealExpenses + housingExpense;
  if (history.freedomAge === null && monthlyPassiveIncome >= freedomExpenses) {
    history.freedomAge = ctx.age;
    events.push({ age: ctx.age, icon: '🚀', text: `Libertad financiera ($${freedomExpenses.toFixed(0)}/mes)` });
  }

  // ── Record snapshot (caller decides frequency) ──
  // Store latest values for the orchestrator to snapshot
  (state as any)._lastNetWorth = netWorth;
  (state as any)._lastPassiveIncome = monthlyPassiveIncome;
}

/**
 * Calculate labor income based on career type, stage, and entrepreneurship phase.
 * From 4-trabajo.md §4:
 *
 * Employment: base × careerMultiplier × min(1, energy)
 *   Junior: 1.0x, Mid: 1.5x, Senior: 2.0x, Director: 3.0x, Executive: 5.0x
 *
 * Entrepreneurship: base × min(1, energy) × phase factor
 *   Year 0-1: $0 (building). Year 1-3: 80%. Year 3+: 1.5x (mature).
 *   If failed: reverts to employment at 80% base.
 */
function calculateLaborIncome(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
  energyMultiplier: number,
): number {
  if (ctx.age >= params.retirementAge) return 0;

  const energy = Math.min(1, energyMultiplier);

  if (state.isEntrepreneur && !state.entrepreneurFailed) {
    if (state.entrepreneurYears < 1) return 0;
    if (state.entrepreneurYears < 3) return state.currentBaseIncome * 0.8 * energy;
    return state.currentBaseIncome * energy * 1.5;
  }

  // Employment: income grows only via stochastic job opportunities (+15% raises)
  return state.currentBaseIncome * energy;
}
