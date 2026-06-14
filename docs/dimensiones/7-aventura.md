# 🌍 Dimensión 7: Aventura — Experiencias, Asombro y Vida Vivida

> *"No se trata de la cantidad de años en la vida, sino de la cantidad de vida en los años. Muchas personas viven el mismo año 80 veces y a eso le llaman vida."* — Robin Sharma

---

## 1. Variable principal: Índice de Riqueza en Aventura

La aventura mide la riqueza de experiencias vividas — viajes, descubrimientos, riesgos tomados, momentos de asombro.

```
aventura(t) = experiencias_acumuladas(t) × 0.40 + diversidad_experiencias(t) × 0.30 + asombro_reciente(t) × 0.30
```

Escala: 0-100, donde:
- 90-100: Vida extraordinariamente rica en experiencias, constante asombro
- 70-89: Buena diversidad de experiencias, viajes frecuentes
- 50-69: Algunas experiencias, pero rutina dominante
- 30-49: Vida mayormente rutinaria, pocas experiencias nuevas
- 0-29: "Vivir el mismo año 80 veces"

---

## 2. Característica única: Las experiencias son permanentes

A diferencia de otras riquezas que decaen sin mantenimiento, **las experiencias vividas son permanentes**. Un viaje a Europa a los 25 sigue siendo parte de tu riqueza a los 60.

```
experiencias_acumuladas(t) = experiencias_acumuladas(t-1) + nuevas_experiencias(t)
```

- No hay tasa de decaimiento (los recuerdos y el crecimiento personal son permanentes)
- Pero el **asombro reciente** sí decae — si no hay experiencias nuevas por mucho tiempo, la vida se siente estancada

```
asombro_reciente(t) = asombro_reciente(t-1) × 0.90 + nuevas_experiencias(t) × intensidad
```

- Decae 10% por mes sin experiencias nuevas
- Se restaura con cada nueva aventura

---

## 3. Tipos de experiencias

### 3.1 Viajes

Los viajes son la forma más tangible de aventura:

| Tipo de viaje | Costo estimado | Duración | Impacto en aventura | Impacto en otras riquezas |
|---------------|---------------|----------|---------------------|--------------------------|
| Local (fin de semana) | ₡50,000-200,000 | 2-3 días | +5 puntos | Bienestar +2 |
| Regional (país vecino) | ₡300,000-800,000 | 1 semana | +10 puntos | Crecimiento +3, Comunidad +2 |
| Continental | ₡1,000,000-2,000,000 | 2 semanas | +15 puntos | Crecimiento +5, Comunidad +3 |
| Intercontinental | ₡2,000,000-4,000,000 | 3-4 semanas | +20 puntos | Crecimiento +8, Comunidad +5 |
| Experiencia transformadora | ₡3,000,000-6,000,000 | 1-3 meses | +30 puntos | Crecimiento +15, todos +5 |

### 3.2 Experiencias no-viaje

La aventura no es solo viajar:

| Experiencia | Costo | Impacto | Ejemplo |
|------------|-------|---------|---------|
| Hobby nuevo | ₡50,000-300,000/mes | +3 puntos/mes | Surf, escalada, fotografía |
| Deporte extremo | ₡100,000-500,000 | +5 puntos | Paracaidismo, bungee |
| Aprender algo radicalmente nuevo | Tiempo | +5 puntos | Instrumento musical, idioma |
| Reto personal | Variable | +8 puntos | Maratón, ayuno largo, retiro silencioso |
| Mudarse de ciudad/país | Alto | +15 puntos | Cambio radical de entorno |
| Emprender | Alto (ver Trabajo) | +10 puntos | La aventura del emprendimiento |

### 3.3 Micro-aventuras

Robin Sharma habla de vivir con asombro. Las micro-aventuras son accesibles semanalmente:

| Micro-aventura | Costo | Impacto semanal |
|----------------|-------|----------------|
| Restaurante nuevo | ₡10,000-30,000 | +0.5 puntos |
| Ruta de senderismo nueva | ₡0-5,000 | +1 punto |
| Conversación con un desconocido | ₡0 | +0.3 puntos |
| Actividad cultural (museo, teatro) | ₡5,000-20,000 | +0.5 puntos |
| Cocinar algo que nunca cocinó | ₡5,000-15,000 | +0.3 puntos |

---

## 4. El timing de la aventura: ¿Cuándo viajar?

### La gran pregunta: ¿Viajar joven o viajar mayor?

| Viajar en los 20s | Viajar en los 30s | Viajar en los 40s+ |
|-------------------|-------------------|---------------------|
| ✅ Más energía y flexibilidad | ✅ Más dinero, mejor calidad | ✅ Máximo dinero, más apreciación |
| ✅ Menos responsabilidades | ✅ Viaja con pareja/hijos | ✅ Hijos más grandes o ya independientes |
| ✅ Forma carácter temprano | ⚠️ Menos tiempo (trabajo, hijos) | ⚠️ Menos energía física |
| ⚠️ Menos dinero | ⚠️ Más compromisos | ⚠️ Salud puede limitar actividades |
| ⚠️ Costo de oportunidad financiero | ⚠️ Hijos pequeños dificultan | ✅ Experiencia enriquece más |

**El costo de oportunidad de viajar en los 20s:**
```
Viaje de ₡3M a los 25:
  Costo real (sin invertir): ₡3M
  Costo de oportunidad (30 años al 10%): ₡52M de patrimonio perdido
  
Pero: La experiencia, el crecimiento personal y las conexiones
      pueden generar retornos imposibles de cuantificar.
```

**Recomendación del modelo:** No hay una respuesta correcta universal. Depende de las prioridades por etapa del usuario.

---

## 5. Viajes soñados del usuario

El modelo incluye una lista personalizada de viajes que el usuario quiere hacer:

```yaml
viajes_soñados:
  - destino: "Europa (mochilero)"
    costo: 3_000_000
    edad_ideal: 25
    duracion_semanas: 4
    impacto_aventura: 25
    impacto_crecimiento: 10
    
  - destino: "Asia sudeste"
    costo: 2_500_000
    edad_ideal: 28
    duracion_semanas: 3
    impacto_aventura: 20
    impacto_crecimiento: 12
    
  - destino: "Patagonia"
    costo: 1_500_000
    edad_ideal: 35
    duracion_semanas: 2
    impacto_aventura: 18
    impacto_crecimiento: 8
```

El simulador verifica:
1. ¿Tiene el dinero disponible a esa edad?
2. ¿Tiene el tiempo (considerando trabajo, hijos)?
3. ¿Tiene la salud/energía?
4. Si no puede en la edad ideal, ¿cuándo podría hacerlo y cómo cambia la experiencia?

---

## 6. La aventura y el anti-estancamiento

Robin Sharma critica vivir "el mismo año 80 veces". En el modelo, el estancamiento tiene un costo:

```
Si asombro_reciente < 20 por más de 12 meses:
  bienestar_mental -= 5
  satisfaccion_trabajo -= 5
  crecimiento -= 3
  comunidad -= 2
```

La falta de aventura no solo afecta la dimensión de aventura — erosiona silenciosamente Bienestar, Trabajo, Crecimiento y Comunidad.

---

## 7. Expandir límites: El riesgo como motor de aventura

> "La aventura implica asumir riesgos para expandir los límites personales."

**El modelo de zona de confort:**
```
zona_confort(t) = zona_confort(t-1) + experiencias_retadoras(t) × 0.1
```

- Cada experiencia fuera de la zona de confort la expande
- Una zona de confort más grande → más capacidad para las otras riquezas
- Emprender, hablar en público, viajar solo — todo expande la zona

---

## 8. Conexión con otras riquezas

| Riqueza | Cómo alimenta a la Aventura | Cómo la Aventura la alimenta |
|---------|----------------------------|------------------------------|
| 📈 Crecimiento | Más conocimiento → viajes más profundos | Experiencias → sabiduría, perspectiva global |
| 💚 Bienestar | Salud → capacidad para aventuras físicas | Aventura → endorfinas, vitalidad, propósito |
| 👨‍👩‍👧 Familia | Familia → aventuras compartidas, recuerdos | Aventura → vínculos familiares únicos |
| 🔥 Trabajo | Trabajo remoto → libertad geográfica | Aventura → creatividad, perspectiva laboral |
| 💰 Dinero | Dinero → acceso a más experiencias | Aventura tiene costo de oportunidad financiero |
| 🤝 Comunidad | Red → compañeros de viaje, planes | Aventura → conexiones internacionales |
| 🙏 Servicio | Servir → aventuras de voluntariado | Aventura → perspectiva que inspira a servir |

**La tensión principal:**
> La aventura compite con el Dinero (cuesta) y el Trabajo (requiere tiempo libre). Pero alimenta directamente al Crecimiento, Bienestar y Comunidad. El reto es encontrar formas de aventura accesibles en cada etapa de vida — no todo es un viaje intercontinental.
