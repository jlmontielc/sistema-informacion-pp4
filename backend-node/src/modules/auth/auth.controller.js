const authService = require('./auth.service');

const registrar = async (req, res, next) => {
  try {
    const resultado = await authService.registrar(req.body, req.usuario);
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
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { registrar, registrarInstruido, iniciarSesion, refrescarToken, cerrarSesion, obtenerPerfil, actualizarPerfil };
