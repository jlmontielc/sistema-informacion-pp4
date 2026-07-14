const instruidoService = require('./instruido.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const instruidos = await instruidoService.obtenerTodos(req.usuario.id, req.usuario.rol);
    res.json(instruidos);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const instruido = await instruidoService.obtenerPorId(req.params.id, req.usuario.id, req.usuario.rol);
    if (!instruido) return res.status(404).json({ error: 'Instruido no encontrado' });
    res.json(instruido);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const instruido = await instruidoService.crear(req.body, req.usuario.id);
    res.status(201).json(instruido);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const instruido = await instruidoService.actualizar(req.params.id, req.body, req.usuario.id, req.usuario.rol);
    if (!instruido) return res.status(404).json({ error: 'Instruido no encontrado' });
    res.json(instruido);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await instruidoService.eliminar(req.params.id, req.usuario.id, req.usuario.rol);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const obtenerMiPerfil = async (req, res, next) => {
  try {
    const perfil = await instruidoService.obtenerPorIdPropio(req.usuario.id);
    if (!perfil) return res.status(404).json({ error: 'Instruido no encontrado' });
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

const actualizarMiPerfil = async (req, res, next) => {
  try {
    const perfil = await instruidoService.actualizarPropio(req.usuario.id, req.body);
    if (!perfil) return res.status(404).json({ error: 'Instruido no encontrado' });
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar, obtenerMiPerfil, actualizarMiPerfil };
