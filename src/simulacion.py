"""
🏆 Simulador de las 8 Formas de Riqueza — Modelo Robin Sharma
================================================================
Simula cómo las decisiones de vida impactan las 8 formas de riqueza
a lo largo de 50+ años, y genera una animación tipo Instagram Reel.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import FancyBboxPatch
from math import pi, log
import os

# ==========================================
# 1. CONFIGURACIÓN DEL PERFIL
# ==========================================

PERFIL = {
    'nombre': 'María',
    'edad_actual': 22,
    'edad_fin': 68,
    'moneda': '₡',

    # Financiero
    'ingreso_mensual_base': 500_000,
    'patrimonio_inicial': 2_000_000,
    'gastos_basicos_mensuales': 350_000,
    'gastos_estilo_actual': 650_000,
    'gastos_estilo_ideal': 1_800_000,

    # Educación
    'educacion_formal': 60,  # universidad = 60
    'estudiar_hasta_edad': 22,
    'estudiar_posgrado': True,
    'edad_posgrado': 27,
    'duracion_posgrado_meses': 24,
    'costo_posgrado_mensual': 250_000,

    # Vivienda
    'desea_casa': True,
    'edad_compra_casa': 32,
    'precio_casa': 55_000_000,
    'prima_casa_pct': 0.10,
    'tasa_hipoteca_anual': 0.09,
    'plazo_hipoteca_años': 30,
    'tasa_apreciacion_inmueble': 0.03,

    # Transporte
    'desea_carro': True,
    'edad_compra_carro': 26,
    'precio_carro': 12_000_000,
    'tasa_prestamo_carro': 0.10,
    'plazo_carro_años': 5,
    'costo_mantenimiento_carro_mensual': 120_000,

    # Familia
    'desea_hijos': True,
    'edades_hijos': [30, 33],
    'costo_base_hijo_mensual': 180_000,
    'años_dependencia_hijo': 22,

    # Aventura
    'viajes': [
        {'destino': 'Europa', 'costo': 2_500_000, 'edad': 25, 'impacto': 20},
        {'destino': 'Asia', 'costo': 2_000_000, 'edad': 29, 'impacto': 18},
        {'destino': 'Patagonia', 'costo': 1_200_000, 'edad': 38, 'impacto': 15},
        {'destino': 'Japón', 'costo': 2_800_000, 'edad': 50, 'impacto': 16},
    ],

    # Carrera
    'tipo_carrera': 'mixto',  # empleo hasta 34, emprendimiento después
    'edad_emprendimiento': 34,
    'inversion_emprendimiento': 5_000_000,
    'crecimiento_salarial_anual': 0.06,

    # Inversión
    'rendimientos': {
        'acciones': 0.10, 'bonos': 0.05,
        'bienes_raices': 0.07, 'efectivo': 0.02,
    },
    'cartera_por_etapa': {
        '20s': {'acciones': 0.80, 'bonos': 0.10, 'bienes_raices': 0.05, 'efectivo': 0.05},
        '30s': {'acciones': 0.60, 'bonos': 0.20, 'bienes_raices': 0.15, 'efectivo': 0.05},
        '40s': {'acciones': 0.50, 'bonos': 0.25, 'bienes_raices': 0.20, 'efectivo': 0.05},
        '50s': {'acciones': 0.35, 'bonos': 0.35, 'bienes_raices': 0.20, 'efectivo': 0.10},
        '60s': {'acciones': 0.25, 'bonos': 0.40, 'bienes_raices': 0.20, 'efectivo': 0.15},
    },

    # Prioridades de tiempo (% de 112h/semana)
    'prioridades_por_etapa': {
        '20s': {'crecimiento': 25, 'bienestar': 10, 'familia': 5, 'trabajo': 30,
                'dinero': 5, 'comunidad': 10, 'aventura': 12, 'servicio': 3},
        '30s': {'crecimiento': 10, 'bienestar': 12, 'familia': 25, 'trabajo': 25,
                'dinero': 10, 'comunidad': 8, 'aventura': 5, 'servicio': 5},
        '40s': {'crecimiento': 10, 'bienestar': 18, 'familia': 20, 'trabajo': 20,
                'dinero': 8, 'comunidad': 8, 'aventura': 6, 'servicio': 10},
        '50s': {'crecimiento': 8, 'bienestar': 20, 'familia': 18, 'trabajo': 15,
                'dinero': 5, 'comunidad': 10, 'aventura': 9, 'servicio': 15},
        '60s': {'crecimiento': 8, 'bienestar': 22, 'familia': 20, 'trabajo': 5,
                'dinero': 3, 'comunidad': 12, 'aventura': 10, 'servicio': 20},
    },

    # Supuestos
    'inflacion_anual': 0.04,
    'tasa_retiro_segura': 0.04,
    'depreciacion_carro': 0.15,
}

# ==========================================
# 2. CONSTANTES DEL MODELO
# ==========================================

RIQUEZAS = ['crecimiento', 'bienestar', 'familia', 'trabajo',
            'dinero', 'comunidad', 'aventura', 'servicio']

RIQUEZA_LABELS = {
    'crecimiento': '📈 Crecimiento',
    'bienestar': '💚 Bienestar',
    'familia': '👨‍👩‍👧 Familia',
    'trabajo': '🔥 Trabajo',
    'dinero': '💰 Dinero',
    'comunidad': '🤝 Comunidad',
    'aventura': '🌍 Aventura',
    'servicio': '🙏 Servicio',
}

# Factores de crecimiento por riqueza (k en k × ln(1 + horas))
K_CRECIMIENTO = {
    'crecimiento': 0.6, 'bienestar': 0.7, 'familia': 0.6, 'trabajo': 0.5,
    'dinero': 0.3, 'comunidad': 0.5, 'aventura': 0.8, 'servicio': 0.6,
}

# Umbral mínimo de horas/semana para no decaer
UMBRAL_MINIMO = {
    'crecimiento': 3, 'bienestar': 5, 'familia': 5, 'trabajo': 15,
    'dinero': 1, 'comunidad': 2, 'aventura': 0, 'servicio': 0,
}

# Tasa de decaimiento mensual si horas < umbral
TASA_DECAIMIENTO = {
    'crecimiento': 0.4, 'bienestar': 1.5, 'familia': 0.8, 'trabajo': 0.3,
    'dinero': 0.0, 'comunidad': 1.0, 'aventura': 0.0, 'servicio': 0.0,
}

# Matriz de transferencia (fila transfiere a columna)
TRANSFERENCIA = np.array([
    # Crec  Bien  Fam   Trab  Din   Com   Aven  Serv
    [0.0,   0.0,  0.0,  0.25, 0.15, 0.0,  0.0,  0.0],   # Crecimiento →
    [0.0,   0.0,  0.0,  0.25, 0.15, 0.0,  0.0,  0.0],   # Bienestar →
    [0.0,   0.15, 0.0,  0.0,  0.0,  0.0,  0.0,  0.0],   # Familia →
    [0.15,  0.0,  0.0,  0.0,  0.35, 0.08, 0.0,  0.0],   # Trabajo →
    [0.08,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],   # Dinero →
    [0.15,  0.08, 0.0,  0.15, 0.0,  0.0,  0.08, 0.08],  # Comunidad →
    [0.15,  0.0,  0.0,  0.0,  0.0,  0.08, 0.0,  0.0],   # Aventura →
    [0.0,   0.15, 0.0,  0.0,  0.0,  0.08, 0.0,  0.0],   # Servicio →
])

# Pesos para índice de riqueza total
PESOS_RIQUEZA = {
    'crecimiento': 0.12, 'bienestar': 0.18, 'familia': 0.18, 'trabajo': 0.12,
    'dinero': 0.12, 'comunidad': 0.10, 'aventura': 0.08, 'servicio': 0.10,
}


# ==========================================
# 3. MOTOR DE SIMULACIÓN
# ==========================================

def get_etapa(edad):
    if edad < 30: return '20s'
    if edad < 40: return '30s'
    if edad < 50: return '40s'
    if edad < 60: return '50s'
    return '60s'


def calcular_rendimiento_ponderado_mensual(cartera, rendimientos):
    r_anual = sum(cartera[k] * rendimientos[k] for k in cartera)
    return r_anual / 12


def calcular_cuota_mensual(monto, tasa_anual, plazo_años):
    r = tasa_anual / 12
    n = plazo_años * 12
    if r == 0:
        return monto / n
    return monto * (r * (1 + r)**n) / ((1 + r)**n - 1)


def costo_hijo_mensual(edad_hijo, costo_base):
    """Costo mensual de un hijo según su edad."""
    if edad_hijo < 0:
        return 0
    if edad_hijo <= 5:
        return costo_base * 1.0
    if edad_hijo <= 12:
        return costo_base * 1.3
    if edad_hijo <= 18:
        return costo_base * 1.8
    if edad_hijo <= 22:
        return costo_base * 2.5
    return 0


def simular(perfil):
    """Ejecuta la simulación mes a mes y retorna la historia completa."""

    p = perfil
    edad_inicio = p['edad_actual']
    edad_fin = p['edad_fin']
    meses_total = (edad_fin - edad_inicio) * 12

    # --- Estado inicial ---
    riquezas = {
        'crecimiento': 40.0,
        'bienestar': 80.0,
        'familia': 50.0,
        'trabajo': 30.0,
        'dinero': 10.0,
        'comunidad': 45.0,
        'aventura': 15.0,
        'servicio': 10.0,
    }

    # Ajustar crecimiento por educación
    riquezas['crecimiento'] = min(100, 20 + p['educacion_formal'] * 0.5)

    # Financiero
    cartera_inversion = p['patrimonio_inicial'] * 0.7
    fondo_emergencia = p['patrimonio_inicial'] * 0.3
    valor_inmueble = 0.0
    saldo_hipoteca = 0.0
    cuota_hipoteca = 0.0
    valor_carro = 0.0
    saldo_prestamo_carro = 0.0
    cuota_carro = 0.0
    años_experiencia = 0
    estudiando_posgrado = False
    meses_posgrado_restantes = 0
    emprendiendo = False
    años_emprendimiento = 0
    hijos = []  # lista de edades de nacimiento (edad del padre)

    # Decisiones activadas
    tiene_casa = False
    tiene_carro = False

    # --- Historia ---
    historia = {
        'meses': [],
        'edades': [],
        'etapas': [],
        'riquezas': {r: [] for r in RIQUEZAS},
        'riqueza_total': [],
        'patrimonio_neto': [],
        'cartera_inversion': [],
        'ingresos_pasivos': [],
        'ingresos_laborales': [],
        'flujo_caja': [],
        'eventos': [],  # (mes, icono, texto)
        'seguridad_financiera': None,
        'independencia_financiera': None,
        'libertad_financiera': None,
    }

    meta_libertad = p['gastos_estilo_ideal'] * 12 / p['tasa_retiro_segura']

    for mes in range(meses_total):
        edad = edad_inicio + mes / 12.0
        edad_int = int(edad)
        etapa = get_etapa(edad)
        mes_del_año = mes % 12

        # === EVENTOS / DECISIONES ===

        # Posgrado
        if p['estudiar_posgrado'] and edad_int == p['edad_posgrado'] and mes_del_año == 0:
            estudiando_posgrado = True
            meses_posgrado_restantes = p['duracion_posgrado_meses']
            historia['eventos'].append((mes, '🎓', f'Inicia maestría'))

        if estudiando_posgrado:
            meses_posgrado_restantes -= 1
            if meses_posgrado_restantes <= 0:
                estudiando_posgrado = False
                p['educacion_formal'] = 85  # maestría
                riquezas['crecimiento'] = min(100, riquezas['crecimiento'] + 15)
                historia['eventos'].append((mes, '🎓', f'Termina maestría'))

        # Casa
        if p['desea_casa'] and not tiene_casa and edad_int == p['edad_compra_casa'] and mes_del_año == 0:
            tiene_casa = True
            prima = p['precio_casa'] * p['prima_casa_pct']
            monto_hipoteca = p['precio_casa'] - prima
            saldo_hipoteca = monto_hipoteca
            cuota_hipoteca = calcular_cuota_mensual(monto_hipoteca, p['tasa_hipoteca_anual'], p['plazo_hipoteca_años'])
            valor_inmueble = p['precio_casa']
            cartera_inversion -= min(prima, cartera_inversion)
            historia['eventos'].append((mes, '🏠', f'Compra casa ₡{p["precio_casa"]/1e6:.0f}M'))

        # Carro
        if p['desea_carro'] and not tiene_carro and edad_int == p['edad_compra_carro'] and mes_del_año == 0:
            tiene_carro = True
            valor_carro = p['precio_carro']
            saldo_prestamo_carro = p['precio_carro']
            cuota_carro = calcular_cuota_mensual(p['precio_carro'], p['tasa_prestamo_carro'], p['plazo_carro_años'])
            historia['eventos'].append((mes, '🚗', f'Compra carro ₡{p["precio_carro"]/1e6:.0f}M'))

        # Hijos
        for edad_hijo_nacimiento in p.get('edades_hijos', []):
            if edad_int == edad_hijo_nacimiento and mes_del_año == 0:
                hijos.append(edad)
                riquezas['familia'] = min(100, riquezas['familia'] + 15)
                historia['eventos'].append((mes, '👶', f'Nace hijo #{len(hijos)}'))

        # Viajes
        for viaje in p.get('viajes', []):
            if edad_int == viaje['edad'] and mes_del_año == 6:  # a mitad de año
                cartera_inversion -= min(viaje['costo'], cartera_inversion)
                riquezas['aventura'] = min(100, riquezas['aventura'] + viaje['impacto'])
                riquezas['crecimiento'] = min(100, riquezas['crecimiento'] + viaje['impacto'] * 0.3)
                riquezas['comunidad'] = min(100, riquezas['comunidad'] + viaje['impacto'] * 0.2)
                historia['eventos'].append((mes, '✈️', f'Viaje: {viaje["destino"]}'))

        # Emprendimiento
        if p['tipo_carrera'] == 'mixto' and edad_int == p['edad_emprendimiento'] and mes_del_año == 0:
            emprendiendo = True
            años_emprendimiento = 0
            cartera_inversion -= min(p['inversion_emprendimiento'], cartera_inversion)
            historia['eventos'].append((mes, '🚀', 'Emprende negocio'))

        if emprendiendo:
            años_emprendimiento = (edad - p['edad_emprendimiento'])

        # === DISTRIBUCIÓN DEL TIEMPO ===
        prioridades = dict(p['prioridades_por_etapa'][etapa])

        # Ajustar por hijos menores
        hijos_menores = sum(1 for h_edad in hijos if (edad - h_edad) < 6)
        if hijos_menores > 0:
            extra_familia = 12 * hijos_menores
            prioridades['familia'] += extra_familia
            for k in ['aventura', 'crecimiento', 'comunidad', 'servicio']:
                prioridades[k] = max(1, prioridades[k] - extra_familia / 4)

        # Ajustar por emprendimiento
        if emprendiendo and años_emprendimiento < 5:
            prioridades['trabajo'] += 10
            for k in ['bienestar', 'aventura', 'comunidad']:
                prioridades[k] = max(1, prioridades[k] - 3)

        # Ajustar por posgrado
        if estudiando_posgrado:
            prioridades['crecimiento'] += 12
            for k in ['aventura', 'comunidad', 'familia']:
                prioridades[k] = max(1, prioridades[k] - 4)

        # Normalizar a 112h
        total_prio = sum(prioridades.values())
        horas = {k: v / total_prio * 112 for k, v in prioridades.items()}

        # === ACTUALIZAR RIQUEZAS ===
        multiplicador_energia = max(0.3, riquezas['bienestar'] / 75.0)

        # Bienestar: continuous linear interpolation (no steps)
        # Ceiling: 100 at age 25, drops 1 point/year, min 50 at age 75+
        techo_bienestar = max(50, min(100, 100 - max(0, edad - 25)))
        # Decay: 0 until 30, then grows linearly at 0.005 per year beyond 30
        decay_edad = 0 if edad <= 30 else 0.005 * (edad - 30)
        riquezas['bienestar'] -= decay_edad
        riquezas['bienestar'] = min(riquezas['bienestar'], techo_bienestar)

        # Crecimiento: obsolescencia (olvido + depreciación del conocimiento)
        h_crec = horas.get('crecimiento', 0)
        obsol_crec = 0.15  # base: ~1.8%/año
        if h_crec < 5: obsol_crec += 0.10
        if h_crec < 3: obsol_crec += 0.15
        if edad > 55: obsol_crec += 0.003 * (edad - 55)
        riquezas['crecimiento'] -= obsol_crec
        techo_crec = 100 if edad <= 55 else max(70, 100 - (edad - 55) * 1.2)
        riquezas['crecimiento'] = min(riquezas['crecimiento'], techo_crec)

        for i, r in enumerate(RIQUEZAS):
            if r == 'dinero':
                continue  # dinero se maneja aparte (financiero)

            # Crecimiento logarítmico por horas dedicadas
            h = horas.get(r, 0)
            delta = K_CRECIMIENTO[r] * log(1 + h) * multiplicador_energia * 0.08

            # Transferencia de otras riquezas
            for j, r2 in enumerate(RIQUEZAS):
                if j != i and TRANSFERENCIA[j][i] > 0:
                    delta += riquezas[r2] * TRANSFERENCIA[j][i] * 0.0008

            # Decaimiento si bajo el umbral
            if h < UMBRAL_MINIMO[r]:
                delta -= TASA_DECAIMIENTO[r] * 0.25

            riquezas[r] = max(0, min(100, riquezas[r] + delta))

        # === FINANZAS ===

        # Multiplicador de conocimiento
        mult_conocimiento = 1.0 + p['educacion_formal'] * 0.01
        mult_experiencia = 1.0 + min(años_experiencia * 0.025, 0.8)

        # Ingresos laborales
        if estudiando_posgrado and edad < p['edad_posgrado'] + 2:
            ingreso_laboral = p['ingreso_mensual_base'] * 0.5  # medio tiempo
        elif emprendiendo:
            if años_emprendimiento < 1:
                ingreso_laboral = 0  # sin ingresos el primer año
            elif años_emprendimiento < 3:
                ingreso_laboral = p['ingreso_mensual_base'] * 0.8 * mult_conocimiento
            else:
                # Emprendimiento exitoso crece
                factor_exito = min(3.0, 1.0 + años_emprendimiento * 0.25)
                ingreso_laboral = p['ingreso_mensual_base'] * mult_conocimiento * mult_experiencia * factor_exito * multiplicador_energia
        else:
            ingreso_laboral = (p['ingreso_mensual_base']
                               * (1 + p['crecimiento_salarial_anual'])**(años_experiencia)
                               * mult_conocimiento * multiplicador_energia * 0.5)

        if not estudiando_posgrado or True:
            años_experiencia += 1/12

        # Ingresos pasivos
        ingresos_pasivos = max(0, cartera_inversion) * p['tasa_retiro_segura'] / 12

        ingresos_totales = ingreso_laboral + ingresos_pasivos

        # Gastos
        gastos_fijos = p['gastos_basicos_mensuales'] * 0.6
        if tiene_casa:
            gastos_fijos += cuota_hipoteca
        else:
            gastos_fijos += 200_000  # alquiler

        gastos_carro = 0
        if tiene_carro:
            if saldo_prestamo_carro > 0:
                gastos_carro = cuota_carro + p['costo_mantenimiento_carro_mensual']
            else:
                gastos_carro = p['costo_mantenimiento_carro_mensual']

        gastos_hijos = 0
        for h_nacimiento in hijos:
            edad_h = edad - h_nacimiento
            gastos_hijos += costo_hijo_mensual(edad_h, p['costo_base_hijo_mensual'])

        gasto_posgrado = p['costo_posgrado_mensual'] if estudiando_posgrado else 0

        gastos_variables = p['gastos_basicos_mensuales'] * 0.4

        gastos_totales = gastos_fijos + gastos_carro + gastos_hijos + gasto_posgrado + gastos_variables

        flujo_caja = ingresos_totales - gastos_totales

        # Invertir o usar fondo
        meta_emergencia = p['gastos_estilo_actual'] * 6
        if flujo_caja > 0:
            if fondo_emergencia < meta_emergencia:
                aporte_emergencia = min(flujo_caja * 0.3, meta_emergencia - fondo_emergencia)
                fondo_emergencia += aporte_emergencia
                flujo_caja -= aporte_emergencia
            cartera_inversion += max(0, flujo_caja)
        else:
            deficit = -flujo_caja
            if fondo_emergencia >= deficit:
                fondo_emergencia -= deficit
            else:
                fondo_emergencia = 0
                cartera_inversion -= (deficit - fondo_emergencia)

        # Crecimiento de cartera
        cartera_actual = p['cartera_por_etapa'][etapa]
        rend_mensual = calcular_rendimiento_ponderado_mensual(cartera_actual, p['rendimientos'])
        cartera_inversion *= (1 + rend_mensual)
        cartera_inversion = max(0, cartera_inversion)

        # Inmueble
        if tiene_casa:
            valor_inmueble *= (1 + p['tasa_apreciacion_inmueble'] / 12)
            if saldo_hipoteca > 0:
                interes_hip = saldo_hipoteca * p['tasa_hipoteca_anual'] / 12
                capital_hip = cuota_hipoteca - interes_hip
                capital_hip = min(capital_hip, saldo_hipoteca)
                saldo_hipoteca = max(0, saldo_hipoteca - capital_hip)

        # Carro
        if tiene_carro:
            valor_carro *= (1 - p['depreciacion_carro'] / 12)
            if saldo_prestamo_carro > 0:
                interes_carro = saldo_prestamo_carro * p['tasa_prestamo_carro'] / 12
                capital_carro = cuota_carro - interes_carro
                capital_carro = min(capital_carro, saldo_prestamo_carro)
                saldo_prestamo_carro = max(0, saldo_prestamo_carro - capital_carro)

        # Patrimonio neto
        patrimonio_neto = (cartera_inversion + fondo_emergencia + valor_inmueble + valor_carro
                          - saldo_hipoteca - saldo_prestamo_carro)

        # Normalizar dinero (0-100)
        riquezas['dinero'] = min(100, max(0, patrimonio_neto / meta_libertad * 100))

        # Umbrales
        ip_mensual = max(0, cartera_inversion) * p['tasa_retiro_segura'] / 12
        if historia['seguridad_financiera'] is None and ip_mensual >= p['gastos_basicos_mensuales']:
            historia['seguridad_financiera'] = edad
            historia['eventos'].append((mes, '🛡️', 'Seguridad financiera'))
        if historia['independencia_financiera'] is None and ip_mensual >= p['gastos_estilo_actual']:
            historia['independencia_financiera'] = edad
            historia['eventos'].append((mes, '⚖️', 'Independencia financiera'))
        if historia['libertad_financiera'] is None and ip_mensual >= p['gastos_estilo_ideal']:
            historia['libertad_financiera'] = edad
            historia['eventos'].append((mes, '🚀', 'Libertad financiera'))

        # Riqueza total
        riqueza_total = sum(riquezas[r] * PESOS_RIQUEZA[r] for r in RIQUEZAS)

        # === REGISTRAR ===
        historia['meses'].append(mes)
        historia['edades'].append(edad)
        historia['etapas'].append(etapa)
        for r in RIQUEZAS:
            historia['riquezas'][r].append(riquezas[r])
        historia['riqueza_total'].append(riqueza_total)
        historia['patrimonio_neto'].append(patrimonio_neto)
        historia['cartera_inversion'].append(cartera_inversion)
        historia['ingresos_pasivos'].append(ip_mensual)
        historia['ingresos_laborales'].append(ingreso_laboral)
        historia['flujo_caja'].append(flujo_caja)

    return historia


# ==========================================
# 4. VISUALIZACIÓN — REEL ANIMADO 9:16
# ==========================================

def generar_video(historia, perfil, output_file='simulacion_riquezas_reel.mp4'):
    """Genera un video animado tipo Instagram Reel (1080×1920)."""

    # Colores
    COLOR_BG = '#0f0f23'
    COLOR_AXES = '#1a1a3e'
    COLOR_TEXT = '#c8d6e5'
    COLOR_WHITE = '#ffffff'

    COLORES = {
        'crecimiento': '#00d2ff',
        'bienestar':   '#00ff88',
        'familia':     '#ff6b9d',
        'trabajo':     '#ffa500',
        'dinero':      '#ffd700',
        'comunidad':   '#9b59b6',
        'aventura':    '#e74c3c',
        'servicio':    '#1abc9c',
    }

    # Text labels instead of emojis (font compatibility)
    ICONOS = {
        'crecimiento': 'CREC', 'bienestar': 'BIEN', 'familia': 'FAM', 'trabajo': 'TRAB',
        'dinero': 'DIN', 'comunidad': 'COM', 'aventura': 'AVEN', 'servicio': 'SERV',
    }
    ICONOS_FULL = {
        'crecimiento': 'Crecimiento', 'bienestar': 'Bienestar', 'familia': 'Familia',
        'trabajo': 'Trabajo', 'dinero': 'Dinero', 'comunidad': 'Comunidad',
        'aventura': 'Aventura', 'servicio': 'Servicio',
    }

    # Config
    REEL_FPS = 30
    REEL_DURATION = 60
    TOTAL_FRAMES = REEL_FPS * REEL_DURATION
    INTRO_FRAMES = 120     # 4s intro
    SIM_FRAMES = 1260      # 42s simulación
    HOLD_FRAMES = 180      # 6s resultado final
    OUTRO_FRAMES = 240     # 8s cierre

    total_meses = len(historia['meses'])

    # Crear figura
    plt.style.use('dark_background')
    fig = plt.figure(figsize=(10.8, 19.2), dpi=100)
    fig.patch.set_facecolor(COLOR_BG)

    # --- Título ---
    title_text = fig.text(0.5, 0.94, 'Las 8 Formas de Riqueza',
                         fontsize=32, color=COLOR_WHITE, fontfamily='sans-serif',
                         fontweight='bold', ha='center', va='center', alpha=0)
    subtitle_text = fig.text(0.5, 0.91, '¿Cómo impactan tus decisiones de vida?',
                            fontsize=20, color=COLOR_TEXT, fontfamily='sans-serif',
                            fontweight='light', ha='center', va='center', alpha=0)
    credit_text = fig.text(0.5, 0.885, 'Modelo Robin Sharma',
                          fontsize=16, color='#555577', fontfamily='sans-serif',
                          ha='center', va='center', alpha=0)

    # --- Edad / Línea de tiempo ---
    edad_text = fig.text(0.5, 0.855, '', fontsize=24, color=COLOR_WHITE,
                        fontfamily='sans-serif', fontweight='bold', ha='center')

    # --- Radar Chart (polar axes) ---
    ax = fig.add_axes([0.08, 0.38, 0.84, 0.44], polar=True)
    ax.set_facecolor(COLOR_AXES)

    N = len(RIQUEZAS)
    angles = np.linspace(0, 2 * pi, N, endpoint=False).tolist()
    angles += angles[:1]  # cerrar el polígono

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels([f'{ICONOS[r]}' for r in RIQUEZAS],
                       fontsize=18, color=COLOR_TEXT)
    ax.set_ylim(0, 100)
    ax.set_yticks([25, 50, 75, 100])
    ax.set_yticklabels(['25', '50', '75', '100'], fontsize=10, color='#444466')
    ax.grid(True, color='#2a2a4a', linewidth=0.5, alpha=0.5)
    ax.spines['polar'].set_visible(False)

    # Línea del radar (se actualiza)
    radar_line, = ax.plot([], [], color='#00d2ff', linewidth=2.5, zorder=5)
    radar_glow, = ax.plot([], [], color='#00d2ff', linewidth=10, alpha=0.15, zorder=4)
    radar_fill_patches = []

    # Etiquetas de riqueza alrededor del radar
    label_texts = {}
    for i, r in enumerate(RIQUEZAS):
        angle = angles[i]
        label_texts[r] = ax.text(angle, 112, '', fontsize=11,
                                ha='center', va='center', color=COLORES[r],
                                fontweight='bold', fontfamily='sans-serif')

    # --- Panel financiero ---
    bbox_props = dict(boxstyle='round,pad=0.5', facecolor='#12122e',
                     edgecolor='#2a2a4a', alpha=0.9, linewidth=0.5)

    patrimonio_text = fig.text(0.5, 0.34, '', fontsize=22, color='#ffd700',
                              fontfamily='sans-serif', fontweight='bold',
                              ha='center', bbox=bbox_props)
    ingresos_text = fig.text(0.5, 0.30, '', fontsize=16, color='#00ff88',
                            fontfamily='sans-serif', ha='center', bbox=bbox_props)

    # Umbrales
    umbral_text = fig.text(0.5, 0.255, '', fontsize=16, color=COLOR_TEXT,
                          fontfamily='sans-serif', ha='center')

    # Riqueza total
    riqueza_total_text = fig.text(0.5, 0.215, '', fontsize=20, color=COLOR_WHITE,
                                 fontfamily='sans-serif', fontweight='bold', ha='center')

    # Evento
    evento_text = fig.text(0.5, 0.17, '', fontsize=20, color='#ffa500',
                          fontfamily='sans-serif', fontweight='bold', ha='center',
                          bbox=dict(boxstyle='round,pad=0.6', facecolor='#1a1a3e',
                                   edgecolor='#ffa500', alpha=0.95, linewidth=1.5))

    # 8 barras de riqueza en la parte inferior
    bar_texts = {}
    bar_y_start = 0.12
    bar_spacing = 0.012
    for i, r in enumerate(RIQUEZAS):
        y = bar_y_start - i * bar_spacing
        bar_texts[r] = fig.text(0.5, y, '', fontsize=10, color=COLORES[r],
                               fontfamily='sans-serif', ha='center')

    # Mensaje final
    final_text = fig.text(0.5, 0.50, '', fontsize=28, color=COLOR_WHITE,
                         fontfamily='sans-serif', fontweight='bold', ha='center',
                         va='center', alpha=0,
                         linespacing=1.8)
    final_sub = fig.text(0.5, 0.35, '', fontsize=20, color=COLOR_TEXT,
                        fontfamily='sans-serif', ha='center', va='center', alpha=0)

    # Cache de eventos cercanos
    evento_cache = {'ultimo_mes': -999, 'texto': ''}

    def init():
        radar_line.set_data([], [])
        radar_glow.set_data([], [])
        return []

    def animate(frame):
        # --- FASE 1: INTRO ---
        if frame < INTRO_FRAMES:
            progress = frame / INTRO_FRAMES
            title_text.set_alpha(min(1, progress * 2))
            subtitle_text.set_alpha(min(1, max(0, progress * 2 - 0.3)))
            credit_text.set_alpha(min(1, max(0, progress * 2 - 0.6)))
            # Ocultar todo lo demás
            edad_text.set_text('')
            patrimonio_text.set_text('')
            ingresos_text.set_text('')
            umbral_text.set_text('')
            riqueza_total_text.set_text('')
            evento_text.set_text('')
            for r in RIQUEZAS:
                bar_texts[r].set_text('')
                label_texts[r].set_text('')
            radar_line.set_data([], [])
            radar_glow.set_data([], [])
            for p in radar_fill_patches:
                p.remove()
            radar_fill_patches.clear()
            final_text.set_alpha(0)
            final_sub.set_alpha(0)
            return []

        # --- FASE 2: SIMULACIÓN ---
        elif frame < INTRO_FRAMES + SIM_FRAMES:
            sim_frame = frame - INTRO_FRAMES
            idx = min(int(sim_frame * total_meses / SIM_FRAMES), total_meses - 1)

            # Fade out intro
            title_text.set_alpha(max(0, 1 - (sim_frame / 30)))
            subtitle_text.set_alpha(max(0, 1 - (sim_frame / 30)))
            credit_text.set_alpha(max(0, 1 - (sim_frame / 30)))
            final_text.set_alpha(0)
            final_sub.set_alpha(0)

            # Datos actuales
            edad = historia['edades'][idx]
            valores = [historia['riquezas'][r][idx] for r in RIQUEZAS]
            valores_cerrado = valores + valores[:1]

            # Radar
            radar_line.set_data(angles, valores_cerrado)
            radar_glow.set_data(angles, valores_cerrado)

            for p in radar_fill_patches:
                p.remove()
            radar_fill_patches.clear()
            patches = ax.fill(angles, valores_cerrado, color='#00d2ff', alpha=0.10, zorder=2)
            radar_fill_patches.extend(patches)

            # Labels
            for i, r in enumerate(RIQUEZAS):
                v = historia['riquezas'][r][idx]
                label_texts[r].set_text(f'{v:.0f}')

            # Edad
            edad_text.set_text(f'Edad: {edad:.1f} años')

            # Financiero
            pn = historia['patrimonio_neto'][idx]
            ip = historia['ingresos_pasivos'][idx]
            prefix = '' if pn >= 0 else '-'
            patrimonio_text.set_text(f'  Patrimonio: {prefix}₡{abs(pn)/1e6:,.1f}M  ')
            ingresos_text.set_text(f'  Ingresos pasivos: ₡{ip/1e3:,.0f}K/mes  ')

            # Umbrales
            sf = '🛡️✅' if historia['seguridad_financiera'] and edad >= historia['seguridad_financiera'] else '🛡️⬜'
            iff = '⚖️✅' if historia['independencia_financiera'] and edad >= historia['independencia_financiera'] else '⚖️⬜'
            lf = '🚀✅' if historia['libertad_financiera'] and edad >= historia['libertad_financiera'] else '🚀⬜'
            umbral_text.set_text(f'{sf}  {iff}  {lf}')

            # Riqueza total
            rt = historia['riqueza_total'][idx]
            riqueza_total_text.set_text(f'Riqueza Total: {rt:.1f}/100')

            # Barras
            for i, r in enumerate(RIQUEZAS):
                v = historia['riquezas'][r][idx]
                bar_len = int(v / 5)
                bar = '█' * bar_len + '░' * (20 - bar_len)
                bar_texts[r].set_text(f'{ICONOS[r]} {bar} {v:.0f}')

            # Eventos
            evento_actual = ''
            for ev_mes, ev_icono, ev_texto in historia['eventos']:
                if abs(ev_mes - historia['meses'][idx]) < 8:
                    evento_actual = f'{ev_icono} {ev_texto}'
            evento_text.set_text(f'  {evento_actual}  ' if evento_actual else '')

            return []

        # --- FASE 3: HOLD / RESULTADO FINAL ---
        elif frame < INTRO_FRAMES + SIM_FRAMES + HOLD_FRAMES:
            # Mantener último frame de simulación
            idx = total_meses - 1
            edad = historia['edades'][idx]
            valores = [historia['riquezas'][r][idx] for r in RIQUEZAS]
            valores_cerrado = valores + valores[:1]

            radar_line.set_data(angles, valores_cerrado)
            radar_glow.set_data(angles, valores_cerrado)
            for p in radar_fill_patches:
                p.remove()
            radar_fill_patches.clear()
            patches = ax.fill(angles, valores_cerrado, color='#00d2ff', alpha=0.10, zorder=2)
            radar_fill_patches.extend(patches)

            for i, r in enumerate(RIQUEZAS):
                v = historia['riquezas'][r][idx]
                label_texts[r].set_text(f'{v:.0f}')

            edad_text.set_text(f'Edad: {edad:.1f} años -- RESULTADO FINAL')
            pn = historia['patrimonio_neto'][idx]
            patrimonio_text.set_text(f'  Patrimonio: ₡{pn/1e6:,.1f}M  ')
            ip = historia['ingresos_pasivos'][idx]
            ingresos_text.set_text(f'  Ingresos pasivos: ₡{ip/1e3:,.0f}K/mes  ')

            sf = '🛡️✅' if historia['seguridad_financiera'] else '🛡️❌'
            iff = '⚖️✅' if historia['independencia_financiera'] else '⚖️❌'
            lf = '🚀✅' if historia['libertad_financiera'] else '🚀❌'
            umbral_text.set_text(f'{sf}  {iff}  {lf}')

            rt = historia['riqueza_total'][idx]
            riqueza_total_text.set_text(f'✨ Riqueza Total Final: {rt:.1f}/100 ✨')

            for i, r in enumerate(RIQUEZAS):
                v = historia['riquezas'][r][idx]
                bar_len = int(v / 5)
                bar = '█' * bar_len + '░' * (20 - bar_len)
                bar_texts[r].set_text(f'{ICONOS[r]} {bar} {v:.0f}')

            evento_text.set_text('')
            title_text.set_alpha(0)
            subtitle_text.set_alpha(0)
            credit_text.set_alpha(0)
            final_text.set_alpha(0)
            final_sub.set_alpha(0)

            return []

        # --- FASE 4: CIERRE ---
        else:
            outro_frame = frame - (INTRO_FRAMES + SIM_FRAMES + HOLD_FRAMES)
            progress = min(1.0, outro_frame / 60)

            # Fade out radar y datos
            fade_out = max(0, 1 - progress * 2)
            edad_text.set_alpha(fade_out)
            patrimonio_text.set_alpha(fade_out)
            ingresos_text.set_alpha(fade_out)
            umbral_text.set_alpha(fade_out)
            riqueza_total_text.set_alpha(fade_out)
            for r in RIQUEZAS:
                bar_texts[r].set_alpha(fade_out)
                label_texts[r].set_alpha(fade_out)
            radar_line.set_alpha(fade_out)
            radar_glow.set_alpha(fade_out * 0.15)
            ax.patch.set_alpha(fade_out)

            # Fade in mensaje final
            fade_in = min(1, max(0, (progress - 0.3) * 2))
            final_text.set_text('"Las decisiones de hoy\nse componen\npor décadas"')
            final_text.set_alpha(fade_in)

            final_sub.set_text('¿Cómo quieres distribuir\ntu tiempo y tus recursos?')
            final_sub.set_alpha(min(1, max(0, (progress - 0.5) * 2)))

            return []

    # Generar animación
    print(f'Generando {TOTAL_FRAMES} frames a {REEL_FPS} fps ({REEL_DURATION}s)...')
    ani = animation.FuncAnimation(fig, animate, frames=TOTAL_FRAMES,
                                  init_func=init, blit=False,
                                  interval=1000/REEL_FPS)

    # Guardar
    print(f'Guardando {output_file}...')
    writer = animation.FFMpegWriter(fps=REEL_FPS, codec='h264',
                                     extra_args=['-pix_fmt', 'yuv420p',
                                                 '-preset', 'medium',
                                                 '-crf', '20'])
    ani.save(output_file, writer=writer, dpi=100)
    plt.close(fig)
    print(f'¡Listo! Archivo guardado: {output_file}')
    print(f'Resolución: 1080x1920px | Duración: {REEL_DURATION}s | FPS: {REEL_FPS}')


# ==========================================
# 5. MAIN
# ==========================================

if __name__ == '__main__':
    print('=' * 60)
    print('🏆 SIMULADOR DE LAS 8 FORMAS DE RIQUEZA')
    print('   Modelo Robin Sharma')
    print('=' * 60)

    # Ejecutar simulación
    print('\n📊 Ejecutando simulación...')
    historia = simular(PERFIL)

    # Resumen
    final_idx = len(historia['meses']) - 1
    print(f'\n📋 RESUMEN (de {PERFIL["edad_actual"]} a {PERFIL["edad_fin"]} años):')
    print(f'   Patrimonio neto final: ₡{historia["patrimonio_neto"][final_idx]/1e6:,.1f}M')
    print(f'   Ingresos pasivos: ₡{historia["ingresos_pasivos"][final_idx]/1e3:,.0f}K/mes')
    print(f'   Riqueza total: {historia["riqueza_total"][final_idx]:.1f}/100')
    print()
    for r in RIQUEZAS:
        v = historia['riquezas'][r][final_idx]
        print(f'   {RIQUEZA_LABELS[r]}: {v:.1f}/100')
    print()
    sf = historia['seguridad_financiera']
    iff = historia['independencia_financiera']
    lf = historia['libertad_financiera']
    print(f'   🛡️ Seguridad financiera: {"Edad " + f"{sf:.1f}" if sf else "No alcanzada"}')
    print(f'   ⚖️ Independencia financiera: {"Edad " + f"{iff:.1f}" if iff else "No alcanzada"}')
    print(f'   🚀 Libertad financiera: {"Edad " + f"{lf:.1f}" if lf else "No alcanzada"}')
    print()
    print('   Eventos de vida:')
    for ev_mes, ev_icono, ev_texto in historia['eventos']:
        edad_ev = historia['edades'][min(ev_mes, final_idx)]
        print(f'     {ev_icono} Edad {edad_ev:.1f}: {ev_texto}')

    # Generar video
    print('\n🎬 Generando video animado...')
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                               'simulacion_riquezas_reel.mp4')
    generar_video(historia, PERFIL, output_path)
