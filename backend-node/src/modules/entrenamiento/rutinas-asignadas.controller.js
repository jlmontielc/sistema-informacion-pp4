const rutinasAsignadasService = require('./rutinas-asignadas.service');

const obtenerTodos = async (req, res, next) => {
  try {
    const filtros = { ...req.query };
    if (req.usuario.rol === 'instruido') {
      filtros.instruidoIdActual = req.usuario.id;
      filtros.propias = 'true';
    }
    const rutinas = await rutinasAsignadasService.obtenerTodos(req.usuario.id, filtros);
    res.json(rutinas);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    let rutina;
    if (req.usuario.rol === 'instruido') {
      rutina = await rutinasAsignadasService.obtenerPorIdPropio(req.params.id, req.usuario.id);
    } else {
      rutina = await rutinasAsignadasService.obtenerPorId(req.params.id, req.usuario.id);
    }
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(rutina);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const rutina = await rutinasAsignadasService.crear(req.body, req.usuario.id);
    res.status(201).json(rutina);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const rutina = await rutinasAsignadasService.actualizar(req.params.id, req.body, req.usuario.id);
    if (!rutina) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(rutina);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    await rutinasAsignadasService.eliminar(req.params.id, req.usuario.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
