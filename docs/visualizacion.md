# 🎬 Plan de Visualización — Animación de las 8 Riquezas

## Formato: Instagram Reel (1080×1920, 9:16)

---

## 1. Especificaciones técnicas

| Parámetro | Valor |
|-----------|-------|
| Resolución | 1080 × 1920 px |
| Relación de aspecto | 9:16 (vertical) |
| FPS | 30 |
| Duración | 60 segundos |
| Codec | H.264 |
| Formato | MP4 |
| DPI | 100 |
| Matplotlib figsize | 10.8 × 19.2 |

---

## 2. Estructura narrativa del video (60 segundos)

### Fase 1: Presentación (0-5s, frames 0-150)

```
┌─────────────────────┐
│                     │
│   🏆 LAS 8 FORMAS  │
│     DE RIQUEZA      │
│                     │
│  ¿Cómo impactan tus │
│  decisiones de vida? │
│                     │
│   Modelo Robin Sharma│
│                     │
└─────────────────────┘
```

- Fade in del título
- Subtítulo con pregunta provocadora
- Crédito a Robin Sharma

### Fase 2: Radar Chart Animado (5-45s, frames 150-1350)

```
┌─────────────────────┐
│  Edad: 24 → 70      │
│                     │
│     📈 Crecimiento   │
│    🙏/    \💚       │
│   Serv──●──Bien     │
│    🌍\  |  /👨‍👩‍👧    │
│   Aven─●─Fam       │
│     🤝\ /🔥        │
│    Com──Trab        │
│        💰           │
│      Dinero         │
│                     │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │
│  Patrimonio: ₡XXM   │
│  🛡️⬜ ⚖️⬜ 🚀⬜    │
│                     │
└─────────────────────┘
```

**Animación:**
- El radar chart (octágono) se expande/contrae en cada dimensión mientras avanza la edad
- Una línea temporal en la parte superior muestra el avance de la edad
- Cuando ocurre una **decisión clave**, se muestra un flash/icono:
  - 🎓 "Graduación" a los 22
  - 🏠 "Compra casa" a los 32
  - 👶 "Primer hijo" a los 30
  - ✈️ "Viaje Europa" a los 25
  - 🚀 "Emprende" a los 35
- El patrimonio neto se muestra abajo con los 3 umbrales
- Los umbrales se "encienden" cuando se alcanzan (🛡️✅ ⚖️✅ 🚀✅)

### Fase 3: Comparación de perfiles (45-55s, frames 1350-1650)

```
┌─────────────────────┐
│  A los 60 años:     │
│                     │
│   Perfil A vs B     │
│                     │
│  [Radar A] [Radar B]│
│  Equilib.  Financ.  │
│                     │
│  Riqueza Total:     │
│  A: 78/100  B: 52   │
│  ₡280M     ₡450M    │
│                     │
│  "Más dinero ≠      │
│   más riqueza"      │
│                     │
└─────────────────────┘
```

- Dos radar charts lado a lado
- Comparación visual de perfiles distintos
- Mensaje impactante

### Fase 4: Mensaje final (55-60s, frames 1650-1800)

```
┌─────────────────────┐
│                     │
│   "Las decisiones   │
│    de hoy se        │
│    componen por     │
│    décadas"         │
│                     │
│   ¿Cómo quieres    │
│   distribuir tu     │
│   tiempo?           │
│                     │
│   @tu_cuenta        │
│                     │
└─────────────────────┘
```

---

## 3. Diseño visual

### Paleta de colores

```python
COLOR_BG = '#0f0f23'          # Fondo oscuro profundo
COLOR_AXES = '#1a1a3e'        # Fondo del gráfico
COLOR_TEXT = '#c8d6e5'         # Texto principal
COLOR_WHITE = '#ffffff'        # Texto destacado

# Colores por riqueza (8 colores distinguibles)
COLORES_RIQUEZAS = {
    'crecimiento': '#00d2ff',  # Cyan brillante
    'bienestar':   '#00ff88',  # Verde esmeralda
    'familia':     '#ff6b9d',  # Rosa cálido
    'trabajo':     '#ffa500',  # Naranja energético
    'dinero':      '#ffd700',  # Dorado
    'comunidad':   '#9b59b6',  # Púrpura
    'aventura':    '#e74c3c',  # Rojo aventura
    'servicio':    '#1abc9c',  # Turquesa
}

# Colores de umbrales financieros
COLOR_SEGURIDAD = '#2ecc71'
COLOR_INDEPENDENCIA = '#3498db'
COLOR_LIBERTAD = '#f39c12'
```

### Tipografía
- Títulos: Sans-serif, bold, grande
- Datos: Sans-serif, light, mediano
- Todo en español

### Estilo general
- Fondo oscuro (dark mode)
- Líneas con glow (resplandor sutil)
- Transiciones suaves (ease-in-out)
- Iconos emoji para cada riqueza

---

## 4. Componentes visuales

### 4.1 Radar Chart (Octágono)

El componente principal. Un polígono de 8 lados donde cada vértice representa una riqueza:

```python
# Posiciones angulares (empezando arriba, sentido horario)
angulos = {
    'crecimiento': 90°,    # Arriba
    'bienestar':   45°,    # Arriba-derecha
    'familia':     0°,     # Derecha
    'trabajo':     315°,   # Abajo-derecha
    'dinero':      270°,   # Abajo
    'comunidad':   225°,   # Abajo-izquierda
    'aventura':    180°,   # Izquierda
    'servicio':    135°,   # Arriba-izquierda
}
```

- Cada vértice va de 0 (centro) a 100 (borde)
- El polígono se rellena con color semi-transparente
- Se anima mes a mes, expandiéndose y contrayéndose

### 4.2 Línea de tiempo

Barra horizontal que muestra:
- La edad actual (cursor que avanza)
- Las decisiones marcadas como iconos en su posición temporal
- La etapa de vida actual (20s, 30s, etc.)

### 4.3 Panel financiero

En la parte inferior:
- Patrimonio neto actual (número grande)
- Barra de progreso hacia los 3 umbrales
- Ingresos pasivos mensuales

### 4.4 Eventos emergentes

Cuando ocurre una decisión clave:
- Pop-up temporal (2 segundos) con:
  - Icono de la decisión
  - Nombre de la decisión
  - Impacto resumido

---

## 5. Flujo de animación (frame por frame)

```python
TOTAL_FRAMES = 1800  # 60s × 30fps

# Fase 1: Presentación
INTRO_FRAMES = 150   # 5 segundos

# Fase 2: Simulación animada
SIM_FRAMES = 1200    # 40 segundos
# Cada frame de simulación = ~1 mes de vida simulada
# 1200 frames / 12 meses = ~100 frames por año
# Para 46 años (24-70): 1200 / 46 ≈ 26 frames por año ≈ 2 frames por mes

# Fase 3: Comparación
COMPARE_FRAMES = 300  # 10 segundos

# Fase 4: Cierre
OUTRO_FRAMES = 150    # 5 segundos

def animate(frame):
    if frame < INTRO_FRAMES:
        render_intro(frame)
    elif frame < INTRO_FRAMES + SIM_FRAMES:
        sim_frame = frame - INTRO_FRAMES
        mes = int(sim_frame * meses_totales / SIM_FRAMES)
        render_simulacion(mes)
    elif frame < INTRO_FRAMES + SIM_FRAMES + COMPARE_FRAMES:
        render_comparacion(frame)
    else:
        render_cierre(frame)
```

---

## 6. Visualización alternativa: 8 líneas de tiempo

Además del radar chart, se puede usar una visualización de líneas apiladas:

```
┌─────────────────────────────┐
│ Edad    20    30    40    50│
│ 📈 ═══════════════════════  │ Crecimiento
│ 💚 ═══════════════════════  │ Bienestar
│ 👨‍👩‍👧 ═══════════════════════  │ Familia
│ 🔥 ═══════════════════════  │ Trabajo
│ 💰 ═══════════════════════  │ Dinero
│ 🤝 ═══════════════════════  │ Comunidad
│ 🌍 ═══════════════════════  │ Aventura
│ 🙏 ═══════════════════════  │ Servicio
│                             │
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │
│ Patrimonio: ₡XXM            │
│ 🛡️⬜ ⚖️⬜ 🚀⬜              │
└─────────────────────────────┘
```

Cada línea muestra el valor 0-100 de esa riqueza a lo largo del tiempo. Las decisiones se marcan como puntos verticales en todas las líneas.

---

## 7. Datos a mostrar en pantalla

### Siempre visible:
- Edad actual
- Radar chart o líneas
- Patrimonio neto
- Barras de umbral financiero

### Al ocurrir una decisión:
- Nombre de la decisión
- Icono
- Impacto resumido (2-3 segundos)

### En la comparación final:
- Dos perfiles lado a lado
- Riqueza total de cada uno
- Patrimonio de cada uno
- Mensaje de insight

---

## 8. Implementación técnica

```python
# Herramientas
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import numpy as np

# Crear figura vertical (9:16)
fig = plt.figure(figsize=(10.8, 19.2), dpi=100)

# Layout:
# [0.92-0.95] Título
# [0.85-0.90] Línea de tiempo / Edad
# [0.30-0.82] Radar chart (área principal)
# [0.20-0.28] Panel financiero
# [0.05-0.18] Datos numéricos / Mensaje

# Radar chart usando polar axes
ax_radar = fig.add_subplot(111, polar=True)

# Animación
ani = animation.FuncAnimation(fig, animate, frames=TOTAL_FRAMES,
                              init_func=init, blit=False,
                              interval=1000/30)

# Guardar
writer = animation.FFMpegWriter(fps=30, codec='h264',
                                extra_args=['-pix_fmt', 'yuv420p'])
ani.save('simulacion_riquezas.mp4', writer=writer, dpi=100)
```

---

## 9. Variantes de video

### Video 1: "Tu vida simulada" (personalizado)
- Usa los inputs del usuario
- Muestra SU trayectoria específica
- Revela cuándo alcanza cada umbral financiero

### Video 2: "4 vidas, 4 caminos" (comparativo)
- Simula los 4 perfiles ejemplo
- Los 4 radar charts animados simultáneamente
- Revela cuál tiene mayor riqueza total al final
- Mensaje: "El éxito no es unidimensional"

### Video 3: "El costo de oportunidad" (educativo)
- Toma UNA decisión (ej: comprar casa a los 25 vs 35)
- Simula las dos vidas en paralelo
- Muestra cómo impacta las 8 riquezas
- Estilo similar al video de costo de oportunidad ya existente
