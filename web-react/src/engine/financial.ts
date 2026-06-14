/**
 * Financial utility functions.
 * Pure helpers for loan calculations, child costs, portfolio returns, and health expenses.
 */

import type { AssetClass, LifeStage } from '../types/simulation';
import { ASSET_RETURNS } from '../constants/model';

/** Calculate monthly loan payment using standard amortization formula */
export function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 12;
  const totalPayments = termYears * 12;
  if (monthlyRate === 0) return principal / totalPayments;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
}

/**
 * Monthly cost of a child based on their age.
 * From 3-familia.md §3.2 "Evolución del tiempo por edad del hijo"
 */
export function calculateChildMonthlyCost(childAge: number, baseCost: number): number {
  if (childAge < 0) return 0;
  if (childAge <= 5) return baseCost;
  if (childAge <= 12) return baseCost * 1.3;
  if (childAge <= 18) return baseCost * 1.8;
  if (childAge <= 22) return baseCost * 2.5;
  return 0; // Independent after 22
}

/** Weighted monthly portfolio return based on asset allocation */
export function calculatePortfolioMonthlyReturn(allocation: Record<AssetClass, number>): number {
  let annualReturn = 0;
  for (const asset in allocation) {
    annualReturn += allocation[asset as AssetClass] * (ASSET_RETURNS[asset as AssetClass] || 0);
  }
  return annualReturn / 12;
}

/**
 * Health expenses based on age and bienestar level.
 * From 2-bienestar.md §2.3 "Gastos de salud crecientes por edad"
 * Formula: base × (1.5 - bienestar/100) where base grows exponentially with age
 */
export function calculateHealthExpenses(age: number, bienestarLevel: number): number {
  const base = age <= 25 ? 50 : 50 * Math.pow(1 + 0.06 * (age - 25), 1.5);
  return base * (1.5 - bienestarLevel / 100);
}

/** Determine life stage from age */
export function getLifeStage(age: number): LifeStage {
  if (age < 30) return '20s';
  if (age < 40) return '30s';
  if (age < 50) return '40s';
  if (age < 60) return '50s';
  return '60s';
}
