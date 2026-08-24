const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'var(--color-warning)' },
  verificado: { label: 'Verificado', color: 'var(--color-success)' },
  rechazado: { label: 'Rechazado', color: 'var(--color-error)' },
};

export function EstadoBadge({ estado }) {
  const cfg = ESTADOS[estado] || { label: estado, color: 'var(--color-text-secondary)' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)',
        color: '#fff',
        backgroundColor: cfg.color,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
