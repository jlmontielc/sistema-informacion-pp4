const dietasService = require('./dietas.service');
const cache = require('../../shared/cache/cache');
const cacheKeys = require('../../shared/cache/cacheKeys');

const invalidarCacheDieta = async (dietaId, usuario, instruidoId = null) => {
  await cache.eliminarPorPatron(cacheKeys.dietas.patronListado());
  await cache.eliminarPorPatron(cacheKeys.dietas.patronPorId(dietaId));
  await cache.eliminar(cacheKeys.dashboard.stats(usuario.rol, usuario.id));
  if (instruidoId) {
    await cache.eliminar(cacheKeys.dashboard.stats('instruido', instruidoId));
  }
};

const getAll = async (req, res, next) => {
  try {
    const dietas = await dietasService.listarPorUsuario(req.usuario);
    res.json(dietas);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const dieta = await dietasService.obtenerPorId(req.usuario, Number(req.params.id));
    res.json(dieta);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const dieta = await dietasService.crear(req.usuario, req.body);
    await invalidarCacheDieta(dieta.id, req.usuario, dieta.instruidoId);
    res.status(201).json(dieta);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const dieta = await dietasService.actualizar(req.usuario, Number(req.params.id), req.body);
    await invalidarCacheDieta(dieta.id, req.usuario, dieta.instruidoId);
    res.json(dieta);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const dieta = await dietasService.desactivar(req.usuario, Number(req.params.id));
    await invalidarCacheDieta(dieta.id, req.usuario, dieta.instruidoId);
    res.json(dieta);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
};

const generar = async (req, res, next) => {
  try {
    const resultado = await dietasService.generarDieta(
      req.usuario,
      Number(req.params.instruidoId),
      req.body,
    );
    await invalidarCacheDieta(resultado.dieta.id, req.usuario, Number(req.params.instruidoId));
    res.status(201).json(resultado);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, data: err.data });
    }
    next(err);
  }
};

const decidir = async (req, res, next) => {
  try {
    const resultado = await dietasService.decidir(req.usuario, Number(req.params.id), req.body);
    await invalidarCacheDieta(resultado.id, req.usuario, resultado.instruidoId);
    res.json(resultado);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, generar, decidir };
