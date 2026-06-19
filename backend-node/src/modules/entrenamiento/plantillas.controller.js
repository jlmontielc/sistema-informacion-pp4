const plantillasService = require('./plantillas.service');

const getAll = async (req, res, next) => {
  try {
    const plantillas = await plantillasService.findAll(req.user.id, req.query);
    res.json(plantillas);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.findById(req.params.id, req.user.id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.create(req.body, req.user.id);
    res.status(201).json(plantilla);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const plantilla = await plantillasService.update(req.params.id, req.body, req.user.id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await plantillasService.remove(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
