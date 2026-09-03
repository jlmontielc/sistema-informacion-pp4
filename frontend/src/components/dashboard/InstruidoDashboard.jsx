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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1>Mi Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Resumen de tu progreso</p>
      </div>

      {user?.tipo === 'instruido' && user?.perfilMedicoCompleto !== true && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--color-warning-light, #fff3e0)',
          border: '1px solid var(--color-warning, #ff9800)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning, #e65100)' }}>
            Completa tu perfil médico para que tu entrenador pueda generar rutinas personalizadas y seguras.
          </span>
          <Link
            to="/complete-profile"
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--color-warning, #ff9800)',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              whiteSpace: 'nowrap',
            }}
          >
            Completar perfil
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <KpiCard icon="⚖️" label="Peso" value={(medicion?.peso || user?.peso) ? `${medicion?.peso || user?.peso} kg` : '—'} />
        <KpiCard icon="📏" label="Altura" value={altura ? `${altura} m` : '—'} />
      </div>

      {registrosRecientes?.length > 0 && (
        <>
          <Card header="Historial de Entrenamientos">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)', width: 32 }}></th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Fecha</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Rutina</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Duración</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Esfuerzo</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosRecientes.map((s) => (
                    <Fragment key={s.id}>
                      <tr
                        onClick={() => setExpandedRow(expandedRow === s.id ? null : s.id)}
                        style={{
                          borderBottom: '1px solid var(--color-border-light)',
                          cursor: 'pointer',
                          backgroundColor: expandedRow === s.id ? 'var(--color-bg-secondary, #f8f9fa)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 12 }}>
                          {expandedRow === s.id ? '▼' : '▶'}
                        </td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 'var(--font-medium)' }}>{s.fecha}</td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>{s.rutina_nombre || '—'}</td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)' }}>{s.duracion_minutos ? `${s.duracion_minutos} min` : '—'}</td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                          {s.percepcion_esfuerzo ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 'var(--font-bold)',
                              fontSize: 'var(--text-xs)',
                              background: s.percepcion_esfuerzo >= 7 ? 'var(--color-error-light, #fce4ec)' : s.percepcion_esfuerzo >= 4 ? 'var(--color-warning-light, #fff3e0)' : 'var(--color-success-light, #e8f5e9)',
                              color: s.percepcion_esfuerzo >= 7 ? 'var(--color-error)' : s.percepcion_esfuerzo >= 4 ? 'var(--color-warning)' : 'var(--color-success)',
                            }}>
                              {s.percepcion_esfuerzo}/10
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>{s.observaciones || '—'}</td>
                      </tr>
                      {expandedRow === s.id && s.ejercicios_realizados?.length > 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: '0 var(--space-3) var(--space-3)' }}>
                            <div style={{
                              marginTop: 'var(--space-2)',
                              padding: 'var(--space-3)',
                              backgroundColor: 'var(--color-bg-secondary, #f8f9fa)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border-light)',
                            }}>
                              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Ejercicios realizados
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {s.ejercicios_realizados.map((ej, idx) => (
                                  <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-2) var(--space-3)',
                                    backgroundColor: '#fff',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--color-border-light)',
                                    fontSize: 'var(--text-sm)',
                                    flexWrap: 'wrap',
                                  }}>
                                    <span style={{ fontWeight: 'var(--font-bold)', minWidth: 180 }}>{ej.nombre}</span>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>{ej.series_realizadas}×{ej.repeticiones}</span>
                                    {ej.carga_kg != null && <span style={{ color: 'var(--color-primary)' }}>{ej.carga_kg} kg</span>}
                                    {ej.notas && <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>- {ej.notas}</span>}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {rutinaActiva ? (
          <Card header="Mi Rutina">
            <p style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>{rutinaActiva.nombre}</p>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              Tipo: {rutinaActiva.tipo} · {rutinaActiva.frecuencia_semanal}x/semana
            </p>
            {rutinaActiva.fecha_inicio && (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                {rutinaActiva.fecha_inicio} → {rutinaActiva.fecha_fin || 'Sin fin'}
              </p>
            )}
          </Card>
        ) : (
          <Card>
            <EmptyState icon="🏋️" title="Sin rutina activa" description="Tu entrenador aun no te ha asignado una rutina." />
          </Card>
        )}

        {dietaActiva ? (
          <Card header="Mi Dieta">
            <p style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>{dietaActiva.objetivo_calorico} kcal/dia</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
              <MacroBadge label="Proteinas" value={dietaActiva.proteinas_gramos} unit="g" color="var(--color-error)" />
              <MacroBadge label="Carbos" value={dietaActiva.carbohidratos_gramos} unit="g" color="var(--color-warning)" />
              <MacroBadge label="Grasas" value={dietaActiva.grasas_gramos} unit="g" color="var(--color-success)" />
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
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{label}</p>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>{value}</p>
        </div>
      </div>
    </Card>
  );
}

function MacroBadge({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{label}</p>
      <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color }}>
        {value != null ? `${value}${unit}` : '—'}
      </p>
    </div>
  );
}
