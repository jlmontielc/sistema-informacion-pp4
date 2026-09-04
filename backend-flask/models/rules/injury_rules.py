from config.constants import NivelRiesgo, MAPA_LESIONES


REGLAS_LESION_EJERCICIO = {
    'rodilla': {
        'prohibidos': {
            'sentadilla': NivelRiesgo.CRITICAL,
            'sentadilla trasera': NivelRiesgo.CRITICAL,
            'prensa de piernas': NivelRiesgo.HIGH,
            'zancadas': NivelRiesgo.HIGH,
            'zancada búlgara': NivelRiesgo.CRITICAL,
            'lunges': NivelRiesgo.HIGH,
            'extensiones de cuádriceps': NivelRiesgo.MEDIUM,
            'curl femoral': NivelRiesgo.MEDIUM,
            'peso muerto rumano': NivelRiesgo.MEDIUM,
            'step ups': NivelRiesgo.HIGH,
            'saltos': NivelRiesgo.CRITICAL,
            'plyometrics': NivelRiesgo.CRITICAL,
        },
        'permitidos_con_precaucion': {
            'elevación de gemelos': NivelRiesgo.LOW,
            'hip thrust': NivelRiesgo.LOW,
            'glute bridge': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'sentadilla': 'Usar sentadilla al cajón o leg press con rango limitado',
            'prensa de piernas': 'Limitar rango a 90°, evitar carga excesiva',
            'zancadas': 'Usar zancada estática sin carga, rango corto',
        },
    },
    'hombro': {
        'prohibidos': {
            'press militar': NivelRiesgo.CRITICAL,
            'press militar con barra': NivelRiesgo.CRITICAL,
            'press de banca': NivelRiesgo.HIGH,
            'press inclinado': NivelRiesgo.HIGH,
            'fondos en paralelas': NivelRiesgo.CRITICAL,
            'remo al cuello': NivelRiesgo.CRITICAL,
            'elevación lateral': NivelRiesgo.MEDIUM,
            'face pull': NivelRiesgo.LOW,
            'aperturas con mancuernas': NivelRiesgo.HIGH,
        },
        'permitidos_con_precaucion': {
            'elevación lateral': NivelRiesgo.MEDIUM,
            'face pull': NivelRiesgo.SAFE,
            'encogimientos': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'press banca': 'Usar press con mancuernas, rango controlado, sin bajar del pecho',
            'elevación lateral': 'Carga ligera, no subir del hombro',
            'press inclinado': 'Press inclinado con mancuernas, rango parcial',
        },
    },
    'espalda_baja': {
        'prohibidos': {
            'peso muerto': NivelRiesgo.CRITICAL,
            'peso muerto rumano': NivelRiesgo.HIGH,
            'peso muerto sumo': NivelRiesgo.CRITICAL,
            'remo con barra': NivelRiesgo.HIGH,
            'sentadilla trasera': NivelRiesgo.HIGH,
            'buenos días': NivelRiesgo.CRITICAL,
            'hiperextensiones': NivelRiesgo.HIGH,
            'giros con carga': NivelRiesgo.CRITICAL,
            'abdominales con carga': NivelRiesgo.HIGH,
        },
        'permitidos_con_precaucion': {
            'remo con mancuerna': NivelRiesgo.MEDIUM,
            'plancha': NivelRiesgo.SAFE,
            'bird dog': NivelRiesgo.SAFE,
            'dead bug': NivelRiesgo.SAFE,
            'pájaro': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'remo con barra': 'Usar remo con mancuerna unilateral, espalda neutra',
            'sentadilla': 'Usar sentadilla al cajón con soporte, evitar inclinación',
            'hiperextensiones': 'Solo con peso corporal y rango controlado',
        },
    },
    'espalda_alta': {
        'prohibidos': {
            'remo con barra': NivelRiesgo.HIGH,
            'remo al cuello': NivelRiesgo.CRITICAL,
            'dominadas': NivelRiesgo.HIGH,
        },
        'permitidos_con_precaucion': {
            'remo con mancuerna': NivelRiesgo.LOW,
            'face pull': NivelRiesgo.SAFE,
            'encogimientos': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'remo con barra': 'Usar remo en polea baja con agarre neutro',
            'dominadas': 'Usar dominadas asistidas o jalón al pecho',
        },
    },
    'codo': {
        'prohibidos': {
            'press francés': NivelRiesgo.CRITICAL,
            'curl de bíceps': NivelRiesgo.HIGH,
            'fondos en paralelas': NivelRiesgo.HIGH,
            'press de banca': NivelRiesgo.MEDIUM,
        },
        'permitidos_con_precaucion': {
            'curl de bíceps': NivelRiesgo.MEDIUM,
            'extensión de tríceps en polea': NivelRiesgo.LOW,
        },
        'modificaciones': {
            'curl de bíceps': 'Usar agarre martillo, carga ligera',
            'press francés': 'Reemplazar por press de tríceps en polea',
        },
    },
    'tobillo': {
        'prohibidos': {
            'saltos': NivelRiesgo.CRITICAL,
            'plyometrics': NivelRiesgo.CRITICAL,
            'elevación de gemelos': NivelRiesgo.HIGH,
            'cardio de alto impacto': NivelRiesgo.CRITICAL,
        },
        'permitidos_con_precaucion': {
            'sentadilla': NivelRiesgo.MEDIUM,
            'elevación de gemelos': NivelRiesgo.MEDIUM,
        },
        'modificaciones': {
            'sentadilla': 'Usar sentadilla con soporte, calzado de estabilidad',
            'elevación de gemelos': 'Solo en máquina, carga progresiva',
        },
    },
    'cuello': {
        'prohibidos': {
            'press de banca': NivelRiesgo.HIGH,
            'press militar': NivelRiesgo.HIGH,
            'dominadas': NivelRiesgo.MEDIUM,
            'encogimientos con carga': NivelRiesgo.CRITICAL,
        },
        'permitidos_con_precaucion': {
            'face pull': NivelRiesgo.SAFE,
            'elevación lateral': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'press banca': 'Evitar inclinación excesiva de cabeza, sin jab',
            'encogimientos': 'Solo peso corporal, rango corto',
        },
    },
    'cadera': {
        'prohibidos': {
            'sentadilla profunda': NivelRiesgo.HIGH,
            'peso muerto': NivelRiesgo.HIGH,
            'zancadas': NivelRiesgo.HIGH,
            'saltos': NivelRiesgo.CRITICAL,
        },
        'permitidos_con_precaucion': {
            'sentadilla': NivelRiesgo.MEDIUM,
            'hip thrust': NivelRiesgo.LOW,
            'glute bridge': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'sentadilla': 'Rango parcial, sin bajar del paralelo',
            'zancadas': 'Zancada corta sin carga',
        },
    },
    'muneca': {
        'prohibidos': {
            'press de banca': NivelRiesgo.HIGH,
            'fondos en paralelas': NivelRiesgo.HIGH,
            'curl de bíceps': NivelRiesgo.HIGH,
            'press francés': NivelRiesgo.HIGH,
        },
        'permitidos_con_precaucion': {
            'press de banca con mancuernas': NivelRiesgo.MEDIUM,
        },
        'modificaciones': {
            'press banca': 'Usar muñequeras de soporte, agarre neutro',
            'curl de bíceps': 'Usar barra Z, carga ligera',
        },
    },
}


def detectar_grupo_lesion(texto_lesion: str) -> list:
    texto_lower = texto_lesion.lower()
    grupos_detectados = []
    for grupo, alias_list in MAPA_LESIONES.items():
        for alias in alias_list:
            if alias in texto_lower:
                if grupo not in grupos_detectados:
                    grupos_detectados.append(grupo)
                break
    return grupos_detectados


def evaluar_ejercicio_por_lesiones(nombre_ejercicio: str, lesiones_cliente: list) -> dict:
    nombre_lower = nombre_ejercicio.lower().strip()
    alertas = []
    nivel_maximo = NivelRiesgo.SAFE
    modificacion_sugerida = None

    for texto_lesion in lesiones_cliente:
        grupos = detectar_grupo_lesion(texto_lesion)
        for grupo in grupos:
            reglas = REGLAS_LESION_EJERCICIO.get(grupo, {})

            prohibidos = reglas.get('prohibidos', {})
            for ejercicio_regla, nivel in prohibidos.items():
                if ejercicio_regla.lower() in nombre_lower or nombre_lower in ejercicio_regla.lower():
                    if _orden_riesgo(nivel) > _orden_riesgo(nivel_maximo):
                        nivel_maximo = nivel
                    alertas.append({
                        'tipo': 'lesion',
                        'zonaAfectada': grupo,
                        'lesionDetectada': texto_lesion,
                        'nivelRiesgo': nivel.value,
                        'mensaje': f'Ejercicio contraindicado por lesión en {grupo}',
                    })

            precaucion = reglas.get('permitidos_con_precaucion', {})
            for ejercicio_regla, nivel in precaucion.items():
                if ejercicio_regla.lower() in nombre_lower or nombre_lower in ejercicio_regla.lower():
                    if _orden_riesgo(nivel) > _orden_riesgo(nivel_maximo):
                        nivel_maximo = nivel
                    alertas.append({
                        'tipo': 'lesion_precaucion',
                        'zonaAfectada': grupo,
                        'lesionDetectada': texto_lesion,
                        'nivelRiesgo': nivel.value,
                        'mensaje': f'Ejercicio permitido con precaución por lesión en {grupo}',
                    })

            modificaciones = reglas.get('modificaciones', {})
            for ejercicio_regla, modif in modificaciones.items():
                if ejercicio_regla.lower() in nombre_lower or nombre_lower in ejercicio_regla.lower():
                    modificacion_sugerida = modif

    return {
        'alertas': alertas,
        'nivelMaximo': nivel_maximo,
        'modificacionSugerida': modificacion_sugerida,
        'bloqueado': nivel_maximo in (NivelRiesgo.CRITICAL, NivelRiesgo.HIGH),
    }


def _orden_riesgo(nivel: NivelRiesgo) -> int:
    orden = {
        NivelRiesgo.SAFE: 0,
        NivelRiesgo.LOW: 1,
        NivelRiesgo.MEDIUM: 2,
        NivelRiesgo.HIGH: 3,
        NivelRiesgo.CRITICAL: 4,
    }
    return orden.get(nivel, 0)
