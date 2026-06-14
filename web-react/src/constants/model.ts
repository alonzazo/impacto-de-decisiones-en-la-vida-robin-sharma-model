import type { WealthDimension, AssetClass, LifeStage } from '../types/simulation';

/** The 8 wealth dimensions */
export const WEALTH_DIMENSIONS: WealthDimension[] = [
  'crecimiento', 'bienestar', 'familia', 'trabajo',
  'dinero', 'comunidad', 'aventura', 'servicio',
];

/** Colors per dimension (for charts/UI) */
export const DIMENSION_COLORS: Record<WealthDimension, string> = {
  crecimiento: '#00d2ff',
  bienestar: '#00ff88',
  familia: '#ff6b9d',
  trabajo: '#ffa500',
  dinero: '#ffd700',
  comunidad: '#9b59b6',
  aventura: '#e74c3c',
  servicio: '#1abc9c',
};

/** Display names per dimension */
export const DIMENSION_NAMES: Record<WealthDimension, string> = {
  crecimiento: 'Crecimiento',
  bienestar: 'Bienestar',
  familia: 'Familia',
  trabajo: 'Trabajo',
  dinero: 'Dinero',
  comunidad: 'Comunidad',
  aventura: 'Aventura',
  servicio: 'Servicio',
};

/**
 * Growth factors per dimension: k in k × ln(1 + hours)
 * From modelo.md §2 / inventario-del-tiempo.md §5
 */
export const GROWTH_FACTORS: Record<WealthDimension, number> = {
  crecimiento: 0.6, bienestar: 0.7, familia: 0.6, trabajo: 0.5,
  dinero: 0.3, comunidad: 0.5, aventura: 0.8, servicio: 0.6,
};

/**
 * Minimum weekly hours before decay kicks in
 * From inventario-del-tiempo.md §5
 */
export const MIN_HOURS_THRESHOLD: Record<WealthDimension, number> = {
  crecimiento: 3, bienestar: 5, familia: 5, trabajo: 15,
  dinero: 1, comunidad: 2, aventura: 0, servicio: 0,
};

/**
 * Monthly decay rate when hours fall below threshold
 * From inventario-del-tiempo.md §6
 */
export const DECAY_RATES: Record<WealthDimension, number> = {
  crecimiento: 0.4, bienestar: 1.5, familia: 0.8, trabajo: 0.3,
  dinero: 0.0, comunidad: 1.0, aventura: 0.0, servicio: 0.0,
};

/**
 * Transfer matrix: row dimension transfers value to column dimension
 * From modelo.md §4: "Matriz de interdependencia"
 *
 * Reading: TRANSFER_MATRIX[sourceIdx][targetIdx]
 * Example: Crecimiento(70) → Trabajo: 70 × 0.25 × 0.0008 per month
 */
export const TRANSFER_MATRIX: number[][] = [
  // Crec  Bien  Fam   Trab  Din   Com   Aven  Serv
  [0,    0.08, 0.12, 0.25, 0.15, 0.10, 0,    0.08],  // Crecimiento → (psicología/liderazgo mejora familia, comunidad, bienestar, servicio)
  [0,    0,    0,    0.25, 0.15, 0,    0,    0   ],  // Bienestar →
  [0,    0.15, 0,    0,    0,    0,    0,    0   ],  // Familia →
  [0.15, 0,    0,    0,    0.35, 0.08, 0,    0   ],  // Trabajo →
  [0.08, 0,    0,    0,    0,    0,    0,    0   ],  // Dinero →
  [0.15, 0.08, 0,    0.15, 0,    0,    0.08, 0.08],  // Comunidad →
  [0.15, 0,    0,    0,    0,    0.08, 0,    0   ],  // Aventura →
  [0,    0.15, 0,    0,    0,    0.08, 0,    0   ],  // Servicio →
];

/**
 * Weights for the composite Wealth Index (0-100)
 * From modelo.md §6: "Índice de Riqueza Total"
 */
export const WEALTH_INDEX_WEIGHTS: Record<WealthDimension, number> = {
  crecimiento: 0.12, bienestar: 0.18, familia: 0.18, trabajo: 0.12,
  dinero: 0.12, comunidad: 0.10, aventura: 0.08, servicio: 0.10,
};

/**
 * Expected annual returns per asset class (nominal)
 * From 5-dinero.md §2.1
 */
export const ASSET_RETURNS: Record<AssetClass, number> = {
  acciones: 0.10,
  bonos: 0.05,
  bienes_raices: 0.07,
  efectivo: 0.02,
};

/**
 * Portfolio allocation per life stage
 * From 5-dinero.md §2.1 "Distribución de cartera por etapa de vida"
 */
export const PORTFOLIO_BY_STAGE: Record<LifeStage, Record<AssetClass, number>> = {
  '20s': { acciones: 0.80, bonos: 0.10, bienes_raices: 0.05, efectivo: 0.05 },
  '30s': { acciones: 0.60, bonos: 0.20, bienes_raices: 0.15, efectivo: 0.05 },
  '40s': { acciones: 0.50, bonos: 0.25, bienes_raices: 0.20, efectivo: 0.05 },
  '50s': { acciones: 0.35, bonos: 0.35, bienes_raices: 0.20, efectivo: 0.10 },
  '60s': { acciones: 0.25, bonos: 0.40, bienes_raices: 0.20, efectivo: 0.15 },
};

/** Car depreciation rate per year (supuestos.md #5) */
export const CAR_DEPRECIATION_RATE = 0.15;

/** Fraction of positive cash flow allocated to emergency fund (supuestos.md #1) */
export const EMERGENCY_FUND_ALLOCATION = 0.30;

/** Total available weekly hours (16h/day × 7 days) from inventario-del-tiempo.md §1 */
export const WEEKLY_AVAILABLE_HOURS = 112;
