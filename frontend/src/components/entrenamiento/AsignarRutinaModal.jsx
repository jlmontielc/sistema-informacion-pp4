import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { rutinasAsignadasApi, instruidosApi } from '../../services/rutinasApi';

export function AsignarRutinaModal({ isOpen, onClose, plantilla, onSaved }) {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteId, setClienteId] = useState('');
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingClientes(true);
    instruidosApi.listar()
      .then((res) => setClientes(res.data?.instruidos || res.data || []))
      .catch(() => setClientes([]))
      .finally(() => setLoadingClientes(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (plantilla) {
      setNombre(plantilla.nombre || '');
    } else {
      setNombre('');
    }
    setClienteId('');
    setFechaInicio('');
    setObservaciones('');
    setError(null);
  }, [isOpen, plantilla]);

  const handleGuardar = async () => {
    if (!clienteId) {
      setError('Selecciona un cliente');
      return;
    }
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (plantilla?.id) {
        await rutinasAsignadasApi.clonarDesdePlantilla(plantilla.id, {
          instruido_id: parseInt(clienteId),
          fecha_inicio: fechaInicio || undefined,
          observaciones: observaciones.trim() || undefined,
        });
      } else {
        const payload = {
          cliente_id: parseInt(clienteId),
          nombre: nombre.trim(),
          tipo: 'hipertrofia',
          ejercicios: [],
          dias_semana: {},
          frecuencia_semanal: 3,
          fecha_inicio: fechaInicio || undefined,
          observaciones: observaciones.trim() || undefined,
        };
        await rutinasAsignadasApi.crear(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al asignar la rutina');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plantilla ? `Asignar: ${plantilla.nombre}` : 'Asignar Rutina'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {error && (
          <div style={{
            padding: 'var(--space-3)',
            background: '#fef2f2',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
          }}>
            {error}
          </div>
        )}

        {loadingClientes ? (
          <Loading text="Cargando clientes..." />
        ) : (
          <>
            <div className="field">
              <label className="field-label">Cliente *</label>
              <select
                className="field-input"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <Input
              label="Nombre de la rutina *"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre para esta rutina"
            />

            <Input
              label="Fecha de inicio"
              name="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />

            <div className="field">
              <label className="field-label">Observaciones</label>
              <textarea
                className="field-input"
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre la rutina..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {plantilla && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-neutral-50)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                Se clonara la plantilla <strong>{plantilla.nombre}</strong> con todos sus ejercicios y dias configurados.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <Button onClick={handleGuardar} loading={saving}>
                Asignar Rutina
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
