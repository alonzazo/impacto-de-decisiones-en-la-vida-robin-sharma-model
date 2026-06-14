# 💰 Dimensión 5: Dinero — Patrimonio Neto y Libertad Financiera

> *"El dinero es fundamental porque brinda libertad, opciones y tiempo. Sin embargo, la clave de la felicidad es sentir que se tiene suficiente."* — Robin Sharma / Naval Ravikant

---

## 1. Variable principal: Patrimonio Neto

El patrimonio neto es la medida central de la riqueza financiera. Es la diferencia entre todo lo que tienes y todo lo que debes.

```
patrimonio_neto(t) = activos_totales(t) - pasivos_totales(t)
```

El patrimonio neto determina si la persona alcanza cada uno de los 3 niveles de libertad financiera a lo largo de su vida.

---

## 2. Activos

### 2.1 Cartera de Inversión

La cartera es el motor principal de generación de riqueza a largo plazo. Crece mediante:
- **Aportes mensuales** (flujo de caja positivo que se invierte)
- **Rendimiento compuesto** (interés sobre interés)

```
cartera(t) = cartera(t-1) × (1 + rendimiento_ponderado_mensual) + aporte_mensual(t)
```

**Rendimiento ponderado mensual:**
```
rendimiento_ponderado = Σ (porcentaje_tipo_i × rendimiento_tipo_i) / 12
```

**Rendimientos esperados por tipo de activo (nominales anuales):**

| Tipo de activo | Rendimiento anual | Volatilidad | Descripción |
|---------------|-------------------|-------------|-------------|
| Acciones (ETFs globales) | 10% | Alta | S&P 500, mercados emergentes |
| Bonos (renta fija) | 5% | Baja | Bonos gobierno, corporativos |
| Bienes raíces (REITs) | 7% | Media | Fondos inmobiliarios |
| Efectivo (ahorro) | 2% | Nula | Cuentas de ahorro, CDs |
| Crypto | 15%* | Muy alta | *Altamente especulativo |

**Distribución de cartera por etapa de vida:**

| Etapa | Acciones | Bonos | Bienes raíces | Efectivo | Perfil |
|-------|----------|-------|---------------|----------|--------|
| 20s | 80% | 10% | 5% | 5% | Agresivo |
| 30s | 60% | 20% | 15% | 5% | Moderado-agresivo |
| 40s | 50% | 25% | 20% | 5% | Balanceado |
| 50s | 35% | 35% | 20% | 10% | Moderado-conservador |
| 60s+ | 25% | 40% | 20% | 15% | Conservador |

> El usuario puede personalizar esta distribución. La transición entre etapas es gradual (1 año para rebalancear).

### 2.2 Valor del Inmueble (si aplica)

Si la persona compra casa:

```
valor_inmueble(t) = precio_compra × (1 + tasa_apreciacion_anual/12)^meses_transcurridos
```

- `tasa_apreciacion_anual`: 3-5% (depende del mercado, default 3%)
- El inmueble cuenta como activo en el patrimonio neto
- Pero la hipoteca pendiente cuenta como pasivo

**Patrimonio en la casa (equity):**
```
equity_casa(t) = valor_inmueble(t) - saldo_hipoteca(t)
```

### 2.3 Valor del Vehículo (si aplica)

Los vehículos son **activos depreciables**:

```
valor_carro(t) = precio_compra × (1 - tasa_depreciacion)^años_uso
```

- `tasa_depreciacion`: 15-20% anual (default 15%)
- Año 1: pierde 20-30% del valor (depreciación acelerada al salir de la agencia)
- Después: ~15% anual
- A los 5 años: vale ~40% del precio original
- A los 10 años: vale ~15% del precio original

### 2.4 Fondo de Emergencia

Reserva líquida que no se invierte agresivamente:

```
fondo_emergencia_ideal = gastos_mensuales_totales × 6  (6 meses)
```

- Se prioriza antes de invertir en cartera
- Rinde como efectivo (~2% anual)
- Se usa en emergencias y se repone

### 2.5 Valor de Negocio (si emprendió)

Si la persona emprendió, el negocio tiene un valor:

```
valor_negocio(t) = ingresos_anuales_negocio(t) × multiplo_industria
```

- `multiplo_industria`: 2-10x según tipo de negocio
- El negocio es un activo ilíquido
- Alto riesgo: puede valer 0 si fracasa

---

## 3. Pasivos

### 3.1 Hipoteca

Si compra casa con préstamo:

```
cuota_mensual = monto_prestamo × [r(1+r)^n] / [(1+r)^n - 1]

donde:
  r = tasa_anual / 12  (tasa mensual)
  n = plazo_años × 12  (total de cuotas)
  monto_prestamo = precio_casa - prima
```

**Evolución del saldo:**
```
Para cada mes t:
  interes(t) = saldo(t-1) × tasa_mensual
  capital(t) = cuota_mensual - interes(t)
  saldo(t) = saldo(t-1) - capital(t)
```

**Ejemplo con valores típicos:**
- Precio casa: ₡55,000,000
- Prima (10%): ₡5,500,000
- Préstamo: ₡49,500,000
- Tasa: 9% anual
- Plazo: 30 años (360 meses)
- **Cuota mensual: ₡398,486**
- **Total pagado: ₡143,455,000** (2.9x el préstamo original)
- **Intereses totales: ₡93,955,000** (1.9x el capital)

### 3.2 Préstamo de Vehículo

```
cuota_carro = monto_financiado × [r(1+r)^n] / [(1+r)^n - 1]
```

Típicamente:
- Tasa: 8-12% anual
- Plazo: 5-7 años
- Costo adicional mensual: seguro + combustible + mantenimiento

**Costo total de propiedad del vehículo (mensual):**
```
costo_total_carro = cuota_prestamo + seguro + combustible + mantenimiento
```

### 3.3 Préstamo Estudiantil

Si eligió estudiar con financiamiento:
- Empieza a pagarse al terminar estudios (periodo de gracia)
- Tasa: 6-10% anual
- Plazo: 5-15 años

### 3.4 Deudas de Consumo

Tarjetas de crédito y similares:
- Tasa: 20-40% anual (la más cara)
- Si existe, se prioriza su pago antes de invertir

---

## 4. Flujo de Caja Mensual

El flujo de caja determina cuánto se puede ahorrar/invertir o cuánto se necesita cubrir con deuda:

```
flujo_caja(t) = ingresos_totales(t) - gastos_totales(t)
```

### 4.1 Ingresos

```
ingresos_totales(t) = ingreso_laboral(t) + ingresos_pasivos(t) + ingreso_negocio(t)
```

**Ingreso laboral** (depende de Crecimiento y Trabajo):
```
ingreso_laboral(t) = ingreso_base × (1 + crecimiento_salarial)^años_experiencia × multiplicador_conocimiento
```

Donde `multiplicador_conocimiento` depende del portafolio de conocimiento:
- Sin estudios: 1.0x
- Técnico: 1.3x
- Universidad: 1.7x
- Posgrado: 2.2x
- + Habilidades especializadas: +0.1-0.5x adicional

**Ingresos pasivos** (generados por la cartera):
```
ingresos_pasivos(t) = cartera_inversion(t) × tasa_retiro_segura / 12
```

Usando la regla del 4%: para generar ₡1 de ingreso pasivo mensual, se necesitan ₡300 invertidos.

### 4.2 Gastos

```
gastos_totales(t) = gastos_fijos(t) + gastos_variables(t) + gastos_por_decisiones(t)
```

**Gastos fijos:** alquiler/hipoteca, servicios públicos, seguros, transporte base
**Gastos variables:** alimentación, entretenimiento, ropa, imprevistos
**Gastos por decisiones:**

| Decisión | Gasto mensual adicional | Duración |
|----------|------------------------|----------|
| Hipoteca | ~₡400,000 | 30 años |
| Carro (total) | ~₡300,000 (cuota + mantenimiento) | Permanente si renueva |
| Hijo (0-5 años) | ~₡200,000 | 5 años |
| Hijo (6-12 años) | ~₡250,000 | 7 años |
| Hijo (13-18 años) | ~₡350,000 | 6 años |
| Hijo (universidad) | ~₡500,000 | 4-5 años |
| Viaje | Evento puntual | Puntual |
| Posgrado | ~₡300,000 (cuota + oportunidad) | 2-3 años |

**Flujo de caja positivo** → se distribuye:
1. Primero: fondo de emergencia (hasta completar 6 meses)
2. Segundo: pagar deudas de alto interés (>10%)
3. Tercero: invertir según distribución de cartera

**Flujo de caja negativo** → se cubre:
1. Primero: fondo de emergencia
2. Segundo: deuda (con costo de interés)

---

## 5. Los 3 Umbrales de Libertad Financiera

Estos son los hitos más importantes en la dimensión financiera. Representan niveles crecientes de libertad y seguridad.

### Cálculo

```
ingresos_pasivos_mensuales(t) = patrimonio_invertido(t) × 0.04 / 12
```

Donde `patrimonio_invertido` = cartera de inversión (excluyendo inmueble y vehículo, que son ilíquidos).

### 🛡️ Nivel 1: Seguridad Financiera

```
Condición: ingresos_pasivos_mensuales ≥ gastos_basicos_mensuales
```

**¿Qué cubre?**
- Alimentación
- Vivienda (alquiler/hipoteca)
- Servicios públicos (agua, luz, internet)
- Entretenimiento básico

**¿Qué significa?** Si perdiera el empleo mañana, podría cubrir sus necesidades básicas indefinidamente sin trabajar.

**Ejemplo:**
- Gastos básicos: ₡400,000/mes
- Patrimonio invertido necesario: ₡400,000 × 12 / 0.04 = **₡120,000,000**

### ⚖️ Nivel 2: Independencia Financiera

```
Condición: ingresos_pasivos_mensuales ≥ gastos_estilo_actual
```

**¿Qué cubre?** Todo lo que gasta actualmente: vivienda, alimentación, transporte, seguros, entretenimiento, salidas, ropa, etc.

**¿Qué significa?** Puede mantener su estilo de vida actual sin necesidad de trabajar. Trabaja porque quiere, no porque necesita.

**Ejemplo:**
- Gastos actuales: ₡800,000/mes
- Patrimonio invertido necesario: ₡800,000 × 12 / 0.04 = **₡240,000,000**

### 🚀 Nivel 3: Libertad Financiera

```
Condición: ingresos_pasivos_mensuales ≥ gastos_estilo_ideal
```

**¿Qué cubre?** El estilo de vida que realmente desea: viajes frecuentes, mejor vivienda, mejor alimentación, experiencias premium, generosidad con familia y comunidad.

**¿Qué significa?** Puede vivir la vida que sueña sin restricciones financieras. El dinero dejó de ser una variable limitante.

**Ejemplo:**
- Gastos ideales: ₡2,000,000/mes
- Patrimonio invertido necesario: ₡2,000,000 × 12 / 0.04 = **₡600,000,000**

---

## 6. Impacto de las Decisiones en el Patrimonio Neto

### Estudiar vs Trabajar temprano

| Escenario | Edad 20 | Edad 30 | Edad 40 | Edad 50 |
|-----------|---------|---------|---------|---------|
| Trabaja desde los 16, sin universidad | ₡3M | ₡15M | ₡45M | ₡90M |
| Universidad (22), trabaja después | -₡2M | ₡20M | ₡70M | ₡160M |
| Universidad + Maestría (26) | -₡5M | ₡18M | ₡85M | ₡220M |

> El costo de oportunidad de estudiar se recupera y multiplica en ~10-15 años.

### Comprar casa: 25 vs 35 años

| Escenario | Patrimonio 40 | Patrimonio 50 | Patrimonio 60 | Intereses pagados |
|-----------|--------------|--------------|--------------|-------------------|
| Casa a los 25 (₡55M, 9%, 30 años) | ₡25M equity | ₡40M equity | ₡75M equity | ₡94M |
| Casa a los 35 (₡55M, 9%, 30 años) | Alquila | ₡20M equity | ₡45M equity | ₡94M |
| Nunca compra, invierte diferencia | ₡60M cartera | ₡130M cartera | ₡280M cartera | ₡0 |

> Comprar casa da estabilidad (Familia ↑) pero puede frenar la cartera de inversión.

### Carro: comprar vs no comprar

Costo de un carro de ₡12M durante 10 años (incluyendo depreciación, mantenimiento, seguro, combustible):
- **Costo total: ~₡25-30M en 10 años**
- Si ese dinero se invirtiera al 10%: **~₡50M en 10 años**

### Hijo: 20s vs 30s vs 40s

| Timing | Costo total estimado (0-22 años) | Impacto en patrimonio a los 60 |
|--------|----------------------------------|-------------------------------|
| Hijo a los 25 | ₡70-90M | -₡150M vs sin hijos (pero hijo independiente a los 47) |
| Hijo a los 30 | ₡70-90M | -₡120M vs sin hijos (hijo independiente a los 52) |
| Hijo a los 35 | ₡70-90M | -₡100M vs sin hijos (hijo independiente a los 57) |
| Hijo a los 40 | ₡70-90M | -₡85M vs sin hijos (hijo independiente a los 62) |

> Un hijo temprano cuesta más en patrimonio (menos años de inversión compuesta) pero te libera antes. Un hijo tardío cuesta menos en patrimonio pero compromete años de potencial retiro.

---

## 7. Conexión con las otras riquezas

El dinero no existe en aislamiento. Está conectado con todas las demás dimensiones:

| Riqueza | Cómo afecta al Dinero | Cómo el Dinero la afecta |
|---------|----------------------|--------------------------|
| 📈 Crecimiento | Más conocimiento → mejores ingresos | Más dinero → acceso a mejor educación |
| 💚 Bienestar | Buena salud → más energía → más productividad | Más dinero → mejor alimentación, gym, salud |
| 👨‍👩‍👧 Familia | Familia estable → enfoque en trabajo | Más dinero → menos estrés financiero familiar |
| 🔥 Trabajo | Mejor trabajo → más ingresos | Más dinero → libertad de elegir trabajo por pasión |
| 🤝 Comunidad | Buena red → oportunidades laborales | Más dinero → capacidad de networking y eventos |
| 🌍 Aventura | Viajes cuestan dinero | Más dinero → más aventuras posibles |
| 🙏 Servicio | Servicio rara vez genera dinero directo | Más dinero → más capacidad de dar |



### Actualizaciones v2 al modelo financiero

- **Inflación configurable** (default 4%): gastos crecen mensualmente con `gastos × (1 + inflacion/12)^meses`
- **gastos_actuales incluye vivienda** (alquiler). Al comprar casa solo se suma la diferencia (hipoteca - alquiler)
- **Ingresos pasivos solo post-retiro**: antes del retiro, la cartera solo crece vía rendimientos. Después del retiro, se retira según tasa de retiro y la cartera se reduce
- **Ingreso laboral simplificado**: `base × min(1, energia)` — sin multiplicadores de educación, experiencia o crecimiento salarial
- **Apreciación inmueble configurable** (default 3%)

**Retroalimentación clave:**
- **Bienestar → Dinero**: Si te enfermas, pierdes ingresos y gastas en salud. Invertir en bienestar ES invertir en dinero.
- **Crecimiento → Dinero**: Cada hora de estudio rinde retornos compuestos en ingresos futuros.
- **Dinero → Todas**: Alcanzar independencia financiera libera TIEMPO (la meta-variable) para todas las demás riquezas.
