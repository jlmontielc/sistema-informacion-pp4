const rutinasAsignadasService = require('./rutinas-asignadas.service');

const getAll = async (req, res, next) => {
  try {
    const rutinas = await rutinasAsignadasService.findAll(req.user.id, req.query);
    res.json(rutinas);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const rutina = await rutinasAsignadasService.findById(req.params.id, req.user.id);
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(rutina);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const rutina = await rutinasAsignadasService.create(req.body, req.user.id);
    res.status(201).json(rutina);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const rutina = await rutinasAsignadasService.update(req.params.id, req.body, req.user.id);
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(rutina);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await rutinasAsignadasService.remove(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
