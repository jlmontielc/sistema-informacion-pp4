import { useCallback, useEffect, useRef, useState } from 'react';
import { registroEntrenamientoApi } from '../services/rutinasApi';

const ESTADO_INICIAL = {
  cargando: false,
  error: null,
  sesionId: null,
  fechaInicio: null,
  series: {},
};

/** `ejercicioId → numeroSerie → { id, pesoKg, repeticiones }` */
function indexarSeries(series) {
  const mapa = {};
  series.forEach((serie) => {
    if (!mapa[serie.ejercicioId]) mapa[serie.ejercicioId] = {};
    mapa[serie.ejercicioId][serie.numeroSerie] = {
      id: serie.id,
      pesoKg: Number(serie.pesoKg) || 0,
      repeticiones: Number(serie.repeticionesRealizadas) || 0,
    };
  });
  return mapa;
}

async function pedir(funcion) {
  try {
    const respuesta = await funcion();
    return respuesta?.data ?? null;
  } catch {
    return null;
  }
}

function normalizarLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.registros)) return respuesta.registros;
  return [];
}

/**
 * Sesión "en progreso" de la rutina en modo **solo lectura**: la vista diaria la
 * usa para mostrar el avance real y el reloj, nunca para crear o modificar
 * series. Toda la interacción ocurre en `RegistroEntrenamientoModal`, que
 * reutiliza esta misma sesión en vez de abrir una nueva.
 */
export function useSesionAbierta(rutina) {
  const [datos, setDatos] = useState(ESTADO_INICIAL);

  const rutinaId = rutina?.id ?? null;
  const claveRef = useRef(null);

  const cargar = useCallback(async () => {
    if (!rutinaId) {
      setDatos(ESTADO_INICIAL);
      return;
    }
    setDatos((previo) => ({ ...previo, cargando: true, error: null }));

    const respuesta = await pedir(() =>
      registroEntrenamientoApi.listar({ rutinaId, estado: 'en_progreso' })
    );

    if (respuesta === null) {
      setDatos({
        ...ESTADO_INICIAL,
        error: 'No se pudo comprobar si tienes una sesión abierta.',
      });
      return;
    }

    // Con rol `instruido` el backend ignora el filtro `estado`, así que la
    // sesión abierta se localiza en cliente.
    const enCurso = normalizarLista(respuesta).find(
      (registro) =>
        Number(registro.rutinaAsignadaId) === Number(rutinaId) &&
        registro.estado === 'en_progreso'
    );

    if (!enCurso?.id) {
      setDatos({ ...ESTADO_INICIAL, cargando: false });
      return;
    }

    const series = await pedir(() => registroEntrenamientoApi.listarSeries(enCurso.id));
    setDatos({
      cargando: false,
      error: null,
      sesionId: enCurso.id,
      fechaInicio: enCurso.fechaInicio || enCurso.fecha || null,
      series: indexarSeries(Array.isArray(series) ? series : []),
    });
  }, [rutinaId]);

  /* Solo se consulta cuando cambia la rutina; `recargar` fuerza el refresco
     después de registrar o finalizar un entrenamiento. */
  useEffect(() => {
    if (claveRef.current === rutinaId) return;
    claveRef.current = rutinaId;
    cargar();
  }, [rutinaId, cargar]);

  return { ...datos, recargar: cargar };
}
