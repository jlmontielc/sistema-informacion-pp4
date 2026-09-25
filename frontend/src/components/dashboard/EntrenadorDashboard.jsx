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
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen de tu actividad como entrenador</p>
        </div>
      </div>

      <div className="grid grid-cols-4">
        <KpiCard icon="👥" label="Mis Clientes" value={totalClientes} />
        <KpiCard icon="🏋️" label="Rutinas Activas" value={rutinasActivas} />
        <KpiCard icon="🥗" label="Dietas Activas" value={dietasActivas} />
        <KpiCard icon="🆕" label="Nuevos este mes" value={clientesNuevosMes} />
      </div>

      {clientesRecientes?.length > 0 ? (
        <Card header="Mis Clientes Recientes">
          <div className="table-wrapper tabla-ajustada">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Peso</th>
                  <th>Nivel</th>
                  <th className="hide-mobile">Registro</th>
                </tr>
              </thead>
              <tbody>
                {clientesRecientes.map(c => (
                  <tr key={c.id}>
                    <td className="text-medium">{c.nombre}</td>
                    <td>{c.peso} kg</td>
                    <td>{nivelLabels[c.nivelActividad] || c.nivelActividad}</td>
                    <td className="hide-mobile text-muted">{c.fechaRegistro}</td>
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
