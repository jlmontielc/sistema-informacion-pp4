const pagosService = require('./pagos.service');

// ============ PLANES ============

const listarPlanes = async (req, res, next) => {
  try {
    const planes = await pagosService.listarPlanes(req.usuario);
    res.json(planes);
  } catch (err) {
    next(err);
  }
};

const crearPlan = async (req, res, next) => {
  try {
    const plan = await pagosService.crearPlan(req.usuario, req.body);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

const actualizarPlan = async (req, res, next) => {
  try {
    const plan = await pagosService.actualizarPlan(Number(req.params.planId), req.usuario, req.body);
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

const eliminarPlan = async (req, res, next) => {
  try {
    await pagosService.eliminarPlan(Number(req.params.planId), req.usuario);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// ============ MÉTODOS DE PAGO ============

const listarMetodos = async (req, res, next) => {
  try {
    const metodos = await pagosService.listarMetodos(req.usuario);
    res.json(metodos);
  } catch (err) {
    next(err);
  }
};

const crearMetodo = async (req, res, next) => {
  try {
    const metodo = await pagosService.crearMetodo(req.usuario, req.body);
    res.status(201).json(metodo);
  } catch (err) {
    next(err);
  }
};

const actualizarMetodo = async (req, res, next) => {
  try {
    const metodo = await pagosService.actualizarMetodo(Number(req.params.metodoId), req.usuario, req.body);
    res.json(metodo);
  } catch (err) {
    next(err);
  }
};

const eliminarMetodo = async (req, res, next) => {
  try {
    await pagosService.eliminarMetodo(Number(req.params.metodoId), req.usuario);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// ============ CONFIGURACIÓN ============

const obtenerConfiguracion = async (req, res, next) => {
  try {
    const config = await pagosService.obtenerConfiguracion(req.usuario.id);
    res.json(config);
  } catch (err) {
    next(err);
  }
};

const actualizarConfiguracion = async (req, res, next) => {
  try {
    const config = await pagosService.actualizarTasa(req.usuario.id, req.body.tasaCambio);
    res.json(config);
  } catch (err) {
    next(err);
  }
};

// ============ CATÁLOGO Y PAGOS DEL INSTRUIDO ============

const obtenerCatalogo = async (req, res, next) => {
  try {
    const catalogo = await pagosService.obtenerCatalogo(
      req.usuario.id,
      Number(req.params.entrenadorId),
    );
    res.json(catalogo);
  } catch (err) {
    next(err);
  }
};

const registrarPago = async (req, res, next) => {
  try {
    const pago = await pagosService.registrarPago(req.usuario.id, req.body);
    const { comprobante, ...pagoSinComprobante } = pago.toJSON();
    res.status(201).json(pagoSinComprobante);
  } catch (err) {
    next(err);
  }
};

const listarMisPagos = async (req, res, next) => {
  try {
    const pagos = await pagosService.listarMisPagos(req.usuario.id);
    res.json(pagos);
  } catch (err) {
    next(err);
  }
};

const miSuscripcion = async (req, res, next) => {
  try {
    const suscripcion = await pagosService.obtenerMiSuscripcion(req.usuario.id);
    res.json(suscripcion);
  } catch (err) {
    next(err);
  }
};

// ============ VERIFICACIÓN (ENTRENADOR) ============

const listarPagosEntrenador = async (req, res, next) => {
  try {
    const pagos = await pagosService.listarPagosEntrenador(req.usuario, req.query);
    res.json(pagos);
  } catch (err) {
    next(err);
  }
};

const obtenerComprobante = async (req, res, next) => {
  try {
    const archivo = await pagosService.obtenerComprobante(Number(req.params.pagoId), req.usuario);
    const buffer = Buffer.from(archivo.comprobante, 'base64');
    res.set('Content-Type', archivo.mimeType);
    res.set('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

const verificarPago = async (req, res, next) => {
  try {
    const pago = await pagosService.verificarPago(Number(req.params.pagoId), req.usuario);
    res.json(pago);
  } catch (err) {
    next(err);
  }
};

const rechazarPago = async (req, res, next) => {
  try {
    const pago = await pagosService.rechazarPago(Number(req.params.pagoId), req.usuario, req.body.comentario);
    res.json(pago);
  } catch (err) {
    next(err);
  }
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
  actualizarConfiguracion,
  obtenerCatalogo,
  registrarPago,
  listarMisPagos,
  miSuscripcion,
  listarPagosEntrenador,
  obtenerComprobante,
  verificarPago,
  rechazarPago,
};
