const { PlantillaEntrenamiento } = require('./entrenamiento.model');
const { Op } = require('sequelize');

const obtenerTodos = async (entrenadorId, filtros = {}) => {
  const where = { entrenadorId };
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.objetivo) where.objetivo = filtros.objetivo;
  if (filtros.activa !== undefined) where.activa = filtros.activa === 'true';
  if (filtros.busqueda) {
    where.nombre = { [Op.like]: `%${filtros.busqueda}%` };
  }
  return PlantillaEntrenamiento.findAll({ where, order: [['createdAt', 'DESC']] });
};

const obtenerPorId = async (id, entrenadorId) =>
  PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });

const crear = async (datos, entrenadorId) =>
  PlantillaEntrenamiento.create({ ...datos, entrenadorId });

const actualizar = async (id, datos, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;
  return plantilla.update(datos);
};

const eliminar = async (id, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;
  return plantilla.destroy();
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
