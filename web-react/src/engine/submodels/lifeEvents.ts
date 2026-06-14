/**
 * Life Events Sub-model
 * Handles deterministic scheduled decisions: house, car, children, travel, career, retirement.
 * From modelo.md Steps 3-4.
 */

import type { MonthContext, SimulationState, SimulationParams, SimulationEvent } from '../../types/simulation';
import { calculateMonthlyPayment } from '../financial';

/** Process all deterministic life events for the current month */
export function processLifeEvents(
  ctx: MonthContext,
  state: SimulationState,
  params: SimulationParams,
  events: SimulationEvent[],
): void {
  processHousePurchase(ctx, state, params, events);
  processCarPurchase(ctx, state, params, events);
  processChildBirths(ctx, state, params, events);
  processTrips(ctx, state, params, events);
  processEntrepreneurship(ctx, state, params, events);
  processRetirement(ctx, params, events);
}

function processHousePurchase(ctx: MonthContext, state: SimulationState, params: SimulationParams, events: SimulationEvent[]): void {
  if (!params.wantsHouse || state.ownsHouse || ctx.ageFloor !== params.housePurchaseAge || ctx.monthOfYear !== 0) return;

  state.ownsHouse = true;
  const downPayment = params.housePrice * params.downPaymentRatio;
  state.mortgageBalance = params.housePrice - downPayment;
  state.mortgagePayment = calculateMonthlyPayment(state.mortgageBalance, params.mortgageRate, params.mortgageTerm);
  state.propertyValue = params.housePrice;
  state.portfolio -= Math.min(downPayment, state.portfolio);
  events.push({ age: ctx.age, icon: '🏠', text: `Casa $${(params.housePrice / 1e3).toFixed(0)}K` });
}

function processCarPurchase(ctx: MonthContext, state: SimulationState, params: SimulationParams, events: SimulationEvent[]): void {
  if (!params.wantsCar || state.ownsCar || ctx.ageFloor !== params.carPurchaseAge || ctx.monthOfYear !== 0) return;

  state.ownsCar = true;
  state.carValue = params.carPrice;
  state.carLoanBalance = params.carPrice;
  state.carPayment = calculateMonthlyPayment(params.carPrice, params.carLoanRate, 5);
  events.push({ age: ctx.age, icon: '🚗', text: `Carro $${(params.carPrice / 1e3).toFixed(0)}K` });
}

function processChildBirths(ctx: MonthContext, state: SimulationState, params: SimulationParams, events: SimulationEvent[]): void {
  for (const birthAge of params.childrenBirthAges) {
    if (ctx.ageFloor === birthAge && ctx.monthOfYear === 0 && !state.childrenAges.includes(birthAge)) {
      state.childrenAges.push(ctx.age);
      state.wealthLevels.familia = Math.min(100, state.wealthLevels.familia + 15);
      events.push({ age: ctx.age, icon: '👶', text: `Hijo #${state.childrenAges.length}` });
    }
  }
}

function processTrips(ctx: MonthContext, state: SimulationState, params: SimulationParams, events: SimulationEvent[]): void {
  for (const trip of params.trips) {
    if (ctx.ageFloor === trip.age && ctx.monthOfYear === 6) {
      state.portfolio -= Math.min(trip.cost, state.portfolio);
      state.wealthLevels.aventura = Math.min(100, state.wealthLevels.aventura + trip.adventureImpact);
      state.wealthLevels.crecimiento = Math.min(100, state.wealthLevels.crecimiento + trip.adventureImpact * 0.3);
      events.push({ age: ctx.age, icon: '✈️', text: trip.destination });
    }
  }
}

function processEntrepreneurship(ctx: MonthContext, state: SimulationState, params: SimulationParams, events: SimulationEvent[]): void {
  if ((params.careerType === 'mixto' || params.careerType === 'emprendimiento') &&
      ctx.ageFloor === params.entrepreneurshipAge && ctx.monthOfYear === 0 && !state.isEntrepreneur) {
    state.isEntrepreneur = true;
    state.entrepreneurYears = 0;
    state.portfolio -= Math.min(params.entrepreneurshipInvestment, state.portfolio);
    events.push({ age: ctx.age, icon: '🚀', text: 'Emprende' });
  }
  if (state.isEntrepreneur) {
    state.entrepreneurYears = ctx.age - params.entrepreneurshipAge;
  }
}

function processRetirement(ctx: MonthContext, params: SimulationParams, events: SimulationEvent[]): void {
  if (ctx.ageFloor === params.retirementAge && ctx.monthOfYear === 0) {
    events.push({ age: ctx.age, icon: '🏖️', text: 'Retiro laboral' });
  }
}
