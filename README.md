# 🏆 Impacto de las Decisiones en la Vida — Modelo Robin Sharma

## Simulador de las 8 Formas de Riqueza

> *"No se trata de la cantidad de años en tu vida, sino de la cantidad de vida en tus años."*
> — Robin Sharma

### ¿Qué es esto?

Un simulador que modela cómo las **decisiones concretas de vida** (estudiar, comprar casa, tener hijos, emprender, viajar, invertir) impactan las **8 formas de riqueza** de Robin Sharma a lo largo de 50+ años.

El modelo no se basa en abstracciones — usa **inputs reales del usuario** (ingresos, patrimonio, metas, prioridades) para simular trayectorias de vida y mostrar el **costo de oportunidad** de cada decisión.

### Las 8 Formas de Riqueza

| # | Riqueza | Qué mide |
|---|---------|----------|
| 1 | 📈 **Crecimiento** | Conocimiento, habilidades, mentalidad |
| 2 | 💚 **Bienestar** | Salud física y mental, energía |
| 3 | 👨‍👩‍👧 **Familia** | Calidad de relaciones íntimas |
| 4 | 🔥 **Trabajo** | Propósito e impacto profesional |
| 5 | 💰 **Dinero** | Patrimonio neto y libertad financiera |
| 6 | 🤝 **Comunidad** | Red de apoyo y conexiones |
| 7 | 🌍 **Aventura** | Experiencias, asombro, vida vivida |
| 8 | 🙏 **Servicio** | Contribución al mundo |

### La variable maestra: ⏰ El Tiempo

El tiempo es el recurso más escaso y no renovable. Cada hora dedicada a una riqueza es una hora NO dedicada a otra. El modelo simula cómo la **distribución del tiempo** entre las 8 riquezas, junto con las **decisiones clave de vida**, determina la trayectoria de éxito de una persona.

### Estructura del proyecto

```
├── README.md                          ← Estás aquí
├── docs/
│   ├── tesis.md                       # La tesis central del modelo
│   ├── inputs.md                      # Inputs del usuario
│   ├── modelo.md                      # Modelo matemático general
│   ├── inventario-del-tiempo.md       # El tiempo como meta-variable
│   ├── dimensiones/
│   │   ├── 1-crecimiento.md           # Portafolio de conocimiento
│   │   ├── 2-bienestar.md             # Salud y energía
│   │   ├── 3-familia.md               # Hijos, pareja, timing
│   │   ├── 4-trabajo.md               # Emprender vs empleo
│   │   ├── 5-dinero.md                # Patrimonio neto, 3 niveles de libertad
│   │   ├── 6-comunidad.md             # Red de apoyo
│   │   ├── 7-aventura.md              # Viajes y experiencias
│   │   └── 8-servicio.md              # Contribución
│   └── visualizacion.md               # Plan de la animación
└── src/
    └── simulacion.py                  # Implementación (pendiente)
```

### Output del simulador

- 🎬 **Video animado** (Instagram Reel 1080×1920) mostrando la evolución de las 8 riquezas a lo largo de la vida
- 📊 **Dashboard** con patrimonio neto, umbrales de libertad financiera, y métricas de cada dimensión
- 🔄 **Comparaciones** entre distintos perfiles de decisión

### Basado en

- **Robin Sharma** — Las 8 formas de riqueza (*The Wealth Money Can't Buy*)
- **Regla del 4%** — Para calcular ingresos pasivos y libertad financiera
- **Interés compuesto** — Aplicado tanto a dinero como a conocimiento y relaciones
- **Costo de oportunidad** — Cada decisión tiene un precio en tiempo y dinero
