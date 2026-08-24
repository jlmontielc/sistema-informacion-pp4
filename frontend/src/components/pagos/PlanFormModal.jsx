import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { planesPagoApi } from '../../services/pagosApi';

export function PlanFormModal({ isOpen, onClose, plan, onGuardado }) {
  const editando = Boolean(plan);
  const [form, setForm] = useState({ nombre: '', descripcion: '', montoUsd: '', diasVigencia: 30 });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(
        plan
          ? {
              nombre: plan.nombre || '',
              descripcion: plan.descripcion || '',
              montoUsd: plan.montoUsd ?? '',
              diasVigencia: plan.diasVigencia ?? 30,
            }
          : { nombre: '', descripcion: '', montoUsd: '', diasVigencia: 30 }
      );
      setError('');
    }
  }, [isOpen, plan]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombre = form.nombre.trim();
    if (nombre.length < 2) return setError('El nombre debe tener al menos 2 caracteres');

    const monto = parseFloat(form.montoUsd);
    if (!monto || monto <= 0) return setError('Ingresa un monto válido en USD');
    if (monto > 99999999) return setError('El monto excede el máximo permitido');

    const dias = parseInt(form.diasVigencia, 10);
    if (!dias || dias < 1 || dias > 365) {
      return setError('La vigencia debe estar entre 1 y 365 días');
    }

    const datos = {
      nombre,
      descripcion: form.descripcion.trim(),
      montoUsd: Math.round(monto * 100) / 100,
      diasVigencia: dias,
    };

    setGuardando(true);
    try {
      if (editando) await planesPagoApi.actualizar(plan.id, datos);
      else await planesPagoApi.crear(datos);
      onGuardado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el plan');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editando ? 'Editar plan' : 'Nuevo plan'}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Nombre del plan"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Mensual Full"
            maxLength={150}
            required
          />
          <div className="field">
            <label className="field-label" htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="field-input"
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Qué incluye este plan (opcional)"
              maxLength={2000}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input
              label="Monto (USD)"
              name="montoUsd"
              type="number"
              min="0.01"
              step="0.01"
              value={form.montoUsd}
              onChange={handleChange}
              placeholder="35.00"
              required
            />
            <Input
              label="Vigencia (días)"
              name="diasVigencia"
              type="number"
              min="1"
              max="365"
              step="1"
              value={form.diasVigencia}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-error)',
                color: 'var(--color-text-inverse)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              {editando ? 'Guardar cambios' : 'Crear plan'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
