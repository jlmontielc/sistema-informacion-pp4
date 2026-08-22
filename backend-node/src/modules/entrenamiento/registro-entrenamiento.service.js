const { RegistroEntrenamiento, RutinaAsignada } = require('./entrenamiento.model');
const { Instruido } = require('../instruidos/instruido.model');
const { Op } = require('sequelize');

const obtenerTodos = async (usuario, filtros = {}) => {
  if (usuario.rol === 'instruido') {
    return RegistroEntrenamiento.findAll({
      where: { instruidoId: usuario.id },
      order: [['fecha', 'DESC']],
    });
  }

  const where = {};
  if (filtros.instruidoId) where.instruidoId = filtros.instruidoId;
  if (filtros.rutinaId) where.rutinaAsignadaId = filtros.rutinaId;
  if (filtros.desde || filtros.hasta) {
    where.fecha = {};
    if (filtros.desde) where.fecha[Op.gte] = filtros.desde;
    if (filtros.hasta) where.fecha[Op.lte] = filtros.hasta;
  }

  if (usuario.rol === 'entrenador') {
    const rutinas = await RutinaAsignada.findAll({
      where: { entrenadorId: usuario.id },
      attributes: ['id'],
    });
    const rutinaIds = rutinas.map(r => r.id);
    if (!rutinaIds.length) return [];
    where.rutinaAsignadaId = { [Op.in]: rutinaIds };
  }

  return RegistroEntrenamiento.findAll({
    where,
    order: [['fecha', 'DESC']],
  });
};

const obtenerPorId = async (id, usuario) => {
  const registro = await RegistroEntrenamiento.findByPk(id);
  if (!registro) return null;

  if (usuario.rol === 'instruido' && Number(registro.instruidoId) !== Number(usuario.id)) {
    return null;
  }
  if (usuario.rol === 'entrenador') {
    const rutina = await RutinaAsignada.findByPk(registro.rutinaAsignadaId, {
      attributes: ['entrenadorId'],
    });
    if (!rutina || Number(rutina.entrenadorId) !== Number(usuario.id)) return null;
  }
  return registro;
};

const crear = async (usuario, datos) => {
  const registroDatos = { ...datos };

  if (usuario.rol === 'instruido') {
    registroDatos.instruidoId = usuario.id;
  } else if (usuario.rol === 'entrenador') {
    if (!registroDatos.instruidoId) {
      const err = new Error('instruidoId es requerido para registrar el entrenamiento');
      err.status = 400;
      throw err;
    }
    const pertenece = await Instruido.findOne({
      where: { id: registroDatos.instruidoId, entrenadorId: usuario.id },
    });
    if (!pertenece) {
      const err = new Error('Instruido no encontrado o no pertenece al entrenador');
      err.status = 404;
      throw err;
    }
  }

  if (!registroDatos.fecha) {
    registroDatos.fecha = new Date();
  }

  return RegistroEntrenamiento.create(registroDatos);
};

const eliminar = async (id, usuario) => {
  const registro = await obtenerPorId(id, usuario);
  if (!registro) return null;
  await registro.destroy();
  return registro;
};

module.exports = { obtenerTodos, obtenerPorId, crear, eliminar };
