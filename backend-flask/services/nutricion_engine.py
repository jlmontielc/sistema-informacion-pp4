import logging

logger = logging.getLogger(__name__)

MAPA_PROPOSITO_DIETA = {
    'perder_peso': {'ajuste_kcal': -0.20, 'proteina_g_kg': 2.2, 'pct_grasas': 0.30},
    'perdida_peso': {'ajuste_kcal': -0.20, 'proteina_g_kg': 2.2, 'pct_grasas': 0.30},
    'bajar_peso': {'ajuste_kcal': -0.20, 'proteina_g_kg': 2.2, 'pct_grasas': 0.30},
    'ganar_musculo': {'ajuste_kcal': 0.15, 'proteina_g_kg': 1.6, 'pct_grasas': 0.25},
    'ganancia_muscular': {'ajuste_kcal': 0.15, 'proteina_g_kg': 1.6, 'pct_grasas': 0.25},
    'mantener': {'ajuste_kcal': 0.0, 'proteina_g_kg': 1.8, 'pct_grasas': 0.27},
    'mantenimiento': {'ajuste_kcal': 0.0, 'proteina_g_kg': 1.8, 'pct_grasas': 0.27},
}


def normalizar_proposito(proposito_raw: str) -> str:
    if not proposito_raw:
        return 'mantener'
    normalizado = proposito_raw.strip().lower().replace(' ', '_')
    if normalizado in MAPA_PROPOSITO_DIETA:
        return normalizado
    return 'mantener'


def calcular_macros(gct: float, peso: float, proposito: str = 'mantener') -> dict:
    config = MAPA_PROPOSITO_DIETA.get(normalizar_proposito(proposito), MAPA_PROPOSITO_DIETA['mantener'])

    objetivo_calorico = round(gct * (1 + config['ajuste_kcal']))

    proteinas_gramos = round(config['proteina_g_kg'] * peso)

    kcal_proteinas = proteinas_gramos * 4

    kcal_grasas = round(objetivo_calorico * config['pct_grasas'])
    grasas_gramos = round(kcal_grasas / 9)

    kcal_carbos = objetivo_calorico - kcal_proteinas - kcal_grasas
    if kcal_carbos < 0:
        kcal_carbos = 0
    carbohidratos_gramos = round(kcal_carbos / 4)

    return {
        'objetivo_calorico': objetivo_calorico,
        'proteinas_gramos': proteinas_gramos,
        'carbohidratos_gramos': carbohidratos_gramos,
        'grasas_gramos': grasas_gramos,
    }


def guardian_dieta(datos: dict, tmb: float, gct: float, datos_medicos: dict = None) -> dict:
    alertas = []
    aprobado = True

    objetivo_calorico = datos.get('objetivo_calorico', gct)

    umbral_deficit = tmb * 1.05
    if objetivo_calorico < umbral_deficit:
        aprobado = False
        alertas.append({
            'tipo': 'deficit_peligroso',
            'nivel_riesgo': 'HIGH',
            'mensaje': (
                f'El objetivo calórico ({objetivo_calorico} kcal) está por debajo del '
                f'umbral mínimo seguro ({round(umbral_deficit)} kcal = TMB × 1.05). '
                'Esto representa un déficit calórico peligroso.'
            ),
        })

    if datos_medicos:
        alergias = datos_medicos.get('alergias', [])
        intolerancias = datos_medicos.get('intolerancias', [])
        condiciones = datos_medicos.get('condiciones', [])

        for alergia in alergias:
            alertas.append({
                'tipo': 'alergia_informativa',
                'nivel_riesgo': 'LOW',
                'mensaje': (
                    f'Alergia detectada: "{alergia}". '
                    'Nota: como la dieta son macros puros, esto es informativo. '
                    'El detalle de alimentos se maneja al crear el menú.'
                ),
            })

        for intolerancia in intolerancias:
            alertas.append({
                'tipo': 'intolerancia_informativa',
                'nivel_riesgo': 'LOW',
                'mensaje': (
                    f'Intolerancia detectada: "{intolerancia}". '
                    'Nota informativa para la fase de diseño de menú.'
                ),
            })

        for condicion in condiciones:
            condicion_lower = condicion.lower()
            if 'diabetes' in condicion_lower:
                alertas.append({
                    'tipo': 'diabetes_alerta',
                    'nivel_riesgo': 'MEDIUM',
                    'mensaje': (
                        'Condición diabetes detectada: se recomienda distribuir '
                        'carbohidratos en 5-6 comidas para estabilizar glucosa. '
                        'Evitar picos de carbohidratos en una sola comida.'
                    ),
                })
            elif 'cardiopat' in condicion_lower or 'corazon' in condicion_lower:
                alertas.append({
                    'tipo': 'cardiopatia_alerta',
                    'nivel_riesgo': 'MEDIUM',
                    'mensaje': (
                        'Condición cardiopatía detectada: se recomienda limitar '
                        'ingesta de sodio y mantener distribución equilibrada de macros.'
                    ),
                })
            elif 'hipertension' in condicion_lower or 'presion alta' in condicion_lower:
                alertas.append({
                    'tipo': 'hipertension_alerta',
                    'nivel_riesgo': 'LOW',
                    'mensaje': (
                        'Condición hipertensión detectada: se recomienda '
                        'moderar ingesta de sodio en la distribución de alimentos.'
                    ),
                })

    return {
        'aprobado': aprobado,
        'alertas': alertas,
    }
