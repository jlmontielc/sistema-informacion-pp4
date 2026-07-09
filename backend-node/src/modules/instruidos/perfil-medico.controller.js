const perfilMedicoService = require('./perfil-medico.service');

const obtenerPorInstruido = async (req, res, next) => {
  try {
    const perfil = await perfilMedicoService.obtenerPorInstruidoId(req.params.instruidoId, req.usuario.id);
    if (perfil === null) return res.status(404).json({ error: 'Instruido no encontrado' });
    if (!perfil) return res.json({});
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

const crearOActualizar = async (req, res, next) => {
  try {
    const perfil = await perfilMedicoService.crearOActualizar(req.params.instruidoId, req.body, req.usuario.id);
    if (perfil === null) return res.status(404).json({ error: 'Instruido no encontrado' });
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerPorInstruido, crearOActualizar };
