const NivelRiesgo = {
  SAFE: 'SAFE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const MAPA_LESIONES = {
  rodilla: [
    'rodilla', 'lca', 'ligamento cruzado', 'menisco', 'tendinitis rotuliana',
    'condromalacia', 'artrosis rodilla', 'luxacion rotula', 'meniscopatia',
    'tendinopatia rotuliana', 'esguince rodilla', 'quiste de baker',
  ],
  hombro: [
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
  codo: [
    'codo', 'epicondilitis', 'epitrocleitis', 'codo de tenista',
    'codo de golfista', 'bursitis codo', 'artrosis codo',
  ],
  tobillo: [
    'tobillo', 'esguince tobillo', 'peroneo', 'aquiles', 'tendinitis aquiles',
    'fascitis plantar', 'rotura aquiles', 'esguince lateral',
  ],
  cuello: [
    'cuello', 'cervical', 'torticolis', 'hernia cervical', 'cervicalgia',
    'esguince cervical', 'artrosis cervical',
  ],
  cadera: [
    'cadera', 'coxartrosis', 'femoropatia', 'labrum cadera',
    'bursitis trocanterea', 'tendinitis glutea', 'necrosis femoral',
  ],
  muneca: [
    'muneca', 'tunel carpiano', 'fractura escafoide', 'tendinitis muneca',
    'esguince muneca', 'ganglion',
  ],
};

const REGLAS_LESION_EJERCICIO = {
  rodilla: {
    prohibidos: {
      sentadilla: NivelRiesgo.CRITICAL,
      'sentadilla trasera': NivelRiesgo.CRITICAL,
      'prensa de piernas': NivelRiesgo.HIGH,
      zancadas: NivelRiesgo.HIGH,
      'zancada búlgara': NivelRiesgo.CRITICAL,
      lunges: NivelRiesgo.HIGH,
      'extensiones de cuádriceps': NivelRiesgo.MEDIUM,
      'curl femoral': NivelRiesgo.MEDIUM,
      'peso muerto rumano': NivelRiesgo.MEDIUM,
      step ups: NivelRiesgo.HIGH,
      saltos: NivelRiesgo.CRITICAL,
      plyometrics: NivelRiesgo.CRITICAL,
    },
    permitidos_con_precaucion: {
      'elevación de gemelos': NivelRiesgo.LOW,
      'hip thrust': NivelRiesgo.LOW,
      'glute bridge': NivelRiesgo.SAFE,
    },
    modificaciones: {
      sentadilla: 'Usar sentadilla al cajón o leg press con rango limitado',
      'prensa de piernas': 'Limitar rango a 90°, evitar carga excesiva',
      zancadas: 'Usar zancada estática sin carga, rango corto',
    },
  },
  hombro: {
    prohibidos: {
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
    permitidos_con_precaucion: {
      'elevación lateral': NivelRiesgo.MEDIUM,
      'face pull': NivelRiesgo.SAFE,
      'encogimientos': NivelRiesgo.SAFE,
    },
    modificaciones: {
      'press banca': 'Usar press con mancuernas, rango controlado, sin bajar del pecho',
      'elevación lateral': 'Carga ligera, no subir del hombro',
      'press inclinado': 'Press inclinado con mancuernas, rango parcial',
    },
  },
  'espalda_baja': {
    prohibidos: {
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
    permitidos_con_precaucion: {
      'remo con mancuerna': NivelRiesgo.MEDIUM,
      'plancha': NivelRiesgo.SAFE,
      'bird dog': NivelRiesgo.SAFE,
      'dead bug': NivelRiesgo.SAFE,
      'pájaro': NivelRiesgo.SAFE,
    },
    modificaciones: {
      'remo con barra': 'Usar remo con mancuerna unilateral, espalda neutra',
      'sentadilla': 'Usar sentadilla al cajón con soporte, evitar inclinación',
      'hiperextensiones': 'Solo con peso corporal y rango controlado',
    },
  },
  'espalda_alta': {
    prohibidos: {
      'remo con barra': NivelRiesgo.HIGH,
      'remo al cuello': NivelRiesgo.CRITICAL,
      'dominadas': NivelRiesgo.HIGH,
    },
    permitidos_con_precaucion: {
      'remo con mancuerna': NivelRiesgo.LOW,
      'face pull': NivelRiesgo.SAFE,
      'encogimientos': NivelRiesgo.SAFE,
    },
    modificaciones: {
      'remo con barra': 'Usar remo en polea baja con agarre neutro',
      'dominadas': 'Usar dominadas asistidas o jalón al pecho',
    },
  },
  codo: {
    prohibidos: {
      'press francés': NivelRiesgo.CRITICAL,
      'curl de bíceps': NivelRiesgo.HIGH,
      'fondos en paralelas': NivelRiesgo.HIGH,
      'press de banca': NivelRiesgo.MEDIUM,
    },
    permitidos_con_precaucion: {
      'curl de bíceps': NivelRiesgo.MEDIUM,
      'extensión de tríceps en polea': NivelRiesgo.LOW,
    },
    modificaciones: {
      'curl de bíceps': 'Usar agarre martillo, carga ligera',
      'press francés': 'Reemplazar por press de tríceps en polea',
    },
  },
  tobillo: {
    prohibidos: {
      'saltos': NivelRiesgo.CRITICAL,
      'plyometrics': NivelRiesgo.CRITICAL,
      'elevación de gemelos': NivelRiesgo.HIGH,
      'cardio de alto impacto': NivelRiesgo.CRITICAL,
    },
    permitidos_con_precaucion: {
      'sentadilla': NivelRiesgo.MEDIUM,
      'elevación de gemelos': NivelRiesgo.MEDIUM,
    },
    modificaciones: {
      'sentadilla': 'Usar sentadilla con soporte, calzado de estabilidad',
      'elevación de gemelos': 'Solo en máquina, carga progresiva',
    },
  },
  cuello: {
    prohibidos: {
      'press de banca': NivelRiesgo.HIGH,
      'press militar': NivelRiesgo.HIGH,
      'dominadas': NivelRiesgo.MEDIUM,
      'encogimientos con carga': NivelRiesgo.CRITICAL,
    },
    permitidos_con_precaucion: {
      'face pull': NivelRiesgo.SAFE,
      'elevación lateral': NivelRiesgo.SAFE,
    },
    modificaciones: {
      'press banca': 'Evitar inclinación excesiva de cabeza, sin jab',
      'encogimientos': 'Solo peso corporal, rango corto',
    },
  },
  cadera: {
    prohibidos: {
      'sentadilla profunda': NivelRiesgo.HIGH,
      'peso muerto': NivelRiesgo.HIGH,
      'zancadas': NivelRiesgo.HIGH,
      'saltos': NivelRiesgo.CRITICAL,
    },
    permitidos_con_precaucion: {
      'sentadilla': NivelRiesgo.MEDIUM,
      'hip thrust': NivelRiesgo.LOW,
      'glute bridge': NivelRiesgo.SAFE,
    },
    modificaciones: {
      'sentadilla': 'Rango parcial, sin bajar del paralelo',
      'zancadas': 'Zancada corta sin carga',
    },
  },
  muneca: {
    prohibidos: {
      'press de banca': NivelRiesgo.HIGH,
      'fondos en paralelas': NivelRiesgo.HIGH,
      'curl de bíceps': NivelRiesgo.HIGH,
      'press francés': NivelRiesgo.HIGH,
    },
    permitidos_con_precaucion: {
      'press de banca con mancuernas': NivelRiesgo.MEDIUM,
    },
    modificaciones: {
      'press banca': 'Usar muñequeras de soporte, agarre neutro',
      'curl de bíceps': 'Usar barra Z, carga ligera',
    },
  },
};

function detectar_grupo_lesion(texto_lesion) {
  const texto_lower = texto_lesion.toLowerCase();
  const grupos_detectados = [];
  for (const [grupo, alias_list] of Object.entries(MAPA_LESIONES)) {
    for (const alias of alias_list) {
      if (texto_lower.includes(alias)) {
        if (!grupos_detectados.includes(grupo)) {
          grupos_detectados.push(grupo);
        }
        break;
      }
    }
  }
  return grupos_detectados;
}

function _orden_riesgo(nivel) {
  const orden = {
    [NivelRiesgo.SAFE]: 0,
    [NivelRiesgo.LOW]: 1,
    [NivelRiesgo.MEDIUM]: 2,
    [NivelRiesgo.HIGH]: 3,
    [NivelRiesgo.CRITICAL]: 4,
  };
  return orden[nivel] || 0;
}

function evaluar_ejercicio_por_lesiones(nombre_ejercicio, lesiones_cliente) {
  const nombre_lower = nombre_ejercicio.toLowerCase().trim();
  const alertas = [];
  let nivel_maximo = NivelRiesgo.SAFE;
  let modificacion_sugerida = null;

  for (const texto_lesion of lesiones_cliente) {
    const grupos = detectar_grupo_lesion(texto_lesion);
    for (const grupo of grupos) {
      const reglas = REGLAS_LESION_EJERCICIO[grupo] || {};
      const prohibidos = reglas.prohibidos || {};
      const permitidos = reglas.permitidos_con_precaucion || {};
      const modificaciones = reglas.modificaciones || {};

      for (const [ejercicio_regla, nivel] of Object.entries(prohibidos)) {
        if (ejercicio_regla.toLowerCase().includes(nombre_lower) || nombre_lower.includes(ejercicio_regla.toLowerCase())) {
          if (_orden_riesgo(nivel) > _orden_riesgo(nivel_maximo)) {
            nivel_maximo = nivel;
          }
          alertas.push({
            tipo: 'lesion',
            zona_afectada: grupo,
            lesion_detectada: texto_lesion,
            nivel_riesgo: nivel,
            mensaje: `Ejercicio contraindicado por lesión en ${grupo}`,
          });
        }
      }

      for (const [ejercicio_regla, nivel] of Object.entries(permitidos)) {
        if (ejercicio_regla.toLowerCase().includes(nombre_lower) || nombre_lower.includes(ejercicio_regla.toLowerCase())) {
          if (_orden_riesgo(nivel) > _orden_riesgo(nivel_maximo)) {
            nivel_maximo = nivel;
          }
          alertas.push({
            tipo: 'lesion_precaucion',
            zona_afectada: grupo,
            lesion_detectada: texto_lesion,
            nivel_riesgo: nivel,
            mensaje: `Ejercicio permitido con precaución por lesión en ${grupo}`,
          });
        }
      }

      for (const [ejercicio_regla, modif] of Object.entries(modificaciones)) {
        if (ejercicio_regla.toLowerCase().includes(nombre_lower) || nombre_lower.includes(ejercicio_regla.toLowerCase())) {
          modificacion_sugerida = modif;
        }
      }
    }
  }

  const bloqueado = nivel_maximo === NivelRiesgo.CRITICAL || nivel_maximo === NivelRiesgo.HIGH;

  return {
    alertas,
    nivel_maximo,
    modificacion_sugerida,
    bloqueado,
  };
}

module.exports = { NivelRiesgo, MAPA_LESIONES, REGLAS_LESION_EJERCICIO, detectar_grupo_lesion, evaluar_ejercicio_por_lesiones, _orden_riesgo };