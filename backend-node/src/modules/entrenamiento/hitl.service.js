const { Instruido } = require('../instruidos/instruido.model');
const { PerfilMedico } = require('../instruidos/perfil-medico.model');
const { RegistroEntrenamiento, RutinaAsignada, PlantillaEntrenamiento } = require('./entrenamiento.model');
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
  if (!resultado || !resultado.success) return null;
  const plantillaId = resultado.plantilla_id;
  if (plantillaId == null) return null;

  const plantilla = await PlantillaEntrenamiento.findByPk(plantillaId);
  if (!plantilla) return null;

  await RutinaAsignada.update(
    { activa: false },
    { where: { instruidoId: clienteId, activa: true } },
  );

  const metadataRecomendacion = {
    plantilla_id: plantillaId,
    confianza: resultado.confianza,
    explicacion: resultado.explicacion || null,
    advertencia: resultado.advertencia || null,
    hasLesiones: resultado.hasLesiones || false,
    lesionesDetalle: resultado.lesionesDetalle || [],
    metadata: resultado.metadata || {},
  };

  return RutinaAsignada.create({
    instruidoId: clienteId,
    entrenadorId,
    plantillaOrigenId: plantillaId,
    nombre: `IA - ${plantilla.nombre}`,
    tipo: plantilla.tipo,
    ejercicios: plantilla.ejercicios,
    diasSemana: plantilla.diasSemana,
    frecuenciaSemanal: plantilla.frecuenciaSemanal,
    duracionSemanas: plantilla.duracionSemanas,
    observaciones: JSON.stringify(metadataRecomendacion),
    personalizadaPorEntrenador: false,
    activa: false,
  });
};

const sugerirRutina = async (clienteId, entrenadorId, preferencias = {}, opts = { persistir: true }) => {
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

  const plantillas = await PlantillaEntrenamiento.findAll({
    where: { entrenadorId, activa: true },
    attributes: ['id', 'nombre', 'tipo', 'objetivo', 'nivelDificultad', 'frecuenciaSemanal', 'duracionSemanas', 'diasSemana'],
    order: [['nombre', 'ASC']],
  });

  const plantillasMetadata = plantillas.map(p => p.toJSON());

  const lesionesFiltradas = perfilDescifrado ? parsearCampoJson(perfilDescifrado.lesiones) : [];

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
      lesiones: lesionesFiltradas,
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
    plantillas_disponibles: plantillasMetadata,
  };

  const response = await httpRequest('/api/predict/routine', 'POST', payload, 10000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  if (opts.persistir) {
    const resultadoPersistir = {
      ...response.data,
      hasLesiones: lesionesFiltradas.length > 0,
      lesionesDetalle: lesionesFiltradas,
    };
    await persistRoutineFromPrediction(clienteId, entrenadorId, resultadoPersistir);
  }

  return {
    ...response.data,
    hasLesiones: lesionesFiltradas.length > 0,
    lesionesDetalle: lesionesFiltradas,
  };
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

  const hoy = new Date();
  const fechaFin = new Date(hoy);
  fechaFin.setDate(fechaFin.getDate() + 30);

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
    fechaInicio: hoy.toISOString().split('T')[0],
    fechaFin: fechaFin.toISOString().split('T')[0],
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
    nivel_actividad: instruido.nivelActividad,
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
