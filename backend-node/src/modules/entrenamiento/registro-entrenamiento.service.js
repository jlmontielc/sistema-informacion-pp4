const { RegistroEntrenamiento, RutinaAsignada } = require('./entrenamiento.model');
const { Op } = require('sequelize');

const findAll = async (entrenadorId, filters = {}) => {
  const rutinas = await RutinaAsignada.findAll({
    where: { entrenadorId },
    attributes: ['id', 'clienteId', 'nombre'],
  });
  const rutinaIds = rutinas.map(r => r.id);

  const where = { rutinaAsignadaId: { [Op.in]: rutinaIds } };
  if (filters.clienteId) where.clienteId = filters.clienteId;
  if (filters.rutinaId) where.rutinaAsignadaId = filters.rutinaId;
  if (filters.desde) where.fecha = { ...where.fecha, [Op.gte]: filters.desde };
  if (filters.hasta) where.fecha = { ...where.fecha, [Op.lte]: filters.hasta };

  return RegistroEntrenamiento.findAll({
    where,
    order: [['fecha', 'DESC']],
  });
};

const findById = async (id, entrenadorId) => {
  const rutinas = await RutinaAsignada.findAll({
    where: { entrenadorId },
    attributes: ['id'],
  });
  const rutinaIds = rutinas.map(r => r.id);
  return RegistroEntrenamiento.findOne({
    where: { id, rutinaAsignadaId: { [Op.in]: rutinaIds } },
  });
};

const create = async (data) => RegistroEntrenamiento.create(data);

const remove = async (id, entrenadorId) => {
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

module.exports = { findAll, findById, create, remove };
