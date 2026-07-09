const { RutinaAsignada } = require('./entrenamiento.model');
const { Instruido } = require('../instruidos/instruido.model');
const { Op } = require('sequelize');

const obtenerTodos = async (entrenadorId, filtros = {}) => {
  const where = { entrenadorId };
  if (filtros.instruidoId) where.instruidoId = filtros.instruidoId;
  if (filtros.activa !== undefined) where.activa = filtros.activa === 'true';
  if (filtros.propias === 'true' && filtros.instruidoIdActual) {
    where.instruidoId = filtros.instruidoIdActual;
  }
  return RutinaAsignada.findAll({
    where,
    include: [{ model: Instruido, attributes: ['id', 'nombre'] }],
    order: [['createdAt', 'DESC']],
  });
};

const obtenerPorId = async (id, entrenadorId) =>
  RutinaAsignada.findOne({
    where: { id, entrenadorId },
    include: [{ model: Instruido, attributes: ['id', 'nombre'] }],
  });

const obtenerPorIdPropio = async (id, instruidoId) =>
  RutinaAsignada.findOne({
    where: { id, instruidoId },
  });

const crear = async (datos, entrenadorId) => {
  const instruido = await Instruido.findOne({ where: { id: datos.instruidoId, entrenadorId } });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }
  return RutinaAsignada.create({ ...datos, entrenadorId });
};

const actualizar = async (id, datos, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;
  if (datos.instruidoId) {
    const instruido = await Instruido.findOne({ where: { id: datos.instruidoId, entrenadorId } });
    if (!instruido) {
      const err = new Error('Instruido no encontrado');
      err.status = 404;
      throw err;
    }
  }
  return rutina.update(datos);
};

const eliminar = async (id, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;
  return rutina.update({ activa: false });
};

module.exports = { obtenerTodos, obtenerPorId, obtenerPorIdPropio, crear, actualizar, eliminar };
