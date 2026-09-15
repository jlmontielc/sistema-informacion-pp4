const ejerciciosService = require('./ejercicios.service');
const cache = require('../../shared/cache/cache');
const cacheKeys = require('../../shared/cache/cacheKeys');

const obtenerTodos = async (req, res, next) => {
  try {
    const { pagina, limite, grupoMuscular, target, equipoNecesario, dificultad, busqueda } = req.query;
    const filtros = { pagina, limite, grupoMuscular, target, equipoNecesario, dificultad, busqueda };
    const resultado = await ejerciciosService.obtenerTodos(filtros);
    res.json(resultado);
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
    await cache.eliminarPorPatron(cacheKeys.ejercicios.patronLista());
    res.status(201).json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const ejercicio = await ejerciciosService.actualizar(req.params.id, req.body);
    if (!ejercicio) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    await cache.eliminar(cacheKeys.ejercicios.porId(req.params.id));
    await cache.eliminarPorPatron(cacheKeys.ejercicios.patronLista());
    res.json(ejercicio);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await ejerciciosService.eliminar(req.params.id);
    await cache.eliminar(cacheKeys.ejercicios.porId(req.params.id));
    await cache.eliminarPorPatron(cacheKeys.ejercicios.patronLista());
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
