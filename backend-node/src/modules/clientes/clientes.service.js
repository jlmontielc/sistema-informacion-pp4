const { Cliente } = require('./clientes.model');

const findAll = async (entrenadorId) => Cliente.findAll({ where: { entrenadorId } });

const findById = async (id, entrenadorId) => Cliente.findOne({ where: { id, entrenadorId } });

const create = async (data, entrenadorId) => Cliente.create({ ...data, entrenadorId });

const update = async (id, data, entrenadorId) => {
  const cliente = await Cliente.findOne({ where: { id, entrenadorId } });
  if (!cliente) return null;
  return cliente.update(data);
};

const remove = async (id, entrenadorId) => {
  const cliente = await Cliente.findOne({ where: { id, entrenadorId } });
  if (!cliente) return null;
  return cliente.destroy();
};

module.exports = { findAll, findById, create, update, remove };
