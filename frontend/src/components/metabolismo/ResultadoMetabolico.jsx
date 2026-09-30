import { Icon } from '../common/Icon';

/* Etiquetas legibles por nivel de actividad (el VALUE llega del backend) */
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
    <div className="dm-seccion dm-card">
      <div className="dm-card-cabecera">
        <h3>
          <Icon name="monitoring" size={20} />
          Resultado del metabolismo
        </h3>
      </div>
      <div className="dm-card-cuerpo">
        {/* KPIs con los valores calculados */}
        <div className="dm-resultado">
          {/* TMB */}
          <div className="dm-kpi dm-kpi--tmb">
            <div className="dm-kpi-cabecera">
              <span className="dm-kpi-icono" aria-hidden="true">
                <Icon name="flame" size={20} />
              </span>
              <span className="dm-kpi-etiqueta">
                Tasa Metabólica Basal (TMB)
              </span>
            </div>
            <span className="dm-kpi-valor">{Number(tmb).toFixed(1)}</span>
            <span className="dm-kpi-unidad">kcal/día</span>
          </div>

          {/* GCT */}
          <div className="dm-kpi dm-kpi--gct">
            <div className="dm-kpi-cabecera">
              <span className="dm-kpi-icono" aria-hidden="true">
                <Icon name="bolt" size={20} />
              </span>
              <span className="dm-kpi-etiqueta">
                Gasto Calórico Total (GCT)
              </span>
            </div>
            <span className="dm-kpi-valor">{Number(gct).toFixed(1)}</span>
            <span className="dm-kpi-unidad">kcal/día</span>
          </div>
        </div>

        {/* Resumen de datos de entrada */}
        <div className="dm-entrada">
          <span className="dm-chip-entrada">
            <strong>{datosEntrada.peso}</strong> kg
          </span>
          <span className="dm-chip-entrada">
            <strong>{datosEntrada.altura}</strong> m
          </span>
          <span className="dm-chip-entrada">
            <strong>{datosEntrada.edad}</strong> años
          </span>
          <span className="dm-chip-entrada">
            <strong>{datosEntrada.sexo === 'masculino' ? 'Masculino' : 'Femenino'}</strong>
          </span>
          <span className="dm-chip-entrada">
            <strong>{NIVELES_ACTIVIDAD_LABELS[nivelActividad] || nivelActividad}</strong>
          </span>
        </div>

        {/* Explicación de los indicadores */}
        <div className="dm-notas">
          <p>
            <strong>TMB (Tasa Metabólica Basal):</strong> Cantidad de energía que tu cuerpo necesita en reposo
            para funcionar (respirar, circular sangre, regenerar células). Se calcula con la ecuación de Harris-Benedict.
          </p>
          <p>
            <strong>GCT (Gasto Calórico Total):</strong> TMB multiplicada por el factor de actividad física.
            Representa las calorías diarias necesarias para mantener tu peso actual según tu nivel de actividad.
          </p>
        </div>
      </div>
    </div>
  );
}
