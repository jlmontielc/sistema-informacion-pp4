const ETIQUETAS = {
  pendiente: 'Pendiente',
  verificado: 'Verificado',
  rechazado: 'Rechazado',
};

const CLASES_BADGE = {
  pendiente: 'badge-warning',
  verificado: 'badge-success',
  rechazado: 'badge-danger',
};

export function EstadoBadge({ estado }) {
  const clase = CLASES_BADGE[estado] || 'badge-neutral';
  const etiqueta = ETIQUETAS[estado] || estado;
  return (
    <span className={`badge ${clase}`}>
      {etiqueta}
    </span>
  );
}
