const registroEntrenamientoService = require('./registro-entrenamiento.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const registros = await registroEntrenamientoService.obtenerTodos(req.usuario, req.query);
    res.json(registros);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.obtenerPorId(req.params.id, req.usuario);
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(registro);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.crear(req.usuario, req.body);
    res.status(201).json(registro);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const eliminado = await registroEntrenamientoService.eliminar(req.params.id, req.usuario);
    if (!eliminado) return res.status(404).json({ error: 'Registro no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, eliminar };
