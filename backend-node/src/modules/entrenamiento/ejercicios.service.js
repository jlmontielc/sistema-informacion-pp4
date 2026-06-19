const { Ejercicio } = require('./entrenamiento.model');

const { Op } = require('sequelize');

const findAll = async (filters = {}) => {
  const where = {};
  if (filters.grupoMuscular) where.grupoMuscular = filters.grupoMuscular;
  if (filters.dificultad) where.dificultad = filters.dificultad;
  if (filters.search) {
    where.nombre = { [Op.like]: `%${filters.search}%` };
  }
  return Ejercicio.findAll({ where, order: [['nombre', 'ASC']] });
};

const findById = async (id) => Ejercicio.findByPk(id);

const create = async (data) => Ejercicio.create(data);

const update = async (id, data) => {
  const ejercicio = await Ejercicio.findByPk(id);
  if (!ejercicio) return null;
  return ejercicio.update(data);
};

const remove = async (id) => {
  const ejercicio = await Ejercicio.findByPk(id);
  if (!ejercicio) return null;
  return ejercicio.destroy();
};

module.exports = { findAll, findById, create, update, remove };
