const dietasService = require('./dietas.service');

const getAll = async (req, res, next) => {
  try {
    const dietas = await dietasService.listarPorUsuario(req.usuario);
    res.json(dietas);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const dieta = await dietasService.crear(req.usuario, req.body);
    res.status(201).json(dieta);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create };
