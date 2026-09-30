import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { Icon } from '../common/Icon';
import { rutinasAsignadasApi, registroEntrenamientoApi } from '../../services/rutinasApi';
import { useResumenSemanal } from '../../hooks/useResumenSemanal';
import { useSesionAbierta } from '../../hooks/useSesionAbierta';
import { obtenerDiaActual, DiaSelector } from './DiaSelector';
import { RegistroEntrenamientoModal } from './RegistroEntrenamientoModal';
import { MiRutinaCabecera } from './MiRutinaCabecera';
import { VistaSemanalRutina } from './VistaSemanalRutina';
import {
  abreviarDia,
  estimarTiempoSesion,
  extraerNotasRegistro,
  fechaDeDiaSemana,
  formatearDia,
  formatearDuracion,
  formatearFechaCorta,
  formatearFechaLarga,
} from '../../utils/fechasRutina';

const PESTANAS = [
  { id: 'dia', etiqueta: 'Rutina del día' },
  { id: 'semana', etiqueta: 'Vista semanal' },
  { id: 'historial', etiqueta: 'Historial' },
];

function ordenar(ejercicios) {
  return [...(ejercicios || [])].sort((a, b) => (a.orden || 0) - (b.orden || 0));
}

export function InstruidoRutinasView() {
  const [pestana, setPestana] = useState('dia');
  const [dia, setDia] = useState(obtenerDiaActual());
  const [rutina, setRutina] = useState(null);
  const [cargandoRutina, setCargandoRutina] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const cargarRutina = useCallback(async () => {
    setCargandoRutina(true);
    try {
      const respuesta = await rutinasAsignadasApi.listar();
      const rutinas = Array.isArray(respuesta?.data)
        ? respuesta.data
        : respuesta?.data?.rutinas || [];
      setRutina(rutinas.find((item) => item.activa) || rutinas[0] || null);
    } catch {
      setRutina(null);
    } finally {
      setCargandoRutina(false);
    }
  }, []);

  useEffect(() => {
    cargarRutina();
  }, [cargarRutina]);

  const resumenSemana = useResumenSemanal(rutina);
  const { recargar: recargarSemana } = resumenSemana;
  /* Solo lectura: la sesion abierta se pinta en la cabecera y el modal la
     reutiliza; la vista diaria nunca crea series. */
  const sesionAbierta = useSesionAbierta(rutina);
  const { recargar: recargarSesion } = sesionAbierta;

  const ejerciciosDelDia = useMemo(
    () => ordenar((rutina?.ejercicios || []).filter((item) => Number(item.dia) === dia)),
    [rutina, dia]
  );

  const resumenDia = useMemo(
    () => resumenSemana.dias.find((item) => Number(item.dia) === dia) || null,
    [resumenSemana.dias, dia]
  );

  const seriesPlaneadas = useMemo(
    () => ejerciciosDelDia.reduce((acc, item) => acc + (Number(item.series) || 0), 0),
    [ejerciciosDelDia]
  );

  const seriesRegistradas = useMemo(
    () =>
      ejerciciosDelDia.reduce(
        (acc, item) =>
          acc + Object.keys(sesionAbierta.series?.[item.ejercicioId] || {}).length,
        0
      ),
    [ejerciciosDelDia, sesionAbierta.series]
  );

  /* El resumen de la semana solo trae registros completados: si el día elegido
     tiene sesión abierta, su avance se cuenta aparte. */
  const seriesHechasDia = resumenDia?.estado === 'completado' ? resumenDia.series : seriesRegistradas;

  const duracionEstimada = useMemo(
    () => estimarTiempoSesion(ejerciciosDelDia),
    [ejerciciosDelDia]
  );

  /* Nombre real de la sesion ("Día de Empuje", "Tirón", ...) si el entrenador
     lo configuró en la rutina; si no, se omite el distintivo. */
  const nombreSesion = useMemo(() => {
    const diaSemana = rutina?.diasSemana?.[String(dia)];
    return diaSemana?.nombre || resumenDia?.nombreSesion || '';
  }, [rutina, dia, resumenDia]);

  const cargarHistorial = useCallback(async () => {
    setCargandoHistorial(true);
    try {
      const respuesta = await registroEntrenamientoApi.listar();
      const registros = Array.isArray(respuesta?.data)
        ? respuesta.data
        : respuesta?.data?.registros || [];
      setHistorial(registros);
    } catch {
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  useEffect(() => {
    if (pestana === 'historial') cargarHistorial();
  }, [pestana, cargarHistorial]);

  /* Tras finalizar hay que invalidar el resumen semanal y el de la sesión. */
  const handleFinalizado = useCallback(() => {
    recargarSemana();
    recargarSesion();
    cargarHistorial();
  }, [recargarSemana, recargarSesion, cargarHistorial]);

  const handleIrADia = useCallback((numero) => {
    setDia(numero);
    setPestana('dia');
  }, []);

  /* "Iniciar" en la vista semanal lleva al día y, si es hoy, abre el registro. */
  const handleAbrirDia = useCallback((numero) => {
    handleIrADia(numero);
    if (numero === obtenerDiaActual()) setModalAbierto(true);
  }, [handleIrADia]);

  if (cargandoRutina) return <Loading text="Cargando tu rutina..." />;

  if (!rutina) {
    return (
      <div className="page mi-rutina">
        <MiRutinaCabecera rutina={null} semana={{ etiqueta: '', rango: '' }} />
        <Card>
          <EmptyState
            icon={<Icon name="dumbbell" size={48} />}
            title="Sin rutina activa"
            description="Tu entrenador aún no te ha asignado una rutina de entrenamiento. Pronto tendrás tu plan personalizado."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="page mi-rutina">
      {pestana !== 'historial' && (
        <MiRutinaCabecera
          rutina={rutina}
          semana={resumenSemana.semana}
          sesionAbierta={sesionAbierta.sesionId ? sesionAbierta : null}
        />
      )}

      <div className="tabs-container mi-rutina-pestanas" role="tablist" aria-label="Vistas de la rutina">
        {PESTANAS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`pestana-${item.id}`}
            aria-selected={pestana === item.id}
            aria-controls={`panel-${item.id}`}
            className={`tab-button ${pestana === item.id ? 'active' : ''}`}
            onClick={() => setPestana(item.id)}
          >
            {item.etiqueta}
          </button>
        ))}
      </div>

      {pestana === 'dia' && (
        <section
          id="panel-dia"
          role="tabpanel"
          aria-labelledby="pestana-dia"
          className="mi-rutina-panel"
        >
          <section className="mi-rutina-workout">
            <div className="mi-rutina-workout-cabecera">
              <div>
                <h2 className="mi-rutina-workout-dia">
                  {formatearDia(dia)}
                  {nombreSesion && (
                    <span className="mi-rutina-workout-badge">{nombreSesion}</span>
                  )}
                </h2>
                <p className="mi-rutina-workout-fecha">
                  {formatearFechaLarga(fechaDeDiaSemana(dia))}
                  {duracionEstimada ? ` • Duración estimada: ${formatearDuracion(duracionEstimada)}` : ''}
                </p>
              </div>
            </div>

            <div className="mi-rutina-dias">
              <DiaSelector
                seleccionados={[dia]}
                onToggle={(numero) => setDia(numero)}
              />
            </div>

            <div className="mi-rutina-progreso">
              <span className="mi-rutina-progreso-etiqueta">Día</span>
              <div className="mi-rutina-progreso-cuerpo">
                <div className="mi-rutina-progreso-cabecera">
                  <span className="mi-rutina-progreso-titulo">
                    {`${abreviarDia(dia)} ${formatearFechaCorta(fechaDeDiaSemana(dia))}`}
                  </span>
                  <span className="mi-rutina-progreso-cifras">
                    {`${seriesHechasDia}/${seriesPlaneadas || '—'} `}
                    <span className="mi-rutina-progreso-vistos">vistas</span>
                  </span>
                </div>
                <div
                  className="mi-rutina-barra"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={seriesPlaneadas || 0}
                  aria-valuenow={seriesHechasDia}
                  aria-label="Series completadas del día"
                >
                  <div
                    className="mi-rutina-barra-relleno"
                    style={{
                      width: `${
                        seriesPlaneadas > 0
                          ? Math.min(100, Math.round((seriesHechasDia / seriesPlaneadas) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {sesionAbierta.error && (
              <p className="mi-rutina-error-linea" role="alert">
                {sesionAbierta.error}
              </p>
            )}

            {ejerciciosDelDia.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Icon name="dumbbell" size={48} />}
                  title="Día de descanso"
                  description="No hay ejercicios programados para este día. Aprovecha para recuperarte."
                />
              </Card>
            ) : (
              <>
                <div className="mi-rutina-ejercicios">
                  {ejerciciosDelDia.map((ejercicio, indice) => (
                    <article key={ejercicio.ejercicioId} className="mi-rutina-ejercicio">
                      <div className="mi-rutina-ejercicio-cabecera">
                        <div>
                          <span className="mi-rutina-ejercicio-etiqueta">{`Ejercicio ${indice + 1}`}</span>
                          <h3 className="mi-rutina-ejercicio-nombre">{ejercicio.nombre}</h3>
                        </div>
                        <span className="mi-rutina-resumen">
                          <span className="mi-rutina-resumen-num">{ejercicio.series}</span> series
                          <span aria-hidden="true"> x </span>
                          <span className="mi-rutina-resumen-num">{ejercicio.repeticiones}</span> reps
                          {Number(ejercicio.descansoSegundos) > 0 && (
                            <>
                              <span aria-hidden="true"> • </span>
                              <span className="mi-rutina-resumen-num">
                                {`${ejercicio.descansoSegundos}s`}
                              </span>{' '}
                              descanso
                            </>
                          )}
                        </span>
                      </div>
                      <div className="mi-rutina-ejercicio-pie">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mi-rutina-enlace"
                          onClick={() => setModalAbierto(true)}
                        >
                          Registrar series
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mi-rutina-acciones">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setModalAbierto(true)}
                  >
                    Registrar entrenamiento
                  </Button>
                </div>
                <p className="mi-rutina-acciones-nota">
                  Los datos se sincronizarán inmediatamente con tu plan y tu panel de progreso.
                </p>
              </>
            )}
          </section>
        </section>
      )}

      {pestana === 'semana' && (
        <section
          id="panel-semana"
          role="tabpanel"
          aria-labelledby="pestana-semana"
          className="mi-rutina-panel"
        >
          <VistaSemanalRutina
            dias={resumenSemana.dias}
            semana={resumenSemana.semana}
            tipoRutina={rutina.tipo}
            diasCompletados={resumenSemana.diasCompletados}
            diasPlanificados={resumenSemana.diasPlanificados}
            metricas={{
              tiempoTotalMin: resumenSemana.tiempoTotalMin,
              seriesTotales: resumenSemana.seriesTotales,
              repeticionesTotales: resumenSemana.repeticionesTotales,
              volumenTotalKg: resumenSemana.volumenTotalKg,
            }}
            cargando={resumenSemana.cargando}
            error={resumenSemana.error}
            grupos={resumenSemana.gruposMusculares}
            onReintentar={recargarSemana}
            onAbrirDia={handleAbrirDia}
            onIrADia={handleIrADia}
          />
        </section>
      )}

      {pestana === 'historial' && (
        <section
          id="panel-historial"
          role="tabpanel"
          aria-labelledby="pestana-historial"
          className="mi-rutina-panel"
        >
          {cargandoHistorial ? (
            <Loading text="Cargando historial..." />
          ) : historial.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Icon name="chartline" size={48} />}
                title="Sin registros"
                description="Aún no has registrado ningún entrenamiento."
              />
            </Card>
          ) : (
            <ul className="mi-rutina-historial">
              {historial.map((registro) => {
                const completado = registro.estado === 'completado';
                const notas = extraerNotasRegistro(registro.observaciones);
                return (
                  <li key={registro.id} className="mi-rutina-historial-item">
                    <div className="mi-rutina-historial-cabecera">
                      <div>
                        <h3 className="mi-rutina-historial-fecha">
                          {formatearFechaLarga(registro.fechaInicio || registro.fecha)}
                        </h3>
                        <p className="mi-rutina-historial-estado">
                          {completado ? 'Entrenamiento completado' : 'Sesión cancelada'}
                        </p>
                      </div>
                      <span
                        className={`mi-rutina-historial-badge ${
                          completado ? 'mi-rutina-historial-badge-ok' : ''
                        }`}
                      >
                        {completado ? 'Completado' : 'Cancelado'}
                      </span>
                    </div>
                    <dl className="mi-rutina-historial-datos">
                      <div>
                        <dt>Duración</dt>
                        <dd>{formatearDuracion(registro.duracionMinutos)}</dd>
                      </div>
                      {registro.percepcionEsfuerzo ? (
                        <div>
                          <dt>RPE</dt>
                          <dd>{registro.percepcionEsfuerzo}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {notas && <p className="mi-rutina-historial-notas">{notas}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <RegistroEntrenamientoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        rutina={rutina}
        dia={dia}
        ejercicios={ejerciciosDelDia}
        onFinalizado={handleFinalizado}
      />
    </div>
  );
}
