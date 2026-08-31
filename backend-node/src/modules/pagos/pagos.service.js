const { Op } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');
const {
  PlanPago,
  MetodoPago,
  ConfiguracionPago,
  Pago,
  Instruido,
} = require('../../shared/database/associations');
const hitlService = require('../entrenamiento/hitl.service');

const TASA_POR_DEFECTO = 40.0000;

// Aritmetica de fechas pura en UTC para evitar desfases por zona horaria
const hoyISO = () => new Date().toISOString().slice(0, 10);

const sumarDias = (fechaISO, dias) => {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return fecha.toISOString().slice(0, 10);
};

const diasEntre = (inicioISO, finISO) => {
  const [a1, m1, d1] = inicioISO.split('-').map(Number);
  const [a2, m2, d2] = finISO.split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
};

const limpiar = (registro) => {
  if (!registro) return registro;
  if (Array.isArray(registro)) return registro.map((r) => limpiar(r));
  const datos = registro.toJSON();
  delete datos.comprobante;
  return datos;
};

const error = (mensaje, status) => {
  const err = new Error(mensaje);
  err.status = status;
  return err;
};

const verificarPertenencia = async (instruidoId, entrenadorId) => {
  const pertenece = await Instruido.findOne({ where: { id: instruidoId, entrenadorId } });
  if (!pertenece) {
    throw error('No estás asignado a este entrenador', 403);
  }
};

// ============ PLANES ============

const listarPlanes = async (usuario) => {
  const where = {};
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  return PlanPago.findAll({ where, order: [['created_at', 'DESC']] });
};

const crearPlan = async (usuario, datos) =>
  PlanPago.create({ ...datos, entrenadorId: usuario.id });

const obtenerPlanPropio = async (planId, usuario) => {
  const where = { id: planId };
  if (usuario.rol !== 'administrador') where.entrenadorId = usuario.id;
  const plan = await PlanPago.findOne({ where });
  if (!plan) throw error('Plan no encontrado', 404);
  return plan;
};

const actualizarPlan = async (planId, usuario, datos) => {
  const plan = await obtenerPlanPropio(planId, usuario);
  await plan.update(datos);
  return plan;
};

const eliminarPlan = async (planId, usuario) => {
  const plan = await obtenerPlanPropio(planId, usuario);
  await plan.update({ activo: false });
  return plan;
};

// ============ MÉTODOS DE PAGO ============

const listarMetodos = async (usuario) => {
  const where = {};
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  return MetodoPago.findAll({ where, order: [['created_at', 'DESC']] });
};

const crearMetodo = async (usuario, datos) =>
  MetodoPago.create({ ...datos, entrenadorId: usuario.id });

const obtenerMetodoPropio = async (metodoId, usuario) => {
  const where = { id: metodoId };
  if (usuario.rol !== 'administrador') where.entrenadorId = usuario.id;
  const metodo = await MetodoPago.findOne({ where });
  if (!metodo) throw error('Método de pago no encontrado', 404);
  return metodo;
};

const actualizarMetodo = async (metodoId, usuario, datos) => {
  const metodo = await obtenerMetodoPropio(metodoId, usuario);
  await metodo.update(datos);
  return metodo;
};

const eliminarMetodo = async (metodoId, usuario) => {
  const metodo = await obtenerMetodoPropio(metodoId, usuario);
  await metodo.update({ activo: false });
  return metodo;
};

// ============ CONFIGURACIÓN (TASA DE CAMBIO) ============

const obtenerConfiguracion = async (entrenadorId) => {
  const [config] = await ConfiguracionPago.findOrCreate({
    where: { entrenadorId },
    defaults: { tasaCambio: TASA_POR_DEFECTO },
  });
  return config;
};

const actualizarTasa = async (entrenadorId, tasaCambio) => {
  const config = await obtenerConfiguracion(entrenadorId);
  await config.update({ tasaCambio });
  return config;
};

// ============ CATÁLOGO PARA EL INSTRUIDO ============

const obtenerCatalogo = async (instruidoId, entrenadorId) => {
  await verificarPertenencia(instruidoId, entrenadorId);
  const [planes, metodos, config] = await Promise.all([
    PlanPago.findAll({ where: { entrenadorId, activo: true }, order: [['montoUsd', 'ASC']] }),
    MetodoPago.findAll({ where: { entrenadorId, activo: true } }),
    obtenerConfiguracion(entrenadorId),
  ]);
  return { planes, metodos, tasaCambio: Number(config.tasaCambio) };
};

// ============ PAGOS ============

const registrarPago = async (instruidoId, datos) => {
  const plan = await PlanPago.findOne({ where: { id: datos.planId, activo: true } });
  if (!plan) throw error('Plan no encontrado o no está disponible', 404);

  await verificarPertenencia(instruidoId, plan.entrenadorId);

  const metodo = await MetodoPago.findOne({
    where: { id: datos.metodoPagoId, entrenadorId: plan.entrenadorId, activo: true },
  });
  if (!metodo) throw error('Método de pago no encontrado o no está disponible', 404);

  const config = await obtenerConfiguracion(plan.entrenadorId);
  const montoUsd = Number(plan.montoUsd);
  const tasaAplicada = Number(config.tasaCambio);

  return Pago.create({
    instruidoId,
    entrenadorId: plan.entrenadorId,
    planId: plan.id,
    metodoPagoId: metodo.id,
    montoUsd,
    montoBs: Number((montoUsd * tasaAplicada).toFixed(2)),
    tasaAplicada,
    referencia: datos.referencia,
    fechaPago: datos.fechaPago,
    comprobante: datos.comprobante,
    comprobanteMime: datos.comprobanteMime,
    estado: 'pendiente',
  });
};

const listarMisPagos = async (instruidoId) =>
  Pago.findAll({
    where: { instruidoId },
    include: [
      { model: PlanPago, as: 'plan', attributes: ['id', 'nombre', 'montoUsd', 'diasVigencia'] },
      { model: MetodoPago, as: 'metodo', attributes: ['id', 'tipo'] },
    ],
    order: [['created_at', 'DESC']],
  }).then(limpiar);

const ESTADOS_VALIDOS = ['pendiente', 'verificado', 'rechazado'];

const listarPagosEntrenador = async (usuario, filtros = {}) => {
  const where = {};
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (filtros.estado && ESTADOS_VALIDOS.includes(filtros.estado)) {
    where.estado = filtros.estado;
  }
  if (filtros.instruidoId) where.instruidoId = Number(filtros.instruidoId) || undefined;
  return Pago.findAll({
    where,
    include: [
      { model: Instruido, attributes: ['id', 'nombre'] },
      { model: PlanPago, as: 'plan', attributes: ['id', 'nombre', 'montoUsd', 'diasVigencia'] },
      { model: MetodoPago, as: 'metodo', attributes: ['id', 'tipo'] },
    ],
    order: [['created_at', 'DESC']],
  }).then(limpiar);
};

const obtenerComprobante = async (pagoId, usuario) => {
  const pago = await Pago.findByPk(pagoId, {
    attributes: ['id', 'comprobante', 'comprobanteMime', 'instruidoId', 'entrenadorId'],
  });
  if (!pago) throw error('Pago no encontrado', 404);
  if (usuario.rol === 'instruido' && pago.instruidoId !== usuario.id) {
    throw error('No tienes acceso a este comprobante', 403);
  }
  if (usuario.rol === 'entrenador' && pago.entrenadorId !== usuario.id) {
    throw error('No tienes acceso a este comprobante', 403);
  }
  return { comprobante: pago.comprobante, mimeType: pago.comprobanteMime || 'image/jpeg' };
};

const verificarPago = async (pagoId, usuario) => {
  const resultado = await sequelize.transaction(async (t) => {
    const where = { id: pagoId };
    if (usuario.rol !== 'administrador') where.entrenadorId = usuario.id;

    const pago = await Pago.findOne({ where, transaction: t, lock: t.LOCK.UPDATE });
    if (!pago) throw error('Pago no encontrado', 404);
    if (pago.estado !== 'pendiente') {
      throw error(`El pago ya fue procesado (estado actual: ${pago.estado})`, 409);
    }

    const plan = await PlanPago.findByPk(pago.planId, { transaction: t });
    if (!plan) throw error('El plan asociado al pago ya no existe', 400);

    const hoy = hoyISO();
    // Con lock pesimista: dos verificaciones simultaneas del mismo instruido
    // no deben asignarse el mismo periodo (se apilan de forma determinista)
    const suscripcionVigente = await Pago.findOne({
      where: {
        instruidoId: pago.instruidoId,
        estado: 'verificado',
        fechaFin: { [Op.gte]: hoy },
      },
      order: [['fechaFin', 'DESC']],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // Si tiene suscripción activa la renovación se apila después de su vencimiento
    const fechaInicio = suscripcionVigente ? sumarDias(suscripcionVigente.fechaFin, 1) : hoy;
    const fechaFin = sumarDias(fechaInicio, plan.diasVigencia || 30);

    await pago.update({
      estado: 'verificado',
      verificadoPor: usuario.id,
      fechaVerificacion: new Date(),
      fechaInicio,
      fechaFin,
    }, { transaction: t });

    return pago;
  });

  // Disparar predicciones IA segun ofrecimiento del plan
  try {
    const plan = await PlanPago.findByPk(resultado.planId);
    if (plan && plan.ofrecimiento) {
      const clienteId = resultado.instruidoId;
      const entrenadorId = resultado.entrenadorId;
      const errores = [];

      if (plan.ofrecimiento === 'entrenamiento' || plan.ofrecimiento === 'ambos') {
        try {
          await hitlService.sugerirRutina(clienteId, entrenadorId, {}, { persistir: true });
        } catch (err) {
          console.error('[Pago] Error prediccion rutina automatica:', err.message);
          errores.push(`Rutina: ${err.message}`);
        }
      }

      if (plan.ofrecimiento === 'dietas' || plan.ofrecimiento === 'ambos') {
        try {
          await hitlService.sugerirDieta(clienteId, entrenadorId, {}, { persistir: true });
        } catch (err) {
          console.error('[Pago] Error prediccion dieta automatica:', err.message);
          errores.push(`Dieta: ${err.message}`);
        }
      }

      if (errores.length > 0) {
        await Pago.update(
          { errorPrediccionIa: errores.join(' | ') },
          { where: { id: resultado.id } },
        );
      }
    }
  } catch (err) {
    console.error('[Pago] Error disparando predicciones IA:', err.message);
    await Pago.update(
      { errorPrediccionIa: `Error general: ${err.message}` },
      { where: { id: resultado.id } },
    );
  }

  return limpiar(resultado);
};

const rechazarPago = async (pagoId, usuario, comentario) => {
  const where = { id: pagoId };
  if (usuario.rol !== 'administrador') where.entrenadorId = usuario.id;

  const pago = await Pago.findOne({ where });
  if (!pago) throw error('Pago no encontrado', 404);
  if (pago.estado !== 'pendiente') {
    throw error(`El pago ya fue procesado (estado actual: ${pago.estado})`, 409);
  }

  await pago.update({ estado: 'rechazado', comentarioRechazo: comentario || null });
  return limpiar(pago);
};

const obtenerMiSuscripcion = async (instruidoId) => {
  const hoy = hoyISO();

  const vigente = await Pago.findOne({
    where: { instruidoId, estado: 'verificado', fechaFin: { [Op.gte]: hoy } },
    include: [{ model: PlanPago, as: 'plan', attributes: ['nombre'] }],
    order: [['fechaFin', 'DESC']],
  });

  if (vigente) {
    return {
      activa: true,
      vencida: false,
      fechaInicio: vigente.fechaInicio,
      fechaFin: vigente.fechaFin,
      diasRestantes: diasEntre(hoy, vigente.fechaFin),
      plan: vigente.plan ? vigente.plan.nombre : null,
    };
  }

  const ultimo = await Pago.findOne({
    where: { instruidoId, estado: 'verificado' },
    order: [['fechaFin', 'DESC']],
  });

  if (!ultimo) {
    return { activa: false, vencida: false, mensaje: 'Sin suscripciones registradas' };
  }

  return {
    activa: false,
    vencida: true,
    fechaInicio: ultimo.fechaInicio,
    fechaFin: ultimo.fechaFin,
    mensaje: 'La suscripción ha vencido',
  };
};

module.exports = {
  listarPlanes,
  crearPlan,
  actualizarPlan,
  eliminarPlan,
  listarMetodos,
  crearMetodo,
  actualizarMetodo,
  eliminarMetodo,
  obtenerConfiguracion,
  actualizarTasa,
  obtenerCatalogo,
  registrarPago,
  listarMisPagos,
  listarPagosEntrenador,
  obtenerComprobante,
  verificarPago,
  rechazarPago,
  obtenerMiSuscripcion,
};
