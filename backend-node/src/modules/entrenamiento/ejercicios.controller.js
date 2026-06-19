const ejerciciosService = require('./ejercicios.service');

const getAll = async (req, res, next) => {
  try {
    const ejercicios = await ejerciciosService.findAll(req.query);
    res.json(ejercicios);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const ejercicio = await ejerciciosService.findById(req.params.id);
    if (!ejercicio) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    res.json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const ejercicio = await ejerciciosService.create(req.body);
    res.status(201).json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const ejercicio = await ejerciciosService.update(req.params.id, req.body);
    if (!ejercicio) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    res.json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await ejerciciosService.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
