const { Ejercicio } = require('./entrenamiento.model');
const { Op } = require('sequelize');
const cache = require('../../shared/cache/cache');
const cacheKeys = require('../../shared/cache/cacheKeys');

const TTL_EJERCICIOS = 1800;

const obtenerTodos = async (filtros = {}) => {
  const clave = cacheKeys.ejercicios.lista(filtros);
  const cacheado = await cache.obtener(clave);
  if (cacheado) return cacheado;

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
    const resultado = await Ejercicio.findAll({ where, order: [['nombre', 'ASC']] });
    await cache.guardar(clave, resultado, TTL_EJERCICIOS);
    return resultado;
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
  const resultado = {
    ejercicios: rows,
    total: count,
    pagina,
    limite,
    totalPaginas: Math.max(Math.ceil(count / limite), 1),
  };
  await cache.guardar(clave, resultado, TTL_EJERCICIOS);
  return resultado;
};

const obtenerPorId = async (id) => {
  const clave = cacheKeys.ejercicios.porId(id);
  const cacheado = await cache.obtener(clave);
  if (cacheado) return cacheado;

  const ejercicio = await Ejercicio.findByPk(id);
  await cache.guardar(clave, ejercicio, TTL_EJERCICIOS);
  return ejercicio;
};

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
