const ejerciciosService = require('./ejercicios.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const ejercicios = await ejerciciosService.obtenerTodos(req.query);
    res.json(ejercicios);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const ejercicio = await ejerciciosService.obtenerPorId(req.params.id);
    if (!ejercicio) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    res.json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const ejercicio = await ejerciciosService.crear(req.body);
    res.status(201).json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const ejercicio = await ejerciciosService.actualizar(req.params.id, req.body);
    if (!ejercicio) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    res.json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await ejerciciosService.eliminar(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
