export function EjercicioCard({
  ejercicio,
  nombreEjercicio,
  onEditar,
  onEliminar,
  onCambio,
  editable = false,
  showActions = true,
}) {
  const nombre = nombreEjercicio || ejercicio?.nombre || 'Ejercicio';

  const handleChange = (campo, valor) => {
    onCambio?.({ ...ejercicio, [campo]: valor });
  };

  return (
    <div className="ejercicio-card">
      <div className="ejercicio-card-header">
        <h4 className="ejercicio-card-title">{nombre}</h4>
        {showActions && (
          <div className="ejercicio-card-actions">
            {onEditar && (
              <button className="btn btn-ghost btn-sm" onClick={onEditar}>
                Editar
              </button>
            )}
            {onEliminar && (
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={onEliminar}>
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
      <div className="ejercicio-meta">
        {editable ? (
          <>
            <span className="ejercicio-meta-item">
              <input
                type="number"
                min={1}
                max={20}
                value={ejercicio?.series || 1}
                onChange={(e) => handleChange('series', parseInt(e.target.value) || 1)}
                className="ejercicio-inline-input"
              />
              <span> series</span>
            </span>
            <span className="ejercicio-meta-item">
              ×
              <input
                type="number"
                min={1}
                max={100}
                value={ejercicio?.repeticiones || 1}
                onChange={(e) => handleChange('repeticiones', parseInt(e.target.value) || 1)}
                className="ejercicio-inline-input"
              />
              <span> reps</span>
            </span>
            <span className="ejercicio-meta-item">
              <input
                type="number"
                min={0}
                max={999}
                step={0.5}
                value={ejercicio?.carga_kg || 0}
                onChange={(e) => handleChange('carga_kg', parseFloat(e.target.value) || 0)}
                className="ejercicio-inline-input"
              />
              <span> kg</span>
            </span>
            <span className="ejercicio-meta-item">
              <input
                type="number"
                min={0}
                max={600}
                step={5}
                value={ejercicio?.descanso_segundos || 0}
                onChange={(e) => handleChange('descanso_segundos', parseInt(e.target.value) || 0)}
                className="ejercicio-inline-input"
              />
              <span>s descanso</span>
            </span>
          </>
        ) : (
          <>
            <span className="ejercicio-meta-item">
              <span className="ejercicio-meta-value">{ejercicio?.series || 0}</span> series
            </span>
            <span className="ejercicio-meta-item">
              × <span className="ejercicio-meta-value">{ejercicio?.repeticiones || 0}</span> reps
            </span>
            {ejercicio?.carga_kg > 0 && (
              <span className="ejercicio-meta-item">
                <span className="ejercicio-meta-value">{ejercicio.carga_kg}</span> kg
              </span>
            )}
            {ejercicio?.descanso_segundos > 0 && (
              <span className="ejercicio-meta-item">
                <span className="ejercicio-meta-value">{ejercicio.descanso_segundos}s</span> descanso
              </span>
            )}
          </>
        )}
      </div>
      {ejercicio?.notas && (
        <div className="ejercicio-notas">{ejercicio.notas}</div>
      )}
    </div>
  );
}
