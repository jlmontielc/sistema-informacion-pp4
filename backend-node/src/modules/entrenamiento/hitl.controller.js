const hitlService = require('./hitl.service');

const sugerirRutina = async (req, res, next) => {
  try {
    const { clienteId } = req.params;
    const preferencias = req.body.preferencias || {};
    const resultado = await hitlService.sugerirRutina(
      Number(clienteId),
      req.usuario.id,
      preferencias,
      { persistir: true },
    );
    res.json(resultado);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, data: err.data });
    }
    next(err);
  }
};

const validarEjercicio = async (req, res, next) => {
  try {
    const { ejercicioId, clienteId } = req.params;
    const { carga_kg } = req.query;
    const resultado = await hitlService.validarEjercicio(
      Number(ejercicioId),
      Number(clienteId),
      carga_kg ? Number(carga_kg) : null,
    );
    res.json(resultado);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, data: err.data });
    }
    next(err);
  }
};

const sugerirDieta = async (req, res, next) => {
  try {
    const { clienteId } = req.params;
    const preferencias = req.body.preferencias || {};
    const resultado = await hitlService.sugerirDieta(
      Number(clienteId),
      req.usuario.id,
      preferencias,
      { persistir: true },
    );
    res.json(resultado);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, data: err.data });
    }
    next(err);
  }
};

module.exports = { sugerirRutina, validarEjercicio, sugerirDieta };
