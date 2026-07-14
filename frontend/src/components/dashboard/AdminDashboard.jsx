import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import api from '../../services/api';

export default function AdminDashboard() {
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

  const {
    totalClientes,
    totalEntrenadores,
    rutinasActivas,
    dietasActivas,
    metabolicos,
    clientesNuevosMes,
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Resumen general del sistema</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <KpiCard icon="👥" label="Clientes Totales" value={totalClientes} />
        <KpiCard icon="🏋️" label="Entrenadores" value={totalEntrenadores} />
        <KpiCard icon="📋" label="Rutinas Activas" value={rutinasActivas} />
        <KpiCard icon="🥗" label="Dietas Activas" value={dietasActivas} />
        <KpiCard icon="⚡" label="Metabolicos" value={metabolicos} />
        <KpiCard icon="🆕" label="Clientes Nuevos (Mes)" value={clientesNuevosMes} />
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
