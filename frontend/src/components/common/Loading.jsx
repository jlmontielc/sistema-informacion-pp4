export function Loading({ size = 'md', text = 'Cargando...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-8)',
      color: 'var(--color-text-secondary)',
    }}>
      <span className={`spinner spinner-${size}`} />
      {text && <span style={{ fontSize: 'var(--text-sm)' }}>{text}</span>}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 20, count = 1, gap = 12 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width: typeof width === 'number' ? `${width}px` : width, height }} />
      ))}
    </div>
  );
}
