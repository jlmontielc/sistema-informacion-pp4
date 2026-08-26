const { Instruido } = require('../instruidos/instruido.model');
const { PerfilMedico } = require('../instruidos/perfil-medico.model');
const { RegistroEntrenamiento, RutinaAsignada } = require('./entrenamiento.model');
const { CalculoMetabolico } = require('../metabolismo/metabolismo.model');
const {
  httpRequest,
  descifrarSeguro,
  parsearCampoJson,
  CAMPOS_SENSIBLES,
} = require('../../shared/utils/flask-client');

const descifrarCampos = (registro) => {
  if (!registro) return registro;
  const datos = registro.toJSON ? registro.toJSON() : { ...registro };
  for (const campo of CAMPOS_SENSIBLES) {
    if (datos[campo]) {
      datos[campo] = descifrarSeguro(datos[campo]);
    }
  }
  return datos;
};

const persistRoutineFromPrediction = async (clienteId, entrenadorId, resultado) => {
  if (!resultado || !resultado.success || !resultado.plantillas_recomendadas) return null;

  const recomendaciones = resultado.plantillas_recomendadas;
  if (!Array.isArray(recomendaciones) || recomendaciones.length === 0) return null;

  const mejor = recomendaciones[0];

  await RutinaAsignada.update(
    { activa: false },
    { where: { instruidoId: clienteId, activa: true } },
  );

  const datosGuardados = {
    plantillas_recomendadas: recomendaciones.map(p => ({
      plantilla_id: p.plantilla_id,
      nombre: p.nombre,
      score: p.score,
      tipo: p.tipo,
      nivel_dificultad: p.nivel_dificultad,
      objetivo: p.objetivo,
      dias_semana: p.dias_semana,
      frecuencia_semanal: p.frecuencia_semanal,
      ejercicios_totales: p.ejercicios_totales,
      ejercicios_seguros: p.ejercicios_seguros,
      ejercicios_bloqueados_count: p.ejercicios_bloqueados_count,
      explicacion: p.explicacion,
    })),
    explicacion: resultado.explicacion || null,
  };

  return RutinaAsignada.create({
    instruidoId: clienteId,
    entrenadorId,
    plantillaOrigenId: mejor.plantilla_id || null,
    nombre: `IA - ${mejor.nombre || 'Recomendación'}`,
    tipo: mejor.tipo || 'fuerza',
    ejercicios: datosGuardados,
    diasSemana: mejor.dias_semana || null,
    frecuenciaSemanal: mejor.frecuencia_semanal || null,
    observaciones: resultado.explicacion || null,
    personalizadaPorEntrenador: false,
    activa: false,
  });
};

const sugerirRutina = async (clienteId, entrenadorId, preferencias = {}, opts = {}) => {
  const instruido = await Instruido.findOne({
    where: { id: clienteId, entrenadorId },
  });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  const perfilMedicoRaw = await PerfilMedico.findOne({
    where: { instruidoId: clienteId },
  });
  const perfilDescifrado = perfilMedicoRaw ? descifrarCampos(perfilMedicoRaw) : null;

  const historial = await RegistroEntrenamiento.findAll({
    where: { instruidoId: clienteId },
    order: [['fecha', 'DESC']],
    limit: 20,
  });

  const historialFormateado = historial.map(reg => ({
    fecha: reg.fecha,
    ejercicios_realizados: reg.ejerciciosRealizados,
    percepcion_esfuerzo: reg.percepcionEsfuerzo,
    duracion_minutos: reg.duracionMinutos,
  }));

  const payload = {
    cliente_id: clienteId,
    entrenador_id: entrenadorId,
    edad: instruido.edad,
    peso: Number(instruido.peso),
    altura: Number(instruido.altura),
    sexo: instruido.sexo,
    nivel_actividad: instruido.nivelActividad,
    nivel_experiencia: instruido.nivelExperiencia || null,
    proposito: instruido.propositoEntrenamiento || 'mantenimiento',
    dias_disponibles: instruido.diasDisponibles || 3,
    perfil_medico: {
      lesiones: perfilDescifrado ? parsearCampoJson(perfilDescifrado.lesiones) : [],
      condiciones_preexistentes: perfilDescifrado ? parsearCampoJson(perfilDescifrado.condicionesPreexistentes) : [],
      alergias: perfilDescifrado ? parsearCampoJson(perfilDescifrado.alergias) : [],
      medicacion: perfilDescifrado ? parsearCampoJson(perfilDescifrado.medicacionActual) : [],
    },
    historial_reciente: {
      ultimas_4_semanas: historialFormateado,
    },
    preferencias: {
      ejercicios_excluir: preferencias.excluir || [],
      equipamiento_disponible: preferencias.equipamiento || [],
    },
  };

  const response = await httpRequest('/api/predict/routine', 'POST', payload, 10000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  if (opts.persistir) {
    await persistRoutineFromPrediction(clienteId, entrenadorId, response.data);
  }

  return response.data;
};

const validarEjercicio = async (ejercicioId, clienteId, cargaKg = null) => {
  const payload = {
    ejercicio_id: ejercicioId,
    cliente_id: clienteId,
  };
  if (cargaKg !== null) {
    payload.carga_kg = cargaKg;
  }

  const response = await httpRequest('/api/predict/validate', 'POST', payload, 5000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  return response.data;
};

const persistDietaFromPrediction = async (clienteId, entrenadorId, resultado) => {
  if (!resultado || !resultado.objetivo_calorico) return null;

  const { Dieta } = require('../dietas/dietas.model');

  await Dieta.update(
    { activo: false },
    { where: { instruidoId: clienteId, activo: true } },
  );

  return Dieta.create({
    instruidoId: clienteId,
    entrenadorId,
    objetivoCalorico: resultado.objetivo_calorico,
    proteinas: resultado.proteinas_gramos,
    carbohidratos: resultado.carbohidratos_gramos,
    grasas: resultado.grasas_gramos,
    observaciones: resultado.justificacion || 'Generada por IA tras activacion de plan',
    activo: false,
    decision: 'pendiente',
  });
};

const sugerirDieta = async (clienteId, entrenadorId, preferencias = {}, opts = {}) => {
  const instruido = await Instruido.findOne({
    where: { id: clienteId, entrenadorId },
  });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  const perfilMedicoRaw = await PerfilMedico.findOne({
    where: { instruidoId: clienteId },
  });
  const perfilDescifrado = perfilMedicoRaw ? descifrarCampos(perfilMedicoRaw) : null;

  const calculoMetabolico = await CalculoMetabolico.findOne({
    where: { clienteId },
    order: [['fechaCalculo', 'DESC']],
  });

  if (!calculoMetabolico) {
    const err = new Error('No existe cálculo metabólico para este cliente. Genere uno primero desde metabolismo.');
    err.status = 400;
    throw err;
  }

  const payload = {
    tmb: Number(calculoMetabolico.tmb),
    gct: Number(calculoMetabolico.gct),
    nivelActividad: instruido.nivelActividad,
    proposito: preferencias.proposito || 'mantener',
    peso: Number(instruido.peso),
    altura: Number(instruido.altura),
    edad: instruido.edad,
    sexo: instruido.sexo,
    datosMedicos: {
      alergias: perfilDescifrado ? parsearCampoJson(perfilDescifrado.alergias) : [],
      intolerancias: perfilDescifrado ? parsearCampoJson(perfilDescifrado.intolerancias) : [],
      condiciones: perfilDescifrado ? parsearCampoJson(perfilDescifrado.condicionesPreexistentes) : [],
    },
  };

  const response = await httpRequest('/api/predict/dieta', 'POST', payload, 10000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  if (opts.persistir) {
    await persistDietaFromPrediction(clienteId, entrenadorId, response.data);
  }

  return response.data;
};

module.exports = {
  sugerirRutina,
  validarEjercicio,
  sugerirDieta,
  persistRoutineFromPrediction,
  persistDietaFromPrediction,
};
