const ETIQUETAS = {
  banco: 'Banco',
  telefono: 'Teléfono',
  cedula: 'Cédula',
  numeroCuenta: 'N° de cuenta',
  correo: 'Correo',
  titular: 'Titular',
  id: 'ID',
  descripcion: 'Descripción',
};

export function DatosMetodo({ datos }) {
  if (!datos || typeof datos !== 'object') return null;
  const entradas = Object.entries(datos).filter(
    ([, valor]) => valor !== undefined && valor !== null && String(valor).trim() !== ''
  );
  if (entradas.length === 0) return null;

  return (
    <div className="stack stack-sm">
      {entradas.map(([clave, valor]) => (
        <span key={clave} className="text-sm">
          <strong className="text-muted">
            {ETIQUETAS[clave] || clave}:
          </strong>{' '}
          {String(valor)}
        </span>
      ))}
    </div>
  );
}
