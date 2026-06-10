const { Rendimiento } = require('./reportes.model');

const rendimientoMensual = async (clienteId) => {
  return Rendimiento.findAll({
    where: { clienteId },
    order: [['fecha', 'ASC']],
  });
};

module.exports = { rendimientoMensual };
