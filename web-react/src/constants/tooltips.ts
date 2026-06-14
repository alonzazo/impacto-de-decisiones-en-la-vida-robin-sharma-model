/**
 * Tooltip texts for simulation parameters and UI fields.
 * PARAM_TOOLTIPS uses keyof SimulationParams for type safety.
 * UI_TOOLTIPS covers non-param fields (initial values, UI toggles, etc).
 */

import type { SimulationParams } from '../types/simulation';

/** Tooltips for SimulationParams fields — type-checked against the interface */
export const PARAM_TOOLTIPS: Partial<Record<keyof SimulationParams, string>> = {
  // ── Perfil Basico ──
  currentAge: 'Edad al inicio de la simulación. Define el punto de partida en el eje X del gráfico. A menor edad, más años de interés compuesto.',
  endAge: 'Edad final de la simulación. Define el punto final del eje X. Más años = más tiempo para que las decisiones se acumulen.',
  baseIncome: 'Ingreso neto mensual (después de impuestos). Se multiplica por energía (bienestar/75). Afecta directamente la línea de Patrimonio Neto (amarilla). Solo crece por eventos estocásticos de oportunidad laboral (+15%).',
  initialWealth: 'Dinero con el que empiezas. Se distribuye automáticamente: primero llena el fondo de emergencia, el resto va a cartera de inversión. Afecta el punto de partida de Patrimonio Neto.',
  rentAmount: 'Gasto mensual de vivienda incluido en gastos actuales. Al comprar casa, solo se cobra la diferencia (hipoteca - alquiler) como gasto adicional. Reducir alquiler mejora flujo de caja → más inversión → Patrimonio sube más rápido.',
  retirementAge: 'Edad a la que dejas de trabajar. Post-retiro: ingreso laboral = $0, se activan ingresos pasivos (retiro de cartera). En el gráfico: Trabajo decae post-retiro, Patrimonio puede empezar a bajar si la tasa de retiro > rendimientos.',

  // ── Gastos y Ahorro ──
  basicExpenses: 'Gastos mínimos para sobrevivir (comida, servicios, transporte). Define el umbral de Seguridad Financiera: cuando ingresos pasivos ≥ gastos básicos. Se marca con 🛡️ en el gráfico.',
  currentExpenses: 'Gastos de tu estilo de vida actual. Define el umbral de Independencia Financiera (⚖️ en el gráfico). También determina el fondo de emergencia (gastos × meses). Mayor gasto = necesitas más patrimonio para independencia.',
  idealExpenses: 'Gastos del estilo de vida que sueñas. Define el umbral de Libertad Financiera (🚀 en el gráfico) y normaliza Dinero a 0-100. Patrimonio necesario = gastos ideales × 12 / tasa retiro. Con $5K y 4%: necesitas $1.5M.',
  safeWithdrawalRate: '% anual que retiras de tu cartera en el retiro (regla del 4% de Trinity Study). Post-retiro, ingreso pasivo = cartera × tasa / 12. Una tasa mayor da más ingreso pero agota la cartera más rápido. También define cuánto patrimonio necesitas para cada umbral.',
  emergencyMonths: 'Meses de gastos actuales guardados como fondo de emergencia. Se llena primero con patrimonio inicial, luego con 30% del flujo positivo mensual. Protege ante déficits y enfermedades. No genera rendimientos de inversión.',
  inflationRate: 'Tasa a la que crecen tus gastos cada mes. Con 4%/año, gastos de $1800 a los 22 serán ~$6500 a los 55. Mayor inflación = necesitas más patrimonio para los umbrales. Afecta la pendiente de la línea de Patrimonio.',

  // ── Educación ──
  formalEducation: 'Nivel de educación formal. NO afecta el ingreso directamente, pero aumenta la probabilidad de eventos estocásticos de oportunidad laboral (+15% raise). Mayor educación = más oportunidades → ingreso crece más rápido → Patrimonio sube.',

  // ── Salud y Seguro ──
  hasInsurance: 'Si tienes seguro, pagas prima fija mensual en vez de gastos de salud variables. Además: enfermedades estocásticas cuestan $0 (en vez de $500-$200K) y el impacto en bienestar se reduce 50%. Protege Patrimonio y Bienestar ante enfermedades graves.',
  insurancePremium: 'Costo fijo mensual del seguro. Se paga desde la edad de inicio. Trade-off: $200/mes × 40 años = $96K pagados, pero una sola enfermedad grave sin seguro puede costar $20K-$200K. Afecta flujo de caja → velocidad de crecimiento de Patrimonio.',
  insuranceStartAge: 'Edad desde la que empiezas a pagar y estar cubierto. Antes de esta edad: pagas gastos de salud variables (crecen con la edad). Las enfermedades estocásticas antes de esta edad NO están cubiertas.',

  // ── Vivienda ──
  wantsHouse: 'Decidir si compras casa. Al comprar: se resta la prima del portafolio, se agrega hipoteca mensual, pero el inmueble aprecia 3%/año. En el gráfico: Patrimonio baja al comprar (prima) pero el inmueble compensa a largo plazo.',
  housePurchaseAge: 'Edad a la que compras la casa. Aparece como evento 🏠 en el gráfico. Comprar joven = más años de apreciación, pero menos portafolio invertido. Comprar tarde = más capital acumulado pero menos tiempo de apreciación.',
  housePrice: 'Precio total de la casa. La prima (%) se resta del portafolio, el resto es hipoteca. Mayor precio = mayor hipoteca mensual = menos flujo para invertir, pero mayor activo apreciando. Afecta la línea de Patrimonio significativamente.',
  downPaymentRatio: '% del precio que pagas de contado. Se resta del portafolio al comprar. Mayor prima = menor hipoteca mensual pero golpe fuerte al portafolio. Menor prima = más cuotas + más intereses pagados en total.',
  mortgageRate: 'Tasa de interés anual del préstamo hipotecario. Mayor tasa = cuota más alta = más intereses pagados. Con $200K al 7% a 30 años: cuota ~$1,330/mes, total pagado ~$479K (2.4× el préstamo).',
  mortgageTerm: 'Años para pagar la hipoteca. Mayor plazo = cuota menor pero más intereses totales. 15 años: cuota alta, menos intereses. 30 años: cuota baja, muchos más intereses. Afecta el flujo de caja mensual.',
  propertyAppreciation: 'Tasa anual de apreciación del valor de la propiedad. Con 3%, una casa de $200K vale $485K en 30 años. Contribuye al Patrimonio Neto incluso después de pagada la hipoteca. Visible en la curva de Patrimonio a largo plazo.',

  // ── Transporte ──
  wantsCar: 'Decidir si compras carro. A diferencia de la casa, el carro se DEPRECIA 15%/año. Es un pasivo disfrazado de activo. Afecta Patrimonio negativamente: cuota + mantenimiento + depreciación.',
  carPurchaseAge: 'Edad a la que compras el carro. Aparece como evento 🚗. Comprar joven = años de pagos que podrían ir a inversión. El costo de oportunidad de un carro de $25K en 40 años al 10% = ~$1.1M de patrimonio perdido.',
  carPrice: 'Precio total. Se financia al 100% a 5 años. El carro pierde 15%/año: a los 5 años vale ~40%, a los 10 ~15% del precio original. Mayor precio = mayor cuota + más depreciación. Impacto directo en Patrimonio.',
  carLoanRate: 'Tasa de interés anual del préstamo del carro a 5 años. Con $25K al 6%: cuota ~$483/mes. Total pagado: ~$29K (16% más que el precio).',
  carMaintenance: 'Gasto mensual fijo: seguro, combustible, mantenimiento. Se paga mientras tengas el carro (incluso después de pagar el préstamo). Reduce el flujo de caja permanentemente → menos inversión → Patrimonio crece más lento.',

  // ── Familia, Pareja e Hijos ──
  hasPartner: 'Si empiezas con pareja. La pareja aplica un multiplicador GLOBAL a todas las riquezas: 0.5× (tóxica) a 1.3× (excelente). Puede romperse y encontrar nueva pareja por eventos estocásticos. Afecta TODAS las líneas del gráfico.',
  partnerQuality: 'Calidad inicial de la relación. ≥90: mult 1.3× (todas las riquezas crecen 30% más rápido). 50: mult 1.0× (neutro). <30: mult 0.5× (todas las riquezas crecen la mitad). También afecta la probabilidad de rompimiento: calidad 30 = 16%/año de rompimiento.',
  partnerStartAge: 'Edad a la que inicia la relación de pareja. Aparece como evento 💑. Antes de esta edad, el multiplicador de pareja es 1.0× (neutro). Una pareja buena temprana potencia todo el crecimiento futuro.',
  childrenBirthAges: 'Tener hijos afecta: Familia (+15 al nacer), tiempo (más horas a familia, menos a aventura/crecimiento), costos ($500-$1250/mes por 22 años), y causa "nido vacío" cuando se van (~-6pts familia). Aparecen como 👶 en el gráfico.',
  childBaseCost: 'Costo mensual base por hijo de 0-5 años. Escala por edad: 6-12 años: ×1.3, 13-18: ×1.8, universidad: ×2.5. Con $500 base: un hijo cuesta ~$500→$650→$900→$1250/mes a lo largo de 22 años. Reduce flujo de caja → menor Patrimonio.',

  // ── Carrera ──
  careerType: 'Empleo: ingreso estable = base × energía. Emprendimiento: año 1 = $0, años 2-3 = 80%, después = base × 1.5 × energía (50% más). Mixto: empieza empleado, cambia a emprender. Afecta Patrimonio y Trabajo. Emprender requiere +10h/sem de Trabajo los primeros 5 años.',
  entrepreneurshipAge: 'Edad a la que emprendes (si carrera es mixto/emprendimiento). Aparece como 🚀. Se resta la inversión del portafolio. El primer año sin ingresos es visible como una meseta o bajón en Patrimonio.',
  entrepreneurshipInvestment: 'Capital invertido al emprender. Se resta del portafolio. Afecta inmediatamente el Patrimonio Neto. Si el emprendimiento sobrevive 3+ años, el ingreso sube 50% permanentemente (compensa la inversión).',

  // ── Estocástico ──
  stochasticEnabled: 'Activa 6 tipos de eventos aleatorios cada 3 meses: 🏥 Enfermedad, 💼 Oportunidad laboral, 📉 Crisis mercado, 🎯 Golpe suerte, 💔 Rompimiento, 💕 Nueva pareja. Desactivar produce resultados determinísticos (misma simulación siempre).',
  randomSeed: 'Semilla del generador de números aleatorios. Misma semilla = mismos eventos aleatorios. Cambiar la semilla produce una "vida diferente". Monte Carlo prueba 200 semillas distintas para ver el rango de posibilidades.',
};

/** Tooltips for non-SimulationParams UI fields */
export const UI_TOOLTIPS = {
  showExito: 'Muestra la línea blanca punteada EXITO en el gráfico: promedio ponderado de las 8 riquezas (0-100). Bienestar y Familia pesan más (18% c/u).',
  numChildren: 'Cada hijo adicional cuesta ~$70-90K en 22 años. Más hijos = más horas a Familia (menos a otras), más gasto mensual, pero más riqueza Familiar y Servicio. 2 hijos con 3 años de diferencia es lo más retador (pico de carga años 3-5).',
  firstChildAge: 'Hijo temprano (20s): más energía pero menos estabilidad financiera, mayor costo de oportunidad. Hijo tardío (40s): más dinero pero menos energía, hijo depende hasta los 62+. Aparece como 👶 en el gráfico.',
  childSpacing: 'Años entre cada hijo. Poco espacio (2 años): pico de carga muy intenso. Mucho espacio (5+): la carga se distribuye pero dura más tiempo. Afecta cuánto tiempo las horas de Familia dominan el presupuesto de tiempo.',

  // Initial values
  iniCrecimiento: 'Nivel inicial de conocimiento (0-100). Alto crecimiento transfiere valor a Trabajo, Familia, Comunidad y Servicio via la matriz de transferencia. Sufre obsolescencia: sin estudio baja ~3-5%/año.',
  iniBienestar: 'Nivel inicial de salud física y mental (0-100). Es el MULTIPLICADOR DE ENERGÍA (bienestar/75) que afecta productividad laboral, capacidad de aprender y todas las riquezas. Techo baja 1pt/año desde 25. La dimensión más impactante.',
  iniFamilia: 'Nivel inicial de relaciones familiares (0-100). Sube con hijos (+15) y tiempo dedicado. Baja con nido vacío cuando hijos se van. Pesa 18% en el índice EXITO — la más alta junto con Bienestar.',
  iniTrabajo: 'Nivel inicial de riqueza laboral (0-100). Crece con horas de trabajo y transferencias de Crecimiento/Comunidad. Decae post-retiro (-0.3/mes). Transfiere valor a Dinero (0.35) y Comunidad (0.08).',
  iniComunidad: 'Nivel inicial de red social (0-100). Aumenta probabilidad de oportunidades laborales (+15% raise) y de encontrar nueva pareja. Se erosiona después de 55 y cuando bienestar < 60. Amplificador silencioso de todo.',
  iniAventura: 'Nivel inicial de experiencias (0-100). ÚNICA dimensión que no decae: las experiencias son permanentes. Sube con viajes (✈️ en el gráfico). Limitada por bienestar bajo en edad avanzada.',
  iniServicio: 'Nivel inicial de contribución al mundo (0-100). Crece con horas dedicadas y transferencias de Crecimiento y Comunidad. Decae cuando bienestar < 60 (necesitas salud para servir). Robin Sharma: la riqueza que da sentido a todas las demás.',
} as const;
