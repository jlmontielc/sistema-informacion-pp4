import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

/* ============================================================
   Utilidades puras de derivación de datos (sin estado)
   ============================================================ */

const SIN_DATO = '—';
// Denominador de la barra de consistencia (sesiones al mes)
const META_SESIONES_MES = 16;
// Colores rotativos del puntito de rutina en la tabla
const PUNTOS_TABLA = ['#d0bcff', '#4cd7f6', '#d2bbff'];

// Convierte 'YYYY-MM-DD' en Date local (evita el desfase de zona UTC)
function aFechaLocal(valor) {
  if (!valor) return null;
  const fecha = new Date(`${valor}T00:00:00`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

// Fecha corta para la tabla y los ejes: "15 sep"
function formatoCorto(valor) {
  const fecha = aFechaLocal(valor);
  if (!fecha) return valor || SIN_DATO;
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

// Fecha larga para la pill de última sesión: "15 de septiembre"
function formatoLargo(valor) {
  const fecha = aFechaLocal(valor);
  if (!fecha) return valor || SIN_DATO;
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
}

// Índice de masa corporal redondeado a 1 decimal (null si falta un dato)
function calcularImc(peso, altura) {
  const p = Number(peso);
  const h = Number(altura);
  if (!p || !h) return null;
  return Math.round((p / (h * h)) * 10) / 10;
}

// Categoría del IMC según los rangos de la OMS
function categoriaImc(imc) {
  if (imc == null) return null;
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Peso saludable';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidad';
}

// Tramo activo y color de la barra decorativa del IMC
function tramoImc(imc) {
  if (imc == null) return null;
  if (imc < 18.5) return { indice: 0, color: '#d2bbff' };
  if (imc < 25) return { indice: 0, color: '#4cd7f6' };
  if (imc < 30) return { indice: 1, color: '#d0bcff' };
  return { indice: 2, color: '#ffb4ab' };
}

// Suma de la carga total levantada en una sesión (kg)
function sumarCarga(ejercicios) {
  if (!Array.isArray(ejercicios)) return null;
  const total = ejercicios.reduce((acum, ej) => acum + (Number(ej?.carga_kg) || 0), 0);
  return total > 0 ? Math.round(total * 10) / 10 : null;
}

// Serie del gráfico ordenada por fecha ascendente
function construirSerie(registros) {
  if (!Array.isArray(registros)) return [];
  return [...registros]
    .filter((r) => r?.fecha)
    .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
    .map((r) => ({
      fecha: r.fecha,
      rpe: r.percepcion_esfuerzo ?? null,
      duracion: r.duracion_minutos ?? null,
      carga: sumarCarga(r.ejercicios_realizados),
    }));
}

// Cantidad de sesiones registradas en el mes en curso
function contarSesionesMes(registros) {
  if (!Array.isArray(registros)) return 0;
  const ahora = new Date();
  const prefijo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  return registros.filter((r) => String(r?.fecha || '').slice(0, 7) === prefijo).length;
}

// Nombre del mes actual capitalizado: "Septiembre de 2026"
function nombreMesActual() {
  const texto = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Distribución de macronutrientes en kcal y porcentaje del total
function calcularMacros(dieta) {
  if (!dieta) return [];
  const kcalProte = dieta.proteinas_gramos != null ? dieta.proteinas_gramos * 4 : null;
  const kcalCarbo = dieta.carbohidratos_gramos != null ? dieta.carbohidratos_gramos * 4 : null;
  const kcalGrasa = dieta.grasas_gramos != null ? dieta.grasas_gramos * 9 : null;
  const total = [kcalProte, kcalCarbo, kcalGrasa].every((v) => v != null)
    ? kcalProte + kcalCarbo + kcalGrasa
    : null;
  const porcentaje = (kcal) =>
    kcal != null && total > 0 ? Math.round((kcal / total) * 100) : null;

  return [
    { etiqueta: 'Proteínas', gramos: dieta.proteinas_gramos, kcal: kcalProte, color: '#ffb4ab', pct: porcentaje(kcalProte) },
    { etiqueta: 'Carbos', gramos: dieta.carbohidratos_gramos, kcal: kcalCarbo, color: '#e9ddff', pct: porcentaje(kcalCarbo) },
    { etiqueta: 'Grasas', gramos: dieta.grasas_gramos, kcal: kcalGrasa, color: '#4cd7f6', pct: porcentaje(kcalGrasa) },
  ];
}

// Configuración de las métricas del control segmentado del gráfico
const METRICAS = {
  rpe: {
    dataKey: 'rpe',
    etiqueta: 'Esfuerzo',
    nombre: 'Esfuerzo (RPE)',
    formatear: (v) => (v != null ? `RPE ${v}` : SIN_DATO),
  },
  duracion: {
    dataKey: 'duracion',
    etiqueta: 'Duración',
    nombre: 'Duración (min)',
    formatear: (v) => (v != null ? `${v} min` : SIN_DATO),
  },
  carga: {
    dataKey: 'carga',
    etiqueta: 'Carga',
    nombre: 'Carga (kg)',
    formatear: (v) => (v != null ? `${v} kg` : SIN_DATO),
  },
};

/* ============================================================
   Componentes internos
   ============================================================ */

// Chip de esfuerzo percibido con punto de nivel (alto/medio/bajo)
function ChipRpe({ valor }) {
  const nivel = valor >= 7 ? 'alto' : valor >= 4 ? 'medio' : 'bajo';
  return (
    <span className={`da-chip-rpe ${nivel}`}>
      <span className="da-chip-punto" aria-hidden="true" />
      {valor}/10
    </span>
  );
}

/* ============================================================
   Dashboard del Atleta (rol instruido)
   ============================================================ */
export default function InstruidoDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [metrica, setMetrica] = useState('rpe');

  useEffect(() => {
    if (user?.tipo === 'instruido' && user?.perfilMedicoCompleto !== true) {
      window.location.href = '/complete-profile';
      return;
    }
    api.get('/dashboard/stats')
      .then((res) => setData(res.data))
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loading text="Cargando tu dashboard..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;
  if (!data) return <EmptyState icon="📊" title="Sin datos" description="Aún no hay información disponible." />;

  const { medicion, rutinaActiva, dietaActiva, registrosRecientes } = data;
  const registros = Array.isArray(registrosRecientes) ? registrosRecientes : [];

  // ===== Derivaciones de datos =====
  const peso = medicion?.peso || user?.peso || null;
  const altura = medicion?.altura || user?.altura || null;
  const imc = calcularImc(peso, altura);
  const categoria = categoriaImc(imc);
  const tramo = tramoImc(imc);
  const sesionesMes = contarSesionesMes(registros);
  const serie = construirSerie(registros);
  const ultimaSesion = serie.length ? serie[serie.length - 1].fecha : null;
  const mesActual = nombreMesActual();
  const macros = calcularMacros(dietaActiva);
  const config = METRICAS[metrica];

  // Media de la métrica activa (para la línea de tiempo)
  const valores = serie.map((p) => p[config.dataKey]).filter((v) => v != null);
  const media = valores.length
    ? Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10
    : null;

  // Alterna la fila expandida del historial
  const alternarFila = (id) => setExpandedRow((actual) => (actual === id ? null : id));

  return (
    <div className="da-pagina">
      {/* ===== Cabecera ===== */}
      <header className="da-cabecera da-seccion">
        <div className="da-cabecera-info">
          <div className="da-fila-titulo">
            <h1 className="da-titulo">Mi Dashboard</h1>
            <span className="da-pill-estado" role="status">
              <span className="da-pulso" aria-hidden="true" />
              {ultimaSesion ? `Última sesión: ${formatoLargo(ultimaSesion)}` : 'Sin registros aún'}
            </span>
          </div>
          <p className="da-subtitulo">Resumen de tu progreso y estado actual</p>
        </div>
        <div className="da-cabecera-acciones">
          <Link to="/reportes" className="da-chip-calendario" aria-label="Ver reportes">
            <Icon name="calendar" size={16} />
            {mesActual}
          </Link>
          <Link to="/entrenamiento" className="da-cta">
            <Icon name="plus" size={18} />
            Registrar Sesión
          </Link>
        </div>
      </header>

      {/* ===== Alerta de perfil médico incompleto ===== */}
      {user?.tipo === 'instruido' && user?.perfilMedicoCompleto !== true && (
        <div className="da-alerta da-seccion" role="alert">
          <p className="da-alerta-texto">
            Completa tu perfil médico para que tu entrenador pueda generar rutinas
            personalizadas y seguras.
          </p>
          <Link to="/complete-profile" className="da-boton-secundario">
            Completar perfil
          </Link>
        </div>
      )}

      {/* ===== Indicadores (KPIs) ===== */}
      <section className="da-kpis da-seccion" aria-label="Indicadores principales">
        {/* Peso */}
        <article className="da-kpi">
          <div className="da-kpi-cabecera">
            <span className="da-kpi-icono" aria-hidden="true">
              <Icon name="scale" size={20} />
            </span>
            <div className="da-kpi-titulos">
              <p className="da-kpi-label">Peso</p>
              <p className="da-kpi-sub">Última medición</p>
            </div>
          </div>
          <p className="da-kpi-valor">
            {peso != null ? peso : SIN_DATO}
            {peso != null && <span className="da-kpi-unidad">kg</span>}
          </p>
          <div className="da-kpi-pie">
            <span>Índice de masa corporal</span>
            <strong className="da-kpi-pie-valor">{imc != null ? imc : SIN_DATO}</strong>
          </div>
        </article>

        {/* Altura */}
        <article className="da-kpi">
          <div className="da-kpi-cabecera">
            <span className="da-kpi-icono" aria-hidden="true">
              <Icon name="ruler" size={20} />
            </span>
            <div className="da-kpi-titulos">
              <p className="da-kpi-label">Altura</p>
              <p className="da-kpi-sub">Última medición</p>
            </div>
          </div>
          <p className="da-kpi-valor">
            {altura != null ? altura : SIN_DATO}
            {altura != null && <span className="da-kpi-unidad">m</span>}
          </p>
          <div className="da-kpi-pie">
            <span>{imc != null ? `IMC ${imc} · ${categoria}` : 'IMC —'}</span>
            {tramo && (
              <span className="da-tramos" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} style={i === tramo.indice ? { background: tramo.color } : undefined} />
                ))}
              </span>
            )}
          </div>
        </article>

        {/* Consistencia */}
        <article className="da-kpi">
          <div className="da-kpi-cabecera">
            <span className="da-kpi-icono" aria-hidden="true">
              <Icon name="flame" size={20} />
            </span>
            <div className="da-kpi-titulos">
              <p className="da-kpi-label">Consistencia</p>
              <p className="da-kpi-sub">Ritmo de entrenamiento</p>
            </div>
            <span className="da-kpi-chip">Sesiones este mes</span>
          </div>
          <p className="da-kpi-valor">
            {sesionesMes}
            <span className="da-kpi-unidad">sesiones</span>
          </p>
          <div className="da-barra" aria-hidden="true">
            <span
              className="da-barra-relleno"
              style={{ width: `${Math.min((sesionesMes / META_SESIONES_MES) * 100, 100)}%` }}
            />
          </div>
          <div className="da-kpi-pie">
            <span>Meta mensual</span>
            <strong className="da-kpi-pie-valor">{META_SESIONES_MES} sesiones</strong>
          </div>
        </article>
      </section>

      {/* ===== Historial de entrenamientos ===== */}
      {registros.length > 0 && (
        <section className="da-seccion" aria-label="Historial de entrenamientos">
          <article className="da-tabla-card">
            <div className="da-card-cabecera">
              <div className="da-card-cabecera-info">
                <span className="da-card-icono" aria-hidden="true">
                  <Icon name="history" size={16} />
                </span>
                <div className="da-card-titulos">
                  <h2 className="da-card-titulo">Historial de Entrenamientos</h2>
                  <p className="da-card-subtitulo">Registros recientes de carga y esfuerzo</p>
                </div>
              </div>
              <Link to="/reportes" className="da-enlace">
                Ver todo
                <Icon name="arrow" size={14} />
              </Link>
            </div>

            <div className="table-wrapper">
              <table className="da-tabla">
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Rutina</th>
                    <th scope="col">Duración</th>
                    <th scope="col">Esfuerzo (RPE)</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col" className="da-col-accion">
                      <span className="da-sr-solo">Detalle</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((sesion, indice) => {
                    const abierto = expandedRow === sesion.id;
                    return (
                      <Fragment key={sesion.id ?? indice}>
                        <tr
                          className={`da-fila${abierto ? ' abierta' : ''}`}
                          onClick={() => alternarFila(sesion.id)}
                        >
                          <td>{formatoCorto(sesion.fecha)}</td>
                          <td>
                            <span className="da-rutina-nombre">
                              <span
                                className="da-punto-color"
                                style={{ background: PUNTOS_TABLA[indice % PUNTOS_TABLA.length] }}
                                aria-hidden="true"
                              />
                              {sesion.rutina_nombre || SIN_DATO}
                            </span>
                          </td>
                          <td>{sesion.duracion_minutos ? `${sesion.duracion_minutos} min` : SIN_DATO}</td>
                          <td>
                            {sesion.percepcion_esfuerzo != null ? (
                              <ChipRpe valor={sesion.percepcion_esfuerzo} />
                            ) : (
                              SIN_DATO
                            )}
                          </td>
                          <td className="da-celda-observaciones">{sesion.observaciones || SIN_DATO}</td>
                          <td className="da-col-accion">
                            <button
                              type="button"
                              className={`da-fila-toggle${abierto ? ' abierto' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                alternarFila(sesion.id);
                              }}
                              aria-expanded={abierto}
                              aria-label={`Ver detalle de la sesión del ${formatoLargo(sesion.fecha)}`}
                            >
                              <Icon name="next" size={16} />
                            </button>
                          </td>
                        </tr>

                        {/* Panel de ejercicios de la sesión expandida */}
                        {abierto && sesion.ejercicios_realizados?.length > 0 && (
                          <tr className="da-fila-detalle">
                            <td colSpan={6}>
                              <div className="da-detalle">
                                <p className="da-detalle-titulo">Ejercicios realizados</p>
                                <ul className="da-detalle-lista">
                                  {sesion.ejercicios_realizados.map((ej, idx) => (
                                    <li key={idx} className="da-detalle-item">
                                      <span className="da-detalle-nombre">{ej.nombre}</span>
                                      <span className="da-detalle-series">
                                        {ej.series_realizadas ?? SIN_DATO}×{ej.repeticiones ?? SIN_DATO}
                                      </span>
                                      {ej.carga_kg != null && (
                                        <span className="da-detalle-carga">{ej.carga_kg} kg</span>
                                      )}
                                      {ej.notas && <span className="da-detalle-notas">— {ej.notas}</span>}
                                    </li>
                                  ))}
                                </ul>
                                {sumarCarga(sesion.ejercicios_realizados) != null && (
                                  <p className="da-detalle-total">
                                    Carga total: {sumarCarga(sesion.ejercicios_realizados)} kg
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {/* ===== Mi Progreso ===== */}
      <section className="da-seccion" aria-label="Mi progreso">
        <article className="da-tabla-card">
          <div className="da-card-cabecera">
            <div className="da-card-cabecera-info">
              <span className="da-card-icono" aria-hidden="true">
                <Icon name="monitoring" size={16} />
              </span>
              <div className="da-card-titulos">
                <h2 className="da-card-titulo">Mi Progreso</h2>
                <p className="da-card-subtitulo">Evolución de tus sesiones recientes</p>
              </div>
            </div>
            {/* Control segmentado de métrica */}
            <div className="da-segmentos" role="group" aria-label="Métrica del gráfico">
              {Object.entries(METRICAS).map(([clave, cfg]) => (
                <button
                  key={clave}
                  type="button"
                  className={metrica === clave ? 'activo' : ''}
                  onClick={() => setMetrica(clave)}
                  aria-pressed={metrica === clave}
                >
                  {cfg.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {serie.length >= 2 ? (
            <div className="da-card-cuerpo">
              <div className="da-grafico">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={serie} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
                    <defs>
                      {/* Relleno del área bajo la curva */}
                      <linearGradient id="da-relleno" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a078ff" stopOpacity={0.45} />
                        <stop offset="60%" stopColor="#7c3aed" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                      {/* Trazo con degradado horizontal */}
                      <linearGradient id="da-trazo" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4cd7f6" />
                        <stop offset="50%" stopColor="#a078ff" />
                        <stop offset="100%" stopColor="#d0bcff" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(149,142,160,0.2)" vertical={false} />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={formatoCorto}
                      tick={{ fontSize: 11, fill: '#958ea0' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#958ea0' }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#2a292e',
                        border: '1px solid #49454',
                        borderRadius: 8,
                        color: '#e4e1e7',
                      }}
                      labelStyle={{ color: '#958ea0', fontSize: 11 }}
                      itemStyle={{ color: '#e4e1e7', fontSize: 12 }}
                      cursor={{ stroke: 'rgba(208,188,255,0.4)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey={config.dataKey}
                      name={config.nombre}
                      stroke="url(#da-trazo)"
                      strokeWidth={3}
                      fill="url(#da-relleno)"
                      dot={{ r: 4, fill: '#131317', stroke: '#a078ff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#d0bcff', stroke: '#131317', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Línea de tiempo: primera · media · última */}
              <div className="da-timeline">
                <span>
                  {formatoCorto(serie[0].fecha)} · {config.formatear(serie[0][config.dataKey])}
                </span>
                {media != null && (
                  <span className="da-timeline-media">Media: {config.formatear(media)}</span>
                )}
                <span className="activa">
                  {formatoCorto(serie[serie.length - 1].fecha)} ·{' '}
                  {config.formatear(serie[serie.length - 1][config.dataKey])}
                </span>
              </div>
            </div>
          ) : (
            <div className="da-card-cuerpo">
              <EmptyState
                icon="📉"
                title="Datos insuficientes"
                description="Registra al menos dos sesiones para ver tu evolución en el gráfico."
              />
            </div>
          )}
        </article>
      </section>

      {/* ===== Mi Rutina y Mi Dieta ===== */}
      <div className="da-doble da-seccion">
        {/* --- Mi Rutina --- */}
        {rutinaActiva ? (
          <article className="da-card">
            <div className="da-card-cabecera">
              <div className="da-card-cabecera-info">
                <span className="da-card-icono" aria-hidden="true">
                  <Icon name="dumbbell" size={16} />
                </span>
                <div className="da-card-titulos">
                  <h2 className="da-card-titulo">Mi Rutina</h2>
                </div>
              </div>
              <span className="da-badge-curso">En curso</span>
            </div>
            <div className="da-card-cuerpo">
              <div className="da-panel">
                <div>
                  <h3 className="da-panel-nombre">{rutinaActiva.nombre}</h3>
                  <p className="da-panel-sub">{rutinaActiva.frecuencia_semanal}x / semana</p>
                </div>
                <div className="da-panel-grid">
                  <div className="da-dato">
                    <p className="da-dato-label">Modalidad</p>
                    <p className="da-dato-valor">Tipo: {rutinaActiva.tipo || SIN_DATO}</p>
                  </div>
                  <div className="da-dato">
                    <p className="da-dato-label">Vigencia</p>
                    <p className="da-dato-valor">
                      {rutinaActiva.fecha_inicio || SIN_DATO} → {rutinaActiva.fecha_fin || 'Sin fecha de fin'}
                    </p>
                  </div>
                </div>
                <div className="da-sesion">
                  <span className="da-sesion-icono" aria-hidden="true">
                    <Icon name="event" size={18} />
                  </span>
                  <div>
                    <p className="da-sesion-titulo">Programa vigente</p>
                    <p className="da-sesion-sub">
                      {rutinaActiva.fecha_inicio || SIN_DATO} → {rutinaActiva.fecha_fin || 'Sin fecha de fin'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="da-card-pie">
              <Link to="/entrenamiento" className="da-enlace">
                Ver rutina completa
                <Icon name="arrow" size={14} />
              </Link>
              <Link to="/entrenamiento" className="da-boton-secundario">
                <Icon name="play" size={14} />
                Iniciar entrenamiento
              </Link>
            </div>
          </article>
        ) : (
          <article className="da-card">
            <div className="da-card-cabecera">
              <div className="da-card-cabecera-info">
                <span className="da-card-icono" aria-hidden="true">
                  <Icon name="dumbbell" size={16} />
                </span>
                <div className="da-card-titulos">
                  <h2 className="da-card-titulo">Mi Rutina</h2>
                </div>
              </div>
            </div>
            <div className="da-card-cuerpo">
              <EmptyState
                icon="🏋️"
                title="Sin rutina activa"
                description="Tu entrenador aún no te ha asignado una rutina."
              />
            </div>
          </article>
        )}

        {/* --- Mi Dieta --- */}
        {dietaActiva ? (
          <article className="da-card">
            <div className="da-card-cabecera">
              <div className="da-card-cabecera-info">
                <span className="da-card-icono" aria-hidden="true">
                  <Icon name="restaurant" size={16} />
                </span>
                <div className="da-card-titulos">
                  <h2 className="da-card-titulo">Mi Dieta</h2>
                </div>
              </div>
              <span className="da-badge-curso">En curso</span>
            </div>
            <div className="da-card-cuerpo">
              {/* Callout de calorías objetivo */}
              <div className="da-calorias">
                <span className="da-calorias-valor">
                  {dietaActiva.objetivo_calorico != null ? dietaActiva.objetivo_calorico : SIN_DATO}
                </span>
                <span className="da-calorias-unidad">kcal / día</span>
              </div>

              {/* Distribución de macros */}
              <div className="da-macros">
                {macros.map((macro) => (
                  <div className="da-macro" key={macro.etiqueta}>
                    <p className="da-macro-label">{macro.etiqueta}</p>
                    <p className="da-macro-valor" style={{ color: macro.color }}>
                      {macro.gramos != null ? `${macro.gramos} g` : SIN_DATO}
                    </p>
                    <div className="da-macro-barra" aria-hidden="true">
                      <i
                        style={{
                          width: macro.pct != null ? `${macro.pct}%` : '0%',
                          background: macro.color,
                        }}
                      />
                    </div>
                    <span className="da-macro-pct">
                      {macro.pct != null ? `${macro.pct}% del total` : SIN_DATO}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="da-card-pie">
              <Link to="/dietas" className="da-enlace">
                Ver plan completo
                <Icon name="arrow" size={14} />
              </Link>
            </div>
          </article>
        ) : (
          <article className="da-card">
            <div className="da-card-cabecera">
              <div className="da-card-cabecera-info">
                <span className="da-card-icono" aria-hidden="true">
                  <Icon name="restaurant" size={16} />
                </span>
                <div className="da-card-titulos">
                  <h2 className="da-card-titulo">Mi Dieta</h2>
                </div>
              </div>
            </div>
            <div className="da-card-cuerpo">
              <EmptyState
                icon="🥗"
                title="Sin dieta activa"
                description="Tu entrenador aún no te ha asignado un plan nutricional."
              />
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
