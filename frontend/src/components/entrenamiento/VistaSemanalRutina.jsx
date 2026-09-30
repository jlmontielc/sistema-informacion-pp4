import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';
import {
  formatearDuracion,
  formatearPeso,
  tituloTipoRutina,
} from '../../utils/fechasRutina';

/** Resumen legible de los nombres de ejercicio de un día, con "+N más" si sobran. */
function listaEjercicios(ejercicios = [], maximo = 3) {
  const visibles = ejercicios.slice(0, maximo);
  const resto = ejercicios.length - visibles.length;
  return [
    ...visibles.map((ejercicio) => ejercicio.nombre),
    ...(resto > 0 ? [`+${resto} más`] : []),
  ];
}

function Caja({ etiqueta, valor, destacado = false }) {
  return (
    <div className={`mi-rutina-caja${destacado ? ' mi-rutina-caja-destacada' : ''}`}>
      <span className="mi-rutina-caja-etiqueta">{etiqueta}</span>
      <span className="mi-rutina-caja-valor">{valor}</span>
    </div>
  );
}

/**
 * Vista semanal: cabecera con el avance real de la semana, una tarjeta por día
 * con lo que el usuario registró y el volumen por grupo muscular. No se muestra
 * duración planificada por día ni series planificadas por grupo porque el
 * sistema no expone ese denominador.
 */
export function VistaSemanalRutina({
  dias = [],
  semana,
  tipoRutina,
  diasCompletados = 0,
  diasPlanificados = 0,
  metricas = {},
  grupos = [],
  cargando,
  error,
  onReintentar,
  onAbrirDia,
  onIrADia,
}) {
  const diaHoy = dias.find((item) => item.esHoy) || null;
  const planificados = Math.max(0, Number(diasPlanificados) || 0);
  const completados = Math.max(0, Number(diasCompletados) || 0);
  const cumplimiento = planificados > 0 ? Math.min(100, Math.round((completados / planificados) * 100)) : 0;
  const hoyPendiente = diaHoy && diaHoy.estado === 'pendiente';
  const maxVolumen = grupos.reduce((max, grupo) => Math.max(max, grupo.volumenKg), 0);

  if (cargando && dias.length === 0) {
    return <Loading text="Cargando tu semana..." />;
  }

  if (error && dias.length === 0) {
    return (
      <div className="mi-rutina-error">
        <p>{error}</p>
        <Button variant="secondary" onClick={onReintentar}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="mi-rutina-semanal">
      <section className="mi-rutina-semana-cabecera">
        <div className="mi-rutina-semana-cabecera-fila">
          <div className="mi-rutina-semana-cabecera-titulos">
            <div className="mi-rutina-semana-cabecera-etiquetas">
              {semana?.etiqueta && (
                <span className="mi-rutina-workout-badge">{semana.etiqueta}</span>
              )}
              {tituloTipoRutina(tipoRutina) && (
                <span className="mi-rutina-semana-tipo">{tituloTipoRutina(tipoRutina)}</span>
              )}
            </div>
            <h2 className="mi-rutina-semana-titulo">Planificación Semanal</h2>
            <p className="mi-rutina-semana-progreso">
              {planificados > 0 ? (
                <>
                  {`Progreso: ${completados} de ${planificados} sesiones completadas`}
                  {hoyPendiente ? ' • 1 pendiente para hoy' : ''}
                </>
              ) : (
                'Tu entrenador todavía no programó sesiones para esta semana.'
              )}
            </p>
          </div>
          <div className="mi-rutina-semana-cajas">
            <Caja
              etiqueta="Tiempo total"
              valor={metricas.tiempoTotalMin > 0 ? formatearDuracion(metricas.tiempoTotalMin) : '—'}
            />
            <Caja
              etiqueta="Series"
              valor={metricas.seriesTotales > 0 ? metricas.seriesTotales : '—'}
            />
            <Caja
              etiqueta="Volumen"
              valor={metricas.volumenTotalKg > 0 ? formatearPeso(metricas.volumenTotalKg) : '—'}
              destacado
            />
          </div>
        </div>

        {planificados > 0 && (
          <div className="mi-rutina-cumplimiento">
            <div className="mi-rutina-cumplimiento-cabecera">
              <span className="mi-rutina-cumplimiento-etiqueta">
                Cumplimiento del plan semanal
              </span>
              <span className="mi-rutina-cumplimiento-valor">{`${cumplimiento}%`}</span>
            </div>
            <div
              className="mi-rutina-barra"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={cumplimiento}
              aria-label="Cumplimiento del plan semanal"
            >
              <div className="mi-rutina-barra-relleno" style={{ width: `${cumplimiento}%` }} />
            </div>
          </div>
        )}
      </section>

      <div className="mi-rutina-semana-grid">
        {dias.map((dia) => {
          const completado = dia.estado === 'completado';
          const descanso = dia.estado === 'descanso';

          return (
            <article
              key={dia.dia}
              className={[
                'mi-rutina-dia',
                completado ? 'mi-rutina-dia-completado' : '',
                dia.esHoy ? 'mi-rutina-dia-hoy' : '',
                !completado && !descanso ? 'mi-rutina-dia-pendiente' : '',
                descanso ? 'mi-rutina-dia-descanso' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="mi-rutina-dia-cabecera">
                <span className="mi-rutina-dia-nombre">{dia.nombre}</span>
                {completado && (
                  <span className="mi-rutina-dia-estado mi-rutina-dia-estado-ok">
                    <Icon name="check" size={14} />
                    <span className="mi-rutina-oculto">Completado</span>
                  </span>
                )}
                {descanso && <span className="mi-rutina-dia-estado">Descanso</span>}
              </div>

              <div className="mi-rutina-dia-fecha">{dia.fechaCorta}</div>

              {dia.nombreSesion && <p className="mi-rutina-dia-sesion">{dia.nombreSesion}</p>}

              {completado ? (
                <>
                  <div className="mi-rutina-dia-datos">
                    <span className="mi-rutina-chip">{`${dia.series} series`}</span>
                    <span className="mi-rutina-chip">{`${dia.repeticiones} reps`}</span>
                  </div>
                  <p className="mi-rutina-dia-detalle">
                    <Icon name="clock" size={13} />
                    {` ${dia.duracionMinutos} min`}
                    {dia.volumenKg > 0 ? ` · ${formatearPeso(dia.volumenKg)}` : ''}
                  </p>
                  <p className="mi-rutina-dia-ejercicios">
                    {listaEjercicios(dia.ejercicios).join(' · ') || 'Sin ejercicios'}
                  </p>
                </>
              ) : descanso ? (
                <p className="mi-rutina-dia-placeholder">Día de descanso</p>
              ) : (
                <p className="mi-rutina-dia-placeholder">
                  {dia.esFuturo
                    ? `${dia.totalEjercicios} ejercicios programados`
                    : 'Sin registro'}
                </p>
              )}

              <div className="mi-rutina-dia-acciones">
                {completado && (
                  <Button variant="ghost" size="sm" onClick={() => onIrADia(dia.dia)}>
                    Ver detalle
                  </Button>
                )}
                {dia.esHoy && !completado && !descanso && (
                  <span className="mi-rutina-dia-hoy-marca">
                    <span className="mi-rutina-leyenda-punto mi-rutina-leyenda-hoy" aria-hidden="true" />
                    Hoy
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mi-rutina-leyenda">
        <span className="mi-rutina-leyenda-item">
          <Icon name="check" size={14} /> Completado
        </span>
        <span className="mi-rutina-leyenda-item">
          <span className="mi-rutina-leyenda-punto mi-rutina-leyenda-hoy" aria-hidden="true" />
          Hoy
        </span>
        <span className="mi-rutina-leyenda-item">
          <span className="mi-rutina-leyenda-punto" aria-hidden="true" />
          Pendiente
        </span>
      </div>

      {grupos.length > 0 && (
        <section className="mi-rutina-grupos">
          <h3 className="mi-rutina-grupos-titulo">Volumen por Grupo Muscular</h3>
          <p className="mi-rutina-grupos-nota">
            Series y volumen registrados en los últimos 7 días.
          </p>
          <ul className="mi-rutina-grupos-lista">
            {grupos.map((grupo) => (
              <li key={grupo.nombre} className="mi-rutina-grupos-item">
                <div className="mi-rutina-grupos-cabecera">
                  <span className="mi-rutina-grupos-nombre">{grupo.nombre}</span>
                  <span className="mi-rutina-grupos-cifras">
                    {grupo.series > 0 ? `${grupo.series} series · ` : ''}
                    {formatearPeso(grupo.volumenKg)}
                  </span>
                </div>
                <div
                  className="mi-rutina-barra mi-rutina-barra-clara"
                  role="img"
                  aria-label={`${grupo.nombre}: ${formatearPeso(grupo.volumenKg)} de volumen`}
                >
                  <div
                    className="mi-rutina-barra-relleno"
                    style={{
                      width: `${maxVolumen > 0 ? (grupo.volumenKg / maxVolumen) * 100 : 0}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {diaHoy &&
        diaHoy.estado !== 'completado' &&
        diaHoy.estado !== 'descanso' &&
        diaHoy.totalEjercicios > 0 && (
          <div className="mi-rutina-acciones">
            <Button variant="primary" size="lg" onClick={() => onAbrirDia(diaHoy.dia)}>
              Iniciar entrenamiento de hoy
            </Button>
          </div>
        )}
    </div>
  );
}
