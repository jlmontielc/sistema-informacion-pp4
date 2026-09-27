export function CertificacionCard({ cert }) {
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
      {cert.imagenUrl && (
        <a href={cert.imagenUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primario">
          Ver imagen
        </a>
      )}
    </div>
  );
}
