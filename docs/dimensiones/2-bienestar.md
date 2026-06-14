# 💚 Dimensión 2: Bienestar — Salud Física y Mental

> *"A menudo no valoramos la salud hasta que la perdemos."* — Robin Sharma

---

## 1. Variable principal: Índice de Bienestar

El bienestar es la dimensión más volátil y con mayor efecto cascada sobre todas las demás. Se mide como un índice compuesto de salud física y mental.

```
bienestar(t) = salud_fisica(t) × 0.5 + salud_mental(t) × 0.3 + energia(t) × 0.2
```

Escala: 0-100, donde:
- 90-100: Óptimo — energía máxima, claridad mental, vitalidad
- 70-89: Bueno — funcional, energía suficiente
- 50-69: Regular — fatiga frecuente, empiezan problemas
- 30-49: Pobre — enfermedades, baja energía, afecta todo
- 0-29: Crítico — incapacidad, costos médicos altos

---

## 2. Salud Física

### 2.1 Factores que la incrementan

| Hábito | Impacto semanal | Horas requeridas | Según Robin Sharma |
|--------|----------------|-----------------|-------------------|
| Ejercicio regular | +2 puntos/sem | 3-5h | ✅ Fundamental |
| Alimentación saludable | +1 punto/sem | 5-7h (cocinar) | ✅ Clave |
| Sueño de calidad (7-8h) | +1.5 puntos/sem | 49-56h | Implícito |
| Conexión con naturaleza | +0.5 puntos/sem | 2-3h | ✅ Mencionado |
| Duchas frías | +0.3 puntos/sem | 0.5h | ✅ Mencionado |
| Ayuno intermitente | +0.5 puntos/sem | 0h (es dejar de comer) | ✅ Mencionado |

### 2.2 Factores que la decrementan

| Factor | Impacto | Causa |
|--------|---------|-------|
| Sedentarismo | -2 puntos/sem | No dedicar tiempo a Bienestar |
| Mala alimentación | -1 punto/sem | Priorizar conveniencia sobre salud |
| Estrés crónico | -1.5 puntos/sem | Sobrecargar Trabajo sin Recovery |
| Alcohol | -1 punto/sem | Robin Sharma recomienda evitarlo |
| Falta de sueño | -2 puntos/sem | Sacrificar sueño por productividad |
| Envejecimiento natural | -0.3 puntos/año después de los 30 | Inevitable, pero mitigable |

### 2.3 Modelo de envejecimiento

El bienestar tiene un **techo máximo por edad** que disminuye progresivamente, representando el declive biológico inevitable. Incluso con los mejores hábitos, hay un límite natural que baja con los años.

**Techo de bienestar por edad (interpolación lineal continua):**

En vez de escalones discretos, el techo baja suavemente con la edad usando interpolación lineal:

```
techo_bienestar(edad):
  si edad <= 25: return 100      (pico biológico)
  si edad >= 75: return 50       (límite inferior en vejez avanzada)
  return 100 - (edad - 25)       (pierde 1 punto por año después de los 25)
```

| Edad | Techo | Decaimiento/mes | Descripción |
|------|-------|-----------------|-------------|
| 25 | 100 | 0.000 | Pico biológico |
| 30 | 95 | 0.025 | Declive apenas perceptible |
| 35 | 90 | 0.050 | Leve |
| 40 | 85 | 0.075 | Moderado |
| 45 | 80 | 0.100 | Se nota la edad |
| 50 | 75 | 0.125 | Significativo |
| 55 | 70 | 0.150 | Energía baja |
| 60 | 65 | 0.175 | Limitaciones físicas |
| 65 | 60 | 0.200 | Vejez |
| 70 | 55 | 0.225 | Declive acelerado |
| 75+ | 50 | 0.250 | Límite inferior |

**Decaimiento mensual (también continuo):**
```
decaimiento_por_edad(edad):
  si edad <= 30: return 0
  return 0.005 × (edad - 30)     (crece gradualmente)
```

**Actualización mensual:**
```
bienestar(t) -= decaimiento_por_edad(edad)
bienestar(t) = min(bienestar(t), techo_bienestar(edad))
```

La curva resultante es **suave y continua**, sin saltos bruscos entre décadas.

- El techo impide que una persona de 60 años tenga bienestar 100 aunque dedique todas sus horas a salud
- Los buenos hábitos permiten **acercarse al techo** de su edad (una persona activa de 60 puede tener 65, una sedentaria 40)
- El decaimiento mensual progresivo simula el deterioro acumulativo del envejecimiento
- Mitigable con hábitos: una persona de 60 con buenos hábitos puede tener mejor bienestar que una de 40 sedentaria, pero nunca superará el techo de 65

**Impacto cascada:** Al bajar el bienestar en la vejez, baja el multiplicador de energía (bienestar/75), lo que reduce la productividad y el crecimiento de TODAS las demás riquezas. Esto simula cómo la salud deteriorada limita todo en la vida.

### Gastos de salud crecientes por edad

Los gastos médicos crecen exponencialmente con la edad y son inversamente proporcionales al bienestar:

```
gastos_salud_brutos(edad, bienestar):
  si edad <= 25: base = 15,000/mes
  sino: base = 15,000 × (1 + 0.06 × (edad - 25))^1.5
  
  // Quien cuida su salud gasta menos en médicos
  mult_bienestar = 1.5 - (bienestar / 100)
  return base × mult_bienestar
```

| Edad | Base | Con bienestar 80 | Con bienestar 40 |
|------|------|-------------------|-------------------|
| 25 | ₡15K | ₡11K | ₡17K |
| 35 | ₡30K | ₡21K | ₡33K |
| 45 | ₡75K | ₡53K | ₡83K |
| 55 | ₡170K | ₡119K | ₡187K |
| 65 | ₡350K | ₡245K | ₡385K |
| 75 | ₡600K+ | ₡420K | ₡660K |

### Seguro médico (100%)

El usuario puede elegir tener seguro médico que cubre el 100% de los gastos:

```
Si tiene_seguro y edad >= edad_inicio_seguro:
  gastos_medicos = prima_seguro_mensual    // gasto fijo (ej: ₡80,000/mes)
Sino:
  gastos_medicos = gastos_salud_brutos     // paga todo de bolsillo
```

**Trade-off del seguro:**
- Con seguro (₡80K/mes desde los 25): ₡24M pagados en 25 años, pero protege de gastos de ₡300-600K/mes a los 60+
- Sin seguro: ahorra ₡80K/mes de joven para invertir, pero riesgo de drenaje masivo en la vejez

---

## 3. Salud Mental

### 3.1 Factores positivos

| Práctica | Impacto | Según Robin Sharma |
|----------|---------|-------------------|
| Meditación diaria | +1.5 puntos/sem | ✅ Fundamental |
| Escritura/journaling | +1 punto/sem | ✅ "Cuidar la salud mental" |
| Diálogo interior positivo | +0.5 puntos/sem | ✅ Mencionado |
| Relaciones de calidad | +1 punto/sem | Efecto de Familia y Comunidad |
| Propósito/sentido | +1 punto/sem | Efecto de Trabajo y Servicio |
| Gratitud deliberada | +0.5 puntos/sem | ✅ Clave |

### 3.2 Factores negativos

| Factor | Impacto | Causa |
|--------|---------|-------|
| Aislamiento social | -1.5 puntos/sem | Baja Comunidad y Familia |
| Trabajo sin propósito | -1 punto/sem | Baja en Trabajo |
| Estrés financiero | -1.5 puntos/sem | Baja en Dinero (deudas, inseguridad) |
| Comparación social | -0.5 puntos/sem | Redes sociales, envidia |
| Falta de control | -1 punto/sem | Sentir que la vida no va a donde quiere |

---

## 4. Energía: El multiplicador universal

La energía es función directa del bienestar y actúa como **multiplicador de productividad** en todas las demás riquezas:

```
energia(t) = salud_fisica(t) × 0.6 + salud_mental(t) × 0.4
```

```
multiplicador_energia = energia(t) / 75  (normalizado, 75 = "normal")
```

- Energía 90 → multiplicador 1.2x (20% más productivo en todo)
- Energía 75 → multiplicador 1.0x (base)
- Energía 50 → multiplicador 0.67x (33% menos productivo)
- Energía 30 → multiplicador 0.40x (60% menos productivo)

**Efecto cascada:**
```
productividad_real(t) = productividad_base × multiplicador_energia(t)
ingreso_real(t) = ingreso_potencial × multiplicador_energia(t)
aprendizaje_real(t) = aprendizaje_potencial × multiplicador_energia(t)
```

> **Invertir en bienestar ES invertir en todo lo demás.** Una hora de ejercicio no "cuesta" productividad — la genera.

---

## 5. El costo de no invertir en bienestar

### Escenario: Descuidar salud por 10 años (30-40)

```
Año 30: Bienestar = 85, Energía = 85, Multiplicador = 1.13x
Año 35: Bienestar = 65, Energía = 65, Multiplicador = 0.87x
Año 40: Bienestar = 50, Energía = 50, Multiplicador = 0.67x
```

**Impacto financiero acumulado:**
- Pérdida de productividad: ~20-30% de ingresos potenciales perdidos
- Costos médicos: ₡5-20M en tratamientos
- Días perdidos: ~30-60 días/año de baja productividad
- **Costo total estimado en 10 años: ₡30-50M** (entre ingresos perdidos y gastos médicos)

### Escenario: Invertir en bienestar consistentemente

```
Costo: ~5-7h/semana + ~₡100,000/mes (gym, comida sana)
Retorno: +20% productividad × 40 años = ROI incalculable
```

---

## 6. Eventos de salud

El modelo incluye eventos estocásticos (aleatorios) que pueden impactar el bienestar:

| Evento | Probabilidad | Impacto en bienestar | Costo financiero |
|--------|-------------|---------------------|------------------|
| Enfermedad menor | 20%/año | -10 puntos por 2 semanas | ₡50,000-200,000 |
| Lesión deportiva | 5%/año | -20 puntos por 2 meses | ₡500,000-2,000,000 |
| Enfermedad grave | 2%/año (↑ con edad y malos hábitos) | -40 puntos por 6+ meses | ₡5,000,000-20,000,000 |
| Burnout | 10%/año si Trabajo >50h/sem | -30 puntos por 3-6 meses | Ingresos perdidos |
| Depresión | 5%/año (↑ con aislamiento) | -30 mental por 6-12 meses | ₡1,000,000-5,000,000 |

> La probabilidad de eventos negativos disminuye con mayor inversión en bienestar.

---

## 7. Impacto de decisiones de vida en el bienestar

| Decisión | Efecto en Bienestar |
|----------|---------------------|
| Tener un hijo | -15 puntos temporales (falta de sueño, estrés), +10 a largo plazo (propósito) |
| Emprender | -10 puntos por estrés, variable según resultado |
| Comprar casa lejos | -5 puntos (commute = menos ejercicio, más estrés) |
| Viajar | +5 puntos temporales (descanso activo, nuevas experiencias) |
| Cambiar de trabajo | ±10 puntos según si mejora o no |

---

## 8. Conexión con otras riquezas

| Riqueza | Cómo alimenta al Bienestar | Cómo el Bienestar la alimenta |
|---------|----------------------------|-------------------------------|
| 📈 Crecimiento | Conocer sobre salud → mejores decisiones | Energía → más capacidad de aprender |
| 👨‍👩‍👧 Familia | Amor → bienestar emocional | Salud → presencia, longevidad con familia |
| 🔥 Trabajo | Propósito → salud mental | Energía → productividad, creatividad |
| 💰 Dinero | Dinero → acceso a mejor salud | Salud → más ingresos, menos gastos médicos |
| 🤝 Comunidad | Conexión → bienestar emocional | Energía → más social, mejor presencia |
| 🌍 Aventura | Aventuras → endorfinas, vitalidad | Salud → capacidad física para aventuras |
| 🙏 Servicio | Dar → satisfacción, propósito | Energía → más capacidad de servir |

**La retroalimentación más crítica:**
> Bienestar → Energía → Productividad en TODO → Más ingresos → Más tiempo libre (eventualmente) → Más bienestar
>
> Es un **ciclo virtuoso** o **vicioso** — no hay punto neutro. O se invierte en salud o se paga el precio.



### Interacción seguro médico ↔ enfermedades estocásticas (actualización v3)

El seguro médico tiene un doble efecto protector ante eventos de enfermedad:

1. **Elimina el costo financiero**: Con seguro activo, las enfermedades no cuestan nada del portafolio.
2. **Reduce el impacto en bienestar 50%**: Mejor atención médica disminuye el riesgo de consecuencias crónicas.

| Tipo | Sin seguro | Con seguro |
|------|-----------|-----------|
| 🤒 Enfermedad menor | Bienestar -8, Costo $500–$5K (aleatorio uniforme) | Bienestar -4, Costo $0 |
| 🏥 Enfermedad grave | Bienestar -20, Costo $20K–$200K (aleatorio sesgado) | Bienestar -10, Costo $0 |

La probabilidad de enfermarse:
```
prob = max(0.005, (0.02 + max(0, edad-40) × 0.002) × (1.3 - bienestar/100))
```

El costo de enfermedad grave usa distribución sesgada (`rng()²`): P25 ~$29K, P50 ~$65K, P75 ~$121K, P95 ~$191K.
