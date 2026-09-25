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

const experienciaBadge = {
  principiante: 'badge-success',
  intermedio: 'badge-warning',
  avanzado: 'badge-danger',
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
        <div className="table-wrapper tabla-ajustada">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="hide-mobile">Email</th>
                <th>Edad</th>
                <th>Peso</th>
                <th className="hide-mobile">Nivel Act.</th>
                <th>Experiencia</th>
                <th className="hide-mobile">Registro</th>
              </tr>
            </thead>
            <tbody>
              {instruidos.map((inst) => (
                <tr
                  key={inst.id}
                  onClick={() => abrirDetalle(inst)}
                  className="tabla-fila-clicable"
                >
                  <td>{inst.nombre}</td>
                  <td className="hide-mobile">{inst.email}</td>
                  <td>{inst.edad}</td>
                  <td>{inst.peso} kg</td>
                  <td className="hide-mobile">{nivelLabels[inst.nivelActividad] || inst.nivelActividad}</td>
                  <td>
                    <span className={`badge ${experienciaBadge[inst.nivelExperiencia] || 'badge-neutral'}`}>
                      {experienciaLabels[inst.nivelExperiencia] || '—'}
                    </span>
                  </td>
                  <td className="hide-mobile">{inst.fechaRegistro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={!!seleccionado} onClose={() => setSeleccionado(null)} title="Detalle del Instruido">
        {seleccionado && (
          <div className="stack">
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
              <p className="field-ayuda">
                Usado por la IA para generar rutinas acordes a su nivel
              </p>
            </div>

            {saveError && (
              <p className="text-sm text-error">{saveError}</p>
            )}

            <div className="form-acciones">
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

function InfoField({ label, value }) {
  return (
    <div className="field">
      <p className="dato-label">{label}</p>
      <p className="dato-valor">{value}</p>
    </div>
  );
}
