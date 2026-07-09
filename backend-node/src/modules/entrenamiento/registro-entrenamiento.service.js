const { RegistroEntrenamiento, RutinaAsignada } = require('./entrenamiento.model');
const { Op } = require('sequelize');

const obtenerTodos = async (entrenadorId, filtros = {}) => {
  const rutinas = await RutinaAsignada.findAll({
    where: { entrenadorId },
    attributes: ['id', 'instruidoId', 'nombre'],
  });
  const rutinaIds = rutinas.map(r => r.id);

  const where = { rutinaAsignadaId: { [Op.in]: rutinaIds } };
  if (filtros.instruidoId) where.instruidoId = filtros.instruidoId;
  if (filtros.rutinaId) where.rutinaAsignadaId = filtros.rutinaId;
  if (filtros.desde) where.fecha = { ...where.fecha, [Op.gte]: filtros.desde };
  if (filtros.hasta) where.fecha = { ...where.fecha, [Op.lte]: filtros.hasta };
  if (filtros.propias === 'true' && filtros.instruidoIdActual) {
    where.instruidoId = filtros.instruidoIdActual;
  }

  return RegistroEntrenamiento.findAll({
    where,
    order: [['fecha', 'DESC']],
  });
};

const obtenerPorId = async (id, entrenadorId) => {
  const rutinas = await RutinaAsignada.findAll({
    where: { entrenadorId },
    attributes: ['id'],
  });
  const rutinaIds = rutinas.map(r => r.id);
  return RegistroEntrenamiento.findOne({
    where: { id, rutinaAsignadaId: { [Op.in]: rutinaIds } },
  });
};

const crear = async (datos) => RegistroEntrenamiento.create(datos);

const eliminar = async (id, entrenadorId) => {
  const rutinas = await RutinaAsignada.findAll({
    where: { entrenadorId },
    attributes: ['id'],
  });
  const rutinaIds = rutinas.map(r => r.id);
  const registro = await RegistroEntrenamiento.findOne({
    where: { id, rutinaAsignadaId: { [Op.in]: rutinaIds } },
  });
  if (!registro) return null;
  return registro.destroy();
};

module.exports = { obtenerTodos, obtenerPorId, crear, eliminar };
