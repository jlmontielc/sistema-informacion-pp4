import { Card } from '../common/Card';

const NIVELES_ACTIVIDAD_LABELS = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

const ESTILO_RESULTADO = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-4)',
  },
  tarjeta: {
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  },
  valor: {
    fontSize: 'var(--text-3xl)',
    fontWeight: 'var(--font-bold)',
    lineHeight: 'var(--line-height-tight)',
  },
  etiqueta: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
    fontWeight: 'var(--font-medium)',
  },
  unidad: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  },
};

export function ResultadoMetabolico({ datos, datosEntrada }) {
  const { tmb, gct, nivelActividad } = datos;

  return (
    <Card
      header={
        <div className="card-header">
          <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Resultado del metabolismo</h3>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Resumen de datos de entrada */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          padding: 'var(--space-3)',
          background: 'var(--color-bg, #f8fafc)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          <span><strong>{datosEntrada.peso}</strong> kg</span>
          <span><strong>{datosEntrada.altura}</strong> m</span>
          <span><strong>{datosEntrada.edad}</strong> anos</span>
          <span><strong>{datosEntrada.sexo === 'masculino' ? 'Masculino' : 'Femenino'}</strong></span>
          <span><strong>{NIVELES_ACTIVIDAD_LABELS[nivelActividad] || nivelActividad}</strong></span>
        </div>

        {/* Valores calculados */}
        <div style={ESTILO_RESULTADO.container}>
          {/* TMB */}
          <div style={{
            ...ESTILO_RESULTADO.tarjeta,
            background: 'var(--color-primary-50, #eff6ff)',
            borderColor: 'var(--color-primary-200, #bfdbfe)',
          }}>
            <span style={ESTILO_RESULTADO.etiqueta}>Tasa Metabolica Basal (TMB)</span>
            <span style={{ ...ESTILO_RESULTADO.valor, color: 'var(--color-primary-700, #1d4ed8)' }}>
              {Number(tmb).toFixed(1)}
            </span>
            <span style={ESTILO_RESULTADO.unidad}>kcal/dia</span>
          </div>

          {/* GCT */}
          <div style={{
            ...ESTILO_RESULTADO.tarjeta,
            background: 'var(--color-success-bg, #d4edda)',
            borderColor: '#a3d9b1',
          }}>
            <span style={ESTILO_RESULTADO.etiqueta}>Gasto Calorico Total (GCT)</span>
            <span style={{ ...ESTILO_RESULTADO.valor, color: 'var(--color-success, #155724)' }}>
              {Number(gct).toFixed(1)}
            </span>
            <span style={ESTILO_RESULTADO.unidad}>kcal/dia</span>
          </div>
        </div>

        {/* Explicacion */}
        <div style={{
          padding: 'var(--space-3)',
          background: 'var(--color-bg, #f8fafc)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--line-height-relaxed)',
        }}>
          <p style={{ margin: '0 0 var(--space-2)' }}>
            <strong>TMB (Tasa Metabolica Basal):</strong> Cantidad de energia que tu cuerpo necesita en reposo
            para funcionar (respirar, circular sangre, regenerar celulas). Se calcula con la ecuacion de Harris-Benedict.
          </p>
          <p style={{ margin: 0 }}>
            <strong>GCT (Gasto Calorico Total):</strong> TMB multiplicada por el factor de actividad fisica.
            Representa las calorias diarias necesarias para mantener tu peso actual segun tu nivel de actividad.
          </p>
        </div>
      </div>
    </Card>
  );
}
