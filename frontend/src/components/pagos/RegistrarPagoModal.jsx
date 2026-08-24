import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { pagosApi } from '../../services/pagosApi';
import { formatUsd, formatBs, fechaHoyISO } from '../../utils/formatters';
import { DatosMetodo } from './DatosMetodo';

const MIMES_VALIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANIO_MAX = 2 * 1024 * 1024;

const leerArchivoBase64 = (archivo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(archivo);
  });

export function RegistrarPagoModal({ isOpen, onClose, plan, metodos, tasaCambio, onRegistrado }) {
  const [metodoPagoId, setMetodoPagoId] = useState('');
  const [referencia, setReferencia] = useState('');
  const [fechaPago, setFechaPago] = useState(fechaHoyISO());
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMetodoPagoId('');
      setReferencia('');
      setFechaPago(fechaHoyISO());
      setArchivo(null);
      setError('');
    }
  }, [isOpen]);

  if (!plan) return null;

  const metodoSeleccionado = metodos.find((m) => String(m.id) === String(metodoPagoId));

  const handleArchivoChange = (e) => {
    setError('');
    const file = e.target.files?.[0] || null;
    if (!file) {
      setArchivo(null);
      return;
    }
    if (!MIMES_VALIDOS.includes(file.type)) {
      setArchivo(null);
      e.target.value = '';
      return setError('Formato no permitido. Usa JPG, PNG o WebP.');
    }
    if (file.size > TAMANIO_MAX) {
      setArchivo(null);
      e.target.value = '';
      return setError('La imagen supera el máximo de 2 MB.');
    }
    setArchivo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!metodoPagoId) return setError('Selecciona un método de pago');
    if (referencia.trim().length < 3) {
      return setError('Ingresa la referencia de la operación (mínimo 3 caracteres)');
    }
    if (!fechaPago || fechaPago > fechaHoyISO()) {
      return setError('La fecha del pago no puede ser futura');
    }
    if (!archivo) return setError('Adjunta la imagen del comprobante');

    setGuardando(true);
    try {
      const comprobante = await leerArchivoBase64(archivo);
      await pagosApi.registrar({
        planId: plan.id,
        metodoPagoId: Number(metodoPagoId),
        referencia: referencia.trim(),
        fechaPago,
        comprobante,
        comprobanteMime: archivo.type,
      });
      onRegistrado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar pago" size="md">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-neutral-100)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <div>
              <strong>{plan.nombre}</strong>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                Vigencia: {plan.diasVigencia} días
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>
                {formatUsd(plan.montoUsd)}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                ≈ {formatBs(plan.montoUsd, tasaCambio)}
              </div>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="metodoPagoId">
              Método de pago
            </label>
            <select
              id="metodoPagoId"
              name="metodoPagoId"
              className="field-input"
              value={metodoPagoId}
              onChange={(e) => {
                setMetodoPagoId(e.target.value);
                setError('');
              }}
            >
              <option value="">Selecciona un método…</option>
              {metodos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.tipo === 'pago_movil'
                    ? 'Pago Móvil'
                    : m.tipo === 'transferencia'
                      ? 'Transferencia'
                      : m.tipo === 'zelle'
                        ? 'Zelle'
                        : m.tipo === 'binance'
                          ? 'Binance'
                          : 'Otro'}
                </option>
              ))}
            </select>
          </div>

          {metodoSeleccionado && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <strong style={{ display: 'block', marginBottom: 4, color: 'var(--color-text)' }}>
                Realiza la transferencia a estos datos:
              </strong>
              <DatosMetodo datos={metodoSeleccionado.datos} />
            </div>
          )}

          <Input
            label="Referencia / número de operación"
            name="referencia"
            value={referencia}
            onChange={(e) => {
              setReferencia(e.target.value);
              setError('');
            }}
            placeholder="Ej. 123456789"
            maxLength={100}
            required
          />
          <Input
            label="Fecha del pago"
            name="fechaPago"
            type="date"
            max={fechaHoyISO()}
            value={fechaPago}
            onChange={(e) => {
              setFechaPago(e.target.value);
              setError('');
            }}
            required
          />
          <div className="field">
            <label className="field-label" htmlFor="comprobante">
              Comprobante (JPG, PNG o WebP · máx. 2 MB)
            </label>
            <input
              id="comprobante"
              name="comprobante"
              type="file"
              className="field-input"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleArchivoChange}
              required
            />
            {archivo && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                {archivo.name}
              </span>
            )}
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
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Tu entrenador revisará y verificará el pago para activar tu plan.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              Enviar pago
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
