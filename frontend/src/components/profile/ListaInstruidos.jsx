import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
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
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;
  if (instruidos.length === 0) return (
    <EmptyState icon="👥" title="Sin instruidos" description="Aun no tienes instruidos asignados." />
  );

  return (
    <>
      <Card header={`Mis Instruidos (${instruidos.length})`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Edad</th>
                <th style={thStyle}>Peso</th>
                <th style={thStyle}>Nivel Act.</th>
                <th style={thStyle}>Experiencia</th>
                <th style={thStyle}>Registro</th>
              </tr>
            </thead>
            <tbody>
              {instruidos.map((inst) => (
                <tr
                  key={inst.id}
                  onClick={() => abrirDetalle(inst)}
                  style={{ borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-alt)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}
                >
                  <td style={tdStyle}>{inst.nombre}</td>
                  <td style={tdStyle}>{inst.email}</td>
                  <td style={tdStyle}>{inst.edad}</td>
                  <td style={tdStyle}>{inst.peso} kg</td>
                  <td style={tdStyle}>{nivelLabels[inst.nivelActividad] || inst.nivelActividad}</td>
                  <td style={tdStyle}>
                    <span className={`rutina-tipo-badge ${inst.nivelExperiencia || ''}`}>
                      {experienciaLabels[inst.nivelExperiencia] || '—'}
                    </span>
                  </td>
                  <td style={tdStyle}>{inst.fechaRegistro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={!!seleccionado} onClose={() => setSeleccionado(null)} title="Detalle del Instruido">
        {seleccionado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <InfoField label="Nombre" value={seleccionado.nombre} />
            <InfoField label="Email" value={seleccionado.email} />
            <InfoField label="Edad" value={`${seleccionado.edad} años`} />
            <InfoField label="Peso" value={`${seleccionado.peso} kg`} />
            <InfoField label="Altura" value={`${seleccionado.altura} m`} />
            <InfoField label="Sexo" value={seleccionado.sexo === 'masculino' ? 'Masculino' : 'Femenino'} />
            <InfoField label="Nivel de actividad" value={nivelLabels[seleccionado.nivelActividad] || seleccionado.nivelActividad} />
            <InfoField label="Propósito" value={seleccionado.propositoEntrenamiento ? labelObjetivo(seleccionado.propositoEntrenamiento) : '—'} />
            <InfoField label="Días disponibles" value={seleccionado.diasDisponibles ? `${seleccionado.diasDisponibles} días/semana` : '—'} />
            <InfoField label="Fecha de registro" value={seleccionado.fechaRegistro} />

            <div className="field">
              <label className="field-label">Nivel de experiencia *</label>
              <select
                className="field-input"
                value={editExperiencia}
                onChange={(e) => setEditExperiencia(e.target.value)}
              >
                <option value="">Sin definir</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Usado por la IA para generar rutinas acordes a su nivel
              </p>
            </div>

            {saveError && (
              <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>{saveError}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => setSeleccionado(null)}>Cerrar</button>
              <Button onClick={handleGuardarExperiencia} loading={saving}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

const thStyle = { textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-secondary)' };
const tdStyle = { padding: 'var(--space-2) var(--space-3)' };

function InfoField({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 'var(--font-medium)' }}>{value}</p>
    </div>
  );
}
