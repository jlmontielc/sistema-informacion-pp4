import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import api from '../../services/api';

const nivelLabels = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

export default function EntrenadorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setData(res.data))
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando dashboard..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;
  if (!data) return <EmptyState icon="📊" title="Sin datos" description="Aun no hay informacion disponible." />;

  const { totalClientes, rutinasActivas, dietasActivas, clientesNuevosMes, clientesRecientes } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Resumen de tu actividad como entrenador</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <KpiCard icon="👥" label="Mis Clientes" value={totalClientes} />
        <KpiCard icon="🏋️" label="Rutinas Activas" value={rutinasActivas} />
        <KpiCard icon="🥗" label="Dietas Activas" value={dietasActivas} />
        <KpiCard icon="🆕" label="Nuevos este mes" value={clientesNuevosMes} />
      </div>

      {clientesRecientes?.length > 0 ? (
        <Card header="Mis Clientes Recientes">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Peso</th>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Nivel</th>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>Registro</th>
                </tr>
              </thead>
              <tbody>
                {clientesRecientes.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 'var(--font-medium)' }}>{c.nombre}</td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)' }}>{c.peso} kg</td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)' }}>{nivelLabels[c.nivelActividad] || c.nivelActividad}</td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' }}>{c.fechaRegistro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon="👥"
            title="Sin clientes"
            description="Aun no tienes clientes asignados. Registra tu primer instruido para comenzar."
          />
        </Card>
      )}
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
