import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { metodosPagoApi } from '../../services/pagosApi';

export const TIPOS_METODO = [
  {
    value: 'pago_movil',
    label: 'Pago Móvil',
    campos: [
      { name: 'banco', label: 'Banco' },
      { name: 'telefono', label: 'Teléfono' },
      { name: 'cedula', label: 'Cédula' },
    ],
  },
  {
    value: 'transferencia',
    label: 'Transferencia',
    campos: [
      { name: 'banco', label: 'Banco' },
      { name: 'numeroCuenta', label: 'Número de cuenta' },
      { name: 'cedula', label: 'Cédula / RIF' },
    ],
  },
  {
    value: 'zelle',
    label: 'Zelle',
    campos: [
      { name: 'correo', label: 'Correo' },
      { name: 'titular', label: 'Titular' },
    ],
  },
  {
    value: 'binance',
    label: 'Binance',
    campos: [
      { name: 'id', label: 'ID de Binance' },
      { name: 'titular', label: 'Titular' },
    ],
  },
  {
    value: 'otro',
    label: 'Otro',
    campos: [{ name: 'descripcion', label: 'Datos / instrucciones' }],
  },
];

const camposDe = (tipo) => TIPOS_METODO.find((t) => t.value === tipo)?.campos || [];
const vaciarDatos = (tipo) =>
  camposDe(tipo).reduce((acc, campo) => ({ ...acc, [campo.name]: '' }), {});

export function MetodoPagoModal({ isOpen, onClose, metodo, onGuardado }) {
  const editando = Boolean(metodo);
  const [tipo, setTipo] = useState('pago_movil');
  const [datos, setDatos] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const tipoInicial = metodo?.tipo || 'pago_movil';
      setTipo(tipoInicial);
      setDatos(
        metodo?.datos && typeof metodo.datos === 'object'
          ? { ...vaciarDatos(tipoInicial), ...metodo.datos }
          : vaciarDatos(tipoInicial)
      );
      setError('');
    }
  }, [isOpen, metodo]);

  const handleTipoChange = (e) => {
    const nuevoTipo = e.target.value;
    setTipo(nuevoTipo);
    setDatos(vaciarDatos(nuevoTipo));
    setError('');
  };

  const handleDatoChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const datosLimpios = {};
    for (const campo of camposDe(tipo)) {
      const valor = String(datos[campo.name] || '').trim();
      if (!valor) return setError(`Completa el campo "${campo.label}"`);
      datosLimpios[campo.name] = valor;
    }

    setGuardando(true);
    try {
      if (editando) await metodosPagoApi.actualizar(metodo.id, { tipo, datos: datosLimpios });
      else await metodosPagoApi.crear({ tipo, datos: datosLimpios });
      onGuardado();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el método de pago');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editando ? 'Editar método de pago' : 'Nuevo método de pago'}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="field">
            <label className="field-label" htmlFor="tipo">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              className="field-input"
              value={tipo}
              onChange={handleTipoChange}
            >
              {TIPOS_METODO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {camposDe(tipo).map((campo) => (
            <Input
              key={campo.name}
              label={campo.label}
              name={campo.name}
              value={datos[campo.name] || ''}
              onChange={handleDatoChange}
              required
            />
          ))}
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
              {editando ? 'Guardar cambios' : 'Crear método'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
