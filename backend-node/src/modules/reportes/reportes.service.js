const { Rendimiento } = require('./reportes.model');
const { Instruido } = require('../instruidos/instruido.model');

const rendimientoMensual = async (instruidoId, entrenadorId) => {
  const instruido = await Instruido.findOne({ where: { id: instruidoId, entrenadorId } });
  if (!instruido) return [];
  return Rendimiento.findAll({
    where: { instruidoId },
    order: [['fecha', 'ASC']],
  });
};

module.exports = { rendimientoMensual };
