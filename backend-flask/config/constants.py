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
        'rodilla', 'lca', 'ligamento cruzado', 'ligamento cruzado anterior',
        'menisco', 'rotura de menisco', 'meniscopatia', 'condromalacia',
        'condromalacia rotuliana', 'tendinitis rotuliana', 'tendinopatia rotuliana',
        'gonalgia', 'dolor de rodilla', 'luxacion de rotula', 'luxacion rotula',
        'rotula', 'esguince de rodilla', 'esguince rodilla', 'quiste de baker',
        'baker', 'artrosis de rodilla', 'artrosis rodilla', 'femoropatia',
    ],
    'hombro': [
        'hombro', 'manguito rotador', 'sindrome del manguito rotador',
        'bursitis subacromial', 'subacromial', 'capsulitis adhesiva',
        'hombro congelado', 'hombro doloroso', 'labrum', 'lesion de labrum',
        'slap', 'tendinitis supraespinoso', 'tendinitis del supraespinoso',
        'inestabilidad de hombro', 'inestabilidad hombro', 'artrosis de hombro',
        'artrosis hombro', 'fractura de acromion', 'fractura acromion',
        'desgarro de manguito', 'desgarro manguito',
    ],
    'espalda_baja': [
        'espalda baja', 'lumbar', 'lumbalgia', 'lumbago', 'dolor lumbar',
        'ciatica', 'ciatalgia', 'neuralgia ciatica', 'hernia discal',
        'hernia discal lumbar', 'hernia de disco', 'hernia l4', 'hernia l5',
        'protrusion discal', 'protusion discal', 'degeneracion discal',
        'estenosis espinal', 'estenosis de canal', 'espondilolistesis',
        'espondilolisis', 'discopatia', 'lordosis', 'hiperlordosis',
        'esguince lumbar', 'contractura lumbar',
    ],
    'espalda_alta': [
        'espalda alta', 'toracica', 'dorsal', 'hernia toracica',
    ],
    'codo': [
        'codo', 'epicondilitis', 'epitrocleitis', 'codo de tenista',
        'codo de golfista', 'bursitis codo', 'artrosis codo',
    ],
    'tobillo': [
        'tobillo', 'esguince de tobillo', 'esguince tobillo',
        'rotura de ligamentos del tobillo', 'rotura de ligamentos de tobillo',
        'rotura ligamentos tobillo', 'peroneo', 'aquiles', 'tendinitis aquiles',
        'fascitis plantar', 'fascitis', 'rotura aquiles', 'esguince lateral',
    ],
    'cuello': [
        'cuello', 'cervical', 'cervicalgia', 'torticolis', 'latigazo cervical',
        'hernia cervical', 'esguince cervical', 'artrosis cervical',
    ],
    'cadera': [
        'cadera', 'coxartrosis', 'artrosis de cadera', 'artrosis cadera',
        'bursitis de cadera', 'bursitis cadera', 'bursitis trocanterea',
        'labrum de cadera', 'labrum cadera', 'femoropatia', 'tendinitis glutea',
        'necrosis femoral', 'pinzamiento de cadera',
    ],
    'muneca': [
        'muneca', 'tunel carpiano', 'sindrome del tunel carpiano',
        'fractura de escafoide', 'fractura escafoide', 'tendinitis de muneca',
        'tendinitis muneca', 'esguince de muneca', 'esguince muneca',
        'ganglion', 'quiste ganglionar',
    ],
}

MAPA_CONDICIONES = {
    'cardiopatia': {
        'alias': [
            'corazon', 'cardiopatia', 'cardiaca', 'insuficiencia cardiaca',
            'arritmia', 'valvulopatia', 'miocardiopatia', 'coronaria',
            'angina de pecho', 'angina',
        ],
        'ejercicios_prohibidos': ['sentadilla pesada', 'peso muerto', 'press banca'],
        'precaucion': 'Evitar esfuerzo maximo. Mantener FC < 70% FCmax. No hacer maniobra de Valsalva.',
        'intensidad_maxima': 0.65,
    },
    'hipertension': {
        'alias': [
            'hipertension', 'hipertension arterial', 'presion alta',
            'presion arterial alta', 'hipertensa', 'hta',
        ],
        'ejercicios_prohibidos': ['press banca pesado', 'peso muerto pesado'],
        'precaucion': 'Evitar isometricos prolongados y cargas >80% 1RM. No aguantar respiracion.',
        'intensidad_maxima': 0.70,
    },
    'diabetes': {
        'alias': [
            'diabetes', 'diabetica', 'diabetico', 'diabetes mellitus',
            'tipo 1', 'tipo 2', 'diabetes tipo 1', 'diabetes tipo 2',
            'diabetes tipo ii', 'dm1', 'dm2',
        ],
        'ejercicios_prohibidos': [],
        'precaucion': 'Medir glucosa antes/despues. Luchar glucosa rapida por si hipoglucemia. Hidratacion constante.',
        'intensidad_maxima': 0.80,
    },
    'asma': {
        'alias': [
            'asma', 'asmatico', 'asmatica', 'broncoespasmo',
            'asma bronquial', 'bronquitis asmatica',
        ],
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
        'alias': [
            'hernia discal', 'hernia de disco', 'hernia', 'protrusion',
            'protusion', 'protrusion discal', 'protusion discal',
            'discopatia', 'degeneracion discal',
        ],
        'ejercicios_prohibidos': ['peso muerto', 'sentadilla trasera', 'remo barra'],
        'precaucion': 'Sin flexion de columna con carga. Core estable. Extension lumbar controlada.',
        'intensidad_maxima': 0.60,
    },
    'artritis': {
        'alias': [
            'artritis', 'artritis reumatoide', 'artrosis', 'osteoartrosis',
        ],
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
