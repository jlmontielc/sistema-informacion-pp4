const { Dieta } = require('./dietas.model');
const { Instruido } = require('../instruidos/instruido.model');

const listarPorUsuario = async (usuario) => {
  const where = {};
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (usuario.rol === 'instruido') where.instruidoId = usuario.id;
  return Dieta.findAll({
    where,
    order: [['created_at', 'DESC']],
  });
};

const crear = async (usuario, datos) => {
  const { instruidoId, ...resto } = datos;

  if (usuario.rol === 'entrenador') {
    const pertenece = await Instruido.findOne({
      where: { id: instruidoId, entrenadorId: usuario.id },
    });
    if (!pertenece) {
      const err = new Error('Instruido no encontrado o no pertenece al entrenador');
      err.status = 404;
      throw err;
    }
  }

  return Dieta.create({ ...resto, instruidoId, entrenadorId: usuario.id });
};

module.exports = { listarPorUsuario, crear };
