const NivelRiesgo = {
  SAFE: 'SAFE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const MAPA_CONDICIONES = {
  cardiopatia: {
    alias: ['corazon', 'cardiopatia', 'cardiaca', 'insuficiencia cardiaca',
      'arritmia', 'valvulopatia', 'miocardiopatia'],
    ejercicios_prohibidos: ['sentadilla pesada', 'peso muerto', 'press banca'],
    precaucion: 'Evitar esfuerzo maximo. Mantener FC < 70% FCmax. No hacer maniobra de Valsalva.',
    intensidad_maxima: 0.65,
  },
  hipertension: {
    alias: ['hipertension', 'presion alta', 'hipertensa'],
    ejercicios_prohibidos: ['press banca pesado', 'peso muerto pesado'],
    precaucion: 'Evitar isometricos prolongados y cargas >80% 1RM. No aguantar respiracion.',
    intensidad_maxima: 0.70,
  },
  diabetes: {
    alias: ['diabetes', 'diabetica', 'diabetico', 'tipo 1', 'tipo 2'],
    ejercicios_prohibidos: [],
    precaucion: 'Medir glucosa antes/despues. Luchar glucosa rapida por si hipoglucemia. Hidratacion constante.',
    intensidad_maxima: 0.80,
  },
  asma: {
    alias: ['asma', 'asmatico', 'asmatica', 'broncoespasmo'],
    ejercicios_prohibidos: [],
    precaucion: 'Inhalador a mano. Calentamiento extenso. Evitar aire frio/seco. Pausas frecuentes.',
    intensidad_maxima: 0.75,
  },
  embarazo: {
    alias: ['embarazo', 'embarazada', 'gestacion'],
    ejercicios_prohibidos: ['abdominales en supino', 'crunches', 'plancha prolongada'],
    precaucion: 'Evitar supino despues del 1er trimestre. Sin impacto. Sin Valsalva. Intensidad baja-media.',
    intensidad_maxima: 0.60,
  },
  osteoporosis: {
    alias: ['osteoporosis', 'osteopenia', 'densidad osea baja'],
    ejercicios_prohibidos: ['peso muerto', 'sentadilla pesada', 'impacto alto'],
    precaucion: 'Evitar flexion de columna con carga. Sin giros bruscos. Ejercicios de impacto bajo.',
    intensidad_maxima: 0.65,
  },
  'hernia_discal': {
    alias: ['hernia discal', 'hernia', 'protrusion', 'protusion'],
    ejercicios_prohibidos: ['peso muerto', 'sentadilla trasera', 'remo barra'],
    precaucion: 'Sin flexion de columna con carga. Core estable. Extension lumbar controlada.',
    intensidad_maxima: 0.60,
  },
  artrosis: {
    alias: ['artritis', 'artritis reumatoide', 'artrosis'],
    ejercicios_prohibidos: [],
    precaucion: 'Movilidad antes de fuerza. Sin carga extrema en articulaciones inflamadas. Calor previo.',
    intensidad_maxima: 0.65,
  },
};

function detectar_condicion(texto_condicion) {
  const texto_lower = texto_condicion.toLowerCase();
  const condiciones_detectadas = [];
  for (const [condicion_key, condicion_data] of Object.entries(MAPA_CONDICIONES)) {
    for (const alias of condicion_data.alias) {
      if (texto_lower.includes(alias)) {
        if (!condiciones_detectadas.some(c => c.key === condicion_key)) {
          condiciones_detectadas.push({ key: condicion_key, data: condicion_data });
        }
        break;
      }
    }
  }
  return condiciones_detectadas;
}

function _ajustar_nivel_por_intensidad(intensidad) {
  if (intensidad >= 0.85) return NivelRiesgo.SAFE;
  if (intensidad >= 0.70) return NivelRiesgo.LOW;
  if (intensidad >= 0.55) return NivelRiesgo.MEDIUM;
  return NivelRiesgo.HIGH;
}

function evaluar_ejercicio_por_condiciones(nombre_ejercicio, condiciones_cliente, nivel_actividad) {
  const nombre_lower = nombre_ejercicio.toLowerCase().trim();
  const alertas = [];
  let nivel_maximo = NivelRiesgo.SAFE;
  let intensidad_permitida = 1.0;
  const precauciones = [];

  for (const texto_condicion of condiciones_cliente) {
    const condiciones = detectar_condicion(texto_condicion);
    for (const condicion of condiciones) {
      const key = condicion.key;
      const data = condicion.data;

      const ejercicios_prohibidos = data.ejercicios_prohibidos || [];
      for (const ej_prohibido of ejercicios_prohibidos) {
        if (ej_prohibido.toLowerCase().includes(nombre_lower) || nombre_lower.includes(ej_prohibido.toLowerCase())) {
          nivel_maximo = NivelRiesgo.CRITICAL;
          alertas.push({
            tipo: 'condicion',
            condicion: key,
            nivel_riesgo: NivelRiesgo.CRITICAL,
            mensaje: `Ejercicio prohibido por condición: ${key}`,
          });
        }
      }

      const intensidad_max = data.intensidad_maxima;
      if (intensidad_max < intensidad_permitida) {
        intensidad_permitida = intensidad_max;
      }

      if (data.precaucion) {
        precauciones.push({
          condicion: key,
          precaucion: data.precaucion,
        });
      }
    }
  }

  if (nivel_maximo === NivelRiesgo.CRITICAL) {
    return {
      alertas,
      nivel_maximo,
      intensidad_permitida: 0.0,
      precauciones,
      bloqueado: true,
    };
  }

  const nivel_ajustado = _ajustar_nivel_por_intensidad(intensidad_permitida);

  if (nivel_ajustado !== NivelRiesgo.SAFE) {
    alertas.push({
      tipo: 'condicion_intensidad',
      nivel_riesgo: nivel_ajustado,
      mensaje: `Intensidad limitada al ${(intensidad_permitida * 100).toFixed(0)}% por condiciones médicas`,
    });
  }

  return {
    alertas,
    nivel_maximo: nivel_maximo !== NivelRiesgo.SAFE ? nivel_maximo : nivel_ajustado,
    intensidad_permitida,
    precauciones,
    bloqueado: false,
  };
}

function obtener_precauciones_cliente(condiciones_cliente) {
  const precauciones_totales = [];
  for (const texto_condicion of condiciones_cliente) {
    const condiciones = detectar_condicion(texto_condicion);
    for (const condicion of condiciones) {
      if (condicion.data.precaucion) {
        precauciones_totales.push({
          condicion: condicion.key,
          precaucion: condicion.data.precaucion,
        });
      }
    }
  }
  return precauciones_totales;
}

module.exports = { NivelRiesgo, MAPA_CONDICIONES, detectar_condicion, evaluar_ejercicio_por_condiciones, obtener_precauciones_cliente, _ajustar_nivel_por_intensidad };