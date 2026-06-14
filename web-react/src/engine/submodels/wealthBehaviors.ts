/**
 * Wealth Dimension-Specific Behaviors Sub-model
 * Each dimension has unique aging, ceiling, and cross-dependency rules.
 *
 * Sources:
 * - 2-bienestar.md §2.3: Aging ceiling + decay
 * - 1-crecimiento.md §4: Knowledge obsolescence
 * - 4-trabajo.md: Post-retirement decay
 * - 3-familia.md §3: Children leaving home
 * - 6-comunidad.md: Age erosion 55+, bienestar-linked decay
 * - 8-servicio.md: Bienestar-linked decay
 * - 7-aventura.md: Limited by bienestar in old age
 * - supuestos.md #29: Entropy soft cap >85
 */

import type { MonthContext, SimulationState, SimulationParams, SimulationEvent, WealthDimension, CareerStage } from '../../types/simulation';
import { WEALTH_DIMENSIONS } from '../../constants/model';

/** Career stage multipliers for income */
export const CAREER_STAGE_MULTIPLIERS: Record<CareerStage, number> = {
  junior: 1.0,
  mid: 1.5,
  senior: 2.0,
  director: 3.0,
  executive: 5.0,
};

const CAREER_STAGES: CareerStage[] = ['junior', 'mid', 'senior', 'director', 'executive'];

/** Apply all dimension-specific aging, ceiling, and cross-dependency behaviors */
export function applyWealthBehaviors(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
  weeklyHours: Record<WealthDimension, number>,
  events?: SimulationEvent[],
  rng?: () => number,
): void {
  applyBienestarAging(ctx, state);
  applyCrecimientoObsolescence(ctx, state, weeklyHours);
  applyJobSatisfaction(state);
  applyTrabajoPostRetirement(ctx, state, params, weeklyHours);
  applyFamiliaChildrenLeaving(ctx, state);
  applyComunidadErosion(ctx, state);
  applyServicioDecay(state);
  applyAventuraLimitation(ctx, state);
  applyEntropySoftCap(state);
}

/**
 * Career progression: promotions for employment, failure risk for entrepreneurship.
 * From 4-trabajo.md §2.1 and §2.2
 *
 * Employment: Promotion every ~4 years if crecimiento > 50 and trabajo > 55
 *   Junior(0-3yr) → Mid(3-7yr) → Senior(7-12yr) → Director(12-20yr) → Executive(20yr+)
 *   Each promotion: income ×multiplier, satisfaction +8, event logged
 *
 * Entrepreneurship: High failure risk, decreasing with experience
 *   Year 1: 25%/year failure. Year 2-3: 15%/year. Year 3-5: 8%/year.
 *   Experience reduces risk: prob × max(0.3, 1 - yearsExperience×0.03)
 *   Failure: revert to employment, income = 80% base, satisfaction -15
 */
function applyCareerProgression(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
  events: SimulationEvent[],
  rng: () => number,
): void {
  if (ctx.age >= params.retirementAge) return;

  // Only check annually (month 0 of each year)
  if (ctx.monthOfYear !== 0) return;

  if (state.isEntrepreneur && !state.entrepreneurFailed) {
    // ── Entrepreneur failure check ──
    const years = state.entrepreneurYears;
    let baseFailureProb: number;
    if (years < 1) baseFailureProb = 0.25;
    else if (years < 3) baseFailureProb = 0.15;
    else if (years < 5) baseFailureProb = 0.08;
    else baseFailureProb = 0.03;

    // Experience reduces failure risk
    const expFactor = Math.max(0.3, 1 - state.yearsExperience * 0.03);
    const failureProb = baseFailureProb * expFactor;

    if (rng() < failureProb) {
      // Business failed!
      state.entrepreneurFailed = true;
      state.isEntrepreneur = false;
      state.currentBaseIncome = params.baseIncome * 0.8; // Take a pay cut
      state.jobSatisfaction = Math.max(0, state.jobSatisfaction - 15);
      state.careerStage = 'mid'; // Re-enter workforce at mid level
      state.wealthLevels.trabajo = Math.max(0, state.wealthLevels.trabajo - 10);
      events.push({ age: ctx.age, icon: '💥', text: `Emprendimiento fracasó (${years.toFixed(0)} años)` });
    }
  } else if (!state.isEntrepreneur) {
    // ── Employment promotion check ──
    const currentIdx = CAREER_STAGES.indexOf(state.careerStage);
    if (currentIdx >= CAREER_STAGES.length - 1) return; // Already executive

    // Promotion requirements: experience thresholds + performance
    const expThresholds = [3, 7, 12, 20]; // years to reach mid, senior, director, executive
    const nextThreshold = expThresholds[currentIdx] || 99;

    if (state.yearsExperience >= nextThreshold &&
        state.wealthLevels.crecimiento > 50 &&
        state.wealthLevels.trabajo > 55) {
      // Promotion!
      const newStage = CAREER_STAGES[currentIdx + 1];
      state.careerStage = newStage;
      state.currentBaseIncome *= CAREER_STAGE_MULTIPLIERS[newStage] / CAREER_STAGE_MULTIPLIERS[CAREER_STAGES[currentIdx]];
      state.jobSatisfaction = Math.min(100, state.jobSatisfaction + 8);
      state.wealthLevels.trabajo = Math.min(100, state.wealthLevels.trabajo + 5);
      events.push({ age: ctx.age, icon: '📈', text: `Promoción: ${newStage}` });
    }
  }
}

/**
 * Job satisfaction influences the Trabajo wealth dimension.
 * From 4-trabajo.md §3:
 * trabajo = weighted average of satisfaction, professionalism (from hours/experience), and transfers
 *
 * Satisfaction for employment: 40 + crecimiento×0.15 + bienestar×0.1
 * Satisfaction for entrepreneurship: 55 + crecimiento×0.15 + bienestar×0.1 (higher autonomy)
 */
function applyJobSatisfaction(state: SimulationState): void {
  const crec = state.wealthLevels.crecimiento;
  const bien = state.wealthLevels.bienestar;

  if (state.isEntrepreneur && !state.entrepreneurFailed) {
    state.jobSatisfaction = Math.min(100, 55 + crec * 0.15 + bien * 0.1);
  } else {
    state.jobSatisfaction = Math.min(100, 40 + crec * 0.15 + bien * 0.1);
  }

  // Satisfaction influences trabajo: blend current trabajo with satisfaction
  const targetTrabajo = state.jobSatisfaction * 0.4 + state.wealthLevels.trabajo * 0.6;
  state.wealthLevels.trabajo += (targetTrabajo - state.wealthLevels.trabajo) * 0.02; // slow convergence
}

/**
 * Bienestar: ceiling drops 1pt/year after 25 (min 50), monthly decay after 30.
 * From 2-bienestar.md §2.3
 */
function applyBienestarAging(ctx: MonthContext, state: SimulationState): void {
  // Ceiling: 100 at 25, drops to 50 at 75+
  const ceiling = Math.max(50, Math.min(100, 100 - Math.max(0, ctx.age - 25)));

  // Monthly decay: 0 until 30, then 0.005 × (age - 30)
  const monthlyDecay = ctx.age <= 30 ? 0 : 0.005 * (ctx.age - 30);
  state.wealthLevels.bienestar -= monthlyDecay;
  state.wealthLevels.bienestar = Math.min(state.wealthLevels.bienestar, ceiling);
}

/**
 * Crecimiento: knowledge obsolescence increases without study, ceiling drops after 55.
 * From 1-crecimiento.md §4
 */
function applyCrecimientoObsolescence(ctx: MonthContext, state: SimulationState, weeklyHours: Record<WealthDimension, number>): void {
  const hoursOnGrowth = weeklyHours.crecimiento || 0;

  // Base obsolescence: ~1.8%/year
  let obsolescenceRate = 0.15;
  if (hoursOnGrowth < 5) obsolescenceRate += 0.10;  // Accelerated without study
  if (hoursOnGrowth < 3) obsolescenceRate += 0.15;  // Severe neglect
  if (ctx.age > 55) obsolescenceRate += 0.003 * (ctx.age - 55); // Age-related

  state.wealthLevels.crecimiento -= obsolescenceRate;

  // Ceiling: 100 until 55, then drops 1.2pt/year (min 70)
  const ceiling = ctx.age <= 55 ? 100 : Math.max(70, 100 - (ctx.age - 55) * 1.2);
  state.wealthLevels.crecimiento = Math.min(state.wealthLevels.crecimiento, ceiling);
}

/**
 * Trabajo post-retirement: purpose-based growth or decay.
 * From 4-trabajo.md "Post-retiro" (actualización v3)
 *
 * Retirement = end of employment, NOT end of purpose.
 * If the person has high servicio + comunidad + crecimiento, they have PURPOSE
 * and Trabajo can actually GROW post-retirement (mentoring, writing, consulting).
 * Without purpose → existential void → Trabajo decays.
 *
 * propósito = (servicio×0.4 + comunidad×0.3 + crecimiento×0.3) / 100
 * propósito > 0.6: trabajo GROWS (+0.1×propósito/month)
 * propósito 0.3-0.6: neutral (maintains)
 * propósito < 0.3: trabajo DECAYS (-0.3×(1-propósito)/month)
 */
function applyTrabajoPostRetirement(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
  weeklyHours: Record<WealthDimension, number>,
): void {
  if (ctx.age < params.retirementAge) return;

  // No employment hours, but may have purpose-driven "work"
  weeklyHours.trabajo = 0;

  // Purpose index from servicio, comunidad, crecimiento
  const proposito = (
    state.wealthLevels.servicio * 0.4 +
    state.wealthLevels.comunidad * 0.3 +
    state.wealthLevels.crecimiento * 0.3
  ) / 100;

  if (proposito > 0.6) {
    // High purpose: Trabajo GROWS — doing what they love with all their time
    state.wealthLevels.trabajo = Math.min(100, state.wealthLevels.trabajo + 0.1 * proposito);
  } else if (proposito < 0.3) {
    // No purpose: existential void — Trabajo decays
    state.wealthLevels.trabajo = Math.max(0, state.wealthLevels.trabajo - 0.3 * (1 - proposito));
  }
  // 0.3-0.6: neutral, maintains current level
}

/**
 * Familia: "Empty nest syndrome" — 3-phase emotional impact when children leave home.
 * From 3-familia.md §3
 *
 * Phase 1 (child age 21.5-22): Acute grief — familia -0.5/mo, bienestar -0.3/mo
 * Phase 2 (child age 22-23): Adjustment — familia -0.2/mo
 * Phase 3 (child age 23-24): Recovery — familia +0.1/mo (new normal, mature relationship)
 *
 * Net effect per child: ~-5.8 pts familia, -1.8 pts bienestar (then partial recovery)
 */
function applyFamiliaChildrenLeaving(ctx: MonthContext, state: SimulationState): void {
  for (const childBirthAge of state.childrenAges) {
    const childAge = ctx.age - childBirthAge;

    if (childAge >= 21.5 && childAge < 22) {
      // Phase 1: Acute grief — child is leaving
      state.wealthLevels.familia = Math.max(0, state.wealthLevels.familia - 0.5);
      state.wealthLevels.bienestar = Math.max(0, state.wealthLevels.bienestar - 0.3);
    } else if (childAge >= 22 && childAge < 23) {
      // Phase 2: Adjustment — getting used to the empty nest
      state.wealthLevels.familia = Math.max(0, state.wealthLevels.familia - 0.2);
    } else if (childAge >= 23 && childAge < 24) {
      // Phase 3: Recovery — building new adult relationship with child
      state.wealthLevels.familia = Math.min(100, state.wealthLevels.familia + 0.1);
    }
  }
}

/**
 * Comunidad: natural erosion after 55, accelerated when bienestar < 60.
 * From 6-comunidad.md "Decay vinculado a bienestar"
 */
function applyComunidadErosion(ctx: MonthContext, state: SimulationState): void {
  if (ctx.age > 55) {
    state.wealthLevels.comunidad = Math.max(0, state.wealthLevels.comunidad - 0.002 * (ctx.age - 55));
  }
  if (state.wealthLevels.bienestar < 60) {
    state.wealthLevels.comunidad = Math.max(0, state.wealthLevels.comunidad - (60 - state.wealthLevels.bienestar) * 0.005);
  }
}

/**
 * Servicio: decays when bienestar < 60 (need health to serve).
 * From 8-servicio.md "Decay vinculado a bienestar"
 */
function applyServicioDecay(state: SimulationState): void {
  if (state.wealthLevels.bienestar < 60) {
    state.wealthLevels.servicio = Math.max(0, state.wealthLevels.servicio - (60 - state.wealthLevels.bienestar) * 0.004);
  }
}

/**
 * Aventura: limited by poor bienestar in old age.
 * From 7-aventura.md, supuestos.md #28
 */
function applyAventuraLimitation(ctx: MonthContext, state: SimulationState): void {
  if (ctx.age > 60 && state.wealthLevels.bienestar < 60) {
    state.wealthLevels.aventura = Math.max(0, state.wealthLevels.aventura - 0.03);
  }
}

/**
 * Entropy: soft global cap — dimensions >85 suffer micro-decay (0.3% of excess).
 * From supuestos.md #29: Prevents easy 100s
 */
function applyEntropySoftCap(state: SimulationState): void {
  for (const dimension of WEALTH_DIMENSIONS) {
    if (dimension === 'dinero' || dimension === 'aventura') continue;
    if (state.wealthLevels[dimension] > 85) {
      state.wealthLevels[dimension] -= (state.wealthLevels[dimension] - 85) * 0.003;
    }
  }
}
