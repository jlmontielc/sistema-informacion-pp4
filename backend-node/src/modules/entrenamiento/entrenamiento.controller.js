const entrenamientoService = require('./entrenamiento.service');

const getAll = async (req, res, next) => {
  try {
    const rutinas = await entrenamientoService.findAll();
    res.json(rutinas);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const rutina = await entrenamientoService.create(req.body);
    res.status(201).json(rutina);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create };
