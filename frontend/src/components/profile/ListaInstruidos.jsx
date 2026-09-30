import { useState, useEffect } from 'react';
import { Loading } from '../common/Loading';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import api from '../../services/api';
import { labelObjetivo } from '../../utils/constants';

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

export function ListaInstruidos() {
  const [instruidos, setInstruidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [editExperiencia, setEditExperiencia] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    api.get('/instruidos')
      .then(res => setInstruidos(res.data))
      .catch(() => setError('No se pudieron cargar los instruidos'))
      .finally(() => setLoading(false));
  }, []);

  const abrirDetalle = (inst) => {
    setSeleccionado(inst);
    setEditExperiencia(inst.nivelExperiencia || '');
    setSaveError(null);
  };

  const handleGuardarExperiencia = async () => {
    if (!seleccionado) return;
    setSaving(true);
    setSaveError(null);
    try {
      await api.put(`/instruidos/${seleccionado.id}`, {
        nivelExperiencia: editExperiencia || null,
      });
      setInstruidos((prev) =>
        prev.map((i) =>
          i.id === seleccionado.id ? { ...i, nivelExperiencia: editExperiencia || null } : i
        )
      );
      setSeleccionado((prev) => ({ ...prev, nivelExperiencia: editExperiencia || null }));
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Cargando instruidos..." />;
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
  if (instruidos.length === 0) return (
    <div className="pf-seccion pf-card">
      <div className="pf-estado">
        <div className="pf-estado-icono">
          <Icon name="users" size={36} />
        </div>
        <h3 className="pf-estado-titulo">Sin instruidos</h3>
        <p className="pf-estado-descripcion">Aun no tienes instruidos asignados.</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="pf-seccion pf-card">
        <div className="pf-card-cabecera">
          <h2 className="pf-card-titulo">
            <Icon name="users" size={20} className="pf-icono" />
            Mis Instruidos
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
                <th>Nivel Act.</th>
                <th>Experiencia</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {instruidos.map((inst) => (
                <tr
                  key={inst.id}
                  onClick={() => abrirDetalle(inst)}
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
                  <td>
                    <ChipExperiencia nivel={inst.nivelExperiencia} />
                  </td>
                  <td>
                    <span className="pf-dato-valor pf-dato-valor--mono">{inst.fechaRegistro || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!seleccionado} onClose={() => setSeleccionado(null)} title="Detalle del Instruido">
        {seleccionado && (
          <div className="pf-modal-datos">
            <DatoModal label="Nombre" valor={seleccionado.nombre} />
            <DatoModal label="Email" valor={seleccionado.email} mono />
            <DatoModal label="Edad" valor={seleccionado.edad ? `${seleccionado.edad} años` : null} />
            <DatoModal label="Peso" valor={seleccionado.peso ? `${seleccionado.peso} kg` : null} />
            <DatoModal label="Altura" valor={seleccionado.altura ? `${seleccionado.altura} m` : null} />
            <DatoModal label="Sexo" valor={seleccionado.sexo === 'masculino' ? 'Masculino' : seleccionado.sexo === 'femenino' ? 'Femenino' : null} />
            <DatoModal label="Nivel de actividad" valor={nivelLabels[seleccionado.nivelActividad] || seleccionado.nivelActividad || null} />
            <DatoModal label="Propósito" valor={seleccionado.propositoEntrenamiento ? labelObjetivo(seleccionado.propositoEntrenamiento) : null} />
            <DatoModal label="Días disponibles" valor={seleccionado.diasDisponibles ? `${seleccionado.diasDisponibles} días/semana` : null} />
            <DatoModal label="Fecha de registro" valor={seleccionado.fechaRegistro || null} />

            <div className="pf-campo">
              <label className="pf-campo-label">Nivel de experiencia *</label>
              <div className="pf-selecto">
                <select
                  className="pf-campo-input"
                  value={editExperiencia}
                  onChange={(e) => setEditExperiencia(e.target.value)}
                >
                  <option value="">Sin definir</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
                <Icon name="next" size={14} className="pf-selecto-flecha" />
              </div>
              <p className="pf-campo-ayuda">
                Usado por la IA para generar rutinas acordes a su nivel
              </p>
            </div>

            {saveError && (
              <div className="pf-aviso pf-aviso--error">
                <Icon name="close" size={16} className="pf-icono" />
                <p>{saveError}</p>
              </div>
            )}

            <div className="pf-acciones">
              <Button variant="secondary" onClick={() => setSeleccionado(null)}>Cerrar</Button>
              <Button variant="primary" loading={saving} onClick={handleGuardarExperiencia}>
                Guardar Cambios
              </Button>
            </div>
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

/* Chip de experiencia; nulo/vacío/desconocido → "Sin definir" gris */
function ChipExperiencia({ nivel }) {
  const clase = nivel && experienciaLabels[nivel] ? `pf-chip-exp--${nivel}` : 'pf-chip-exp--sin-definir';
  return (
    <span className={`pf-chip-exp ${clase}`}>
      {experienciaLabels[nivel] || 'Sin definir'}
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
