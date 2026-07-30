from config.constants import NivelRiesgo


def calcular_imc(peso: float, altura: float) -> float:
    if altura <= 0:
        return 0
    return round(peso / (altura ** 2), 2)


def calcular_carga_maxima_recomendada(
    peso: float,
    altura: float,
    edad: int,
    nivel_actividad: str,
    ejercicio_tipo: str = 'compuesto',
) -> dict:
    imc = calcular_imc(peso, altura)

    factor_edad = _factor_por_edad(edad)
    factor_nivel = _factor_por_nivel(nivel_actividad)
    factor_tipo = 1.0 if ejercicio_tipo == 'compuesto' else 0.7

    carga_max_teorica = peso * 2.0 * factor_edad * factor_nivel * factor_tipo

    return {
        'imc': imc,
        'carga_max_kg': round(carga_max_teorica, 2),
        'factor_edad': factor_edad,
        'factor_nivel': factor_nivel,
        'factor_tipo': factor_tipo,
    }


def _factor_por_edad(edad: int) -> float:
    if edad < 18:
        return 0.5
    elif edad < 30:
        return 1.0
    elif edad < 40:
        return 0.9
    elif edad < 50:
        return 0.8
    elif edad < 60:
        return 0.65
    elif edad < 70:
        return 0.5
    else:
        return 0.35


def _factor_por_nivel(nivel_actividad: str) -> float:
    factores = {
        'sedentario': 0.4,
        'ligero': 0.6,
        'moderado': 0.8,
        'activo': 0.95,
        'muy_activo': 1.0,
    }
    return factores.get(nivel_actividad, 0.7)


def validar_carga_ejercicio(
    carga_sugerida: float,
    peso: float,
    altura: float,
    edad: int,
    nivel_actividad: str,
    ejercicio_tipo: str = 'compuesto',
) -> dict:
    limites = calcular_carga_maxima_recomendada(
        peso, altura, edad, nivel_actividad, ejercicio_tipo
    )

    carga_max = limites['carga_max_kg']
    ratio = carga_sugerida / carga_max if carga_max > 0 else 0

    if ratio > 1.0:
        nivel = NivelRiesgo.CRITICAL
        mensaje = f'Carga {carga_sugerida}kg excede el máximo seguro de {carga_max:.1f}kg'
    elif ratio > 0.85:
        nivel = NivelRiesgo.HIGH
        mensaje = f'Carga {carga_sugerida}kg cerca del límite máximo ({carga_max:.1f}kg)'
    elif ratio > 0.70:
        nivel = NivelRiesgo.MEDIUM
        mensaje = f'Carga {carga_sugerida}kg dentro del rango aceptable'
    elif ratio > 0.40:
        nivel = NivelRiesgo.LOW
        mensaje = f'Carga {carga_sugerida}kg es conservadora'
    else:
        nivel = NivelRiesgo.SAFE
        mensaje = f'Carga {carga_sugerida}kg es ligera y segura'

    return {
        'carga_sugerida': carga_sugerida,
        'carga_max_segura': carga_max,
        'ratio_carga': round(ratio, 3),
        'nivel_riesgo': nivel,
        'mensaje': mensaje,
        'aprobar': nivel not in (NivelRiesgo.CRITICAL,),
    }


def estimar_1rm_repeticiones(carga_kg: float, repeticiones: int) -> float:
    if repeticiones <= 0 or carga_kg <= 0:
        return 0
    if repeticiones == 1:
        return carga_kg
    factor = 1 + (repeticiones * 0.0333)
    return round(carga_kg * factor, 2)


def calcular_carga_por_objetivo(
    estimated_1rm: float,
    objetivo: str,
) -> dict:
    rangos = {
        'perdida_peso': {'min': 0.40, 'max': 0.60},
        'ganancia_muscular': {'min': 0.65, 'max': 0.80},
        'mantenimiento': {'min': 0.55, 'max': 0.75},
        'rendimiento': {'min': 0.80, 'max': 0.95},
        'rehabilitacion': {'min': 0.30, 'max': 0.50},
    }

    rango = rangos.get(objetivo, rangos['mantenimiento'])
    carga_min = round(estimated_1rm * rango['min'], 1)
    carga_max = round(estimated_1rm * rango['max'], 1)
    carga_sugerida = round((carga_min + carga_max) / 2, 1)

    return {
        'estimated_1rm': estimated_1rm,
        'rango_porcentaje': f"{rango['min']*100:.0f}%-{rango['max']*100:.0f}%",
        'carga_min_kg': carga_min,
        'carga_max_kg': carga_max,
        'carga_sugerida_kg': carga_sugerida,
    }
