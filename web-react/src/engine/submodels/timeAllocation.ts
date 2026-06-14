/**
 * Time Allocation Sub-model
 * Distributes 112 weekly hours across 8 wealth dimensions.
 *
 * KEY DESIGN: Work is a FIXED BLOCK (not proportional).
 * - Employment: 48h/week fixed (realistic work week)
 * - Entrepreneurship (<5 years): 60h/week (intense phase)
 * - Retired: 0h/week (total freedom)
 * - The remaining flexible hours are distributed among the other 7 dimensions
 *   based on the user's priority settings.
 *
 * From inventario-del-tiempo.md §§1-4.
 */

import type { MonthContext, SimulationState, SimulationParams, Priorities, WealthDimension } from '../../types/simulation';
import { WEEKLY_AVAILABLE_HOURS } from '../../constants/model';

const WORK_HOURS_EMPLOYED = 48;      // Standard work week
const WORK_HOURS_ENTREPRENEUR = 60;  // Early entrepreneurship is intense
const WORK_HOURS_RETIRED = 0;        // Freedom!

/** Allocate weekly hours: work as fixed block, rest distributed by priorities */
export function allocateTime(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
): Record<WealthDimension, number> {
  const priorities: Priorities = { ...(params.priorities[ctx.stage] || params.priorities['20s']) };

  // ── Determine fixed work hours ──
  let workHours: number;
  if (ctx.age >= params.retirementAge) {
    workHours = WORK_HOURS_RETIRED;
  } else if (state.isEntrepreneur && state.entrepreneurYears < 5) {
    workHours = WORK_HOURS_ENTREPRENEUR;
  } else {
    workHours = WORK_HOURS_EMPLOYED;
  }

  // ── Flexible hours = total - work ──
  const flexibleHours = WEEKLY_AVAILABLE_HOURS - workHours;

  // ── Adjust priorities for life situations (affects flexible hours only) ──
  adjustForYoungChildren(ctx, state, priorities);

  // ── Distribute flexible hours among non-work dimensions ──
  const nonWorkDimensions: (keyof Priorities)[] = [
    'crecimiento', 'bienestar', 'familia', 'dinero', 'comunidad', 'aventura', 'servicio',
  ];

  const totalNonWorkPriority = nonWorkDimensions.reduce((sum, dim) => sum + (priorities[dim] || 0), 0) || 1;

  const weeklyHours: Record<string, number> = {};
  weeklyHours.trabajo = workHours;

  for (const dim of nonWorkDimensions) {
    weeklyHours[dim] = (priorities[dim] || 0) / totalNonWorkPriority * flexibleHours;
  }

  return weeklyHours as Record<WealthDimension, number>;
}

/**
 * Young children (<6 years old) demand extra family time from the flexible pool.
 * From inventario-del-tiempo.md §4 "Tener un hijo"
 */
function adjustForYoungChildren(ctx: MonthContext, state: SimulationState, priorities: Priorities): void {
  const youngChildrenCount = state.childrenAges.filter(birthAge => (ctx.age - birthAge) < 6).length;
  if (youngChildrenCount === 0) return;

  const extraFamilyPriority = 12 * youngChildrenCount;
  priorities.familia = (priorities.familia || 10) + extraFamilyPriority;
  // Reduce discretionary dimensions (not bienestar — health is non-negotiable)
  for (const dimension of ['aventura', 'crecimiento', 'comunidad', 'servicio'] as const) {
    priorities[dimension] = Math.max(1, (priorities[dimension] || 5) - extraFamilyPriority / 4);
  }
}
