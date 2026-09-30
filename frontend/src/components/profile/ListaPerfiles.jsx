import { useState, useEffect } from 'react';
import { Loading } from '../common/Loading';
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icon';
import api from '../../services/api';
import { labelObjetivo } from '../../utils/constants';
import { CertificacionCard } from './CertificacionCard';

/* Devuelve 2 iniciales en mayúsculas (nombre y apellido);
   si solo hay una palabra, una sola letra */
function iniciales(nombre) {
  if (typeof nombre !== 'string') return '—';
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '—';
  if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
  return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
}

/* Valor seguro para texto: null/undefined → guion largo */
function textoSeguro(valor) {
  return valor || '—';
}

const nivelLabels = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

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
  if (error) {
    return (
      <div className="pf-seccion pf-card">
        <div className="pf-estado">
          <div className="pf-estado-icono pf-estado-icono--error">
            <Icon name="close" size={36} />
          </div>
          <h3 className="pf-estado-titulo">Error</h3>
          <p className="pf-estado-descripcion">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Tabs de sección */}
      <div className="pf-seccion pf-tabs">
        <button
          type="button"
          className={`pf-tab ${seccion === 'entrenadores' ? 'pf-tab--activa' : ''}`}
          onClick={() => setSeccion('entrenadores')}
        >
          Entrenadores
          <span className="pf-badge-contador">{entrenadores.length}</span>
        </button>
        <button
          type="button"
          className={`pf-tab ${seccion === 'instruidos' ? 'pf-tab--activa' : ''}`}
          onClick={() => setSeccion('instruidos')}
        >
          Instruidos
          <span className="pf-badge-contador">{instruidos.length}</span>
        </button>
      </div>

      {seccion === 'entrenadores' ? (
        entrenadores.length === 0 ? (
          <div className="pf-seccion pf-card">
            <div className="pf-estado">
              <div className="pf-estado-icono">
                <Icon name="teacher" size={36} />
              </div>
              <h3 className="pf-estado-titulo">Sin entrenadores</h3>
              <p className="pf-estado-descripcion">No hay entrenadores registrados.</p>
            </div>
          </div>
        ) : (
          <div className="pf-seccion pf-card">
            <div className="pf-card-cabecera">
              <h2 className="pf-card-titulo">
                <Icon name="teacher" size={20} className="pf-icono" />
                Entrenadores
              </h2>
              <span className="pf-badge-contador">{entrenadores.length}</span>
            </div>
            <div className="pf-tabla-envoltura">
              <table className="pf-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Especialidad</th>
                    <th>Certificaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entrenadores.map((ent) => (
                    <tr
                      key={ent.id}
                      onClick={() => setSeleccionado({ ...ent, tipo: 'entrenador' })}
                      className="pf-fila-clicable"
                    >
                      <td>
                        <div className="pf-tabla-cliente">
                          <span className="pf-avatar pf-avatar--sm" aria-hidden="true">
                            {iniciales(ent.nombre)}
                          </span>
                          <span className="pf-tabla-nombre">{textoSeguro(ent.nombre)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="pf-dato-valor pf-dato-valor--mono">{textoSeguro(ent.email)}</span>
                      </td>
                      <td>
                        {ent.especialidad ? (
                          <span className="pf-chip-especialidad">{ent.especialidad}</span>
                        ) : (
                          <span className="pf-dato-valor pf-dato-valor--vacio">—</span>
                        )}
                      </td>
                      <td>
                        <span className="pf-tabla-valor">{ent.certificaciones?.length || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        instruidos.length === 0 ? (
          <div className="pf-seccion pf-card">
            <div className="pf-estado">
              <div className="pf-estado-icono">
                <Icon name="users" size={36} />
              </div>
              <h3 className="pf-estado-titulo">Sin instruidos</h3>
              <p className="pf-estado-descripcion">No hay instruidos registrados.</p>
            </div>
          </div>
        ) : (
          <div className="pf-seccion pf-card">
            <div className="pf-card-cabecera">
              <h2 className="pf-card-titulo">
                <Icon name="users" size={20} className="pf-icono" />
                Instruidos
              </h2>
              <span className="pf-badge-contador">{instruidos.length}</span>
            </div>
            <div className="pf-tabla-envoltura">
              <table className="pf-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
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
                      className="pf-fila-clicable"
                    >
                      <td>
                        <div className="pf-tabla-cliente">
                          <span className="pf-avatar pf-avatar--sm" aria-hidden="true">
                            {iniciales(inst.nombre)}
                          </span>
                          <span className="pf-tabla-nombre">{textoSeguro(inst.nombre)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="pf-dato-valor pf-dato-valor--mono">{textoSeguro(inst.email)}</span>
                      </td>
                      <td>
                        <span className="pf-tabla-valor">{inst.edad || <span className="pf-dato-valor pf-dato-valor--vacio">—</span>}</span>
                      </td>
                      <td>
                        {inst.peso ? (
                          <span className="pf-tabla-valor">
                            {inst.peso}
                            <span className="pf-tabla-unidad">kg</span>
                          </span>
                        ) : (
                          <span className="pf-dato-valor pf-dato-valor--vacio">—</span>
                        )}
                      </td>
                      <td>
                        <ChipNivel nivel={inst.nivelActividad} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      <Modal isOpen={!!seleccionado} onClose={() => setSeleccionado(null)} title={seleccionado?.tipo === 'entrenador' ? 'Detalle Entrenador' : 'Detalle Instruido'}>
        {seleccionado && (
          <div className="pf-modal-datos">
            <DatoModal label="Nombre" valor={seleccionado.nombre} />
            <DatoModal label="Email" valor={seleccionado.email} mono />
            {seleccionado.tipo === 'entrenador' ? (
              <>
                <DatoModal label="Especialidad" valor={seleccionado.especialidad} />
                {seleccionado.certificaciones?.length > 0 && (
                  <div className="pf-campo">
                    <p className="pf-campo-label">Certificaciones</p>
                    <div className="pf-modal-cert-lista">
                      {seleccionado.certificaciones.map((cert) => (
                        <CertificacionCard key={cert.id} cert={cert} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <DatoModal label="Edad" valor={seleccionado.edad ? `${seleccionado.edad} años` : null} />
                <DatoModal label="Peso" valor={seleccionado.peso ? `${seleccionado.peso} kg` : null} />
                <DatoModal label="Altura" valor={seleccionado.altura ? `${seleccionado.altura} m` : null} />
                <DatoModal label="Nivel" valor={nivelLabels[seleccionado.nivelActividad] || seleccionado.nivelActividad || null} />
                <DatoModal label="Propósito" valor={seleccionado.propositoEntrenamiento ? labelObjetivo(seleccionado.propositoEntrenamiento) : null} />
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

/* Chip de nivel de actividad con punto de color; nulo → "Sin definir" gris */
function ChipNivel({ nivel }) {
  if (!nivel) {
    return <span className="pf-chip-exp pf-chip-exp--sin-definir">Sin definir</span>;
  }
  return (
    <span className={`pf-chip-nivel pf-chip-nivel--${nivel}`}>
      <span className="pf-punto" />
      {nivelLabels[nivel] || nivel}
    </span>
  );
}

function DatoModal({ label, valor, mono = false }) {
  return (
    <div className="pf-dato">
      <p className="pf-dato-label">{label}</p>
      {valor ? (
        <p className={`pf-dato-valor ${mono ? 'pf-dato-valor--mono' : ''}`}>{valor}</p>
      ) : (
        <p className="pf-dato-valor pf-dato-valor--vacio">—</p>
      )}
    </div>
  );
}
