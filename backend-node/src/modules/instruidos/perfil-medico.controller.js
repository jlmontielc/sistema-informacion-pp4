const perfilMedicoService = require('./perfil-medico.service');
const cache = require('../../shared/cache/cache');
const cacheKeys = require('../../shared/cache/cacheKeys');

const obtenerPorInstruido = async (req, res, next) => {
  try {
    const perfil = await perfilMedicoService.obtenerPerfilDescifradoPorInstruidoId(req.params.instruidoId, req.usuario);
    if (perfil === null) return res.status(404).json({ error: 'Instruido no encontrado' });
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

const crearOActualizar = async (req, res, next) => {
  try {
    const perfil = await perfilMedicoService.crearOActualizar(req.params.instruidoId, req.body, req.usuario);
    if (perfil === null) return res.status(404).json({ error: 'Instruido no encontrado' });
    await cache.eliminar(cacheKeys.auth.perfil('instruido', req.params.instruidoId));
    await cache.eliminar(cacheKeys.dashboard.stats('instruido', req.params.instruidoId));
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerPorInstruido, crearOActualizar };
