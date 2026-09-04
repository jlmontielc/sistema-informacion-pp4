const { Ejercicio } = require('./entrenamiento.model');

const normalizarEjercicio = (ej) => {
  if (!ej) return ej;
  const normalizado = { ...ej };

  if (ej.ejercicio_id !== undefined && ej.ejercicioId === undefined) {
    normalizado.ejercicioId = ej.ejercicio_id;
  }
  if (ej.carga_kg !== undefined && ej.cargaKg === undefined) {
    normalizado.cargaKg = ej.carga_kg;
  }
  if (ej.descanso_segundos !== undefined && ej.descansoSegundos === undefined) {
    normalizado.descansoSegundos = ej.descanso_segundos;
  }

  delete normalizado.ejercicio_id;
  delete normalizado.carga_kg;
  delete normalizado.descanso_segundos;

  return normalizado;
};

const normalizarEjercicios = async (ejercicios) => {
  if (!Array.isArray(ejercicios)) return ejercicios;

  const ids = ejercicios
    .map((e) => e.ejercicioId ?? e.ejercicio_id)
    .filter((id) => id !== undefined && id !== null);

  const resultadoCatalogo = ids.length > 0
    ? await Ejercicio.findAll({
        where: { id: ids },
        attributes: ['id', 'nombre'],
      })
    : [];

  const ejerciciosCatalogo = Array.isArray(resultadoCatalogo) ? resultadoCatalogo : [];

  const nombresPorId = {};
  ejerciciosCatalogo.forEach((e) => {
    nombresPorId[e.id] = e.nombre;
  });

  return ejercicios.map((ej) => {
    const normalizado = normalizarEjercicio(ej);
    const id = normalizado.ejercicioId;
    if (id !== undefined && !normalizado.nombre && nombresPorId[id]) {
      normalizado.nombre = nombresPorId[id];
    }
    return normalizado;
  });
};

const normalizarDiaSemana = (dia) => {
  if (!dia) return dia;
  const normalizado = { ...dia };
  if (dia.dia_semana !== undefined && dia.diaSemana === undefined) {
    normalizado.diaSemana = dia.dia_semana;
  }
  delete normalizado.dia_semana;
  return normalizado;
};

const normalizarDiasSemana = (diasSemana) => {
  if (!diasSemana || typeof diasSemana !== 'object') return diasSemana;
  const normalizado = {};
  Object.entries(diasSemana).forEach(([key, val]) => {
    normalizado[key] = normalizarDiaSemana(val);
  });
  return normalizado;
};

const normalizarPayloadRutina = async (datos) => {
  const normalizado = { ...datos };
  if (datos.ejercicios !== undefined) {
    normalizado.ejercicios = await normalizarEjercicios(datos.ejercicios);
  }
  if (datos.diasSemana !== undefined) {
    normalizado.diasSemana = normalizarDiasSemana(datos.diasSemana);
  }
  if (datos.dias_semana !== undefined && normalizado.diasSemana === undefined) {
    normalizado.diasSemana = normalizarDiasSemana(datos.dias_semana);
  }
  delete normalizado.dias_semana;
  return normalizado;
};

module.exports = {
  normalizarEjercicio,
  normalizarEjercicios,
  normalizarDiaSemana,
  normalizarDiasSemana,
  normalizarPayloadRutina,
};
