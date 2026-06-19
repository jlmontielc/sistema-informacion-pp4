const clientesService = require('./clientes.service');

const getAll = async (req, res, next) => {
  try {
    const clientes = await clientesService.findAll(req.user.id);
    res.json(clientes);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const cliente = await clientesService.findById(req.params.id, req.user.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const cliente = await clientesService.create(req.body, req.user.id);
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const cliente = await clientesService.update(req.params.id, req.body, req.user.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await clientesService.remove(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
