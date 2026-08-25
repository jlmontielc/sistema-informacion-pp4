const { Dieta } = require('./dietas.model');
const { Instruido } = require('../instruidos/instruido.model');
const { PerfilMedico } = require('../instruidos/perfil-medico.model');
const { CalculoMetabolico } = require('../metabolismo/metabolismo.model');
const { calcularTMB, calcularGCT } = require('../../shared/utils/helpers');
const { HitlFeedback } = require('../entrenamiento/hitl-feedback.model');
const {
  httpRequest,
  descifrarSeguro,
  parsearCampoJson,
} = require('../../shared/utils/flask-client');

const verificarPertenencia = async (usuario, instruidoId) => {
  if (usuario.rol === 'instruido') {
    return usuario.id === Number(instruidoId);
  }
  const pertenece = await Instruido.findOne({
    where: { id: instruidoId, entrenadorId: usuario.id },
  });
  return !!pertenece;
};

const listarPorUsuario = async (usuario) => {
  const where = {};
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (usuario.rol === 'instruido') where.instruidoId = usuario.id;
  return Dieta.findAll({
    where,
    order: [['created_at', 'DESC']],
  });
};

const crear = async (usuario, datos) => {
  const { instruidoId, ...resto } = datos;

  if (usuario.rol === 'entrenador') {
    const pertenece = await Instruido.findOne({
      where: { id: instruidoId, entrenadorId: usuario.id },
    });
    if (!pertenece) {
      const err = new Error('Instruido no encontrado o no pertenece al entrenador');
      err.status = 404;
      throw err;
    }
  }

  return Dieta.create({ ...resto, instruidoId, entrenadorId: usuario.id });
};

const obtenerPorId = async (usuario, id) => {
  const dieta = await Dieta.findByPk(id);
  if (!dieta) {
    const err = new Error('Dieta no encontrada');
    err.status = 404;
    throw err;
  }

  if (usuario.rol === 'administrador') return dieta;

  if (usuario.rol === 'instruido') {
    if (dieta.instruidoId !== usuario.id) {
      const err = new Error('Dieta no encontrada');
      err.status = 404;
      throw err;
    }
    return dieta;
  }

  if (usuario.rol === 'entrenador') {
    if (dieta.entrenadorId !== usuario.id) {
      const err = new Error('Dieta no encontrada');
      err.status = 404;
      throw err;
    }
    return dieta;
  }

  const err = new Error('Dieta no encontrada');
  err.status = 404;
  throw err;
};

const CAMPOS_EDITABLES = [
  'objetivoCalorico', 'proteinas', 'carbohidratos', 'grasas',
  'observaciones', 'fechaInicio', 'fechaFin', 'activo',
];

const actualizar = async (usuario, id, datos) => {
  const dieta = await obtenerPorId(usuario, id);
  const datosFiltrados = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (datos[campo] !== undefined) {
      datosFiltrados[campo] = datos[campo];
    }
  }
  if (Object.keys(datosFiltrados).length === 0) {
    const err = new Error('No se proporcionaron campos para actualizar');
    err.status = 400;
    throw err;
  }
  await dieta.update(datosFiltrados);
  return dieta;
};

const desactivar = async (usuario, id) => {
  const dieta = await obtenerPorId(usuario, id);
  await dieta.update({ activo: false });
  return dieta;
};

const CAMPOS_SENSIBLES_PERFIL = ['alergias', 'intolerancias', 'condicionesPreexistentes'];

const generarDieta = async (usuario, instruidoId, { proposito }) => {
  if (usuario.rol !== 'entrenador' && usuario.rol !== 'administrador') {
    const err = new Error('Solo entrenadores y administradores pueden generar dietas');
    err.status = 403;
    throw err;
  }

  const pertenece = await verificarPertenencia(usuario, instruidoId);
  if (!pertenece) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  const instruido = await Instruido.findByPk(instruidoId);
  if (!instruido) {
    const err = new Error('Instruido no encontrado');
    err.status = 404;
    throw err;
  }

  let calculoMetabolico = await CalculoMetabolico.findOne({
    where: { clienteId: instruidoId },
    order: [['fechaCalculo', 'DESC']],
  });

  if (!calculoMetabolico) {
    const tmb = calcularTMB({
      peso: Number(instruido.peso),
      altura: Number(instruido.altura),
      edad: instruido.edad,
      sexo: instruido.sexo,
    });
    const gct = calcularGCT(tmb, instruido.nivelActividad);

    calculoMetabolico = await CalculoMetabolico.create({
      clienteId: instruidoId,
      tmb: Math.round(tmb * 100) / 100,
      gct: Math.round(gct * 100) / 100,
      nivelActividadUsado: instruido.nivelActividad,
      pesoUsado: instruido.peso,
    });
  }

  const perfilMedicoRaw = await PerfilMedico.findOne({
    where: { instruidoId },
  });

  let alergias = [];
  let intolerancias = [];
  let condiciones = [];
  if (perfilMedicoRaw) {
    const perfilDescifrado = {};
    for (const campo of CAMPOS_SENSIBLES_PERFIL) {
      const valorCifrado = perfilMedicoRaw[campo];
      if (valorCifrado) {
        perfilDescifrado[campo] = descifrarSeguro(valorCifrado);
      }
    }
    alergias = parsearCampoJson(perfilDescifrado.alergias);
    intolerancias = parsearCampoJson(perfilDescifrado.intolerancias);
    condiciones = parsearCampoJson(perfilDescifrado.condicionesPreexistentes);
  }

  const payload = {
    tmb: Number(calculoMetabolico.tmb),
    gct: Number(calculoMetabolico.gct),
    nivelActividad: instruido.nivelActividad,
    proposito: proposito || 'mantenimiento',
    peso: Number(instruido.peso),
    altura: Number(instruido.altura),
    edad: instruido.edad,
    sexo: instruido.sexo,
    datosMedicos: { alergias, intolerancias, condiciones },
  };

  const response = await httpRequest('/api/predict/dieta', 'POST', payload, 15000);

  if (response.status >= 400) {
    const err = new Error(response.data.error || 'Error en el servicio de IA');
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  const resultado = response.data;

  if (resultado.guardian && !resultado.guardian.aprobado) {
    const err = new Error('Guardian dietético bloqueó la generación');
    err.status = 409;
    err.data = resultado;
    throw err;
  }

  const dieta = await Dieta.create({
    instruidoId,
    entrenadorId: usuario.id,
    objetivoCalorico: resultado.objetivo_calorico,
    proteinas: resultado.proteinas_gramos,
    carbohidratos: resultado.carbohidratos_gramos,
    grasas: resultado.grasas_gramos,
    observaciones: resultado.justificacion || null,
    activo: false,
    decision: 'pendiente',
  });

  return {
    dieta,
    guardian: resultado.guardian,
    justificacion: resultado.justificacion,
  };
};

const decidir = async (usuario, id, datos) => {
  const { accion, comentario, ...resto } = datos;

  if (usuario.rol !== 'entrenador' && usuario.rol !== 'administrador') {
    const err = new Error('Solo entrenadores y administradores pueden decidir sobre dietas');
    err.status = 403;
    throw err;
  }

  const dieta = await obtenerPorId(usuario, id);

  let estadoFinal = {};

  if (accion === 'aceptada') {
    const datosActualizar = {};
    for (const campo of CAMPOS_EDITABLES) {
      if (resto[campo] !== undefined) {
        datosActualizar[campo] = resto[campo];
      }
    }
    datosActualizar.activo = true;
    datosActualizar.decision = 'aprobada';
    await dieta.update(datosActualizar);
    estadoFinal = dieta.toJSON();
    Object.assign(estadoFinal, datosActualizar);
  } else if (accion === 'rechazada') {
    await dieta.update({ activo: false, decision: 'rechazada' });
    estadoFinal = dieta.toJSON();
    estadoFinal.activo = false;
    estadoFinal.decision = 'rechazada';
  } else if (accion === 'modificada') {
    const datosActualizar = {};
    for (const campo of CAMPOS_EDITABLES) {
      if (resto[campo] !== undefined) {
        datosActualizar[campo] = resto[campo];
      }
    }
    datosActualizar.activo = true;
    datosActualizar.decision = 'modificada';
    await dieta.update(datosActualizar);
    estadoFinal = dieta.toJSON();
    Object.assign(estadoFinal, datosActualizar);
  }

  await HitlFeedback.create({
    entrenadorId: usuario.id,
    clienteId: dieta.instruidoId,
    accion: accion === 'aceptada' ? 'aprobada' : accion === 'rechazada' ? 'rechazada' : 'modificada',
    rutinaOriginal: {
      objetivo_calorico: dieta.objetivoCalorico,
      proteinas_gramos: Number(dieta.proteinas),
      carbohidratos_gramos: Number(dieta.carbohidratos),
      grasas_gramos: Number(dieta.grasas),
    },
    rutinaFinal: {
      objetivo_calorico: estadoFinal.objetivoCalorico,
      proteinas_gramos: Number(estadoFinal.proteinas || 0),
      carbohidratos_gramos: Number(estadoFinal.carbohidratos || 0),
      grasas_gramos: Number(estadoFinal.grasas || 0),
    },
    observaciones: comentario || null,
    tipo: 'dieta',
  });

  return estadoFinal;
};

module.exports = {
  listarPorUsuario, crear, obtenerPorId, actualizar, desactivar, generarDieta, decidir,
};
