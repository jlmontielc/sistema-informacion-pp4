import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';

/* Paleta M3 fija: volumen (lila) y peso máximo (cian) */
const COLOR_VOLUMEN = '#d0bcff';
const COLOR_PESO = '#4cd7f6';
const COLOR_GRID = 'rgba(73, 68, 84, 0.4)';
const COLOR_TEXTO = '#958ea0';

const TOOLTIP_ESTILO = {
  background: '#0e0e12',
  border: '1px solid #494454',
  borderRadius: 8,
  padding: '8px 12px',
};

export function GraficaGruposMusculares({ datos, cargando, error, grupoSeleccionado, onSeleccionarGrupo }) {
  const cabecera = (
    <div className="rp-card-cabecera">
      <h2 className="rp-card-titulo">
        <Icon name="chartline" size={20} className="rp-icono" />
        Rendimiento por grupo muscular
      </h2>
    </div>
  );

  if (cargando) {
    return (
      <div className="rp-card">
        {cabecera}
        <Loading size="md" text="Cargando rendimiento..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card">
        {cabecera}
        <div className="rp-estado">
          <div className="rp-estado-icono rp-estado-icono--error">
            <Icon name="close" size={32} />
          </div>
          <h3 className="rp-estado-titulo">Error</h3>
          <p className="rp-estado-descripcion">{error}</p>
        </div>
      </div>
    );
  }

  if (!datos?.length) {
    return (
      <div className="rp-card">
        {cabecera}
        <div className="rp-estado">
          <div className="rp-estado-icono">
            <Icon name="dumbbell" size={32} />
          </div>
          <h3 className="rp-estado-titulo">Sin datos</h3>
          <p className="rp-estado-descripcion">
            No hay registros de entrenamiento para el periodo seleccionado.
          </p>
        </div>
      </div>
    );
  }

  const handleClick = (entry) => {
    const grupo = entry?.payload?.grupoMuscular || entry?.grupoMuscular;
    if (grupo) {
      onSeleccionarGrupo(grupo);
    }
  };

  return (
    <div className="rp-card">
      {cabecera}
      <div className="rp-card-cuerpo">
        <p className="rp-ayuda-grafica">Haz clic en una barra para ver la evolución temporal.</p>
        <div className="rp-grafica-contenedor">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={datos} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} vertical={false} />
              <XAxis
                dataKey="grupoMuscular"
                tick={{ fontSize: 12, fill: COLOR_TEXTO }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
                axisLine={{ stroke: COLOR_GRID }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: COLOR_TEXTO }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: COLOR_TEXTO }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_ESTILO}
                labelStyle={{ color: '#cbc3d7', fontWeight: 600 }}
                itemStyle={{ color: '#e4e1e7' }}
                cursor={{ fill: 'rgba(73, 68, 84, 0.2)' }}
              />
              <Legend textStyle={{ color: '#cbc3d7', fontSize: 12 }} iconType="circle" />
              <Bar
                yAxisId="left"
                dataKey="volumenTotal"
                name="Volumen total"
                fill={COLOR_VOLUMEN}
                radius={[4, 4, 0, 0]}
                onClick={handleClick}
                className={grupoSeleccionado ? 'rp-barra-seleccionable' : ''}
              />
              <Bar
                yAxisId="right"
                dataKey="pesoMaximoLevantado"
                name="Peso máximo"
                fill={COLOR_PESO}
                radius={[4, 4, 0, 0]}
                onClick={handleClick}
                className={grupoSeleccionado ? 'rp-barra-seleccionable' : ''}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
