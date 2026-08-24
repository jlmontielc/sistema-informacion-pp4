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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {entradas.map(([clave, valor]) => (
        <span key={clave} style={{ fontSize: 'var(--text-sm)' }}>
          <strong style={{ color: 'var(--color-text-secondary)' }}>
            {ETIQUETAS[clave] || clave}:
          </strong>{' '}
          {String(valor)}
        </span>
      ))}
    </div>
  );
}
