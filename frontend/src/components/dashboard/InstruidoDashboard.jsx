import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function InstruidoDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    if (user?.tipo === 'instruido' && user?.perfilMedicoCompleto !== true) {
      window.location.href = '/complete-profile';
      return;
    }
    api.get('/dashboard/stats')
      .then(res => setData(res.data))
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loading text="Cargando tu dashboard..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;
  if (!data) return <EmptyState icon="📊" title="Sin datos" description="Aun no hay informacion disponible." />;

  const { medicion, rutinaActiva, dietaActiva, registrosRecientes } = data;
  const altura = medicion?.altura || user?.altura;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Mi Dashboard</h1>
          <p className="page-subtitle">Resumen de tu progreso</p>
        </div>
      </div>

      {user?.tipo === 'instruido' && user?.perfilMedicoCompleto !== true && (
        <div className="alerta alerta-warning alerta-entre">
          <span>
            Completa tu perfil médico para que tu entrenador pueda generar rutinas personalizadas y seguras.
          </span>
          <Link to="/complete-profile" className="btn btn-sm btn-warning">
            Completar perfil
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2">
        <KpiCard icon="⚖️" label="Peso" value={(medicion?.peso || user?.peso) ? `${medicion?.peso || user?.peso} kg` : '—'} />
        <KpiCard icon="📏" label="Altura" value={altura ? `${altura} m` : '—'} />
      </div>

      {registrosRecientes?.length > 0 && (
        <>
          <Card header="Historial de Entrenamientos">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="col-icono"></th>
                    <th>Fecha</th>
                    <th>Rutina</th>
                    <th>Duración</th>
                    <th>Esfuerzo</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosRecientes.map((s) => (
                    <Fragment key={s.id}>
                      <tr
                        className={`tabla-fila-clicable${expandedRow === s.id ? ' tabla-fila-activa' : ''}`}
                        onClick={() => setExpandedRow(expandedRow === s.id ? null : s.id)}
                      >
                        <td className="col-icono text-muted">
                          {expandedRow === s.id ? '▼' : '▶'}
                        </td>
                        <td className="text-medium">{s.fecha}</td>
                        <td className="text-muted">{s.rutina_nombre || '—'}</td>
                        <td>{s.duracion_minutos ? `${s.duracion_minutos} min` : '—'}</td>
                        <td>
                          {s.percepcion_esfuerzo ? (
                            <span
                              className={`badge ${
                                s.percepcion_esfuerzo >= 7
                                  ? 'badge-danger'
                                  : s.percepcion_esfuerzo >= 4
                                    ? 'badge-warning'
                                    : 'badge-success'
                              }`}
                            >
                              {s.percepcion_esfuerzo}/10
                            </span>
                          ) : '—'}
                        </td>
                        <td className="text-muted">{s.observaciones || '—'}</td>
                      </tr>
                      {expandedRow === s.id && s.ejercicios_realizados?.length > 0 && (
                        <tr>
                          <td colSpan={6} className="tabla-detalle-celda">
                            <div className="detalle-panel">
                              <p className="detalle-titulo">Ejercicios realizados</p>
                              <div className="stack stack-sm">
                                {s.ejercicios_realizados.map((ej, idx) => (
                                  <div key={idx} className="detalle-item">
                                    <span className="detalle-item-nombre">{ej.nombre}</span>
                                    <span className="text-muted">{ej.series_realizadas}×{ej.repeticiones}</span>
                                    {ej.carga_kg != null && <span className="detalle-item-carga">{ej.carga_kg} kg</span>}
                                    {ej.notas && <span className="detalle-item-nota">- {ej.notas}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card header="Mi Progreso">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={registrosRecientes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="percepcion_esfuerzo" stroke="#3b82f6" name="Esfuerzo" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      <div className="grid grid-cols-2">
        {rutinaActiva ? (
          <Card header="Mi Rutina">
            <div className="stack">
              <p className="text-lg text-bold">{rutinaActiva.nombre}</p>
              <p className="text-muted">
                Tipo: {rutinaActiva.tipo} · {rutinaActiva.frecuencia_semanal}x/semana
              </p>
              {rutinaActiva.fecha_inicio && (
                <p className="text-sm text-muted">
                  {rutinaActiva.fecha_inicio} → {rutinaActiva.fecha_fin || 'Sin fin'}
                </p>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <EmptyState icon="🏋️" title="Sin rutina activa" description="Tu entrenador aun no te ha asignado una rutina." />
          </Card>
        )}

        {dietaActiva ? (
          <Card header="Mi Dieta">
            <div className="stack">
              <p className="text-lg text-bold">{dietaActiva.objetivo_calorico} kcal/dia</p>
              <div className="row">
                <MacroBadge label="Proteinas" value={dietaActiva.proteinas_gramos} unit="g" color="var(--color-error)" />
                <MacroBadge label="Carbos" value={dietaActiva.carbohidratos_gramos} unit="g" color="var(--color-warning)" />
                <MacroBadge label="Grasas" value={dietaActiva.grasas_gramos} unit="g" color="var(--color-success)" />
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <EmptyState icon="🥗" title="Sin dieta activa" description="Tu entrenador aun no te ha asignado un plan nutricional." />
          </Card>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-card-icon" aria-hidden="true">{icon}</span>
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
}

function MacroBadge({ label, value, unit, color }) {
  return (
    <div className="macro-dato">
      <p className="dato-label">{label}</p>
      <p className="macro-dato-valor" style={color ? { color } : undefined}>
        {value != null ? `${value}${unit}` : '—'}
      </p>
    </div>
  );
}
