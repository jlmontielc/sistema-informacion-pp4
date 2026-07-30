from enum import Enum


class NivelRiesgo(Enum):
    CRITICAL = 'CRITICAL'
    HIGH = 'HIGH'
    MEDIUM = 'MEDIUM'
    LOW = 'LOW'
    SAFE = 'SAFE'


class AccionHitl(Enum):
    APROBADA = 'aprobada'
    RECHAZADA = 'rechazada'
    MODIFICADA = 'modificada'


MAPA_LESIONES = {
    'rodilla': [
        'rodilla', 'lca', 'ligamento cruzado', 'menisco', 'tendinitis rotuliana',
        'condromalacia', 'artrosis rodilla', 'luxacion rotula', 'meniscopatia',
        'tendinopatia rotuliana', 'esguince rodilla', 'quiste de baker',
    ],
    'hombro': [
        'hombro', 'manguito rotador', 'bursitis subacromial', 'capsulitis adhesiva',
        'labrum', 'slap', 'tendinitis supraespinoso', 'inestabilidad hombro',
        'artrosis hombro', 'fractura acromion', 'desgarro manguito',
    ],
    'espalda_baja': [
        'espalda baja', 'hernia discal', 'lumbar', 'ciatica', 'ciatica lumbar',
        'estenosis espinal', 'espondilolistesis', 'discopatia', 'lordosis',
        'esguince lumbar', 'contractura lumbar', 'hernia l4', 'hernia l5',
        'protrusion discal', 'degeneracion discal',
    ],
    'espalda_alta': [
        'espalda alta', 'toracica', 'dorsal', 'hernia toracica',
    ],
    'codo': [
        'codo', 'epicondilitis', 'epitrocleitis', 'codo de tenista',
        'codo de golfista', 'bursitis codo', 'artrosis codo',
    ],
    'tobillo': [
        'tobillo', 'esguince tobillo', 'peroneo', 'aquiles', 'tendinitis aquiles',
        ' fascitis plantar', 'rotura aquiles', 'esguince lateral',
    ],
    'cuello': [
        'cuello', 'cervical', 'torticolis', 'hernia cervical', 'cervicalgia',
        'esguince cervical', 'artrosis cervical',
    ],
    'cadera': [
        'cadera', 'coxartrosis', 'femoropatia', 'labrum cadera',
        'bursitis trocanterea', 'tendinitis glutea', 'necrosis femoral',
    ],
    'muneca': [
        'muneca', 'tunel carpiano', 'fractura escafoide', 'tendinitis muneca',
        'esguince muneca', 'ganglion',
    ],
}

MAPA_CONDICIONES = {
    'cardiopatia': {
        'alias': ['corazon', 'cardiopatia', 'cardiaca', 'insuficiencia cardiaca',
                  'arritmia', 'valvulopatia', 'miocardiopatia'],
        'ejercicios_prohibidos': ['sentadilla pesada', 'peso muerto', 'press banca'],
        'precaucion': 'Evitar esfuerzo maximo. Mantener FC < 70% FCmax. No hacer maniobra de Valsalva.',
        'intensidad_maxima': 0.65,
    },
    'hipertension': {
        'alias': ['hipertension', 'presion alta', 'hipertensa'],
        'ejercicios_prohibidos': ['press banca pesado', 'peso muerto pesado'],
        'precaucion': 'Evitar isometricos prolongados y cargas >80% 1RM. No aguantar respiracion.',
        'intensidad_maxima': 0.70,
    },
    'diabetes': {
        'alias': ['diabetes', 'diabetica', 'diabetico', 'tipo 1', 'tipo 2'],
        'ejercicios_prohibidos': [],
        'precaucion': 'Medir glucosa antes/despues. Luchar glucosa rapida por si hipoglucemia. Hidratacion constante.',
        'intensidad_maxima': 0.80,
    },
    'asma': {
        'alias': ['asma', 'asmatico', 'asmatica', 'broncoespasmo'],
        'ejercicios_prohibidos': [],
        'precaucion': 'Inhalador a mano. Calentamiento extenso. Evitar aire frio/seco. Pausas frecuentes.',
        'intensidad_maxima': 0.75,
    },
    'embarazo': {
        'alias': ['embarazo', 'embarazada', 'gestacion'],
        'ejercicios_prohibidos': ['abdominales en supino', 'crunches', 'plancha prolongada'],
        'precaucion': 'Evitar supino despues del 1er trimestre. Sin impacto. Sin Valsalva. Intensidad baja-media.',
        'intensidad_maxima': 0.60,
    },
    'osteoporosis': {
        'alias': ['osteoporosis', 'osteopenia', 'densidad osea baja'],
        'ejercicios_prohibidos': ['peso muerto', 'sentadilla pesada', 'impacto alto'],
        'precaucion': 'Evitar flexion de columna con carga. Sin giros bruscos. Ejercicios de impacto bajo.',
        'intensidad_maxima': 0.65,
    },
    'hernia_discal': {
        'alias': ['hernia discal', 'hernia', 'protrusion', 'protusion'],
        'ejercicios_prohibidos': ['peso muerto', 'sentadilla trasera', 'remo barra'],
        'precaucion': 'Sin flexion de columna con carga. Core estable. Extension lumbar controlada.',
        'intensidad_maxima': 0.60,
    },
    'artritis': {
        'alias': ['artritis', 'artritis reumatoide', 'artrosis'],
        'ejercicios_prohibidos': [],
        'precaucion': 'Movilidad antes de fuerza. Sin carga extrema en articulaciones inflamadas. Calor previo.',
        'intensidad_maxima': 0.65,
    },
}

MAPEO_OBJETIVO_CONFIG = {
    'perdida_peso': {
        'peso_cardio': 3,
        'peso_fuerza': 2,
        'peso_volumen': 1,
        'rango_repeticiones': (12, 20),
        'series_por_ejercicio': (2, 3),
        'descanso_segundos': (30, 60),
        'distribucion_dias': {
            2: ['full_body', 'full_body'],
            3: ['full_body', 'cardio_core', 'full_body'],
            4: ['tren_superior', 'tren_inferior', 'tren_superior', 'cardio_core'],
            5: ['push', 'pull', 'piernas', 'cardio', 'full_body'],
            6: ['push', 'pull', 'piernas', 'push', 'pull', 'piernas'],
        },
    },
    'ganancia_muscular': {
        'peso_cardio': 1,
        'peso_fuerza': 3,
        'peso_volumen': 3,
        'rango_repeticiones': (8, 12),
        'series_por_ejercicio': (3, 4),
        'descanso_segundos': (60, 120),
        'distribucion_dias': {
            2: ['tren_superior', 'tren_inferior'],
            3: ['pecho_triceps', 'espalda_biceps', 'piernas'],
            4: ['push', 'pull', 'piernas', 'full_body'],
            5: ['pecho_hombro', 'espalda', 'piernas', 'brazos', 'full_body'],
            6: ['push', 'pull', 'piernas', 'push', 'pull', 'piernas'],
        },
    },
    'mantenimiento': {
        'peso_cardio': 2,
        'peso_fuerza': 2,
        'peso_volumen': 2,
        'rango_repeticiones': (10, 15),
        'series_por_ejercicio': (3, 3),
        'descanso_segundos': (45, 90),
        'distribucion_dias': {
            2: ['tren_superior', 'tren_inferior'],
            3: ['full_body', 'cardio', 'full_body'],
            4: ['push', 'pull', 'piernas', 'cardio'],
            5: ['full_body', 'push', 'pull', 'piernas', 'cardio'],
            6: ['push', 'pull', 'piernas', 'push', 'pull', 'piernas'],
        },
    },
    'rehabilitacion': {
        'peso_cardio': 2,
        'peso_fuerza': 1,
        'peso_volumen': 1,
        'rango_repeticiones': (12, 20),
        'series_por_ejercicio': (2, 3),
        'descanso_segundos': (60, 90),
        'distribucion_dias': {
            2: ['movilidad_fuerza', 'movilidad_cardio'],
            3: ['movilidad', 'fuerza_suave', 'movilidad'],
            4: ['movilidad', 'fuerza', 'cardio_suave', 'movilidad'],
        },
    },
    'rendimiento': {
        'peso_cardio': 1,
        'peso_fuerza': 3,
        'peso_volumen': 2,
        'rango_repeticiones': (5, 8),
        'series_por_ejercicio': (4, 5),
        'descanso_segundos': (120, 180),
        'distribucion_dias': {
            3: ['fuerza_tren_sup', 'fuerza_tren_inf', 'potencia'],
            4: ['fuerza_upper', 'fuerza_lower', 'potencia', 'resistencia'],
            5: ['fuerza_push', 'fuerza_pull', 'fuerza_piernas', 'potencia', 'resistencia'],
            6: ['fuerza_upper', 'fuerza_lower', 'potencia', 'fuerza_upper', 'fuerza_lower', 'resistencia'],
        },
    },
}

DIFICULTAD_ORDEN = {'principiante': 1, 'intermedio': 2, 'avanzado': 3}

GRUPOS_MUSCULARES = [
    'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core',
    'Trapecios', 'Gemelos', 'Isquiotibiales', 'Cuadriceps',
    'Gluteos', 'Abdominales', 'Espalda baja',
]

EQUIPO_POR_CATEGORIA = {
    'barra': ['barra', 'barra olimpica', 'barra z'],
    'mancuernas': ['mancuerna', 'mancuernas'],
    'polea': ['polea', 'cuerda', 'polea alta', 'polea baja'],
    'maquina': ['maquina', 'maquinas'],
    'cuerpo_libre': ['colchoneta', 'paralelas', 'barra de dominadas', 'banco romano'],
    'disco': ['disco', 'discos'],
}
