const { PlantillaEntrenamiento } = require('./entrenamiento.model');
const { Op } = require('sequelize');

const findAll = async (entrenadorId, filters = {}) => {
  const where = { entrenadorId };
  if (filters.tipo) where.tipo = filters.tipo;
  if (filters.objetivo) where.objetivo = filters.objetivo;
  if (filters.activa !== undefined) where.activa = filters.activa === 'true';
  if (filters.search) {
    where.nombre = { [Op.like]: `%${filters.search}%` };
  }
  return PlantillaEntrenamiento.findAll({ where, order: [['createdAt', 'DESC']] });
};

const findById = async (id, entrenadorId) =>
  PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });

const create = async (data, entrenadorId) =>
  PlantillaEntrenamiento.create({ ...data, entrenadorId });

const update = async (id, data, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;
  return plantilla.update(data);
};

const remove = async (id, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;
  return plantilla.destroy();
};

module.exports = { findAll, findById, create, update, remove };
