const metabolismoService = require('./metabolismo.service');

const calcular = async (req, res, next) => {
  try {
    const resultado = await metabolismoService.calcular(req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { calcular };
