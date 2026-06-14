# 📋 Supuestos del Modelo (Sincronizado con web/index.html)

---

## Supuestos financieros

| # | Supuesto | Valor | Configurable |
|---|----------|-------|-------------|
| 1 | 30% del flujo positivo va a fondo emergencia | 30% | No |
| 2 | Inflación anual aplicada a gastos | 4% default | ✅ Sí |
| 3 | Sin impuestos (ingresos netos) | 0% | No |
| 4 | Apreciación inmueble | 3% default | ✅ Sí |
| 5 | Depreciación vehículo | 15%/año | No |
| 6 | Rendimientos: acciones 10%, bonos 5%, BR 7%, efectivo 2% | Fijos | No |
| 7 | Tasa retiro segura (regla del 4%) | 4% default | ✅ Sí |
| 8 | gastos_actuales YA INCLUYE vivienda (alquiler) | — | — |
| 9 | Al comprar casa: se suma (hipoteca - alquiler) a gastos | Diferencial | No |
| 10 | Ingresos pasivos solo después del retiro | Post-retiro | No |
| 11 | Retiro de cartera reduce patrimonio activamente | Sí | No |

## Supuestos de ingresos

| # | Supuesto | Valor |
|---|----------|-------|
| 12 | Ingreso empleo = base × min(1, energía) | Sin multiplicadores |
| 13 | Educación NO afecta ingreso directo | Solo probabilidad de oportunidades |
| 14 | Sin crecimiento salarial automático | Solo estocástico |
| 15 | Emprendimiento año 1: $0 ingresos | Fase inversión |
| 16 | Emprendimiento años 2-3: 80% del base | Fase temprana |
| 17 | Emprendimiento maduro: base × min(1, energía) × 1.5 | Bonus fijo |
| 18 | Post-retiro: ingreso laboral = $0 | Solo ingresos pasivos |

## Supuestos del modelo de riquezas

| # | Supuesto | Valor |
|---|----------|-------|
| 19 | Bienestar: techo -1pt/año desde 25 (min 50, interpolación lineal) | Continuo |
| 20 | Bienestar: decay = 0.005 × (edad-30) por mes | Continuo |
| 21 | Crecimiento: obsolescencia base 0.15/mes (~1.8%/año) | Aumenta sin estudio |
| 22 | Crecimiento: techo baja 1.2pt/año después de 55 (min 70) | Neuroplasticidad |
| 23 | Trabajo: hrs=0 y decay -0.3/mes post-retiro | Pérdida propósito |
| 24 | Comunidad: erosión natural después de 55 | Edad |
| 25 | Comunidad: decay (60-bienestar)×0.005 si bienestar < 60 | Salud → social |
| 26 | Servicio: decay (60-bienestar)×0.004 si bienestar < 60 | Salud → servicio |
| 27 | Aventura: experiencias son permanentes (no decaen) | Acumulativo |
| 28 | Aventura: limitada si bienestar < 60 después de 60 años | Físico |
| 29 | Entropía global: riquezas > 85 sufren micro-decay 0.3% del exceso | Difícil mantener 100 |
| 30 | Hijo independiente a los 22 (costo $0 después) | Supuesto |
| 31 | Pareja: multiplicador global 0.5x (tóxica) a 1.3x (excelente) | En todas las riquezas |

## Componentes estocásticos

| # | Evento | Probabilidad | Efecto |
|---|--------|-------------|--------|
| 32 | 🏥 Enfermedad menor | ↑ con edad, ↓ con bienestar (70% de enfermedades) | **Sin seguro**: -$500–$5K (uniforme aleatoria), bienestar -8. **Con seguro**: $0, bienestar -4 |
| 32b | 🏥 Enfermedad grave | ↑ con edad, ↓ con bienestar (30% de enfermedades) | **Sin seguro**: -$20K–$200K (distribución sesgada rng()², media ~$65K), bienestar -20. **Con seguro**: $0, bienestar -10 |
| 33 | 💼 Oportunidad laboral | ↑ con comunidad + educación | +15% raise permanente |
| 34 | 📉 Crisis de mercado | ~6%/año | -20% cartera |
| 35 | 🎯 Golpe de suerte | ~2%/año | +$2K-$10K |
| 39 | 💔 Rompimiento de pareja | ↑ con baja calidad: max(0.2%, 4%×(1-calidad/100)²) /trimestre | familia -15, bienestar -10, comunidad -5, cooldown 12 meses |
| 40 | 💕 Nueva pareja | 3% + comunidad×0.1% /trimestre (solo si soltero, cooldown expirado, edad < 60) | calidad aleatoria 30-90, familia +5, bienestar +5 |

## Gastos de salud

| # | Supuesto | Valor |
|---|----------|-------|
| 36 | Gastos salud base: $50/mes a los 25 | Crece exponencialmente |
| 37 | Fórmula: 50 × (1+0.06×(edad-25))^1.5 × (1.5 - bienestar/100) | Continua |
| 38 | Con seguro: paga prima fija en vez de gastos variables | Configurable |

## Perfiles predefinidos

Los perfiles NO modifican datos personales (edad, ingreso, patrimonio, alquiler). Solo cambian decisiones de vida.

| Perfil | Foco | Casa | Hijos | Carrera | Pareja |
|--------|------|------|-------|---------|--------|
| Balance | Equilibrio | Sí 32 | 2 | Mixto | 75 |
| Financiero | Dinero | No | 0 | Empleo alto | 60 |
| Aventurero | Experiencias | No | 1 tarde | Empleo | 70 |
| Tradicional | Familia | Sí 28 | 3 | Empleo | 80 |
| Emprendedor | Negocio | No | 0 | Emprende 25 | 70 |
| Amoroso | Relaciones | Sí 27 | 3 | Empleo | 95 |
