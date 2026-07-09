const reportesService = require('./reportes.service');

const rendimientoMensual = async (req, res, next) => {
  try {
    let instruidoId = req.params.instruidoId;
    if (req.usuario.rol === 'instruido') {
      instruidoId = req.usuario.id;
    }
    const data = await reportesService.rendimientoMensual(instruidoId, req.usuario.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { rendimientoMensual };
