# 📈 Dimensión 1: Crecimiento — Portafolio de Conocimiento

> *"Todos tienen un potencial enorme y deben honrar su grandeza. Para crecer, a menudo es necesario abandonar la identidad actual."* — Robin Sharma

---

## 1. Variable principal: Portafolio de Conocimiento

El crecimiento se mide como un **portafolio de conocimiento acumulado** — similar a un portafolio de inversión, pero de habilidades, educación y mentalidad.

```
conocimiento(t) = conocimiento(t-1) + aprendizaje(t) - obsolescencia(t)
```

El portafolio de conocimiento tiene valor de mercado (impacta ingresos) y valor personal (impacta satisfacción y mentalidad).

---

## 2. Componentes del portafolio

### 2.1 Educación Formal

| Nivel | Valor base | Tiempo de adquisición | Multiplicador de ingreso |
|-------|-----------|----------------------|--------------------------|
| Sin estudios | 0 | — | 1.0x |
| Secundaria completa | 20 | 12-18 años | 1.1x |
| Técnico | 40 | 2-3 años | 1.3x |
| Universidad (bachillerato) | 60 | 4-5 años | 1.7x |
| Universidad (licenciatura) | 70 | 5-6 años | 1.9x |
| Maestría | 85 | +2 años | 2.2x |
| Doctorado | 95 | +4 años | 2.5x |

> La educación formal es el componente más estable — no se pierde fácilmente.

### 2.2 Habilidades Técnicas

Habilidades específicas con valor de mercado:

```yaml
habilidades_tecnicas:
  - nombre: "Programación"
    nivel: 70        # 0-100
    demanda: alta     # baja/media/alta
    obsolescencia: 5%/año  # las tecnologías cambian rápido
    
  - nombre: "Inglés"
    nivel: 65
    demanda: alta
    obsolescencia: 2%/año  # idiomas se pierden lento
    
  - nombre: "Liderazgo"
    nivel: 40
    demanda: alta
    obsolescencia: 1%/año  # habilidades blandas son duraderas
```

**Crecimiento de habilidades por hora dedicada:**
```
nivel(t+1) = nivel(t) + tasa_aprendizaje × horas_dedicadas × (1 - nivel(t)/100)
```

- `tasa_aprendizaje`: mayor al principio (curva de aprendizaje), menor al avanzar
- `(1 - nivel/100)`: rendimiento decreciente — es más fácil ir de 20 a 40 que de 80 a 100

### 2.3 Experiencia Aplicada

El conocimiento aplicado en el trabajo se acumula como experiencia:

```
experiencia(t) = experiencia(t-1) + horas_trabajo(t) × calidad_trabajo
```

Donde `calidad_trabajo` depende de:
- Nivel de desafío del trabajo (trabajos fáciles enseñan poco)
- Variedad de responsabilidades
- Mentoría recibida

### 2.4 Sabiduría y Mentalidad

Componente intangible que crece con:
- Reflexión (journaling, gratitud — regla 45/15 de Sharma)
- Experiencias de vida (aventura, fracasos, éxitos)
- Relaciones profundas (comunidad, familia)

```
sabiduria(t) = f(edad, reflexion_acumulada, experiencias_acumuladas, adversidad_superada)
```

---

## 3. Regla 45/15 de Robin Sharma

Robin Sharma propone dedicar diariamente:
- **45 minutos** de lectura o estudio enfocado
- **15 minutos** de reflexión, resumen y asimilación

**Impacto compuesto:**
- 1 hora/día × 365 días = 365 horas/año de crecimiento intencional
- En 10 años: 3,650 horas (equivalente a ~2 años de educación formal a tiempo completo)
- En 30 años: 10,950 horas (maestría en múltiples disciplinas)

```
Si dedica 1h/día desde los 20:
  A los 30: +3,650h de conocimiento = ventaja significativa
  A los 40: +7,300h = experto en varias áreas
  A los 50: +10,950h = maestría profunda

Si empieza a los 35 (15 años tarde):
  A los 50: +5,475h = la mitad del conocimiento acumulado
```

---

## 4. Obsolescencia del conocimiento

No todo el conocimiento mantiene su valor. Diferentes tipos se deprecian a distintas velocidades:

| Tipo de conocimiento | Tasa de obsolescencia | Vida media |
|---------------------|----------------------|------------|
| Habilidades técnicas específicas (ej: framework X) | 15-20%/año | 3-5 años |
| Tecnología general (ej: programación) | 5-8%/año | 8-12 años |
| Conocimiento de industria | 3-5%/año | 15-20 años |
| Idiomas (sin práctica) | 2-3%/año | 20-30 años |
| Habilidades blandas (liderazgo, comunicación) | 1-2%/año | 30-50 años |
| Educación fundamental (matemáticas, lógica) | <1%/año | Casi permanente |
| Sabiduría y mentalidad | 0% | Permanente |

**Implicación:** Es necesario dedicar parte del tiempo de Crecimiento a **mantenimiento** (actualizar conocimiento existente) además de adquisición de nuevo conocimiento.

### Modelo de obsolescencia en la simulación

El crecimiento sufre una **obsolescencia mensual continua** que representa el olvido natural y la depreciación del conocimiento:

```
obsolescencia_mensual(edad, horas_crecimiento):
  base = 0.15                              // ~1.8%/año de olvido/obsolescencia base
  if horas_crecimiento < 5: base += 0.10   // sin estudio → olvido acelerado
  if horas_crecimiento < 3: base += 0.15   // negligencia → olvido severo
  if edad > 55: base += 0.003 × (edad - 55) // vejez → aprendizaje más lento, olvido más rápido
  return base
```

Además, el crecimiento tiene un **techo suave** en la vejez:
```
techo_crecimiento(edad):
  si edad <= 55: return 100
  si edad >= 80: return 70
  return 100 - (edad - 55) × 1.2    // pierde ~1.2 pts/año de techo después de 55
```

Esto significa que:
- Con estudio constante (>5h/sem): el crecimiento puede mantenerse alto, compensando la obsolescencia
- Sin estudio: el crecimiento decae gradualmente (~3-5%/año)
- En la vejez: incluso con estudio, hay un techo natural por menor neuroplasticidad

---

## 5. Valor de mercado del conocimiento

El portafolio de conocimiento tiene un valor financiero directo:

```
valor_mercado_conocimiento = Σ (nivel_habilidad_i × demanda_i × peso_i)
```

Esto se traduce en el `multiplicador_conocimiento` que afecta el ingreso laboral (ver dimensión Dinero):

```
multiplicador_conocimiento = 1.0 + (educacion_formal × 0.01) + Σ(habilidad_i × demanda_i × 0.005)
```

**Ejemplo:**
- Educación formal: Universidad (60) → +0.60
- Programación: nivel 70, demanda alta (×1.5) → +0.53
- Inglés: nivel 65, demanda alta (×1.5) → +0.49
- Liderazgo: nivel 40, demanda alta (×1.5) → +0.30
- **Multiplicador total: 1.0 + 0.60 + 0.53 + 0.49 + 0.30 = 2.92x**

---

## 6. Decisión clave: ¿Estudiar o trabajar?

### Escenario A: Trabajar desde los 16

```
Ingresos tempranos: Sí (desde los 16)
Conocimiento formal: Bajo (multiplicador ~1.1x)
Experiencia: Alta (más años trabajando)
Techo salarial: Bajo-medio
Crecimiento: Depende de autodidactismo
```

### Escenario B: Universidad (18-22/24)

```
Ingresos tempranos: No (4-6 años sin ingresos)
Conocimiento formal: Alto (multiplicador ~1.7-1.9x)
Experiencia: Menor (empieza tarde)
Techo salarial: Medio-alto
Crecimiento: Base sólida para construir
```

### Escenario C: Universidad + Posgrado (18-26)

```
Ingresos tempranos: No (8+ años sin ingresos)
Conocimiento formal: Muy alto (multiplicador ~2.2-2.5x)
Experiencia: Mínima al inicio
Techo salarial: Alto
Crecimiento: Máxima base, pero alto costo de oportunidad financiero
```

**El crossover:** El punto donde el escenario de estudio supera al de trabajo temprano:
- Universidad vs trabajo: ~8-12 años después de graduarse
- Posgrado vs universidad: ~5-8 años después del posgrado

---

## 7. Gratitud deliberada

Robin Sharma enfatiza la gratitud como motor de crecimiento. En el modelo, la gratitud actúa como un **multiplicador de eficiencia**:

```
eficiencia_aprendizaje = base × (1 + factor_gratitud)
```

La gratitud mejora:
- La disposición a aprender (mentalidad de crecimiento)
- La resiliencia ante fracasos (se aprende más del fracaso)
- La calidad de las relaciones (más mentores, mejor comunidad)

---

## 8. Conexión con otras riquezas

| Riqueza | Cómo alimenta al Crecimiento | Cómo el Crecimiento la alimenta |
|---------|------------------------------|--------------------------------|
| 💚 Bienestar | Buena salud → más energía para aprender | Conocer sobre salud → mejores hábitos |
| 👨‍👩‍👧 Familia | Familia estable → concentración | Crecimiento personal → mejor pareja/padre |
| 🔥 Trabajo | Trabajo retador → aprendizaje aplicado | Más conocimiento → mejor trabajo |
| 💰 Dinero | Dinero → acceso a educación premium | Conocimiento → mayores ingresos |
| 🤝 Comunidad | Red intelectual → nuevas perspectivas | Más conocimiento → más para compartir |
| 🌍 Aventura | Experiencias → sabiduría, perspectiva | Conocimiento → viajar con más profundidad |
| 🙏 Servicio | Enseñar → consolidar conocimiento | Más conocimiento → más para dar |

### Transferencias de Crecimiento a otras dimensiones (actualización v3)

El conocimiento en **psicología, liderazgo e inteligencia emocional** tiene impacto directo en múltiples dimensiones. En el modelo, Crecimiento transfiere valor a:

| Dimensión destino | Coeficiente | Justificación |
|-------------------|-------------|---------------|
| → Trabajo | 0.25 | Conocimiento técnico + liderazgo = mejor desempeño |
| → Dinero | 0.15 | Más conocimiento = mejores decisiones financieras |
| → Familia | 0.12 | Psicología: comunicación, resolución de conflictos, inteligencia emocional |
| → Comunidad | 0.10 | Liderazgo: influencia, conexión, facilitación de grupos |
| → Bienestar | 0.08 | Autoconocimiento, manejo del estrés, salud mental |
| → Servicio | 0.08 | Más conocimiento = más para enseñar y compartir |

**Efecto práctico a Crecimiento=70:** Transfiere mensualmente ~0.014pts a Trabajo, ~0.008pts a Dinero, ~0.007pts a Familia, ~0.006pts a Comunidad, ~0.004pts a Bienestar y Servicio. Efectos sutiles pero compuestos a lo largo de décadas.

> **Insight:** Invertir en crecimiento personal no solo mejora el ingreso — mejora las relaciones, la comunidad y la capacidad de servir. El conocimiento en psicología y liderazgo es el conocimiento con mayor retorno multidimensional.
