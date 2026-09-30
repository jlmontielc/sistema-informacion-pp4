import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';

/* Devuelve 2 iniciales en mayúsculas (nombre y apellido);
   si solo hay una palabra, una sola letra */
function iniciales(nombre) {
  if (typeof nombre !== 'string') return '—';
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '—';
  if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
  return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
}

export function ListaInstruidos({ instruidos, seleccionado, onSeleccionar, cargando, error }) {
  if (cargando) {
    return (
      <div className="rp-card">
        <div className="rp-card-cabecera">
          <h2 className="rp-card-titulo">
            <Icon name="users" size={20} className="rp-icono" />
            Mis instruidos
          </h2>
        </div>
        <Loading size="sm" text="Cargando instruidos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card">
        <div className="rp-card-cabecera">
          <h2 className="rp-card-titulo">
            <Icon name="users" size={20} className="rp-icono" />
            Mis instruidos
          </h2>
        </div>
        <div className="rp-estado rp-estado--compacto">
          <div className="rp-estado-icono rp-estado-icono--error">
            <Icon name="close" size={28} />
          </div>
          <p className="rp-estado-error-texto">{error}</p>
        </div>
      </div>
    );
  }

  if (!instruidos?.length) {
    return (
      <div className="rp-card">
        <div className="rp-card-cabecera">
          <h2 className="rp-card-titulo">
            <Icon name="users" size={20} className="rp-icono" />
            Mis instruidos
          </h2>
        </div>
        <div className="rp-estado">
          <div className="rp-estado-icono">
            <Icon name="users" size={32} />
          </div>
          <h3 className="rp-estado-titulo">Sin instruidos</h3>
          <p className="rp-estado-descripcion">No tienes instruidos asignados todavía.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-card">
      <div className="rp-card-cabecera">
        <h2 className="rp-card-titulo">
          <Icon name="users" size={20} className="rp-icono" />
          Mis instruidos
        </h2>
        <span className="rp-badge-contador">{instruidos.length}</span>
      </div>
      <ul className="rp-lista">
        {instruidos.map((instruido) => (
          <li key={instruido.id}>
            <button
              type="button"
              className={`rp-instruido-item ${seleccionado?.id === instruido.id ? 'rp-instruido-item--seleccionado' : ''}`}
              onClick={() => onSeleccionar(instruido)}
              aria-pressed={seleccionado?.id === instruido.id}
            >
              <span className="rp-avatar" aria-hidden="true">
                {iniciales(instruido.nombre)}
              </span>
              <span className="rp-instruido-info">
                <span className="rp-instruido-nombre">{instruido.nombre || 'Sin nombre'}</span>
                <span className="rp-instruido-email">{instruido.email}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
