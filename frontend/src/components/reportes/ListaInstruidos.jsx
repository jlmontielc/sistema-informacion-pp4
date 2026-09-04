import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';

export function ListaInstruidos({ instruidos, seleccionado, onSeleccionar, cargando, error }) {
  if (cargando) {
    return (
      <div className="reportes-lista-instruidos">
        <h3 className="reportes-lista-titulo">Mis instruidos</h3>
        <Loading size="sm" text="Cargando instruidos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reportes-lista-instruidos">
        <h3 className="reportes-lista-titulo">Mis instruidos</h3>
        <p className="reportes-lista-error">{error}</p>
      </div>
    );
  }

  if (!instruidos?.length) {
    return (
      <div className="reportes-lista-instruidos">
        <h3 className="reportes-lista-titulo">Mis instruidos</h3>
        <EmptyState
          icon="👥"
          title="Sin instruidos"
          description="No tienes instruidos asignados todavía."
        />
      </div>
    );
  }

  return (
    <div className="reportes-lista-instruidos">
      <h3 className="reportes-lista-titulo">Mis instruidos</h3>
      <ul className="reportes-lista">
        {instruidos.map((instruido) => (
          <li key={instruido.id}>
            <button
              type="button"
              className={`reportes-instruido-item ${seleccionado?.id === instruido.id ? 'seleccionado' : ''}`}
              onClick={() => onSeleccionar(instruido)}
            >
              <span className="reportes-instruido-nombre">{instruido.nombre || 'Sin nombre'}</span>
              <span className="reportes-instruido-email">{instruido.email}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
