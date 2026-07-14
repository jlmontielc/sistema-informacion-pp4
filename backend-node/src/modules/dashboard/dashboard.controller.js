const { Op } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');
const { Instruido } = require('../instruidos/instruido.model');
const { Entrenador } = require('../auth/entrenador.model');

const stats = async (req, res, next) => {
  try {
    const { rol, id } = req.usuario;

    if (rol === 'administrador') {
      return res.json(await statsAdministrador());
    }
    if (rol === 'entrenador') {
      return res.json(await statsEntrenador(id));
    }
    return res.json(await statsInstruido(id));
  } catch (err) {
    next(err);
  }
};

const primerDiaMes = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

async function statsAdministrador() {
  const mesActual = primerDiaMes();

  const [
    totalClientes,
    totalEntrenadores,
    rutinasActivas,
    dietasActivas,
    metabolicos,
    clientesNuevosMes,
  ] = await Promise.all([
    Instruido.count(),
    Entrenador.count(),
    sequelize.query('SELECT COUNT(*) as total FROM rutinas_asignadas WHERE activa = 1', { type: 'SELECT' }),
    sequelize.query('SELECT COUNT(*) as total FROM planes_dieta WHERE activo = 1', { type: 'SELECT' }),
    sequelize.query('SELECT COUNT(*) as total FROM calculos_metabolicos', { type: 'SELECT' }),
    Instruido.count({ where: { fechaRegistro: { [Op.gte]: mesActual } } }),
  ]);

  return {
    totalClientes,
    totalEntrenadores,
    rutinasActivas: rutinasActivas[0].total,
    dietasActivas: dietasActivas[0].total,
    metabolicos: metabolicos[0].total,
    clientesNuevosMes,
  };
}

async function statsEntrenador(entrenadorId) {
  const mesActual = primerDiaMes();

  const [
    totalClientes,
    rutinasActivas,
    dietasActivas,
    clientesNuevosMes,
    clientesRecientes,
  ] = await Promise.all([
    Instruido.count({ where: { entrenadorId } }),
    sequelize.query(
      'SELECT COUNT(*) as total FROM rutinas_asignadas WHERE entrenador_id = ? AND activa = 1',
      { replacements: [entrenadorId], type: 'SELECT' }
    ),
    sequelize.query(
      'SELECT COUNT(*) as total FROM planes_dieta WHERE entrenador_id = ? AND activo = 1',
      { replacements: [entrenadorId], type: 'SELECT' }
    ),
    Instruido.count({ where: { entrenadorId, fechaRegistro: { [Op.gte]: mesActual } } }),
    Instruido.findAll({
      where: { entrenadorId },
      attributes: ['id', 'nombre', 'peso', 'nivelActividad', 'fechaRegistro'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    }),
  ]);

  return {
    totalClientes,
    rutinasActivas: rutinasActivas[0].total,
    dietasActivas: dietasActivas[0].total,
    clientesNuevosMes,
    clientesRecientes,
  };
}

async function statsInstruido(instruidoId) {
  const [ultimoMetabolismo, ultimaMedicion, rutinaActiva, dietaActiva, registrosRecientes] = await Promise.all([
    sequelize.query(
      'SELECT tmb, gct, nivel_actividad_usado, peso_usado, fecha_calculo FROM calculos_metabolicos WHERE cliente_id = ? ORDER BY fecha_calculo DESC LIMIT 1',
      { replacements: [instruidoId], type: 'SELECT' }
    ),
    sequelize.query(
      'SELECT peso, imc, fecha FROM rendimiento WHERE cliente_id = ? ORDER BY fecha DESC LIMIT 1',
      { replacements: [instruidoId], type: 'SELECT' }
    ),
    sequelize.query(
      `SELECT id, nombre, tipo, fecha_inicio, fecha_fin, frecuencia_semanal, observaciones
       FROM rutinas_asignadas
       WHERE cliente_id = ? AND activa = 1
       ORDER BY created_at DESC LIMIT 1`,
      { replacements: [instruidoId], type: 'SELECT' }
    ),
    sequelize.query(
      `SELECT id, objetivo_calorico, proteinas_gramos, carbohidratos_gramos, grasas_gramos, fecha_inicio, fecha_fin
       FROM planes_dieta
       WHERE cliente_id = ? AND activo = 1
       ORDER BY created_at DESC LIMIT 1`,
      { replacements: [instruidoId], type: 'SELECT' }
    ),
    sequelize.query(
      `SELECT fecha, percepcion_esfuerzo, duracion_minutos, observaciones
       FROM registro_entrenamiento
       WHERE cliente_id = ?
       ORDER BY fecha DESC LIMIT 10`,
      { replacements: [instruidoId], type: 'SELECT' }
    ),
  ]);

  return {
    metabolismo: ultimoMetabolismo[0] || null,
    medicion: ultimaMedicion[0] || null,
    rutinaActiva: rutinaActiva[0] || null,
    dietaActiva: dietaActiva[0] || null,
    registrosRecientes: registrosRecientes.reverse(),
  };
}

module.exports = { stats };
