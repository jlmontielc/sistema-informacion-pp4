import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { labelObjetivo } from '../../utils/constants';

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
    <div className="page">
      <div className="chip-group">
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
            <div className="table-wrapper tabla-ajustada">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th className="hide-mobile">Email</th>
                    <th>Especialidad</th>
                    <th>Certificaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entrenadores.map((ent) => (
                    <tr
                      key={ent.id}
                      onClick={() => setSeleccionado({ ...ent, tipo: 'entrenador' })}
                      className="tabla-fila-clicable"
                    >
                      <td>{ent.nombre}</td>
                      <td className="hide-mobile">{ent.email}</td>
                      <td>{ent.especialidad || '—'}</td>
                      <td>{ent.certificaciones?.length || 0}</td>
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
            <div className="table-wrapper tabla-ajustada">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th className="hide-mobile">Email</th>
                    <th>Edad</th>
                    <th>Peso</th>
                    <th>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {instruidos.map((inst) => (
                    <tr
                      key={inst.id}
                      onClick={() => setSeleccionado({ ...inst, tipo: 'instruido' })}
                      className="tabla-fila-clicable"
                    >
                      <td>{inst.nombre}</td>
                      <td className="hide-mobile">{inst.email}</td>
                      <td>{inst.edad}</td>
                      <td>{inst.peso} kg</td>
                      <td>{nivelLabels[inst.nivelActividad] || inst.nivelActividad}</td>
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
          <div className="stack">
            <InfoField label="Nombre" value={seleccionado.nombre} />
            <InfoField label="Email" value={seleccionado.email} />
            {seleccionado.tipo === 'entrenador' ? (
              <>
                <InfoField label="Especialidad" value={seleccionado.especialidad || '—'} />
                {seleccionado.certificaciones?.length > 0 && (
                  <div className="stack stack-sm">
                    <p className="field-ayuda">Certificaciones</p>
                    {seleccionado.certificaciones.map((cert) => (
                      <div key={cert.id} className="tarjeta-borde">
                        <p className="text-bold">{cert.nombre}</p>
                        {cert.institucion && <p className="text-sm text-muted">{cert.institucion}</p>}
                        {cert.imagenUrl && <a href={cert.imagenUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primario">Ver imagen</a>}
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
                <InfoField label="Propósito" value={seleccionado.propositoEntrenamiento ? labelObjetivo(seleccionado.propositoEntrenamiento) : '—'} />
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

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`chip ${active ? 'active' : ''}`}
      type="button"
    >
      {children}
    </button>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="field">
      <p className="dato-label">{label}</p>
      <p className="dato-valor">{value}</p>
    </div>
  );
}
