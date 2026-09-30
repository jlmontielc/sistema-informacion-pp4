import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { registroEntrenamientoApi, rutinasAsignadasApi } from '../../services/rutinasApi';
import {
  fechaDeDiaSemana,
  formatearDia,
  formatearFechaLarga,
  formatearPeso,
  formatearTiempo,
  obtenerSemanaPlan,
  tituloTipoRutina,
} from '../../utils/fechasRutina';
import { TarjetaRegistroSeries } from './TarjetaRegistroSeries';

const MAX_SERIES = 20;
const DESCANSO_POR_DEFECTO = 60;
const ESPERA_EDICION_MS = 600;

const DESCANSO_INACTIVO = { activo: false, terminado: false, ejercicioId: null, total: 0, restante: 0 };

const numeroONo = (valor, decimales) => {
  if (valor === '' || valor === null || valor === undefined) return null;
  const numero = decimales ? parseFloat(valor) : parseInt(valor, 10);
  return Number.isFinite(numero) ? numero : null;
};

function textoInicial(valor) {
  return valor === null || valor === undefined || valor === '' ? '' : String(valor);
}

/** Fila de una serie planificada: valores precargados desde la rutina y sin marcar. */
function filaPlanificada(ejercicio, numeroSerie) {
  const descanso = Number(ejercicio.descansoSegundos) || DESCANSO_POR_DEFECTO;
  return {
    ejercicioId: ejercicio.ejercicioId,
    numeroSerie,
    serieId: null,
    lista: false,
    pesoKg: textoInicial(ejercicio.cargaKg),
    reps: textoInicial(ejercicio.repeticiones),
    rpe: '',
    // El descanso se cuenta entre series, no antes de la primera.
    descansoSegundos: numeroSerie > 1 ? descanso : 0,
  };
}

/**
 * `listarSeries` devuelve `pesoKg` como DECIMAL, así que llega como texto
 * ("60.00"): hay que normalizarlo antes de usarlo en el formulario.
 */
function filaExistente(serie) {
  return {
    ejercicioId: serie.ejercicioId,
    numeroSerie: serie.numeroSerie,
    serieId: serie.id,
    lista: true,
    pesoKg: textoInicial(serie.pesoKg),
    reps: textoInicial(serie.repeticionesRealizadas),
    rpe: textoInicial(serie.rpe),
    descansoSegundos: Number(serie.descansoSegundos) || DESCANSO_POR_DEFECTO,
  };
}

/** Une lo ya registrado con las filas planificadas de la rutina. */
function construirFilas(ejercicios, series) {
  const porEjercicio = {};
  ejercicios.forEach((ejercicio) => {
    const mapa = {};
    series
      .filter((serie) => Number(serie.ejercicioId) === Number(ejercicio.ejercicioId))
      .sort((a, b) => a.numeroSerie - b.numeroSerie)
      .forEach((serie) => {
        const fila = filaExistente(serie);
        mapa[fila.numeroSerie] = fila;
      });

    const total = Math.max(Number(ejercicio.series) || 0, Object.keys(mapa).length);
    for (let numero = 1; numero <= total; numero += 1) {
      if (!mapa[numero]) mapa[numero] = filaPlanificada(ejercicio, numero);
    }
    porEjercicio[ejercicio.ejercicioId] = mapa;
  });
  return porEjercicio;
}

/** Normaliza peso/reps/rpe a número; `null` si todavía no se puede enviar. */
function construirPayloadSerie(fila, numeroSerie, sobreescribir) {
  if (!fila) return null;
  const peso = numeroONo(sobreescribir?.pesoKg ?? fila.pesoKg, true);
  const reps = numeroONo(sobreescribir?.reps ?? fila.reps, false);
  if (peso === null || reps === null) return null;
  const rpe = numeroONo(sobreescribir?.rpe ?? fila.rpe, false);
  return {
    ejercicioId: Number(fila.ejercicioId),
    numeroSerie: Number(numeroSerie),
    pesoKg: peso,
    repeticionesRealizadas: reps,
    descansoSegundos: Number(fila.descansoSegundos) || 0,
    ...(rpe !== null ? { rpe } : {}),
  };
}

/** Cada request va envuelta para que un fallo puntual no rompa el modal. */
async function pedir(funcion) {
  try {
    const respuesta = await funcion();
    return respuesta?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * `iniciar` siempre crea un registro nuevo, así que primero se busca una sesión
 * "en progreso" de esta rutina para poder retomarla (el backend ignora el filtro
 * `estado` cuando el rol es instruido, de ahí el filtrado en cliente).
 */
async function obtenerOCrearSesion(rutinaId) {
  const registros = await pedir(() =>
    registroEntrenamientoApi.listar({ rutinaId, estado: 'en_progreso' })
  );
  const enCurso = (Array.isArray(registros) ? registros : []).find(
    (registro) =>
      Number(registro.rutinaAsignadaId) === Number(rutinaId) &&
      registro.estado === 'en_progreso'
  );
  if (enCurso?.id) return enCurso;
  return pedir(() => registroEntrenamientoApi.iniciar({ rutinaAsignadaId: rutinaId }));
}

export function RegistroEntrenamientoModal({
  isOpen,
  onClose,
  rutina,
  dia,
  ejercicios: ejerciciosIniciales = [],
  onFinalizado,
}) {
  const [sesion, setSesion] = useState(null);
  const [series, setSeries] = useState([]);
  const [filas, setFilas] = useState({});
  const [anteriores, setAnteriores] = useState({});
  const [ejercicios, setEjercicios] = useState([]);
  const [configuracionDia, setConfiguracionDia] = useState(null);
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [descanso, setDescanso] = useState(DESCANSO_INACTIVO);
  const [finalizando, setFinalizando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const filasRef = useRef(filas);
  filasRef.current = filas;

  /* Los ejercicios llegan como prop del padre: se guardan en un ref para que el
     efecto de apertura no se dispare de nuevo si cambia la identidad del array. */
  const ejerciciosInicialesRef = useRef(ejerciciosIniciales);
  ejerciciosInicialesRef.current = ejerciciosIniciales;

  const temporizadoresRef = useRef({});

  const limpiarTemporizadores = useCallback(() => {
    Object.values(temporizadoresRef.current).forEach((id) => window.clearTimeout(id));
    temporizadoresRef.current = {};
  }, []);

  /**
   * Columna "ANTERIOR": se toma la sesión completada más reciente de esta
   * rutina que no sea la actual y se mapea `ejercicioId → numeroSerie → valores`.
   */
  const cargarAnteriores = useCallback(async (sesionId, rutinaId) => {
    if (!rutinaId) return {};
    const registros = await pedir(() =>
      registroEntrenamientoApi.listar({ rutinaId, estado: 'completado' })
    );
    const lista = Array.isArray(registros) ? registros : [];
    const previa = lista
      .filter(
        (registro) =>
          Number(registro.rutinaAsignadaId) === Number(rutinaId) &&
          registro.estado === 'completado' &&
          Number(registro.id) !== Number(sesionId)
      )
      .sort(
        (a, b) =>
          new Date(b.fechaInicio || b.fecha).getTime() -
          new Date(a.fechaInicio || a.fecha).getTime()
      )[0];
    if (!previa) return {};

    const seriesPrevias = await pedir(() => registroEntrenamientoApi.listarSeries(previa.id));
    const mapa = {};
    (Array.isArray(seriesPrevias) ? seriesPrevias : []).forEach((serie) => {
      if (!mapa[serie.ejercicioId]) mapa[serie.ejercicioId] = {};
      mapa[serie.ejercicioId][serie.numeroSerie] = {
        pesoKg: Number(serie.pesoKg) || 0,
        repeticiones: serie.repeticionesRealizadas ?? null,
      };
    });
    return mapa;
  }, []);

  const abrirSesion = useCallback(async () => {
    if (!rutina) return;
    setCargando(true);
    setError(null);

    // `obtenerPorDia` trae el detalle normalizado del día (nombres + configuración);
    // si falla se sigue con los ejercicios que ya tenía la página.
    const detalle = await pedir(() => rutinasAsignadasApi.obtenerPorDia(rutina.id, dia));
    const lista = detalle?.ejercicios?.length ? detalle.ejercicios : ejerciciosInicialesRef.current;
    setEjercicios(lista);
    setConfiguracionDia(detalle?.configuracionDia || null);

    const nuevaSesion = await obtenerOCrearSesion(rutina.id);
    if (!nuevaSesion?.id) {
      setError('No se pudo iniciar la sesión de entrenamiento.');
      setCargando(false);
      return;
    }

    const [seriesSesion, mapaAnteriores] = await Promise.all([
      pedir(() => registroEntrenamientoApi.listarSeries(nuevaSesion.id)),
      cargarAnteriores(nuevaSesion.id, rutina.id),
    ]);

    const listaSeries = Array.isArray(seriesSesion) ? seriesSesion : [];
    setSesion(nuevaSesion);
    setNotas(nuevaSesion.observaciones || '');
    setSeries(listaSeries);
    setFilas(construirFilas(lista, listaSeries));
    setAnteriores(mapaAnteriores);
    setCargando(false);
  }, [rutina, dia, cargarAnteriores]);

  const cerrarSesion = useCallback(() => {
    setSesion(null);
    setSeries([]);
    setFilas({});
    setAnteriores({});
    setEjercicios([]);
    setConfiguracionDia(null);
    setNotas('');
    setSegundos(0);
    setError(null);
    setFinalizando(false);
    setCancelando(false);
    setDescanso(DESCANSO_INACTIVO);
    limpiarTemporizadores();
  }, [limpiarTemporizadores]);

  useEffect(() => {
    if (isOpen) {
      abrirSesion();
    } else {
      cerrarSesion();
    }
  }, [isOpen, abrirSesion, cerrarSesion]);

  useEffect(() => () => limpiarTemporizadores(), [limpiarTemporizadores]);

  /* Reloj de la sesión en vivo a partir de `fechaInicio` */
  useEffect(() => {
    if (!isOpen || !sesion?.fechaInicio || finalizando || cancelando) return undefined;
    const calcular = () => {
      const inicio = new Date(sesion.fechaInicio).getTime();
      setSegundos(Math.max(0, Math.floor((Date.now() - inicio) / 1000)));
    };
    calcular();
    const intervalo = window.setInterval(calcular, 1000);
    return () => window.clearInterval(intervalo);
  }, [isOpen, sesion, finalizando, cancelando]);

  /* Descanso entre series: un único intervalo para todos los ejercicios */
  useEffect(() => {
    if (!isOpen || !descanso.activo || descanso.terminado) return undefined;
    const intervalo = window.setInterval(() => {
      setDescanso((previo) =>
        previo.restante <= 1
          ? { ...previo, restante: 0, terminado: true }
          : { ...previo, restante: previo.restante - 1 }
      );
    }, 1000);
    return () => window.clearInterval(intervalo);
  }, [isOpen, descanso.activo, descanso.terminado]);

  const volumenTotal = useMemo(
    () =>
      series.reduce((acc, serie) => {
        const peso = parseFloat(serie.pesoKg);
        const reps = Number(serie.repeticionesRealizadas);
        if (!Number.isFinite(peso) || !Number.isFinite(reps)) return acc;
        return acc + peso * reps;
      }, 0),
    [series]
  );

  const escribirSerie = useCallback((serieId, payload, mensajeError) => {
    if (!sesion?.id || !payload) return Promise.resolve(false);
    return pedir(() => registroEntrenamientoApi.editarSerie(sesion.id, serieId, payload)).then(
      (respuesta) => {
        if (!respuesta) setError(mensajeError);
        return Boolean(respuesta);
      }
    );
  }, [sesion]);

  const handleCambiarCampo = useCallback(
    (ejercicioId, numeroSerie, campo, valor) => {
      setFilas((previo) => {
        const mapa = { ...(previo[ejercicioId] || {}) };
        const fila = { ...(mapa[numeroSerie] || {}) };
        mapa[numeroSerie] = {
          ...fila,
          ejercicioId,
          numeroSerie,
          [campo]: valor,
        };
        return { ...previo, [ejercicioId]: mapa };
      });

      const serieId = filasRef.current?.[ejercicioId]?.[numeroSerie]?.serieId;
      if (!sesion?.id || !serieId) return;

      // Se agrupa la escritura con un debounce para no pegarle al backend en
      // cada tecla; el PUT se arma con el estado más reciente de la fila.
      const clave = `${ejercicioId}-${numeroSerie}-${campo}`;
      window.clearTimeout(temporizadoresRef.current[clave]);
      temporizadoresRef.current[clave] = window.setTimeout(() => {
        const filaActual = filasRef.current?.[ejercicioId]?.[numeroSerie];
        escribirSerie(
          serieId,
          construirPayloadSerie(filaActual, numeroSerie),
          'No se pudo actualizar la serie. Revisa los datos e inténtalo de nuevo.'
        );
      }, ESPERA_EDICION_MS);
    },
    [sesion, escribirSerie]
  );

  const handleAlternarLista = useCallback(
    async (ejercicioId, numeroSerie, marcar) => {
      if (!sesion?.id) return;
      const fila = filasRef.current?.[ejercicioId]?.[numeroSerie];
      if (!fila) return;

      const actualizar = (cambios) =>
        setFilas((previo) => ({
          ...previo,
          [ejercicioId]: {
            ...(previo[ejercicioId] || {}),
            [numeroSerie]: { ...fila, ...cambios },
          },
        }));

      if (!marcar) {
        if (!fila.serieId) {
          actualizar({ lista: false, serieId: null });
          return;
        }
        // Optimista: se desmarca al instante y se revierte si el DELETE falla.
        actualizar({ lista: false, serieId: null });
        const respuesta = await pedir(() =>
          registroEntrenamientoApi.eliminarSerie(sesion.id, fila.serieId)
        );
        if (!respuesta) {
          actualizar({ lista: true, serieId: fila.serieId });
          setError('No se pudo eliminar la serie.');
          return;
        }
        setSeries((previas) => previas.filter((serie) => serie.id !== fila.serieId));
        return;
      }

      const payload = construirPayloadSerie(fila, numeroSerie);
      if (!payload) {
        setError('Completa el peso y las repeticiones antes de marcar la serie.');
        return;
      }

      actualizar({ lista: true });
      const respuesta = await pedir(() =>
        registroEntrenamientoApi.crearSerie(sesion.id, payload)
      );
      if (!respuesta?.id) {
        actualizar({ lista: false });
        setError('No se pudo guardar la serie.');
        return;
      }
      setSeries((previas) => [...previas, respuesta]);
      actualizar({ lista: true, serieId: respuesta.id });
    },
    [sesion]
  );

  const handleAgregarFila = useCallback(
    (ejercicioId) => {
      setFilas((previo) => {
        const mapa = { ...(previo[ejercicioId] || {}) };
        const numeros = Object.keys(mapa).map(Number);
        if (numeros.length >= MAX_SERIES) return previo;
        const siguiente = numeros.length ? Math.max(...numeros) + 1 : 1;
        const ejercicio = ejercicios.find((item) => Number(item.ejercicioId) === Number(ejercicioId));
        mapa[siguiente] = filaPlanificada(ejercicio || { ejercicioId }, siguiente);
        return { ...previo, [ejercicioId]: mapa };
      });
    },
    [ejercicios]
  );

  const handleIniciarDescanso = useCallback((ejercicio) => {
    const total = Number(ejercicio?.descansoSegundos) || DESCANSO_POR_DEFECTO;
    setDescanso({ activo: true, terminado: false, ejercicioId: ejercicio.ejercicioId, total, restante: total });
  }, []);

  const handleCancelarDescanso = useCallback(() => setDescanso(DESCANSO_INACTIVO), []);

  const handleFinalizar = useCallback(async () => {
    if (!sesion?.id) return;
    limpiarTemporizadores();
    setFinalizando(true);
    try {
      const respuesta = await pedir(() =>
        registroEntrenamientoApi.finalizar(sesion.id, {
          duracionMinutos: Math.max(0, Math.floor(segundos / 60)),
          observaciones: notas.trim(),
        })
      );
      if (!respuesta) {
        setError('No se pudo finalizar el entrenamiento.');
        return;
      }
      onFinalizado?.();
      onClose?.();
    } finally {
      setFinalizando(false);
    }
  }, [sesion, segundos, notas, limpiarTemporizadores, onFinalizado, onClose]);

  const handleCancelar = useCallback(async () => {
    if (!sesion?.id) return;
    if (!window.confirm('¿Seguro que quieres cancelar esta sesión?')) return;
    limpiarTemporizadores();
    setCancelando(true);
    try {
      const respuesta = await pedir(() =>
        registroEntrenamientoApi.cancelar(sesion.id, { observaciones: notas.trim() })
      );
      if (!respuesta) {
        setError('No se pudo cancelar el entrenamiento.');
        return;
      }
      onClose?.();
    } finally {
      setCancelando(false);
    }
  }, [sesion, notas, limpiarTemporizadores, onClose]);

  const handleCerrar = useCallback(() => {
    if (sesion?.id && series.length > 0) {
      const confirmar = window.confirm(
        'Si cierras ahora perderás el progreso no guardado. ¿Quieres cancelar la sesión?'
      );
      if (!confirmar) return;
      limpiarTemporizadores();
      registroEntrenamientoApi.cancelar(sesion.id).finally(() => onClose?.());
      return;
    }
    onClose?.();
  }, [sesion, series.length, limpiarTemporizadores, onClose]);

  const nombreSesion =
    configuracionDia?.nombre || tituloTipoRutina(rutina?.tipo) || 'tu sesión';
  const semanaPlan = obtenerSemanaPlan(rutina);

  return (
    <Modal isOpen={isOpen} onClose={handleCerrar} title="Mi rutina" size="xl">
      <ErrorBoundary>
        <div className="mi-rutina-modal">
          {cargando && !sesion ? (
            <Loading text="Iniciando sesión..." />
          ) : error && !sesion ? (
            <div className="mi-rutina-error">
              <p>{error}</p>
              <Button variant="secondary" onClick={abrirSesion}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <div className="mi-rutina-banda">
                <div className="mi-rutina-banda-cabecera">
                  <div>
                    <p className="mi-rutina-banda-kicker">Mi rutina</p>
                    <p className="mi-rutina-banda-nombre">{rutina?.nombre || 'Rutina'}</p>
                  </div>
                  <div className="mi-rutina-banda-estado">
                    <span className="mi-rutina-banda-semana">
                      {semanaPlan?.etiqueta || 'Semana actual'}
                    </span>
                    <span className="mi-rutina-banda-tiempo">
                      <span className="mi-rutina-banda-tiempo-label">Tiempo</span>
                      <span className="mi-rutina-banda-tiempo-valor">
                        {formatearTiempo(segundos)}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mi-rutina-banda-cuerpo">
                  <div>
                    <p className="mi-rutina-banda-dia">{formatearDia(dia)}</p>
                    <p className="mi-rutina-banda-sesion">{nombreSesion}</p>
                    <p className="mi-rutina-banda-fecha">
                      {formatearFechaLarga(fechaDeDiaSemana(dia))}
                    </p>
                  </div>
                  <div className="mi-rutina-banda-cifras">
                    {series.length > 0 && (
                      <span>
                        {`${series.length} ${series.length === 1 ? 'serie' : 'series'}`}
                      </span>
                    )}
                    {series.length > 0 && volumenTotal > 0 && (
                      <span>{formatearPeso(volumenTotal)}</span>
                    )}
                  </div>
                </div>

                <p className="mi-rutina-banda-nota">
                  Marca cada serie cuando la completes. Los cambios se sincronizan con tu plan.
                </p>
              </div>

              {error && (
                <p className="mi-rutina-error-linea" role="alert">
                  {error}
                </p>
              )}

              <div className="mi-rutina-cuerpo">
                {ejercicios.length === 0 ? (
                  <p className="mi-rutina-sin-filas">
                    No hay ejercicios programados para este día.
                  </p>
                ) : (
                  ejercicios.map((ejercicio, indice) => (
                    <TarjetaRegistroSeries
                      key={ejercicio.ejercicioId}
                      indice={indice + 1}
                      ejercicio={ejercicio}
                      filas={filas[ejercicio.ejercicioId] || {}}
                      anterioresPorEjercicio={anteriores}
                      descanso={descanso}
                      onCambiarCampo={handleCambiarCampo}
                      onAlternarLista={handleAlternarLista}
                      onAgregarFila={handleAgregarFila}
                      onIniciarDescanso={handleIniciarDescanso}
                      onCancelarDescanso={handleCancelarDescanso}
                    />
                  ))
                )}

                <div className="mi-rutina-notas">
                  <label className="mi-rutina-notas-label" htmlFor="notas-entrenamiento">
                    Notas del entrenamiento (opcional)
                  </label>
                  <textarea
                    id="notas-entrenamiento"
                    className="mi-rutina-notas-area"
                    rows={2}
                    maxLength={2000}
                    value={notas}
                    placeholder="Sensaciones físicas, dolores articulares o ajustes para la siguiente sesión..."
                    onChange={(evento) => setNotas(evento.target.value)}
                  />
                </div>
              </div>

              <div className="mi-rutina-pie">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleFinalizar}
                  loading={finalizando}
                  disabled={finalizando || cancelando}
                >
                  <Icon name="check" size={18} /> Registrar entrenamiento
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleCancelar}
                  loading={cancelando}
                  disabled={finalizando || cancelando}
                >
                  Cancelar sesión
                </Button>
              </div>
            </>
          )}
        </div>
      </ErrorBoundary>
    </Modal>
  );
}
