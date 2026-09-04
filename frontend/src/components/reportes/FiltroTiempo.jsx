const OPCIONES = [
  { valor: '7d', etiqueta: '7 días' },
  { valor: '30d', etiqueta: '30 días' },
  { valor: '3m', etiqueta: '3 meses' },
];

export function FiltroTiempo({ periodo, onChange }) {
  return (
    <div className="reportes-filtro-tiempo">
      {OPCIONES.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          className={`reportes-filtro-boton ${periodo === opcion.valor ? 'active' : ''}`}
          onClick={() => onChange(opcion.valor)}
          aria-pressed={periodo === opcion.valor}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}
