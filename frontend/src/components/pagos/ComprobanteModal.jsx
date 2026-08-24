import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { Loading } from '../common/Loading';
import { pagosApi } from '../../services/pagosApi';

export function ComprobanteModal({ isOpen, onClose, pagoId }) {
  const [urlImagen, setUrlImagen] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let urlCreada = null;

    if (isOpen && pagoId) {
      setCargando(true);
      setError('');
      setUrlImagen(null);
      pagosApi
        .obtenerComprobante(pagoId)
        .then((res) => {
          urlCreada = URL.createObjectURL(res.data);
          setUrlImagen(urlCreada);
        })
        .catch(() => setError('No se pudo cargar el comprobante'))
        .finally(() => setCargando(false));
    }

    return () => {
      if (urlCreada) URL.revokeObjectURL(urlCreada);
    };
  }, [isOpen, pagoId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante de pago" size="lg">
      {cargando && <Loading text="Cargando comprobante..." />}
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
      {urlImagen && (
        <img
          src={urlImagen}
          alt="Comprobante de pago"
          style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
        />
      )}
    </Modal>
  );
}
