/**
 * Wealth Growth Sub-model
 * Applies logarithmic growth from dedicated hours, transfer matrix effects, and decay.
 * From modelo.md §2 "Actualizar cada riqueza" and §4 "Matriz de interdependencia".
 */

import type { SimulationState, WealthDimension } from '../../types/simulation';
import {
  WEALTH_DIMENSIONS, GROWTH_FACTORS, MIN_HOURS_THRESHOLD,
  DECAY_RATES, TRANSFER_MATRIX,
} from '../../constants/model';

/**
 * Update all wealth dimensions based on hours invested + energy multiplier + partner effect + transfers.
 *
 * Formula per dimension i (modelo.md §2):
 *   delta_i = k_i × ln(1 + hours_i) × energyMultiplier × partnerMultiplier × 0.08
 *   + Σ_j (wealthLevel_j × transferMatrix[j][i] × 0.0008)
 *   - decayRate_i × 0.25 (if hours < minThreshold)
 */
export function applyWealthGrowth(
  state: SimulationState,
  weeklyHours: Record<WealthDimension, number>,
  partnerMultiplier: number,
): void {
  // Energy multiplier from bienestar (modelo.md §5.1)
  const energyMultiplier = Math.max(0.3, state.wealthLevels.bienestar / 75);

  for (let i = 0; i < WEALTH_DIMENSIONS.length; i++) {
    const dimension = WEALTH_DIMENSIONS[i];
    if (dimension === 'dinero') continue; // Dinero is handled by finance submodel

    const hours = weeklyHours[dimension] || 0;

    // Logarithmic growth from dedicated hours
    let delta = GROWTH_FACTORS[dimension] * Math.log(1 + hours) * energyMultiplier * partnerMultiplier * 0.08;

    // Transfer effects from other dimensions
    for (let j = 0; j < WEALTH_DIMENSIONS.length; j++) {
      if (j !== i && TRANSFER_MATRIX[j][i] > 0) {
        delta += state.wealthLevels[WEALTH_DIMENSIONS[j]] * TRANSFER_MATRIX[j][i] * 0.0008;
      }
    }

    // Decay if below minimum hours threshold
    if (hours < MIN_HOURS_THRESHOLD[dimension]) {
      delta -= DECAY_RATES[dimension] * 0.25;
    }

    // Apply and clamp to [0, 100]
    state.wealthLevels[dimension] = Math.max(0, Math.min(100, state.wealthLevels[dimension] + delta));
  }
}
