/**
 * Core types for the Robin Sharma 8-Wealth Life Simulator.
 * All names use camelCase with descriptive English identifiers.
 */

// ─── Enums & Unions ───────────────────────────────────────────

/** The 8 wealth dimensions from Robin Sharma's model */
export type WealthDimension =
  | 'crecimiento'
  | 'bienestar'
  | 'familia'
  | 'trabajo'
  | 'dinero'
  | 'comunidad'
  | 'aventura'
  | 'servicio';

/** Life stage (decade) used for priority/portfolio allocation */
export type LifeStage = '20s' | '30s' | '40s' | '50s' | '60s';

/** Career path type */
export type CareerType = 'empleo' | 'mixto' | 'emprendimiento';

/** Investment asset class */
export type AssetClass = 'acciones' | 'bonos' | 'bienes_raices' | 'efectivo';

/** Career progression stage for employment path */
export type CareerStage = 'junior' | 'mid' | 'senior' | 'director' | 'executive';

// ─── Sub-structures ───────────────────────────────────────────

/** A planned trip with financial and wealth impact */
export interface Trip {
  destination: string;
  cost: number;
  age: number;
  adventureImpact: number;
}

/** Weekly hour priorities per wealth dimension */
export interface Priorities {
  crecimiento: number;
  bienestar: number;
  familia: number;
  trabajo: number;
  dinero: number;
  comunidad: number;
  aventura: number;
  servicio: number;
}

/** Priority allocation by life stage */
export type PrioritiesByStage = Record<LifeStage, Priorities>;

/** Initial wealth dimension values (0-100) at simulation start */
export interface InitialWealthValues {
  crecimiento: number;
  bienestar: number;
  familia: number;
  trabajo: number;
  comunidad: number;
  aventura: number;
  servicio: number;
}

// ─── Simulation Parameters (user input) ──────────────────────

export interface SimulationParams {
  // Basic profile
  currentAge: number;
  endAge: number;
  baseIncome: number;
  initialWealth: number;
  rentAmount: number;
  retirementAge: number;

  // Expenses & savings
  basicExpenses: number;
  currentExpenses: number;
  idealExpenses: number;
  safeWithdrawalRate: number;      // 0-1
  emergencyMonths: number;
  inflationRate: number;           // 0-1

  // Education
  formalEducation: number;         // 20/40/60/85

  // Health & insurance
  hasInsurance: boolean;
  insurancePremium: number;
  insuranceStartAge: number;

  // Housing
  wantsHouse: boolean;
  housePurchaseAge: number;
  housePrice: number;
  downPaymentRatio: number;        // 0-1
  mortgageRate: number;            // 0-1
  mortgageTerm: number;            // years
  propertyAppreciation: number;    // 0-1

  // Transport
  wantsCar: boolean;
  carPurchaseAge: number;
  carPrice: number;
  carLoanRate: number;             // 0-1
  carMaintenance: number;

  // Family & partner
  hasPartner: boolean;
  partnerQuality: number;          // 0-100
  partnerStartAge: number;
  childrenBirthAges: number[];
  childBaseCost: number;

  // Career
  careerType: CareerType;
  entrepreneurshipAge: number;
  entrepreneurshipInvestment: number;

  // Travel
  trips: Trip[];

  // Time priorities per life stage
  priorities: PrioritiesByStage;

  // Initial wealth dimension values
  initialValues: InitialWealthValues;

  // Investment
  investSavings: boolean;           // true = portfolio (grows), false = cash (no growth)

  // Stochastic / randomness
  stochasticEnabled: boolean;
  randomSeed: number;
}

// ─── Simulation Events ───────────────────────────────────────

/** A notable event that occurs during the simulation */
export interface SimulationEvent {
  age: number;
  icon: string;
  text: string;
}

// ─── Simulation History (output) ─────────────────────────────

/** Full time-series output of a simulation run */
export interface SimulationHistory {
  ages: number[];
  wealth: Record<WealthDimension, number[]>;
  netWorth: number[];
  passiveIncome: number[];
  wealthIndex: number[];
  securityAge: number | null;
  independenceAge: number | null;
  freedomAge: number | null;
  events: SimulationEvent[];
}

// ─── Simulation State (mutable per-month) ────────────────────

/** Internal mutable state tracked month-to-month during simulation */
export interface SimulationState {
  wealthLevels: Record<WealthDimension, number>;

  // Financial state
  portfolio: number;
  emergencyFund: number;
  propertyValue: number;
  mortgageBalance: number;
  mortgagePayment: number;
  carValue: number;
  carLoanBalance: number;
  carPayment: number;

  // Life decisions state
  ownsHouse: boolean;
  ownsCar: boolean;
  isEntrepreneur: boolean;
  entrepreneurYears: number;
  childrenAges: number[];       // ages at which each child was born (as parent's age)
  yearsExperience: number;

  // Career progression
  careerStage: CareerStage;
  jobSatisfaction: number;        // 0-100
  entrepreneurFailed: boolean;

  // Mutable income (can change via stochastic events)
  currentBaseIncome: number;

  // Partner state (mutable — can change via stochastic breakup/re-partnering)
  hasPartnerActive: boolean;
  currentPartnerQuality: number;
  breakupCooldown: number;

  // Stochastic cooldowns
  illnessCooldown: number;
  crisisCooldown: number;
}

// ─── Month Context (derived per-iteration) ───────────────────

/** Derived values computed once per month iteration */
export interface MonthContext {
  month: number;
  age: number;
  ageFloor: number;
  stage: LifeStage;
  monthOfYear: number;          // 0-11
}

// ─── Monte Carlo ─────────────────────────────────────────────

export interface MonteCarloResult {
  seed: number;
  wealthIndex: number;
  netWorth: number;
}
