const { Op } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');
const { Instruido } = require('../instruidos/instruido.model');
const { Ejercicio, RegistroEntrenamiento } = require('../entrenamiento/entrenamiento.model');
const { SerieEjecutada } = require('../entrenamiento/series-ejecutadas.model');

const PERIODOS_DIAS = {
  '7d': 7,
  '30d': 30,
  '3m': 90,
};

const formatearFecha = (fecha) => {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
};

const calcularRangoFechas = (periodo) => {
  const dias = PERIODOS_DIAS[periodo] || PERIODOS_DIAS['30d'];
  const hoy = new Date();
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() - dias);
  return {
    fechaInicio: formatearFecha(inicio),
    fechaFin: formatearFecha(hoy),
    dias,
  };
};

const obtenerSemanaISO = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const diaSemana = (fecha.getDay() + 6) % 7;
  fecha.setDate(fecha.getDate() - diaSemana + 3);
  const primerJueves = fecha.getTime();
  fecha.setMonth(0, 1);
  if (fecha.getDay() !== 4) {
    fecha.setMonth(0, 1 + ((4 - fecha.getDay()) + 7) % 7);
  }
  const numeroSemana = 1 + Math.ceil((primerJueves - fecha.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${fecha.getFullYear()}-W${String(numeroSemana).padStart(2, '0')}`;
};

const redondear = (valor) => Number(Number(valor).toFixed(2));

const errorAutorizacion = (mensaje, status = 403) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const verificarAcceso = async (instruidoId, usuario) => {
  if (usuario.rol === 'instruido' && usuario.id !== instruidoId) {
    throw errorAutorizacion('No puede consultar reportes de otro instruido');
  }

  const instruido = await Instruido.findByPk(instruidoId, {
    attributes: ['id', 'nombre', 'entrenadorId'],
  });

  if (!instruido) {
    throw errorAutorizacion('Instruido no encontrado', 404);
  }

  // El entrenador puede ver reportes de cualquier instruido.

  return instruido;
};

const obtenerSeriesPeriodo = async (instruidoId, fechaInicio, fechaFin) => {
  return SerieEjecutada.findAll({
    include: [
      {
        model: RegistroEntrenamiento,
        required: true,
        where: {
          instruidoId,
          fecha: { [Op.between]: [fechaInicio, fechaFin] },
          estado: 'completado',
        },
        attributes: ['fecha'],
      },
      {
        model: Ejercicio,
        as: 'ejercicio',
        required: true,
        attributes: ['grupoMuscular'],
      },
    ],
    attributes: ['id', 'numeroSerie', 'repeticionesRealizadas', 'pesoKg'],
    raw: true,
    nest: true,
  });
};

const calcularMetricasGrupo = (series) => {
  const mapa = new Map();

  series.forEach((serie) => {
    const grupo = serie.ejercicio.grupoMuscular || 'Otros';
    if (!mapa.has(grupo)) {
      mapa.set(grupo, { series: [], sesiones: new Set() });
    }
    const entrada = mapa.get(grupo);
    entrada.series.push(serie);
    entrada.sesiones.add(serie.registroEntrenamiento.fecha);
  });

  const resultado = [];
  mapa.forEach((entrada, grupo) => {
    let volumenTotal = 0;
    let pesoMaximo = 0;
    entrada.series.forEach((serie) => {
      const volumenSerie = Number(serie.repeticionesRealizadas) * Number(serie.pesoKg);
      volumenTotal += volumenSerie;
      if (Number(serie.pesoKg) > pesoMaximo) {
        pesoMaximo = Number(serie.pesoKg);
      }
    });

    resultado.push({
      grupoMuscular: grupo,
      volumenTotal: redondear(volumenTotal),
      pesoMaximoLevantado: redondear(pesoMaximo),
      totalSeries: entrada.series.length,
      sesionesEntrenadas: entrada.sesiones.size,
    });
  });

  return resultado.sort((a, b) => b.volumenTotal - a.volumenTotal);
};

const calcularEvolucionSemanal = (series) => {
  const mapa = new Map();

  series.forEach((serie) => {
    const semana = obtenerSemanaISO(serie.registroEntrenamiento.fecha);
    const grupo = serie.ejercicio.grupoMuscular || 'Otros';
    const clave = `${semana}||${grupo}`;

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        semana,
        grupoMuscular: grupo,
        series: [],
        sesiones: new Set(),
      });
    }

    const entrada = mapa.get(clave);
    entrada.series.push(serie);
    entrada.sesiones.add(serie.registroEntrenamiento.fecha);
  });

  const resultado = [];
  mapa.forEach((entrada) => {
    let volumenTotal = 0;
    let pesoMaximo = 0;
    entrada.series.forEach((serie) => {
      const volumenSerie = Number(serie.repeticionesRealizadas) * Number(serie.pesoKg);
      volumenTotal += volumenSerie;
      if (Number(serie.pesoKg) > pesoMaximo) {
        pesoMaximo = Number(serie.pesoKg);
      }
    });

    resultado.push({
      semana: entrada.semana,
      grupoMuscular: entrada.grupoMuscular,
      volumenTotal: redondear(volumenTotal),
      pesoMaximoLevantado: redondear(pesoMaximo),
      totalSeries: entrada.series.length,
      sesionesEntrenadas: entrada.sesiones.size,
    });
  });

  return resultado.sort((a, b) => {
    if (a.semana !== b.semana) return a.semana.localeCompare(b.semana);
    return a.grupoMuscular.localeCompare(b.grupoMuscular);
  });
};

const calcularEvolucionGrupo = (series, grupoMuscular) => {
  const mapa = new Map();

  series.forEach((serie) => {
    const semana = obtenerSemanaISO(serie.registroEntrenamiento.fecha);
    if (!mapa.has(semana)) {
      mapa.set(semana, { series: [], sesiones: new Set() });
    }
    const entrada = mapa.get(semana);
    entrada.series.push(serie);
    entrada.sesiones.add(serie.registroEntrenamiento.fecha);
  });

  const resultado = [];
  mapa.forEach((entrada, semana) => {
    let volumenTotal = 0;
    let pesoMaximo = 0;
    entrada.series.forEach((serie) => {
      const volumenSerie = Number(serie.repeticionesRealizadas) * Number(serie.pesoKg);
      volumenTotal += volumenSerie;
      if (Number(serie.pesoKg) > pesoMaximo) {
        pesoMaximo = Number(serie.pesoKg);
      }
    });

    resultado.push({
      semana,
      volumenTotal: redondear(volumenTotal),
      pesoMaximoLevantado: redondear(pesoMaximo),
      totalSeries: entrada.series.length,
      sesionesEntrenadas: entrada.sesiones.size,
    });
  });

  return resultado.sort((a, b) => a.semana.localeCompare(b.semana));
};

const calcularPromedioHistorico = async (instruidoId) => {
  const series = await SerieEjecutada.findAll({
    include: [
      {
        model: RegistroEntrenamiento,
        required: true,
        where: { instruidoId, estado: 'completado' },
        attributes: ['fecha'],
      },
      {
        model: Ejercicio,
        as: 'ejercicio',
        required: true,
        attributes: ['grupoMuscular'],
      },
    ],
    attributes: ['repeticionesRealizadas', 'pesoKg'],
    raw: true,
    nest: true,
  });

  if (series.length === 0) {
    return {
      volumenPromedioSemanal: 0,
      pesoMaximo: 0,
      sesionesPromedioSemanal: 0,
    };
  }

  let volumenTotal = 0;
  let pesoMaximo = 0;
  const sesiones = new Set();
  const semanas = new Set();

  series.forEach((serie) => {
    volumenTotal += Number(serie.repeticionesRealizadas) * Number(serie.pesoKg);
    if (Number(serie.pesoKg) > pesoMaximo) {
      pesoMaximo = Number(serie.pesoKg);
    }
    sesiones.add(serie.registroEntrenamiento.fecha);
    semanas.add(obtenerSemanaISO(serie.registroEntrenamiento.fecha));
  });

  const totalSemanas = semanas.size || 1;

  return {
    volumenPromedioSemanal: redondear(volumenTotal / totalSemanas),
    pesoMaximo: redondear(pesoMaximo),
    sesionesPromedioSemanal: redondear(sesiones.size / totalSemanas),
  };
};

const calcularPromedioOtrosInstruidos = async (instruidoId, usuario) => {
  const condiciones = ['re.estado = ?', 're.cliente_id != ?'];
  const parametros = ['completado', instruidoId];

  if (usuario.rol === 'entrenador') {
    condiciones.push('i.entrenador_id = ?');
    parametros.push(usuario.id);
  }

  const consulta = `
    SELECT
      SUM(se.repeticiones_realizadas * se.peso_kg) AS volumen_total,
      COUNT(DISTINCT YEARWEEK(re.fecha, 3)) AS semanas
    FROM series_ejecutadas se
    JOIN registro_entrenamiento re ON re.id = se.registro_entrenamiento_id
    JOIN instruidos i ON i.id = re.cliente_id
    WHERE ${condiciones.join(' AND ')}
  `;

  const [fila] = await sequelize.query(consulta, {
    replacements: parametros,
    type: sequelize.QueryTypes.SELECT,
  });

  const volumenTotal = Number(fila?.volumen_total || 0);
  const semanas = Number(fila?.semanas || 1);

  return {
    volumenPromedioSemanal: redondear(volumenTotal / semanas),
  };
};

const metricasPorGrupo = async (instruidoId, periodo, usuario) => {
  const instruido = await verificarAcceso(instruidoId, usuario);
  const { fechaInicio, fechaFin } = calcularRangoFechas(periodo);
  const series = await obtenerSeriesPeriodo(instruidoId, fechaInicio, fechaFin);

  return {
    instruidoId,
    nombre: instruido.nombre,
    periodo,
    fechaInicio,
    fechaFin,
    grupos: calcularMetricasGrupo(series),
    evolucionSemanal: calcularEvolucionSemanal(series),
  };
};

const evolucionPorGrupo = async (instruidoId, grupoMuscular, periodo, usuario) => {
  const instruido = await verificarAcceso(instruidoId, usuario);
  const { fechaInicio, fechaFin } = calcularRangoFechas(periodo);
  const series = await obtenerSeriesPeriodo(instruidoId, fechaInicio, fechaFin);

  const seriesFiltradas = series.filter(
    (serie) => (serie.ejercicio.grupoMuscular || 'Otros').toLowerCase() === grupoMuscular.toLowerCase(),
  );

  return {
    instruidoId,
    nombre: instruido.nombre,
    grupoMuscular,
    periodo,
    fechaInicio,
    fechaFin,
    evolucion: calcularEvolucionGrupo(seriesFiltradas, grupoMuscular),
  };
};

const comparativa = async (instruidoId, periodo, usuario) => {
  const instruido = await verificarAcceso(instruidoId, usuario);
  const { fechaInicio, fechaFin } = calcularRangoFechas(periodo);
  const series = await obtenerSeriesPeriodo(instruidoId, fechaInicio, fechaFin);

  let volumenPeriodo = 0;
  const semanasPeriodo = new Set();
  series.forEach((serie) => {
    volumenPeriodo += Number(serie.repeticionesRealizadas) * Number(serie.pesoKg);
    semanasPeriodo.add(obtenerSemanaISO(serie.registroEntrenamiento.fecha));
  });

  const promedioHistorico = await calcularPromedioHistorico(instruidoId);
  const promedioOtros = await calcularPromedioOtrosInstruidos(instruidoId, usuario);

  return {
    instruidoId,
    nombre: instruido.nombre,
    periodo,
    fechaInicio,
    fechaFin,
    volumenTotalPeriodo: redondear(volumenPeriodo),
    volumenPromedioSemanalPeriodo: redondear(volumenPeriodo / (semanasPeriodo.size || 1)),
    promedioHistoricoGlobal: promedioHistorico,
    comparativaOtros: promedioOtros,
  };
};

const listarInstruidos = async () => {
  const instruidos = await Instruido.findAll({
    attributes: ['id', 'nombre', 'email', 'edad', 'peso', 'altura', 'sexo', 'nivelActividad', 'fechaRegistro', 'activo', 'entrenadorId'],
    order: [['nombre', 'ASC']],
  });

  return { instruidos };
};

module.exports = {
  metricasPorGrupo,
  evolucionPorGrupo,
  comparativa,
  listarInstruidos,
};
