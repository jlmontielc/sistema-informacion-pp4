const registroEntrenamientoService = require('./registro-entrenamiento.service');

const getAll = async (req, res, next) => {
  try {
    const registros = await registroEntrenamientoService.findAll(req.user.id, req.query);
    res.json(registros);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.findById(req.params.id, req.user.id);
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(registro);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const registro = await registroEntrenamientoService.create(req.body);
    res.status(201).json(registro);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await registroEntrenamientoService.remove(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, remove };
