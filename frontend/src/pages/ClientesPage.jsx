import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PerfilEntrenador } from '../components/profile/PerfilEntrenador';
import { EmptyState } from '../components/common/EmptyState';
import { Loading } from '../components/common/Loading';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import api from '../services/api';

const nivelLabels = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

const experienciaLabels = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export default function ClientesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instruidos, setInstruidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.tipo === 'instruido') return;

    api.get('/instruidos')
      .then((res) => setInstruidos(res.data || []))
      .catch(() => setError('No se pudieron cargar los clientes'))
      .finally(() => setLoading(false));
  }, [user]);

  if (user?.tipo === 'instruido') {
    return <PerfilEntrenador />;
  }

  if (loading) return <Loading text="Cargando clientes..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1>Clientes</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {user?.rol === 'administrador'
            ? 'Listado de todos los clientes registrados'
            : 'Clientes asignados a tu supervisión'}
        </p>
      </div>

      {instruidos.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Sin clientes"
          description={
            user?.rol === 'administrador'
              ? 'No hay clientes registrados en el sistema.'
              : 'Aún no tienes clientes asignados.'
          }
        />
      ) : (
        <Card header={`Clientes (${instruidos.length})`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Edad</th>
                  <th style={thStyle}>Peso</th>
                  <th style={thStyle}>Nivel actividad</th>
                  <th style={thStyle}>Experiencia</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {instruidos.map((inst) => (
                  <tr
                    key={inst.id}
                    style={{ borderBottom: '1px solid var(--color-border-light)' }}
                  >
                    <td style={tdStyle}>{inst.nombre}</td>
                    <td style={tdStyle}>{inst.email}</td>
                    <td style={tdStyle}>{inst.edad || '—'}</td>
                    <td style={tdStyle}>{inst.peso ? `${inst.peso} kg` : '—'}</td>
                    <td style={tdStyle}>{nivelLabels[inst.nivelActividad] || inst.nivelActividad || '—'}</td>
                    <td style={tdStyle}>
                      <span className={`rutina-tipo-badge ${inst.nivelExperiencia || ''}`}>
                        {experienciaLabels[inst.nivelExperiencia] || '—'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/clientes/${inst.id}`)}
                      >
                        Ver perfil completo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

const thStyle = { textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' };
const tdStyle = { padding: 'var(--space-2) var(--space-3)' };
