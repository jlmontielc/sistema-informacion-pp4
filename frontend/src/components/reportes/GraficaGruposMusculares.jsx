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
import { Card } from '../common/Card';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';

export function GraficaGruposMusculares({ datos, cargando, error, grupoSeleccionado, onSeleccionarGrupo }) {
  if (cargando) {
    return (
      <Card header="Rendimiento por grupo muscular">
        <Loading size="md" text="Cargando rendimiento..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card header="Rendimiento por grupo muscular">
        <EmptyState icon="⚠️" title="Error" description={error} />
      </Card>
    );
  }

  if (!datos?.length) {
    return (
      <Card header="Rendimiento por grupo muscular">
        <EmptyState
          icon="🏋️"
          title="Sin datos"
          description="No hay registros de entrenamiento para el periodo seleccionado."
        />
      </Card>
    );
  }

  const handleClick = (entry) => {
    const grupo = entry?.payload?.grupoMuscular || entry?.grupoMuscular;
    if (grupo) {
      onSeleccionarGrupo(grupo);
    }
  };

  return (
    <Card header="Rendimiento por grupo muscular">
      <p className="reportes-ayuda-grafica">Haz clic en una barra para ver la evolución temporal.</p>
      <div className="reportes-grafica-contenedor">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={datos} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="grupoMuscular" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="volumenTotal"
              name="Volumen total"
              fill="var(--color-primary-400)"
              radius={[4, 4, 0, 0]}
              onClick={handleClick}
              className={grupoSeleccionado ? 'reportes-barra-seleccionable' : ''}
            />
            <Bar
              yAxisId="right"
              dataKey="pesoMaximoLevantado"
              name="Peso máximo"
              fill="var(--color-success)"
              radius={[4, 4, 0, 0]}
              onClick={handleClick}
              className={grupoSeleccionado ? 'reportes-barra-seleccionable' : ''}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
