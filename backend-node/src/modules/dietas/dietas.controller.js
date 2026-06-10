const dietasService = require('./dietas.service');

const getAll = async (req, res, next) => {
  try {
    const dietas = await dietasService.findAll();
    res.json(dietas);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const dieta = await dietasService.create(req.body);
    res.status(201).json(dieta);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create };
