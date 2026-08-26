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
        'fascitis plantar', 'rotura aquiles', 'esguince lateral',
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

MAPEO_PROPOSITO_TEXTO = {
    'perder peso': 'perdida_peso',
    'bajar de peso': 'perdida_peso',
    'pérdida de peso': 'perdida_peso',
    'loss weight': 'perdida_peso',
    'weight loss': 'perdida_peso',
    'tonificar': 'ganancia_muscular',
    'ganar masa muscular': 'ganancia_muscular',
    'ganar musculo': 'ganancia_muscular',
    'masa muscular': 'ganancia_muscular',
    'gain muscle': 'ganancia_muscular',
    'muscle gain': 'ganancia_muscular',
    'mejorar condicion fisica general': 'mantenimiento',
    'mejorar condición física general': 'mantenimiento',
    'condicion fisica': 'mantenimiento',
    'salud y bienestar': 'mantenimiento',
    'bienestar': 'mantenimiento',
    'salud': 'mantenimiento',
    'mantenimiento': 'mantenimiento',
    'mantener': 'mantenimiento',
    'rendimiento deportivo': 'rendimiento',
    'rendimiento': 'rendimiento',
    'deportivo': 'rendimiento',
    'performance': 'rendimiento',
    'rehabilitacion': 'rehabilitacion',
    'rehabilitación': 'rehabilitacion',
    'rehab': 'rehabilitacion',
}

DIFICULTAD_ORDEN = {'principiante': 1, 'intermedio': 2, 'avanzado': 3}

PESOS_BASE_SCORING = {
    'objetivo': 3.0,
    'nivel': 2.0,
    'dias': 2.0,
    'progresion': 1.5,
    'seguridad': 1.0,
}
