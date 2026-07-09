const plantillasService = require('./plantillas.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const plantillas = await plantillasService.obtenerTodos(req.usuario.id, req.query);
    res.json(plantillas);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.obtenerPorId(req.params.id, req.usuario.id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.crear(req.body, req.usuario.id);
    res.status(201).json(plantilla);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.actualizar(req.params.id, req.body, req.usuario.id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await plantillasService.eliminar(req.params.id, req.usuario.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
