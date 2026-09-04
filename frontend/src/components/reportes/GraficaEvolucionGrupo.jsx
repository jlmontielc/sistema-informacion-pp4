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
import { Card } from '../common/Card';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';

export function GraficaEvolucionGrupo({ grupoMuscular, datos, cargando, error, onCerrar }) {
  const contenido = () => {
    if (cargando) {
      return <Loading size="md" text="Cargando evolución..." />;
    }

    if (error) {
      return <EmptyState icon="⚠️" title="Error" description={error} />;
    }

    if (!grupoMuscular) {
      return (
        <EmptyState
          icon="📈"
          title="Selecciona un grupo muscular"
          description="Haz clic en una barra del gráfico superior para ver su evolución."
        />
      );
    }

    if (!datos?.length) {
      return (
        <EmptyState
          icon="📉"
          title="Sin datos de evolución"
          description={`No hay registros suficientes para ${grupoMuscular} en este periodo.`}
        />
      );
    }

    return (
      <div className="reportes-grafica-contenedor">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={datos} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="volumenTotal"
              name="Volumen"
              stroke="var(--color-primary-500)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pesoMaximoLevantado"
              name="Peso máximo"
              stroke="var(--color-success)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card
      header={
        <div className="reportes-card-header-con-accion">
          <span>Evolución: {grupoMuscular || 'Selecciona un grupo'}</span>
          {grupoMuscular && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={onCerrar}>
              Cerrar
            </button>
          )}
        </div>
      }
    >
      {contenido()}
    </Card>
  );
}
