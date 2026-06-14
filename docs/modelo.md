# 🧮 Modelo Matemático Integrador

## Cómo se simula una vida completa usando las 8 Formas de Riqueza

---

## 1. Visión general del modelo

El simulador avanza mes a mes desde la `edad_actual` hasta la `edad_simulacion_fin`, calculando en cada paso:

```
Para cada mes t (de edad_inicio × 12 hasta edad_fin × 12):

  1. Determinar la etapa de vida (20s, 30s, 40s...)
  2. Obtener prioridades de tiempo de la etapa actual
  3. Aplicar decisiones programadas (casa, carro, hijo, viaje, emprendimiento)
  4. Calcular redistribución de tiempo por decisiones activas
  5. Actualizar las 8 riquezas según tiempo invertido y multiplicadores
  6. Calcular flujo de caja (ingresos - gastos)
  7. Actualizar patrimonio neto (activos - pasivos)
  8. Verificar umbrales de libertad financiera
  9. Registrar estado completo del mes
```

---

## 2. Estado del sistema

En cada mes `t`, el estado completo de la persona es:

```python
estado(t) = {
    # Edad
    'edad': float,
    'etapa': str,  # '20s', '30s', '40s', '50s', '60s'
    
    # Las 8 riquezas (0-100 cada una)
    'crecimiento': float,
    'bienestar': float,
    'familia': float,
    'trabajo': float,
    'dinero': float,       # Este se mide con patrimonio_neto
    'comunidad': float,
    'aventura': float,
    'servicio': float,
    
    # Financiero detallado
    'patrimonio_neto': float,
    'cartera_inversion': float,
    'valor_inmueble': float,
    'valor_vehiculo': float,
    'saldo_hipoteca': float,
    'saldo_deudas': float,
    'ingresos_pasivos_mensuales': float,
    'flujo_caja_mensual': float,
    
    # Umbrales alcanzados
    'seguridad_financiera': bool,
    'independencia_financiera': bool,
    'libertad_financiera': bool,
    
    # Tiempo
    'distribucion_tiempo': dict,  # horas/sem por riqueza
    
    # Conocimiento
    'portafolio_conocimiento': dict,
    'multiplicador_conocimiento': float,
    
    # Energía
    'energia': float,
    'multiplicador_energia': float,
    
    # Decisiones activas
    'tiene_casa': bool,
    'tiene_carro': bool,
    'hijos': list,  # [{edad, costo_mensual}]
    'tipo_carrera': str,  # 'empleo' | 'emprendimiento'
    'estudiando': bool,
}
```

---

## 3. Ciclo de simulación mensual

### Paso 1: Distribución del tiempo

```python
horas_semanales = 112  # 16h/día × 7 días

# Obtener prioridades base de la etapa
prioridades = prioridades_por_etapa[etapa_actual]

# Ajustar por decisiones activas
if tiene_hijos_menores:
    prioridades['familia'] += 15  # horas extra
    # Restar proporcionalmente de las demás
    
if emprendiendo and años_emprendimiento < 5:
    prioridades['trabajo'] += 15
    
if estudiando_posgrado:
    prioridades['crecimiento'] += 15

# Normalizar para que sume 112h
distribucion = normalizar(prioridades, total=112)
```

### Paso 2: Actualizar cada riqueza

Para cada riqueza `i`:

```python
# Crecimiento por horas dedicadas (rendimiento logarítmico)
delta_i = k_i × ln(1 + horas_dedicadas_i) × multiplicador_energia

# Efecto de transferencia (otras riquezas que benefician a esta)
for j in otras_riquezas:
    delta_i += estado[j] × coeficiente_transferencia[j][i] × 0.001

# Decaimiento si horas < umbral mínimo
if horas_dedicadas_i < umbral_minimo_i:
    delta_i -= tasa_decaimiento_i

# Actualizar
estado[i] = clamp(estado[i] + delta_i, 0, 100)
```

**Constantes por riqueza:**

| Riqueza | k (factor crecimiento) | Umbral mínimo (h/sem) | Decaimiento (%/mes) | Techo por edad |
|---------|----------------------|----------------------|---------------------|----------------|
| Crecimiento | 0.6 | 3 | 0.5% | 100 (sin techo) |
| Bienestar | 0.7 | 5 | 2.0% + envejecimiento | 100→95→85→75→65→55 |
| Familia | 0.6 | 5 | 1.0% | 100 (sin techo) |
| Trabajo | 0.5 | 20* | 0.5% | 100 (sin techo) |
| Dinero | 0.3 | 1 | 0.0% (manejado por flujo de caja) | 100 (sin techo) |
| Comunidad | 0.5 | 2 | 1.5% | 100 (sin techo) |
| Aventura | 0.8 | 0 | 0.0% (acumulativo) | 100 (sin techo) |
| Servicio | 0.6 | 0 | 0.0% | 100 (sin techo) |

> **Nota sobre Bienestar:** Usa interpolación lineal continua (sin escalones):
> - `techo(edad) = 100 - max(0, edad - 25)` (clamped a [50, 100])
> - `decay(edad) = max(0, 0.005 × (edad - 30))` por mes
> - Pierde ~1 punto de techo por año después de los 25 (suave, no escalonado)
> - A los 25: techo 100 | A los 50: techo 75 | A los 65: techo 60 | A los 75+: techo 50
>
> Esto simula que la biología impone límites crecientes con la edad de forma gradual. El efecto cascada es significativo: al bajar bienestar, baja el multiplicador de energía, lo que frena el crecimiento de todas las demás riquezas.

*Trabajo: 20h es el mínimo para empleo; emprendimiento requiere más.

### Paso 3: Actualizar finanzas

```python
# --- INGRESOS ---
ingreso_laboral = calcular_ingreso_laboral(
    conocimiento=estado['crecimiento'],
    experiencia=años_experiencia,
    tipo_carrera=estado['tipo_carrera'],
    energia=estado['multiplicador_energia']
)

ingresos_pasivos = estado['cartera_inversion'] × tasa_retiro_segura / 12

ingresos_totales = ingreso_laboral + ingresos_pasivos

# --- GASTOS ---
gastos_fijos = calcular_gastos_fijos(tiene_casa, tiene_carro, alquiler)
gastos_hijos = sum(costo_hijo(h['edad']) for h in hijos)
gastos_viaje = viaje_este_mes()  # evento puntual si aplica
gastos_variables = gastos_estilo_vida(etapa)

gastos_totales = gastos_fijos + gastos_hijos + gastos_viaje + gastos_variables

# --- FLUJO DE CAJA ---
flujo_caja = ingresos_totales - gastos_totales

# --- INVERSIÓN ---
if flujo_caja > 0:
    if fondo_emergencia < meta_emergencia:
        aportar_a_emergencia(flujo_caja)
    else:
        invertir(flujo_caja, distribucion_cartera[etapa])
else:
    usar_fondo_emergencia(-flujo_caja)

# --- CRECIMIENTO DE CARTERA ---
rendimiento_mensual = calcular_rendimiento_ponderado(distribucion_cartera[etapa])
estado['cartera_inversion'] *= (1 + rendimiento_mensual)

# --- AMORTIZACIÓN DE DEUDAS ---
if tiene_hipoteca:
    actualizar_hipoteca()
if tiene_prestamo_carro:
    actualizar_prestamo_carro()

# --- PATRIMONIO NETO ---
estado['patrimonio_neto'] = (
    estado['cartera_inversion'] +
    estado['valor_inmueble'] +
    estado['valor_vehiculo'] +
    fondo_emergencia
) - (
    estado['saldo_hipoteca'] +
    estado['saldo_deudas']
)

# --- UMBRALES ---
estado['ingresos_pasivos_mensuales'] = estado['cartera_inversion'] × 0.04 / 12
estado['seguridad_financiera'] = ingresos_pasivos >= gastos_basicos
estado['independencia_financiera'] = ingresos_pasivos >= gastos_actuales
estado['libertad_financiera'] = ingresos_pasivos >= gastos_ideales
```

### Paso 4: Aplicar eventos programados

```python
# Verificar si este mes hay una decisión programada
if edad == edad_compra_casa:
    comprar_casa(precio, prima, tasa, plazo)
    
if edad == edad_compra_carro:
    comprar_carro(precio, financiado, tasa, plazo)
    
if edad in edades_hijos:
    agregar_hijo()
    
if edad == edad_viaje:
    realizar_viaje(costo, impacto)
    
if edad == edad_emprendimiento:
    iniciar_emprendimiento(inversion, tipo)
    
if edad == edad_posgrado:
    iniciar_posgrado(costo, duracion)
```

---

## 4. Matriz de interdependencia

Las riquezas se influyen mutuamente. Cada mes, el estado de una riqueza puede beneficiar o perjudicar a otras:

```
Coeficientes de transferencia (de fila → a columna):

              Crec  Bien  Fam   Trab  Din   Com   Aven  Serv
Crecimiento [  -    0.08  0.12  0.25  0.15  0.10  0.0   0.08]  (psicología/liderazgo mejora familia, comunidad, bienestar, servicio)
Bienestar   [ 0.0    -    0.0   0.3   0.2   0.0   0.0   0.0 ]
Familia     [ 0.0   0.2    -    0.0   0.0   0.0   0.0   0.0 ]
Trabajo     [ 0.2   0.0   0.0    -    0.5   0.1   0.0   0.0 ]
Dinero      [ 0.1   0.0   0.0   0.0    -    0.0   0.0   0.0 ]
Comunidad   [ 0.2   0.1   0.0   0.2   0.0    -    0.1   0.1 ]
Aventura    [ 0.2   0.0   0.0   0.0   0.0   0.1    -    0.0 ]
Servicio    [ 0.0   0.2   0.0   0.0   0.0   0.1   0.0    -  ]
```

**Lectura:** Crecimiento(70) transfiere 70 × 0.3 × 0.001 = 0.021 puntos/mes a Trabajo.

**Retroalimentación más fuerte:**
- Bienestar → Trabajo y Dinero (energía = productividad)
- Trabajo → Dinero (ingresos)
- Crecimiento → Trabajo (conocimiento = mejor trabajo)
- Comunidad → Trabajo (red = oportunidades)

---

## 5. Multiplicadores globales

### 5.1 Multiplicador de energía (de Bienestar)

```python
multiplicador_energia = estado['bienestar'] / 75

# Afecta: productividad laboral, capacidad de aprendizaje, calidad de relaciones
# Rango: 0.0 (incapacitado) a 1.33 (energía óptima)
```

### 5.2 Multiplicador de pareja (de Familia)

```python
multiplicador_pareja = f(calidad_relacion_pareja)
# Rango: 0.5 (relación tóxica) a 1.3 (relación excepcional)
# Afecta: TODAS las riquezas como multiplicador global
```

### 5.3 Educación → Probabilidad de oportunidades (no ingreso)

```python
# La educación NO multiplica el ingreso directamente.
# En su lugar, aumenta la probabilidad de eventos estocásticos de oportunidad laboral:
prob_oportunidad = 0.01 + comunidad × 0.0006 + educacion × 0.0003

# Ingreso es fijo: base × min(1, energia)
# Solo crece por eventos estocásticos (+15% raise cada oportunidad)
```

### Actualizaciones v3 al modelo estocástico

**Enfermedades con costos realistas y seguro médico:**
```
Enfermedad menor (70%): costo = $500 + rng() × $4,500 (uniforme)
Enfermedad grave (30%): costo = $20,000 + rng()² × $180,000 (sesgada, media ~$65K)

Con seguro activo: costo = $0, impacto bienestar reducido 50%
Sin seguro: costo completo del portafolio
```

**Eventos de pareja estocásticos:**
```
💔 Rompimiento:
  Condición: tiene pareja activa, sin cooldown
  Probabilidad/trimestre: max(0.002, 0.04 × (1 - calidad/100)²)
  Efectos: familia -15, bienestar -10, comunidad -5, cooldown 12 meses

💕 Nueva pareja:
  Condición: soltero, cooldown expirado, edad < 60
  Probabilidad/trimestre: 0.03 + comunidad × 0.001
  Nueva calidad: 30 + rng() × 60 (aleatoria)
  Efectos: familia +5, bienestar +5
```

El estado de pareja ahora es **mutable** — la calidad y existencia de la pareja pueden cambiar a lo largo de la simulación por eventos estocásticos.

---

## 6. Índice de Riqueza Total

Para comparar perfiles y visualizar progreso, se calcula un índice compuesto:

```python
riqueza_total(t) = Σ (riqueza_i(t) × peso_i)
```

**Pesos por defecto (basados en Robin Sharma):**

| Riqueza | Peso | Justificación |
|---------|------|--------------|
| Crecimiento | 0.12 | Base para todo lo demás |
| Bienestar | 0.18 | La más impactante en calidad de vida |
| Familia | 0.18 | "90% de la felicidad" |
| Trabajo | 0.12 | Propósito y productividad |
| Dinero | 0.12 | Libertad y opciones |
| Comunidad | 0.10 | Amplificador silencioso |
| Aventura | 0.08 | Vida vivida |
| Servicio | 0.10 | Propósito final |
| **Total** | **1.00** | |

> El usuario puede personalizar estos pesos según sus valores personales.

---

## 7. Normalización del Dinero a escala 0-100

Para que Dinero sea comparable con las otras riquezas en la escala 0-100:

```python
dinero_normalizado(t) = min(100, patrimonio_neto(t) / meta_libertad_financiera × 100)
```

Donde `meta_libertad_financiera` = el patrimonio necesario para Libertad Financiera (nivel 3).

Así:
- 0 = patrimonio neto cero o negativo
- 33 = alcanzó Seguridad Financiera
- 66 = alcanzó Independencia Financiera
- 100 = alcanzó Libertad Financiera

---

## 8. Perfiles de ejemplo

### Perfil A: "El disciplinado equilibrado"
```yaml
estudia: Universidad (22) + Maestría (26)
casa: A los 33, ₡55M
carro: No
hijos: 2 (a los 31 y 34)
viajes: Europa a los 24, Asia a los 29
carrera: Empleo hasta 35, emprendimiento después
prioridades: Balanceadas, bienestar siempre ≥15%
```

### Perfil B: "El financieramente obsesionado"
```yaml
estudia: Universidad (22)
casa: Nunca (invierte todo)
carro: No
hijos: No
viajes: Mínimos
carrera: Empleo de alta remuneración
prioridades: Trabajo 40%, Dinero 20%, Crecimiento 20%
```

### Perfil C: "El aventurero"
```yaml
estudia: Técnico (20)
casa: No hasta los 40s
carro: No
hijos: 1 a los 38
viajes: Frecuentes, intercontinentales
carrera: Freelance/remoto
prioridades: Aventura 25%, Crecimiento 20%, Comunidad 15%
```

### Perfil D: "El tradicional"
```yaml
estudia: Secundaria
casa: A los 24, ₡40M
carro: A los 22, ₡10M
hijos: 3 (a los 23, 26, 29)
viajes: Poco
carrera: Empleo estable
prioridades: Familia 30%, Trabajo 30%, poco de lo demás
```

---

## 9. Output del modelo

Para cada mes simulado, el modelo produce:

```python
output = {
    'serie_temporal': {
        'meses': [0, 1, 2, ..., N],
        'riquezas': {
            'crecimiento': [v0, v1, ..., vN],
            'bienestar': [v0, v1, ..., vN],
            # ... 8 series
        },
        'financiero': {
            'patrimonio_neto': [v0, v1, ..., vN],
            'cartera_inversion': [v0, v1, ..., vN],
            'ingresos_pasivos': [v0, v1, ..., vN],
            'flujo_caja': [v0, v1, ..., vN],
        },
        'riqueza_total': [v0, v1, ..., vN],
    },
    'hitos': {
        'seguridad_financiera': edad_o_None,
        'independencia_financiera': edad_o_None,
        'libertad_financiera': edad_o_None,
        'primer_hijo': edad_o_None,
        'casa_propia': edad_o_None,
        # ...
    },
    'resumen_final': {
        'riqueza_total_final': float,
        'patrimonio_neto_final': float,
        'riquezas_finales': dict,
        'decisiones_tomadas': list,
    }
}
```

Este output alimenta la capa de visualización (ver `visualizacion.md`).
