export default function OfflinePage() {
  return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <div style={{ fontSize: 64, lineHeight: 1 }}>📡</div>
      <h2 style={{ color: 'var(--color-text)' }}>Sin conexión</h2>
      <p>No tienes acceso a internet en este momento.</p>
      <p>Los datos almacenados localmente aún están disponibles.</p>
      <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
        Reintentar
      </button>
    </div>
  );
}
