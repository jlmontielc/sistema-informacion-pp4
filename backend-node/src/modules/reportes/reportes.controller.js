const reportesService = require('./reportes.service');

const obtenerMetricasPorGrupo = async (req, res, next) => {
  try {
    const instruidoId = req.usuario.rol === 'instruido'
      ? req.usuario.id
      : Number(req.params.instruidoId);
    const { periodo } = req.query;
    const data = await reportesService.metricasPorGrupo(instruidoId, periodo, req.usuario);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const obtenerEvolucion = async (req, res, next) => {
  try {
    const instruidoId = req.usuario.rol === 'instruido'
      ? req.usuario.id
      : Number(req.params.instruidoId);
    const { grupoMuscular } = req.params;
    const { periodo } = req.query;
    const data = await reportesService.evolucionPorGrupo(instruidoId, grupoMuscular, periodo, req.usuario);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const obtenerComparativa = async (req, res, next) => {
  try {
    const instruidoId = req.usuario.rol === 'instruido'
      ? req.usuario.id
      : Number(req.params.instruidoId);
    const { periodo } = req.query;
    const data = await reportesService.comparativa(instruidoId, periodo, req.usuario);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const listarInstruidos = async (req, res, next) => {
  try {
    const data = await reportesService.listarInstruidos(req.usuario);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  obtenerMetricasPorGrupo,
  obtenerEvolucion,
  obtenerComparativa,
  listarInstruidos,
};
