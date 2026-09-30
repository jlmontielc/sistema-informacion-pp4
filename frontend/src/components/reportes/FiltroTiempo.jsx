const OPCIONES = [
  { valor: '7d', etiqueta: '7 días' },
  { valor: '30d', etiqueta: '30 días' },
  { valor: '3m', etiqueta: '3 meses' },
];

export function FiltroTiempo({ periodo, onChange }) {
  return (
    <div className="rp-filtro-tiempo" role="group" aria-label="Filtrar por periodo de tiempo">
      {OPCIONES.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          className={`rp-filtro-boton ${periodo === opcion.valor ? 'rp-filtro-boton--activa' : ''}`}
          onClick={() => onChange(opcion.valor)}
          aria-pressed={periodo === opcion.valor}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}
