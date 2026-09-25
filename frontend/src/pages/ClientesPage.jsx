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

const experienciaBadge = {
  principiante: 'badge-success',
  intermedio: 'badge-warning',
  avanzado: 'badge-danger',
};

export default function ClientesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instruidos, setInstruidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroExperiencia, setFiltroExperiencia] = useState('');

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

  // Filtro local (busqueda por nombre/email y nivel de experiencia)
  const instruidosFiltrados = instruidos.filter((inst) => {
    const texto = `${inst.nombre || ''} ${inst.email || ''}`.toLowerCase();
    const cumpleBusqueda = texto.includes(busqueda.trim().toLowerCase());
    const cumpleExperiencia = !filtroExperiencia || inst.nivelExperiencia === filtroExperiencia;
    return cumpleBusqueda && cumpleExperiencia;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">
            {user?.rol === 'administrador'
              ? 'Listado de todos los clientes registrados'
              : 'Clientes asignados a tu supervisión'}
          </p>
        </div>
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
        <Card header={`Clientes (${instruidosFiltrados.length})`}>
          <div className="toolbar">
            <input
              type="text"
              className="field-input flex-1"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar cliente"
            />
            <select
              className="field-input select-filtro"
              value={filtroExperiencia}
              onChange={(e) => setFiltroExperiencia(e.target.value)}
              aria-label="Filtrar por experiencia"
            >
              <option value="">Toda experiencia</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>

          {instruidosFiltrados.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Sin resultados"
              description="Ningún cliente coincide con la búsqueda o el filtro aplicado."
            />
          ) : (
            <div className="table-wrapper tabla-ajustada">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th className="hide-mobile">Email</th>
                    <th className="hide-mobile">Edad</th>
                    <th>Peso</th>
                    <th className="hide-mobile">Nivel actividad</th>
                    <th>Experiencia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {instruidosFiltrados.map((inst) => (
                    <tr key={inst.id}>
                      <td>{inst.nombre}</td>
                      <td className="hide-mobile">{inst.email}</td>
                      <td className="hide-mobile">{inst.edad || '—'}</td>
                      <td>{inst.peso ? `${inst.peso} kg` : '—'}</td>
                      <td className="hide-mobile">{nivelLabels[inst.nivelActividad] || inst.nivelActividad || '—'}</td>
                      <td>
                        <span className={`badge ${experienciaBadge[inst.nivelExperiencia] || 'badge-neutral'}`}>
                          {experienciaLabels[inst.nivelExperiencia] || 'Sin definir'}
                        </span>
                      </td>
                      <td>
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
          )}
        </Card>
      )}
    </div>
  );
}
