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

  const paginaSolicitada = parseInt(filtros.pagina, 10);
  const limiteSolicitado = parseInt(filtros.limite, 10);
  const paginado =
    (Number.isInteger(paginaSolicitada) && paginaSolicitada > 0) ||
    (Number.isInteger(limiteSolicitado) && limiteSolicitado > 0);

  if (!paginado) {
    return Ejercicio.findAll({ where, order: [['nombre', 'ASC']] });
  }

  const limite = Math.min(Math.max(limiteSolicitado || 50, 1), 100);
  const pagina = Math.max(paginaSolicitada || 1, 1);
  const offset = (pagina - 1) * limite;
  const { rows, count } = await Ejercicio.findAndCountAll({
    where,
    order: [['nombre', 'ASC']],
    limit: limite,
    offset,
  });
  return {
    ejercicios: rows,
    total: count,
    pagina,
    limite,
    totalPaginas: Math.max(Math.ceil(count / limite), 1),
  };
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
