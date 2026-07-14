const { Ejercicio } = require('./entrenamiento.model');
const { Op } = require('sequelize');

const obtenerTodos = async (filtros = {}) => {
  const where = {};
  if (filtros.grupoMuscular) where.grupoMuscular = filtros.grupoMuscular;
  if (filtros.target) where.target = filtros.target;
  if (filtros.equipoNecesario) where.equipoNecesario = filtros.equipoNecesario;
  if (filtros.dificultad) where.dificultad = filtros.dificultad;
  if (filtros.busqueda) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${filtros.busqueda}%` } },
      { instruccionesEs: { [Op.like]: `%${filtros.busqueda}%` } },
    ];
  }
  return Ejercicio.findAll({ where, order: [['nombre', 'ASC']] });
};

const obtenerPorId = async (id) => Ejercicio.findByPk(id);

const crear = async (datos) => Ejercicio.create(datos);

const actualizar = async (id, datos) => {
  const ejercicio = await Ejercicio.findByPk(id);
  if (!ejercicio) return null;
  return ejercicio.update(datos);
};

const eliminar = async (id) => {
  const ejercicio = await Ejercicio.findByPk(id);
  if (!ejercicio) return null;
  return ejercicio.destroy();
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
