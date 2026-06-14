# 📥 Inputs del Usuario

Todo lo que el simulador necesita saber sobre la persona para modelar su vida.

---

## 1. Perfil Básico

| Input | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| `nombre` | texto | "María" | Nombre para etiquetas en la visualización |
| `edad_actual` | número | 24 | Edad actual de la persona |
| `edad_simulacion_fin` | número | 70 | Hasta qué edad simular |
| `moneda` | texto | "₡" | Moneda para mostrar valores |

---

## 2. Situación Financiera Actual

| Input | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| `ingreso_mensual` | número | ₡800,000 | Ingreso neto mensual actual |
| `patrimonio_inicial` | número | ₡5,000,000 | Patrimonio neto total actual |
| `distribucion_patrimonio` | objeto | ver abajo | Cómo está distribuido el patrimonio actual |
| `deudas_actuales` | lista | ver abajo | Deudas existentes (monto, tasa, plazo restante) |

### Distribución del patrimonio actual

```yaml
distribucion_patrimonio:
  efectivo: 30%          # Cuentas de ahorro, colchón
  acciones: 40%          # ETFs, acciones individuales
  bonos: 10%             # Renta fija
  bienes_raices: 0%      # Propiedades
  crypto: 10%            # Criptomonedas
  otros: 10%             # Otros activos
```

### Deudas actuales

```yaml
deudas_actuales:
  - tipo: "préstamo estudiantil"
    monto_pendiente: 3_000_000
    tasa_anual: 0.08
    cuota_mensual: 85_000
    meses_restantes: 48
```

---

## 3. Umbrales de Libertad Financiera

El usuario define sus propios umbrales basados en su estilo de vida:

| Input | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| `gastos_basicos_mensuales` | número | ₡400,000 | Alimentación + vivienda + servicios + entretenimiento básico |
| `gastos_estilo_actual` | número | ₡800,000 | Todo lo que gasta actualmente al mes |
| `gastos_estilo_ideal` | número | ₡2,000,000 | Lo que gastaría si pudiera vivir como quiere |

De estos se derivan los 3 niveles:
- 🛡️ **Seguridad financiera** → patrimonio invertido que genere ≥ `gastos_basicos_mensuales`
- ⚖️ **Independencia financiera** → patrimonio invertido que genere ≥ `gastos_estilo_actual`
- 🚀 **Libertad financiera** → patrimonio invertido que genere ≥ `gastos_estilo_ideal`

---

## 4. Portafolio de Conocimiento

| Input | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| `educacion_formal` | texto | "Bachillerato universitario en Ingeniería" | Nivel educativo actual |
| `habilidades` | lista | ["programación", "inglés B2", "liderazgo"] | Habilidades actuales |
| `años_experiencia` | número | 3 | Años de experiencia laboral |

---

## 5. Decisiones de Vida

### 5.1 Educación vs Trabajo (12-25 años)

| Input | Tipo | Ejemplo |
|-------|------|---------|
| `estudiar_hasta_edad` | número | 24 (terminó universidad) |
| `tipo_estudio` | texto | "universidad" / "técnico" / "autodidacta" |
| `trabajar_desde_edad` | número | 18 (medio tiempo mientras estudia) |
| `estudiar_posgrado` | bool | true |
| `edad_posgrado` | número | 28 |
| `costo_posgrado` | número | ₡8,000,000 |

### 5.2 Vivienda

| Input | Tipo | Ejemplo |
|-------|------|---------|
| `desea_casa_propia` | bool | true |
| `edad_compra_casa` | número | 32 (en los 30s) |
| `precio_casa` | número | ₡55,000,000 |
| `prima_casa` | número | ₡5,500,000 (10%) |
| `tasa_hipoteca_anual` | número | 0.09 (9%) |
| `plazo_hipoteca_años` | número | 30 |
| `tasa_apreciacion_inmueble` | número | 0.03 (3% anual) |

### 5.3 Transporte

| Input | Tipo | Ejemplo |
|-------|------|---------|
| `desea_carro` | bool | true |
| `edad_compra_carro` | número | 25 |
| `precio_carro` | número | ₡12,000,000 |
| `financiado` | bool | true |
| `tasa_prestamo_carro` | número | 0.10 (10%) |
| `plazo_carro_años` | número | 5 |
| `costo_mantenimiento_mensual` | número | ₡150,000 (seguro + combustible + mantenimiento) |
| `renovar_cada_años` | número | 8 |

### 5.4 Familia e Hijos

| Input | Tipo | Ejemplo |
|-------|------|---------|
| `desea_hijos` | bool | true |
| `numero_hijos` | número | 2 |
| `edad_primer_hijo` | número | 30 |
| `espaciamiento_años` | número | 3 (entre hijos) |
| `costo_mensual_por_hijo` | número | ₡200,000 (promedio, varía por edad del hijo) |
| `años_dependencia_hijo` | número | 22 (hasta que es independiente) |

### 5.5 Aventura y Viajes

| Input | Tipo | Ejemplo |
|-------|------|---------|
| `viajes_soñados` | lista | ver abajo |

```yaml
viajes_soñados:
  - destino: "Europa"
    costo: 3_000_000
    edad_ideal: 25
    duracion_semanas: 4
  - destino: "Asia"
    costo: 2_500_000
    edad_ideal: 28
    duracion_semanas: 3
  - destino: "Sudamérica"
    costo: 1_500_000
    edad_ideal: 35
    duracion_semanas: 2
```

### 5.6 Carrera Profesional

| Input | Tipo | Ejemplo |
|-------|------|---------|
| `tipo_carrera` | texto | "empleo" / "emprendimiento" / "mixto" |
| `edad_emprendimiento` | número | 30 (si aplica) |
| `inversion_emprendimiento` | número | ₡5,000,000 (capital semilla) |
| `crecimiento_salarial_anual` | número | 0.05 (5% anual en empleo) |

---

## 6. Distribución de Cartera por Etapa

El usuario define cómo quiere distribuir sus inversiones en cada década:

```yaml
cartera_por_etapa:
  20s:
    acciones: 80%
    bonos: 10%
    bienes_raices: 5%
    efectivo: 5%
  30s:
    acciones: 60%
    bonos: 20%
    bienes_raices: 15%
    efectivo: 5%
  40s:
    acciones: 50%
    bonos: 25%
    bienes_raices: 20%
    efectivo: 5%
  50s:
    acciones: 35%
    bonos: 35%
    bienes_raices: 20%
    efectivo: 10%
  60s:
    acciones: 25%
    bonos: 40%
    bienes_raices: 20%
    efectivo: 15%
```

---

## 7. Prioridades por Etapa de Vida

El usuario asigna un porcentaje de su tiempo/enfoque semanal a cada riqueza por década:

```yaml
prioridades_por_etapa:
  20s:
    crecimiento: 25%
    bienestar: 10%
    familia: 5%
    trabajo: 30%
    dinero: 5%
    comunidad: 10%
    aventura: 12%
    servicio: 3%
  30s:
    crecimiento: 10%
    bienestar: 12%
    familia: 25%
    trabajo: 25%
    dinero: 10%
    comunidad: 8%
    aventura: 5%
    servicio: 5%
  40s:
    crecimiento: 10%
    bienestar: 18%
    familia: 20%
    trabajo: 20%
    dinero: 8%
    comunidad: 8%
    aventura: 6%
    servicio: 10%
  50s:
    crecimiento: 8%
    bienestar: 20%
    familia: 18%
    trabajo: 15%
    dinero: 5%
    comunidad: 10%
    aventura: 9%
    servicio: 15%
  60s:
    crecimiento: 8%
    bienestar: 22%
    familia: 20%
    trabajo: 5%
    dinero: 3%
    comunidad: 12%
    aventura: 10%
    servicio: 20%
```

> **Nota:** Los porcentajes deben sumar 100% en cada etapa. Representan la distribución de las ~112 horas útiles semanales.

---

## 8. Supuestos Económicos Generales

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `inflacion_anual` | número | 0.04 (4%) | Inflación esperada |
| `rendimiento_acciones` | número | 0.10 (10%) | Rendimiento nominal acciones |
| `rendimiento_bonos` | número | 0.05 (5%) | Rendimiento nominal bonos |
| `rendimiento_bienes_raices` | número | 0.07 (7%) | Rendimiento nominal B/R |
| `rendimiento_efectivo` | número | 0.02 (2%) | Rendimiento efectivo/ahorro |
| `tasa_retiro_segura` | número | 0.04 (4%) | Regla del 4% para ingresos pasivos |
| `depreciacion_carro` | número | 0.15 (15%) | Depreciación anual del vehículo |


---

## Actualizaciones v2 — Nuevos inputs

### Inputs agregados al UI

| Input | Tipo | Default | Sección |
|-------|------|---------|---------|
| Alquiler mensual ($) | número | 800 | Perfil Básico |
| Edad retiro laboral | número | 65 | Perfil Básico |
| Inflación anual (%) | número | 4 | Gastos y Ahorro |
| % Patrimonio a cartera | número | 70 | Gastos y Ahorro |
| Meses fondo emergencia | número | 6 | Gastos y Ahorro |
| Tasa retiro segura (%) | número | 4 | Gastos y Ahorro |
| % Gastos fijos | número | 60 | Gastos y Ahorro |
| Apreciación inmueble (%) | número | 3 | Vivienda |
| Tiene pareja? | checkbox | true | Familia |
| Calidad relación (0-100) | slider | 75 | Familia |
| Edad inicio relación | número | 25 | Familia |
| Seguro médico 100%? | checkbox | true | Salud |
| Prima mensual seguro ($) | número | 200 | Salud |
| Edad inicio seguro | número | 25 | Salud |
| Valores iniciales riquezas | 7 sliders | Varios | Valores Iniciales |
| Eventos aleatorios? | checkbox | true | Estocástico |
| Semilla (seed) | número | 42 | Estocástico |
| Mostrar Índice Éxito | checkbox | true | Header |

### Inputs eliminados

| Input | Razón |
|-------|-------|
| Crecimiento salarial (%) | Ingresos no crecen automáticamente, solo por eventos estocásticos |
| Estudiar posgrado? | Simplificado a solo nivel educativo |
| Edad posgrado | Eliminado |
| Costo posgrado/mes | Eliminado |

### Cambio de moneda

Toda la interfaz usa **$** (dólares) en vez de ₡ (colones).

### Perfiles predefinidos (6 botones)

Balance, Financiero, Aventurero, Tradicional, Emprendedor, Amoroso — cargan todas las decisiones de vida pero NO modifican edad, ingreso, patrimonio ni alquiler del usuario.
