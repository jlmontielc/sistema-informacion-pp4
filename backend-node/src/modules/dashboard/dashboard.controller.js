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
      'SELECT COUNT(*) as total FROM rutinas_asignadas WHERE activa = 1 AND entrenador_id = ?',
      { replacements: [entrenadorId], type: 'SELECT' }
    ),
    sequelize.query(
      'SELECT COUNT(*) as total FROM planes_dieta WHERE activo = 1 AND entrenador_id = ?',
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
  const [instruido, rutinaActiva, dietaActiva, registrosRecientes] = await Promise.all([
    Instruido.findByPk(instruidoId, {
      attributes: ['id', 'nombre', 'peso', 'altura', 'updatedAt'],
    }),
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
      `SELECT re.id, re.fecha, re.percepcion_esfuerzo, re.duracion_minutos,
              re.observaciones, re.ejercicios_realizados, re.rutina_asignada_id,
              ra.nombre AS rutina_nombre
       FROM registro_entrenamiento re
       LEFT JOIN rutinas_asignadas ra ON ra.id = re.rutina_asignada_id
       WHERE re.cliente_id = ?
       ORDER BY re.fecha DESC`,
      { replacements: [instruidoId], type: 'SELECT' }
    ),
  ]);

  const registros = registrosRecientes || [];
  const ejercicioIds = new Set();
  registros.forEach(r => {
    if (r.ejercicios_realizados && Array.isArray(r.ejercicios_realizados)) {
      r.ejercicios_realizados.forEach(e => {
        if (e.ejercicio_id) ejercicioIds.add(e.ejercicio_id);
      });
    }
  });

  let ejerciciosCatalogo = [];
  if (ejercicioIds.size > 0) {
    const ids = Array.from(ejercicioIds);
    ejerciciosCatalogo = await sequelize.query(
      `SELECT id, nombre FROM ejercicios WHERE id IN (${ids.map(() => '?').join(',')})`,
      { replacements: ids, type: 'SELECT' }
    );
  }
  const ejerciciosMap = Object.fromEntries(ejerciciosCatalogo.map(e => [e.id, e.nombre]));

  const registrosConNombres = registros.map(r => {
    if (r.ejercicios_realizados && Array.isArray(r.ejercicios_realizados)) {
      r.ejercicios_realizados = r.ejercicios_realizados.map(e => ({
        ...e,
        nombre: ejerciciosMap[e.ejercicio_id] || `Ejercicio #${e.ejercicio_id}`,
      }));
    }
    return r;
  });

  let medicion = null;
  if (instruido) {
    const imc = instruido.altura > 0
      ? Number((instruido.peso / (instruido.altura * instruido.altura)).toFixed(2))
      : null;
    medicion = {
      peso: instruido.peso,
      imc,
      fecha: instruido.updatedAt,
    };
  }

  return {
    medicion,
    rutinaActiva: rutinaActiva[0] || null,
    dietaActiva: dietaActiva[0] || null,
    registrosRecientes: registrosConNombres,
  };
}

module.exports = { stats };
