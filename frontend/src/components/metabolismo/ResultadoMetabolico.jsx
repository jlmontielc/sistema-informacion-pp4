import { Card } from '../common/Card';

const NIVELES_ACTIVIDAD_LABELS = {
  sedentario: 'Sedentario',
  ligero: 'Ligero',
  moderado: 'Moderado',
  activo: 'Activo',
  muy_activo: 'Muy activo',
};

export function ResultadoMetabolico({ datos, datosEntrada }) {
  const { tmb, gct, nivelActividad } = datos;

  return (
    <Card header={<h3 className="card-titulo card-titulo-md">Resultado del metabolismo</h3>}>
      <div className="stack-lg">
        {/* Resumen de datos de entrada */}
        <div className="nota-informativa row">
          <span><strong>{datosEntrada.peso}</strong> kg</span>
          <span><strong>{datosEntrada.altura}</strong> m</span>
          <span><strong>{datosEntrada.edad}</strong> anos</span>
          <span><strong>{datosEntrada.sexo === 'masculino' ? 'Masculino' : 'Femenino'}</strong></span>
          <span><strong>{NIVELES_ACTIVIDAD_LABELS[nivelActividad] || nivelActividad}</strong></span>
        </div>

        {/* Valores calculados */}
        <div className="grid grid-cols-2">
          {/* TMB */}
          <div className="stat-card stat-card-primary">
            <span className="stat-card-label">Tasa Metabolica Basal (TMB)</span>
            <span className="stat-card-value">
              {Number(tmb).toFixed(1)}
            </span>
            <span className="stat-card-label">kcal/dia</span>
          </div>

          {/* GCT */}
          <div className="stat-card stat-card-success">
            <span className="stat-card-label">Gasto Calorico Total (GCT)</span>
            <span className="stat-card-value">
              {Number(gct).toFixed(1)}
            </span>
            <span className="stat-card-label">kcal/dia</span>
          </div>
        </div>

        {/* Explicacion */}
        <div className="nota-informativa stack stack-sm">
          <p>
            <strong>TMB (Tasa Metabolica Basal):</strong> Cantidad de energia que tu cuerpo necesita en reposo
            para funcionar (respirar, circular sangre, regenerar celulas). Se calcula con la ecuacion de Harris-Benedict.
          </p>
          <p>
            <strong>GCT (Gasto Calorico Total):</strong> TMB multiplicada por el factor de actividad fisica.
            Representa las calorias diarias necesarias para mantener tu peso actual segun tu nivel de actividad.
          </p>
        </div>
      </div>
    </Card>
  );
}
