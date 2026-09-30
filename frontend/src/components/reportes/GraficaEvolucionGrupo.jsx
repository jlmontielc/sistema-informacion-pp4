import {
  LineChart,
  Line,
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

export function GraficaEvolucionGrupo({ grupoMuscular, datos, cargando, error, onCerrar }) {
  const cabecera = (
    <div className="rp-card-cabecera">
      <h2 className="rp-card-titulo">
        <Icon name="monitoring" size={20} className="rp-icono" />
        Evolución: {grupoMuscular || 'Selecciona un grupo'}
      </h2>
      {grupoMuscular && (
        <button type="button" className="rp-boton-cerrar" onClick={onCerrar}>
          Cerrar
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );

  const contenido = () => {
    if (cargando) {
      return <Loading size="md" text="Cargando evolución..." />;
    }

    if (error) {
      return (
        <div className="rp-estado">
          <div className="rp-estado-icono rp-estado-icono--error">
            <Icon name="close" size={32} />
          </div>
          <h3 className="rp-estado-titulo">Error</h3>
          <p className="rp-estado-descripcion">{error}</p>
        </div>
      );
    }

    if (!grupoMuscular) {
      return (
        <div className="rp-estado">
          <div className="rp-estado-icono">
            <Icon name="target" size={32} />
          </div>
          <h3 className="rp-estado-titulo">Selecciona un grupo muscular</h3>
          <p className="rp-estado-descripcion">
            Haz clic en una barra del gráfico superior para ver su evolución.
          </p>
        </div>
      );
    }

    if (!datos?.length) {
      return (
        <div className="rp-estado">
          <div className="rp-estado-icono">
            <Icon name="trending-down" size={32} />
          </div>
          <h3 className="rp-estado-titulo">Sin datos de evolución</h3>
          <p className="rp-estado-descripcion">
            No hay registros suficientes para {grupoMuscular} en este periodo.
          </p>
        </div>
      );
    }

    return (
      <div className="rp-grafica-contenedor">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={datos} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
            <XAxis
              dataKey="semana"
              tick={{ fontSize: 12, fill: COLOR_TEXTO }}
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
              cursor={{ stroke: 'rgba(208, 188, 255, 0.4)' }}
            />
            <Legend textStyle={{ color: '#cbc3d7', fontSize: 12 }} iconType="circle" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="volumenTotal"
              name="Volumen"
              stroke={COLOR_VOLUMEN}
              strokeWidth={2}
              dot={{ r: 4, fill: COLOR_VOLUMEN, stroke: '#1b1b1f' }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pesoMaximoLevantado"
              name="Peso máximo"
              stroke={COLOR_PESO}
              strokeWidth={2}
              dot={{ r: 4, fill: COLOR_PESO, stroke: '#1b1b1f' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="rp-card">
      {cabecera}
      <div className="rp-card-cuerpo">{contenido()}</div>
    </div>
  );
}
