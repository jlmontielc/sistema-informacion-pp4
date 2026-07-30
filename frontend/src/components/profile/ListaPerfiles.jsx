import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { Modal } from '../common/Modal';
import api from '../../services/api';

export function ListaPerfiles() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [instruidos, setInstruidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [seccion, setSeccion] = useState('entrenadores');

  useEffect(() => {
    Promise.all([
      api.get('/auth/profiles'),
      api.get('/instruidos'),
    ])
      .then(([resEnt, resInst]) => {
        setEntrenadores(resEnt.data);
        setInstruidos(resInst.data);
      })
      .catch(() => setError('No se pudieron cargar los perfiles'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando perfiles..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <TabButton active={seccion === 'entrenadores'} onClick={() => setSeccion('entrenadores')}>
          Entrenadores ({entrenadores.length})
        </TabButton>
        <TabButton active={seccion === 'instruidos'} onClick={() => setSeccion('instruidos')}>
          Instruidos ({instruidos.length})
        </TabButton>
      </div>

      {seccion === 'entrenadores' ? (
        entrenadores.length === 0 ? (
          <EmptyState icon="🏋️" title="Sin entrenadores" description="No hay entrenadores registrados." />
        ) : (
          <Card header="Entrenadores">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Especialidad</th>
                    <th style={thStyle}>Certificaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entrenadores.map((ent) => (
                    <tr
                      key={ent.id}
                      onClick={() => setSeleccionado({ ...ent, tipo: 'entrenador' })}
                      style={{ borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-alt)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    >
                      <td style={tdStyle}>{ent.nombre}</td>
                      <td style={tdStyle}>{ent.email}</td>
                      <td style={tdStyle}>{ent.especialidad || '—'}</td>
                      <td style={tdStyle}>{ent.certificaciones?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        instruidos.length === 0 ? (
          <EmptyState icon="👥" title="Sin instruidos" description="No hay instruidos registrados." />
        ) : (
          <Card header="Instruidos">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Edad</th>
                    <th style={thStyle}>Peso</th>
                    <th style={thStyle}>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {instruidos.map((inst) => (
                    <tr
                      key={inst.id}
                      onClick={() => setSeleccionado({ ...inst, tipo: 'instruido' })}
                      style={{ borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-alt)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                    >
                      <td style={tdStyle}>{inst.nombre}</td>
                      <td style={tdStyle}>{inst.email}</td>
                      <td style={tdStyle}>{inst.edad}</td>
                      <td style={tdStyle}>{inst.peso} kg</td>
                      <td style={tdStyle}>{nivelLabels[inst.nivelActividad] || inst.nivelActividad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      <Modal isOpen={!!seleccionado} onClose={() => setSeleccionado(null)} title={seleccionado?.tipo === 'entrenador' ? 'Detalle Entrenador' : 'Detalle Instruido'}>
        {seleccionado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <InfoField label="Nombre" value={seleccionado.nombre} />
            <InfoField label="Email" value={seleccionado.email} />
            {seleccionado.tipo === 'entrenador' ? (
              <>
                <InfoField label="Especialidad" value={seleccionado.especialidad || '—'} />
                {seleccionado.certificaciones?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Certificaciones</p>
                    {seleccionado.certificaciones.map((cert) => (
                      <div key={cert.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <p style={{ fontWeight: 'var(--font-bold)' }}>{cert.nombre}</p>
                        {cert.institucion && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{cert.institucion}</p>}
                        {cert.imagenUrl && <a href={cert.imagenUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-500)' }}>Ver imagen</a>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <InfoField label="Edad" value={`${seleccionado.edad} años`} />
                <InfoField label="Peso" value={`${seleccionado.peso} kg`} />
                <InfoField label="Altura" value={`${seleccionado.altura} m`} />
                <InfoField label="Nivel" value={nivelLabels[seleccionado.nivelActividad] || seleccionado.nivelActividad} />
                <InfoField label="Propósito" value={seleccionado.propositoEntrenamiento || '—'} />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const nivelLabels = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

const thStyle = { textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' };
const tdStyle = { padding: 'var(--space-2) var(--space-3)' };

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        background: active ? 'var(--color-primary-500)' : 'var(--color-bg-card)',
        color: active ? 'white' : 'var(--color-text)',
        cursor: 'pointer',
        fontWeight: 'var(--font-medium)',
        fontSize: 'var(--text-sm)',
      }}
    >
      {children}
    </button>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 'var(--font-medium)' }}>{value}</p>
    </div>
  );
}
