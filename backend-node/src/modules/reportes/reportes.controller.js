const reportesService = require('./reportes.service');

const rendimientoMensual = async (req, res, next) => {
  try {
    const data = await reportesService.rendimientoMensual(req.params.clienteId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { rendimientoMensual };
