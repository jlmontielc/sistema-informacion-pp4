import { useState, useEffect } from 'react';
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
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-4">
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
    <div className="stat-card">
      <div className="stat-card-cuerpo">
        <span className="stat-card-icon" aria-hidden="true">{icon}</span>
        <div>
          <p className="stat-card-label">{label}</p>
          <p className="stat-card-value">{value}</p>
        </div>
      </div>
    </div>
  );
}
