/**
 * Partner Effect Sub-model
 * Computes the global partner multiplier (0.5x toxic → 1.3x excellent).
 * Now uses mutable state (hasPartnerActive, currentPartnerQuality) to support
 * stochastic breakup and re-partnering events.
 * From 3-familia.md §2: "La elección de pareja: La decisión más importante"
 */

import type { MonthContext, SimulationState, SimulationParams, SimulationEvent } from '../../types/simulation';

/** Compute partner quality multiplier and emit partner event if applicable */
export function computePartnerMultiplier(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
  events: SimulationEvent[],
): number {
  // Emit initial partner event at relationship start age
  if (params.hasPartner && ctx.ageFloor === params.partnerStartAge && ctx.monthOfYear === 0) {
    events.push({ age: ctx.age, icon: '💑', text: `Pareja (calidad ${state.currentPartnerQuality})` });
  }

  // Use mutable state: partner may have broken up or found a new one
  if (!state.hasPartnerActive || ctx.age < params.partnerStartAge) return 1.0;

  const quality = state.currentPartnerQuality;

  // Quality-to-multiplier mapping (3-familia.md §2)
  if (quality >= 90) return 1.3;        // Excellent
  if (quality >= 70) return 1.0 + quality * 0.003;  // Good: 1.21-1.27
  if (quality >= 50) return 1.0;        // Neutral
  if (quality >= 30) return 0.7 + quality * 0.01;   // Bad: 0.7-1.0
  return 0.5 + quality * 0.007;          // Toxic: 0.5-0.7
}
