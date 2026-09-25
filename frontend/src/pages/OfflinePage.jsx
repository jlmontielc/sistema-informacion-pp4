import { Icon } from '../components/common/Icon';

export default function OfflinePage() {
  return (
    <div className="contenedor-centrado">
      <div className="empty-state">
        <Icon name="wifi-off" size={64} color="var(--color-warning)" />
        <h2 className="empty-state-titulo">Sin conexión</h2>
        <p>No tienes acceso a internet en este momento.</p>
        <p>Los datos almacenados localmente aún están disponibles.</p>
        <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
