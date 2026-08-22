const NivelRiesgo = {
  SAFE: 'SAFE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

function calcular_imc(peso, altura) {
  if (altura <= 0) return 0;
  return Math.round(peso / Math.pow(altura, 2) * 100) / 100;
}

function calcular_carga_maxima_recomendada(peso, altura, edad, nivel_actividad, ejercicio_tipo = 'compuesto') {
  const imc = calcular_imc(peso, altura);

  const factor_edad = _factor_por_edad(edad);
  const factor_nivel = _factor_por_nivel(nivel_actividad);
  const factor_tipo = ejercicio_tipo === 'compuesto' ? 1.0 : 0.7;

  const carga_max_teorica = peso * 2.0 * factor_edad * factor_nivel * factor_tipo;

  return {
    imc,
    carga_max_kg: Math.round(carga_max_teorica * 100) / 100,
    factor_edad,
    factor_nivel,
    factor_tipo,
  };
}

function _factor_por_edad(edad) {
  if (edad < 18) return 0.5;
  if (edad < 30) return 1.0;
  if (edad < 40) return 0.9;
  if (edad < 50) return 0.8;
  if (edad < 60) return 0.65;
  if (edad < 70) return 0.5;
  return 0.35;
}

function _factor_por_nivel(nivel_actividad) {
  const factores = {
    sedentario: 0.4,
    ligero: 0.6,
    moderado: 0.8,
    activo: 0.95,
    'muy_activo': 1.0,
  };
  return factores[nivel_actividad] || 0.7;
}

function validar_carga_ejercicio(carga_sugerida, peso, altura, edad, nivel_actividad, ejercicio_tipo = 'compuesto') {
  const limites = calcular_carga_maxima_recomendada(peso, altura, edad, nivel_actividad, ejercicio_tipo);

  const carga_max = limites.carga_max_kg;
  const ratio = carga_max > 0 ? carga_sugerida / carga_max : 0;

  if (ratio > 1.0) {
    return {
      carga_sugerida,
      carga_max_segura: carga_max,
      ratio_carga: Math.round(ratio * 1000) / 1000,
      nivel_riesgo: NivelRiesgo.CRITICAL,
      mensaje: `Carga ${carga_sugerida}kg excede el máximo seguro de ${carga_max.toFixed(1)}kg`,
      aprobar: true,
    };
  } else if (ratio > 0.85) {
    return {
      carga_sugerida,
      carga_max_segura: carga_max,
      ratio_carga: Math.round(ratio * 1000) / 1000,
      nivel_riesgo: NivelRiesgo.HIGH,
      mensaje: `Carga ${carga_sugerida}kg cerca del límite máximo (${carga_max.toFixed(1)}kg)`,
      aprobar: true,
    };
  } else if (ratio > 0.70) {
    return {
      carga_sugerida,
      carga_max_segura: carga_max,
      ratio_carga: Math.round(ratio * 1000) / 1000,
      nivel_riesgo: NivelRiesgo.MEDIUM,
      mensaje: `Carga ${carga_sugerida}kg dentro del rango aceptable`,
      aprobar: true,
    };
  } else if (ratio > 0.40) {
    return {
      carga_sugerida,
      carga_max_segura: carga_max,
      ratio_carga: Math.round(ratio * 1000) / 1000,
      nivel_riesgo: NivelRiesgo.LOW,
      mensaje: `Carga ${carga_sugerida}kg es conservadora`,
      aprobar: true,
    };
  } else {
    return {
      carga_sugerida,
      carga_max_segura: carga_max,
      ratio_carga: Math.round(ratio * 1000) / 1000,
      nivel_riesgo: NivelRiesgo.SAFE,
      mensaje: `Carga ${carga_sugerida}kg es ligera y segura`,
      aprobar: true,
    };
  }
}

function estimar_1rm_repeticiones(carga_kg, repeticiones) {
  if (repeticiones <= 0 || carga_kg <= 0) return 0;
  if (repeticiones === 1) return carga_kg;
  const factor = 1 + (repeticiones * 0.0333);
  return Math.round(carga_kg * factor * 100) / 100;
}

function calcular_carga_por_objetivo(estimated_1rm, objetivo) {
  const rangos = {
    perdida_peso: { min: 0.40, max: 0.60 },
    ganancia_muscular: { min: 0.65, max: 0.80 },
    mantenimiento: { min: 0.55, max: 0.75 },
    rendimiento: { min: 0.80, max: 0.95 },
    rehabilitacion: { min: 0.30, max: 0.50 },
  };

  const rango = rangos[objetivo] || rangos.mantenimiento;
  const carga_min = Math.round(estimated_1rm * rango.min * 10) / 10;
  const carga_max = Math.round(estimated_1rm * rango.max * 10) / 10;
  const carga_sugerida = Math.round((carga_min + carga_max) / 2 * 10) / 10;

  return {
    estimated_1rm,
    rango_porcentaje: `${(rango.min * 100).toFixed(0)}%-${(rango.max * 100).toFixed(0)}%`,
    carga_min_kg: carga_min,
    carga_max_kg: carga_max,
    carga_sugerida_kg: carga_sugerida,
  };
}

module.exports = {
  NivelRiesgo,
  calcular_imc,
  calcular_carga_maxima_recomendada,
  validar_carga_ejercicio,
  estimar_1rm_repeticiones,
  calcular_carga_por_objetivo,
  _factor_por_edad,
  _factor_por_nivel,
};