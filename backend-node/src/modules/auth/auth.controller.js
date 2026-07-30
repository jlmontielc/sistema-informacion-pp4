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
    res.status(201).json(certificacion);
  } catch (err) {
    next(err);
  }
};

const eliminarCertificacion = async (req, res, next) => {
  try {
    const resultado = await authService.eliminarCertificacion(req.usuario.id, req.params.id);
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
