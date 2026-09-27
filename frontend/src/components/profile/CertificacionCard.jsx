import { useState } from 'react';
import { Button } from '../common/Button';
import api from '../../services/api';

export function CertificacionCard({ cert }) {
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState('');

  const verArchivo = async () => {
    setErrorArchivo('');
    setCargandoArchivo(true);
    try {
      const res = await api.get(`/auth/certifications/${cert.id}/archivo`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      setErrorArchivo('No se pudo abrir el archivo');
    } finally {
      setCargandoArchivo(false);
    }
  };

  return (
    <div className="tarjeta-borde">
      <p className="text-bold">{cert.nombre}</p>
      {cert.institucion && (
        <p className="text-sm text-muted">{cert.institucion}</p>
      )}
      {cert.descripcion && (
        <p className="text-sm">{cert.descripcion}</p>
      )}
      <div className="row text-xs text-muted">
        {cert.fechaObtencion && <span>Obtención: {cert.fechaObtencion}</span>}
        {cert.fechaExpiracion && <span>Expiración: {cert.fechaExpiracion}</span>}
      </div>
      {cert.tieneArchivo && (
        <div className="stack-sm">
          <Button
            variant="secondary"
            size="sm"
            loading={cargandoArchivo}
            disabled={cargandoArchivo}
            onClick={verArchivo}
          >
            Ver archivo
          </Button>
          {errorArchivo && <p className="text-sm text-error">{errorArchivo}</p>}
        </div>
      )}
      {!cert.tieneArchivo && cert.imagenUrl && (
        <a href={cert.imagenUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primario">
          Ver imagen
        </a>
      )}
    </div>
  );
}
