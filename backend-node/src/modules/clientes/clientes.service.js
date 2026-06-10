const { Cliente } = require('./clientes.model');

const findAll = async () => Cliente.findAll();
const findById = async (id) => Cliente.findByPk(id);
const create = async (data) => Cliente.create(data);
const update = async (id, data) => {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) return null;
  return cliente.update(data);
};
const remove = async (id) => {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) return null;
  return cliente.destroy();
};

module.exports = { findAll, findById, create, update, remove };
