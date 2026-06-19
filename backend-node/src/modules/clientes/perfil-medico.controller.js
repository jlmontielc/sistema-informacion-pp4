const perfilMedicoService = require('./perfil-medico.service');

const getByCliente = async (req, res, next) => {
  try {
    const perfil = await perfilMedicoService.findByClienteId(req.params.clienteId, req.user.id);
    if (perfil === null) return res.status(404).json({ error: 'Cliente no encontrado' });
    if (!perfil) return res.json({});
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

const upsert = async (req, res, next) => {
  try {
    const perfil = await perfilMedicoService.upsert(req.params.clienteId, req.body, req.user.id);
    if (perfil === null) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

module.exports = { getByCliente, upsert };
