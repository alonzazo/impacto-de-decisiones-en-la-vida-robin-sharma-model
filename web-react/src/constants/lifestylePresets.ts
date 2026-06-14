/**
 * Lifestyle presets for priority allocation by life stage.
 * Each preset defines a narrative "style of life" with predefined
 * hour distributions across the 8 wealth dimensions.
 */

import type { Priorities } from '../types/simulation';

export interface LifestylePreset {
  name: string;
  emoji: string;
  description: string;
  priorities: Priorities;
}

export const LIFESTYLE_PRESETS: Record<string, LifestylePreset> = {
  ambicioso: {
    name: 'Ambicioso',
    emoji: '🚀',
    description: 'Enfocado en carrera y crecimiento profesional',
    priorities: { crecimiento: 25, bienestar: 10, familia: 5, trabajo: 30, dinero: 10, comunidad: 8, aventura: 7, servicio: 5 },
  },
  equilibrado: {
    name: 'Equilibrado',
    emoji: '⚖️',
    description: 'Balance entre todas las dimensiones',
    priorities: { crecimiento: 14, bienestar: 14, familia: 14, trabajo: 14, dinero: 10, comunidad: 12, aventura: 12, servicio: 10 },
  },
  familia: {
    name: 'Familia primero',
    emoji: '👨‍👩‍👧‍👦',
    description: 'La familia es la prioridad central',
    priorities: { crecimiento: 8, bienestar: 18, familia: 30, trabajo: 18, dinero: 6, comunidad: 8, aventura: 5, servicio: 7 },
  },
  aventurero: {
    name: 'Aventurero',
    emoji: '🌍',
    description: 'Explorar el mundo y vivir experiencias',
    priorities: { crecimiento: 18, bienestar: 12, familia: 8, trabajo: 12, dinero: 5, comunidad: 12, aventura: 25, servicio: 8 },
  },
  servicial: {
    name: 'Servicial',
    emoji: '🙏',
    description: 'Servir a otros y construir comunidad',
    priorities: { crecimiento: 12, bienestar: 12, familia: 10, trabajo: 10, dinero: 5, comunidad: 20, aventura: 6, servicio: 25 },
  },
  financiero: {
    name: 'Financiero',
    emoji: '💰',
    description: 'Maximizar riqueza y patrimonio',
    priorities: { crecimiento: 15, bienestar: 8, familia: 5, trabajo: 30, dinero: 25, comunidad: 7, aventura: 5, servicio: 5 },
  },
};

export const PRESET_KEYS = Object.keys(LIFESTYLE_PRESETS);
