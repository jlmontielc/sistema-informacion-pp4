/* Utilidades puras de fecha, formato y resumen para la vista "Mi Rutina".
   No hacen llamadas HTTP ni guardan estado: solo derivan datos de lo que ya
   devuelve el backend. */

const MS_DIA = 86400000;
const MS_SEMANA = MS_DIA * 7;

/* El backend numera los días 1=Lunes .. 7=Domingo (igual que `obtenerDiaActual`) */
export const DIAS_SEMANA = [
  { num: 1, nombre: 'Lunes', abbr: 'Lun' },
  { num: 2, nombre: 'Martes', abbr: 'Mar' },
  { num: 3, nombre: 'Miércoles', abbr: 'Mié' },
  { num: 4, nombre: 'Jueves', abbr: 'Jue' },
  { num: 5, nombre: 'Viernes', abbr: 'Vie' },
  { num: 6, nombre: 'Sábado', abbr: 'Sáb' },
  { num: 7, nombre: 'Domingo', abbr: 'Dom' },
];

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/* Etiqueta legible del tipo de rutina; el diseño la llama "Día de Empuje", etc. */
const TIPOS_RUTINA = {
  fuerza: 'Día de Fuerza',
  hipertrofia: 'Día de Hipertrofia',
  resistencia: 'Día de Resistencia',
  cardio: 'Día de Cardio',
  funcional: 'Día Funcional',
  flexibilidad: 'Día de Movilidad',
};

function aFecha(valor) {
  if (!valor) return null;
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function formatearDia(num) {
  const dia = DIAS_SEMANA.find((d) => d.num === Number(num));
  return dia ? dia.nombre : `Día ${num}`;
}

export function abreviarDia(num) {
  const dia = DIAS_SEMANA.find((d) => d.num === Number(num));
  return dia ? dia.abbr : `D${num}`;
}

export function tituloTipoRutina(tipo) {
  if (!tipo) return '';
  const clave = String(tipo).toLowerCase();
  if (TIPOS_RUTINA[clave]) return TIPOS_RUTINA[clave];
  return String(tipo).charAt(0).toUpperCase() + String(tipo).slice(1);
}

/** 1 = lunes ... 7 = domingo */
export function diaSemanaISO(fecha = new Date()) {
  const valor = aFecha(fecha);
  if (!valor) return 1;
  const jsDay = valor.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

/** Lunes 00:00:00.000 local de la semana a la que pertenece `fecha`. */
export function inicioSemana(fecha = new Date()) {
  const valor = aFecha(fecha) || new Date();
  const inicio = new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  inicio.setDate(inicio.getDate() - (diaSemanaISO(inicio) - 1));
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

/** Fecha (00:00 local) del día `dia` (1..7) de la semana de `referencia`. */
export function fechaDeDiaSemana(dia, referencia = new Date()) {
  const inicio = inicioSemana(referencia);
  inicio.setDate(inicio.getDate() + (Number(dia) - 1));
  return inicio;
}

/**
 * Rango de la semana ISO actual en local: lunes 00:00 → domingo 23:59:59.999.
 * Se devuelve en ISO porque va directo como query param de `desde` / `hasta`.
 */
export function rangoSemanaActual(referencia = new Date()) {
  const desde = inicioSemana(referencia);
  const hasta = new Date(desde.getTime() + MS_SEMANA - 1);
  return { desde: desde.toISOString(), hasta: hasta.toISOString() };
}

export function esMismoDia(fecha, referencia) {
  const a = aFecha(fecha);
  const b = aFecha(referencia);
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Semana actual del plan según `fechaInicio`.
 * `duracionSemanas` es la fuente de verdad; si falta se estima y se marca
 * `esEstimado` para que la interfaz no lo presente como dato confirmado.
 */
export function obtenerSemanaPlan(rutina) {
  const inicio = aFecha(rutina?.fechaInicio);
  const frecuencia = Number(rutina?.frecuenciaSemanal) || 0;

  let semanasTotales = Number(rutina?.duracionSemanas) || 0;
  let esEstimado = false;

  if (!semanasTotales) {
    const fin = aFecha(rutina?.fechaFin);
    if (inicio && fin && fin.getTime() > inicio.getTime()) {
      semanasTotales = Math.max(1, Math.ceil((fin.getTime() - inicio.getTime()) / MS_SEMANA));
    } else if (frecuencia) {
      // Sin fecha de fin ni duración solo se puede acotar por la frecuencia.
      semanasTotales = Math.max(frecuencia, 8);
    } else {
      semanasTotales = 1;
    }
    esEstimado = true;
  }

  const diasTranscurridos = inicio
    ? Math.max(0, Math.floor((Date.now() - inicio.getTime()) / MS_DIA))
    : 0;
  const semanaActual = inicio
    ? Math.min(Math.max(1, Math.ceil(diasTranscurridos / 7)), semanasTotales)
    : 1;

  return {
    semanaActual,
    semanasTotales,
    esEstimado,
    etiqueta: `Semana ${semanaActual} de ${semanasTotales}`,
    rango: inicio ? rangoFechas(inicio, semanasTotales, semanaActual) : '',
  };
}

/** "22 – 28 sep 2026": semana actual del plan, en local. */
function rangoFechas(inicio, semanasTotales, semanaActual) {
  const desde = new Date(inicio.getTime());
  desde.setDate(desde.getDate() + (semanaActual - 1) * 7);
  const hasta = new Date(desde.getTime() + 6 * MS_DIA);
  const mes = MESES_CORTOS[hasta.getMonth()] || '';
  return `${desde.getDate()} – ${hasta.getDate()} ${mes} ${hasta.getFullYear()}`;
}

/** mm:ss a partir de segundos. */
export function formatearTiempo(segundos) {
  const total = Math.max(0, Math.floor(Number(segundos) || 0));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

/** 2h 35m / 50 min / 1h. Devuelve `—` cuando no hay dato. */
export function formatearDuracion(minutos) {
  const total = Math.floor(Number(minutos));
  if (!Number.isFinite(total) || total <= 0) return '—';
  if (total < 60) return `${total} min`;
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}m`;
}

/** 18.420 kg (es-ES, sin decimales cuando el valor es entero). */
export function formatearPeso(kg) {
  const valor = Number(kg);
  if (!Number.isFinite(valor)) return '—';
  const decimales = Number.isInteger(valor) ? 0 : 1;
  return `${valor.toLocaleString('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })} kg`;
}

/** Lun 14 */
export function formatearFechaCorta(fecha) {
  const valor = aFecha(fecha);
  if (!valor) return '—';
  return `${abreviarDia(diaSemanaISO(valor))} ${valor.getDate()}`;
}

/** 14 de sep de 2026 (formato del mockup) */
export function formatearFechaLarga(fecha) {
  const valor = aFecha(fecha);
  if (!valor) return '—';
  const mes = MESES_CORTOS[valor.getMonth()] || '';
  return `${valor.getDate()} de ${mes} de ${valor.getFullYear()}`;
}

/**
 * Minutos estimados de una sesión: `series * descanso + 60s` por ejercicio.
 * `null` cuando no hay ejercicios o no hay descanso configurado, para poder
 * omitir el chip en vez de mostrar un 0 inventado.
 */
export function estimarTiempoSesion(ejercicios) {
  if (!Array.isArray(ejercicios) || ejercicios.length === 0) return null;
  let segundos = 0;
  let hayDescanso = false;
  ejercicios.forEach((ejercicio) => {
    const series = Number(ejercicio?.series) || 0;
    const descanso = Number(ejercicio?.descansoSegundos) || 0;
    if (descanso > 0) hayDescanso = true;
    segundos += series * (descanso || 60) + 60;
  });
  if (!hayDescanso) return null;
  return Math.round(segundos / 60);
}

/**
 * `finalizar` guarda las observaciones como `"<texto>\nResumen: {json}"`.
 * Se intenta parsear el bloque JSON y, si falla, se cae a una regex tolerante
 * al volumen para no romper la vista si el formato cambia.
 */
export function extraerResumenRegistro(observaciones) {
  if (!observaciones || typeof observaciones !== 'string') return null;

  const marcador = observaciones.lastIndexOf('Resumen:');
  if (marcador >= 0) {
    try {
      const datos = JSON.parse(observaciones.slice(marcador + 'Resumen:'.length).trim());
      const porEjercicio = datos?.porEjercicio || {};
      let seriesTotales = 0;
      let repeticionesTotales = 0;
      Object.values(porEjercicio).forEach((item) => {
        seriesTotales += Number(item?.series) || 0;
        repeticionesTotales += Number(item?.repeticiones) || 0;
      });
      return {
        volumenTotal: Number(datos?.volumenTotal) || 0,
        seriesTotales,
        repeticionesTotales,
      };
    } catch {
      /* Formato inesperado: se intenta la extracción por regex. */
    }
  }

  const match = observaciones.match(/"volumenTotal"\s*:\s*([0-9.]+)/);
  if (!match) return null;
  return {
    volumenTotal: parseFloat(match[1]) || 0,
    seriesTotales: null,
    repeticionesTotales: null,
  };
}

/** Texto del usuario sin el bloque `Resumen:` que agrega el backend. */
export function extraerNotasRegistro(observaciones) {
  if (!observaciones || typeof observaciones !== 'string') return '';
  const marcador = observaciones.lastIndexOf('Resumen:');
  const texto = marcador >= 0 ? observaciones.slice(0, marcador) : observaciones;
  return texto.trim();
}
