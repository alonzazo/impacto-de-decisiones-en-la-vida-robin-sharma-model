/**
 * Stochastic Events Sub-model
 * Random life events: illness, job opportunity, market crisis, lucky break.
 * From supuestos.md #32-35.
 */

import type { MonthContext, SimulationState, SimulationParams, SimulationEvent } from '../../types/simulation';

/** Process stochastic events (checked every 3 months) */
export function processStochasticEvents(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
  events: SimulationEvent[],
  rng: () => number,
): void {
  if (state.illnessCooldown > 0) state.illnessCooldown--;
  if (state.crisisCooldown > 0) state.crisisCooldown--;
  if (state.breakupCooldown > 0) state.breakupCooldown--;

  if (!params.stochasticEnabled || ctx.monthOfYear % 3 !== 0) return;

  const roll1 = rng(), roll2 = rng(), roll3 = rng(), roll4 = rng(), roll5 = rng(), roll6 = rng();

  processIllness(ctx, state, params, events, roll1, rng);
  processJobOpportunity(ctx, state, params, events, roll2);
  processMarketCrisis(ctx, state, events, roll3);
  processLuckyBreak(ctx, state, events, roll4, rng);
  processBreakup(ctx, state, events, roll5);
  processNewPartner(ctx, state, events, roll6, rng);
}

/**
 * 🏥 Illness: probability rises with age, drops with bienestar (2-bienestar.md §6)
 *
 * Insurance effect: If the person has active insurance, medical costs are fully covered
 * and the bienestar impact is halved (better medical care reduces chronic risk).
 */
function processIllness(ctx: MonthContext, state: SimulationState, params: SimulationParams, events: SimulationEvent[], roll: number, rng: () => number): void {
  const probability = Math.max(0.005, (0.02 + Math.max(0, ctx.age - 40) * 0.002) * (1.3 - state.wealthLevels.bienestar / 100));
  if (roll >= probability || state.illnessCooldown > 0) return;

  const hasActiveInsurance = params.hasInsurance && ctx.age >= params.insuranceStartAge;
  const isSevere = roll < probability * 0.3;

  if (isSevere) {
    // Severe illness: major surgery, transplant, experimental treatment
    // Cost: $20K–$200K (skewed distribution: rng()² biases toward lower end but allows extremes)
    const bienestarImpact = hasActiveInsurance ? 10 : 20;
    const financialCost = hasActiveInsurance ? 0 : Math.round(20000 + rng() * rng() * 180000);
    state.wealthLevels.bienestar = Math.max(0, state.wealthLevels.bienestar - bienestarImpact);
    if (financialCost > 0) state.portfolio -= Math.min(financialCost, state.portfolio);
    state.illnessCooldown = 12;
    const costText = hasActiveInsurance ? 'cubierto por seguro' : `-$${(financialCost / 1e3).toFixed(0)}K`;
    events.push({ age: ctx.age, icon: '🏥', text: `Enfermedad grave (${costText})` });
  } else {
    // Minor illness: flu, infection, minor injury
    // Cost: $500–$5,000 (uniform random)
    const bienestarImpact = hasActiveInsurance ? 4 : 8;
    const financialCost = hasActiveInsurance ? 0 : Math.round(500 + rng() * 4500);
    state.wealthLevels.bienestar = Math.max(0, state.wealthLevels.bienestar - bienestarImpact);
    if (financialCost > 0) state.portfolio -= Math.min(financialCost, state.portfolio);
    state.illnessCooldown = 4;
    const costText = hasActiveInsurance ? 'cubierto por seguro' : `-$${(financialCost / 1e3).toFixed(1)}K`;
    events.push({ age: ctx.age, icon: '🤒', text: `Enfermedad menor (${costText})` });
  }
}

/** 💼 Job opportunity: probability rises with comunidad + education (supuestos.md #33) */
function processJobOpportunity(ctx: MonthContext, state: SimulationState, params: SimulationParams, events: SimulationEvent[], roll: number): void {
  const probability = 0.01 + state.wealthLevels.comunidad * 0.0006 + params.formalEducation * 0.0003;
  if (roll >= probability || ctx.age >= params.retirementAge) return;

  const raiseAmount = state.currentBaseIncome * 0.15;
  state.currentBaseIncome += raiseAmount;
  state.wealthLevels.trabajo = Math.min(100, state.wealthLevels.trabajo + 5);
  state.wealthLevels.comunidad = Math.min(100, state.wealthLevels.comunidad + 3);
  events.push({ age: ctx.age, icon: '💼', text: `Oportunidad laboral (+$${raiseAmount.toFixed(0)}/mes)` });
}

/** 📉 Market crisis: ~6%/year portfolio loss (supuestos.md #34) */
function processMarketCrisis(ctx: MonthContext, state: SimulationState, events: SimulationEvent[], roll: number): void {
  if (roll >= 0.015 || state.crisisCooldown > 0) return;

  const portfolioLoss = state.portfolio * 0.2;
  state.portfolio = Math.max(0, state.portfolio - portfolioLoss);
  state.crisisCooldown = 24;
  events.push({ age: ctx.age, icon: '📉', text: `Crisis mercado (-$${(portfolioLoss / 1e3).toFixed(0)}K)` });
}

/** 🎯 Lucky break: ~2%/year windfall (supuestos.md #35) */
function processLuckyBreak(ctx: MonthContext, state: SimulationState, events: SimulationEvent[], roll: number, rng: () => number): void {
  if (roll >= 0.005) return;

  const windfall = 2000 + rng() * 8000;
  state.portfolio += windfall;
  state.wealthLevels.aventura = Math.min(100, state.wealthLevels.aventura + 3);
  events.push({ age: ctx.age, icon: '🎯', text: `Golpe de suerte (+$${windfall.toFixed(0)})` });
}

/**
 * 💔 Breakup: probability inversely related to partner quality.
 * Low quality relationships are much more likely to end.
 * Probability/quarter: max(0.002, 0.04 × (1 - quality/100)²)
 */
function processBreakup(ctx: MonthContext, state: SimulationState, events: SimulationEvent[], roll: number): void {
  if (!state.hasPartnerActive || state.breakupCooldown > 0) return;

  const qualityFactor = 1 - state.currentPartnerQuality / 100;
  const probability = Math.max(0.002, 0.04 * qualityFactor * qualityFactor);
  if (roll >= probability) return;

  state.hasPartnerActive = false;
  state.breakupCooldown = 12; // 1 year before can find new partner
  state.wealthLevels.familia = Math.max(0, state.wealthLevels.familia - 15);
  state.wealthLevels.bienestar = Math.max(0, state.wealthLevels.bienestar - 10);
  state.wealthLevels.comunidad = Math.max(0, state.wealthLevels.comunidad - 5);
  events.push({ age: ctx.age, icon: '💔', text: `Rompimiento (calidad era ${state.currentPartnerQuality.toFixed(0)})` });
}

/**
 * 💕 New partner: can find a new partner after breakup cooldown.
 * Probability rises with comunidad. New partner quality is random (30-90).
 * Only possible if age < 60 and not currently in a relationship.
 */
function processNewPartner(ctx: MonthContext, state: SimulationState, events: SimulationEvent[], roll: number, rng: () => number): void {
  if (state.hasPartnerActive || state.breakupCooldown > 0 || ctx.age >= 60) return;

  const probability = 0.03 + state.wealthLevels.comunidad * 0.001;
  if (roll >= probability) return;

  const newQuality = Math.round(30 + rng() * 60);
  state.hasPartnerActive = true;
  state.currentPartnerQuality = newQuality;
  state.wealthLevels.familia = Math.min(100, state.wealthLevels.familia + 5);
  state.wealthLevels.bienestar = Math.min(100, state.wealthLevels.bienestar + 5);
  events.push({ age: ctx.age, icon: '💕', text: `Nueva pareja (calidad ${newQuality})` });
}
