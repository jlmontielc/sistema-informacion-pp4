const authService = require('./auth.service');
const cache = require('../../shared/cache/cache');
const cacheKeys = require('../../shared/cache/cacheKeys');

const registrar = async (req, res, next) => {
  try {
    const resultado = await authService.registrar(req.body, req.usuario);
    if (resultado.user && resultado.user.rol !== 'instruido') {
      await cache.eliminar(cacheKeys.auth.profiles('all'));
    }
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};

const iniciarSesion = async (req, res, next) => {
  try {
    const resultado = await authService.iniciarSesion(req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const refrescarToken = async (req, res, next) => {
  try {
    const resultado = await authService.refrescarToken(req.body.refreshToken);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const obtenerPerfil = async (req, res, next) => {
  try {
    const perfil = await authService.obtenerPerfil(req.usuario.id, req.usuario.tipo);
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

const actualizarPerfil = async (req, res, next) => {
  try {
    const perfil = await authService.actualizarPerfil(req.usuario.id, req.usuario.tipo, req.body);
    await cache.eliminar(cacheKeys.auth.perfil(req.usuario.tipo, req.usuario.id));
    if (req.usuario.tipo !== 'instruido') {
      await cache.eliminar(cacheKeys.auth.profiles('all'));
    }
    if (req.usuario.tipo === 'entrenador') {
      await cache.eliminarPorPatron(cacheKeys.auth.trainer('*'));
    }
    if (req.usuario.tipo === 'instruido') {
      await cache.eliminar(cacheKeys.dashboard.stats('instruido', req.usuario.id));
    }
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

const cerrarSesion = async (req, res, next) => {
  try {
    const resultado = await authService.cerrarSesion(req.token, req.body.refreshToken);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const registrarInstruido = async (req, res, next) => {
  try {
    const resultado = await authService.registrar({ ...req.body, rol: 'instruido' }, null);
    if (req.usuario) {
      await cache.eliminar(cacheKeys.instruidos.listado(req.usuario.id, req.usuario.rol));
      await cache.eliminarPorPatron(cacheKeys.instruidos.patronListado());
      await cache.eliminar(cacheKeys.dashboard.stats(req.usuario.rol, req.usuario.id));
    }
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};

const obtenerPerfilEntrenador = async (req, res, next) => {
  try {
    const perfil = await authService.obtenerPerfilEntrenador(req.usuario.id);
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

const obtenerTodosLosPerfiles = async (req, res, next) => {
  try {
    const perfiles = await authService.obtenerTodosLosPerfiles();
    res.json(perfiles);
  } catch (err) {
    next(err);
  }
};

const crearCertificacion = async (req, res, next) => {
  try {
    const certificacion = await authService.crearCertificacion(req.usuario.id, req.body);
    await cache.eliminar(cacheKeys.auth.perfil('entrenador', req.usuario.id));
    await cache.eliminar(cacheKeys.auth.profiles('all'));
    await cache.eliminarPorPatron(cacheKeys.auth.perfil('entrenador', '*'));
    await cache.eliminarPorPatron(cacheKeys.auth.trainer('*'));
    res.status(201).json(certificacion);
  } catch (err) {
    next(err);
  }
};

const eliminarCertificacion = async (req, res, next) => {
  try {
    const resultado = await authService.eliminarCertificacion(req.usuario.id, req.params.id);
    await cache.eliminar(cacheKeys.auth.perfil('entrenador', req.usuario.id));
    await cache.eliminar(cacheKeys.auth.profiles('all'));
    await cache.eliminarPorPatron(cacheKeys.auth.perfil('entrenador', '*'));
    await cache.eliminarPorPatron(cacheKeys.auth.trainer('*'));
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registrar,
  registrarInstruido,
  iniciarSesion,
  refrescarToken,
  cerrarSesion,
  obtenerPerfil,
  actualizarPerfil,
  obtenerPerfilEntrenador,
  obtenerTodosLosPerfiles,
  crearCertificacion,
  eliminarCertificacion,
};
