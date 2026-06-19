const { RutinaAsignada } = require('./entrenamiento.model');
const { Cliente } = require('../clientes/clientes.model');
const { Op } = require('sequelize');

const findAll = async (entrenadorId, filters = {}) => {
  const where = { entrenadorId };
  if (filters.clienteId) where.clienteId = filters.clienteId;
  if (filters.activa !== undefined) where.activa = filters.activa === 'true';
  return RutinaAsignada.findAll({
    where,
    include: [{ model: Cliente, attributes: ['id', 'nombre'] }],
    order: [['createdAt', 'DESC']],
  });
};

const findById = async (id, entrenadorId) =>
  RutinaAsignada.findOne({
    where: { id, entrenadorId },
    include: [{ model: Cliente, attributes: ['id', 'nombre'] }],
  });

const create = async (data, entrenadorId) => {
  const cliente = await Cliente.findOne({ where: { id: data.clienteId, entrenadorId } });
  if (!cliente) {
    const err = new Error('Cliente no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }
  return RutinaAsignada.create({ ...data, entrenadorId });
};

const update = async (id, data, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;
  if (data.clienteId) {
    const cliente = await Cliente.findOne({ where: { id: data.clienteId, entrenadorId } });
    if (!cliente) {
      const err = new Error('Cliente no encontrado');
      err.status = 404;
      throw err;
    }
  }
  return rutina.update(data);
};

const remove = async (id, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;
  return rutina.update({ activa: false });
};

module.exports = { findAll, findById, create, update, remove };
