import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import api from '../../services/api';

export default function InstruidoDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setData(res.data))
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Cargando tu dashboard..." />;
  if (error) return <EmptyState icon="⚠️" title="Error" description={error} />;
  if (!data) return <EmptyState icon="📊" title="Sin datos" description="Aun no hay informacion disponible." />;

  const { metabolismo, medicion, rutinaActiva, dietaActiva, registrosRecientes } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1>Mi Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Resumen de tu progreso</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <KpiCard icon="⚖️" label="Peso" value={medicion?.peso ? `${medicion.peso} kg` : '—'} />
        <KpiCard icon="📐" label="IMC" value={medicion?.imc || '—'} />
        <KpiCard icon="🔥" label="TMB" value={metabolismo?.tmb ? `${metabolismo.tmb} kcal` : '—'} />
        <KpiCard icon="⚡" label="GCT" value={metabolismo?.gct ? `${metabolismo.gct} kcal` : '—'} />
      </div>

      {registrosRecientes?.length > 0 && (
        <Card header="Mi Progreso">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={registrosRecientes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="percepcion_esfuerzo" stroke="#3b82f6" name="Esfuerzo" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {rutinaActiva ? (
          <Card header="Mi Rutina">
            <p style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>{rutinaActiva.nombre}</p>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              Tipo: {rutinaActiva.tipo} · {rutinaActiva.frecuencia_semanal}x/semana
            </p>
            {rutinaActiva.fecha_inicio && (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                {rutinaActiva.fecha_inicio} → {rutinaActiva.fecha_fin || 'Sin fin'}
              </p>
            )}
          </Card>
        ) : (
          <Card>
            <EmptyState icon="🏋️" title="Sin rutina activa" description="Tu entrenador aun no te ha asignado una rutina." />
          </Card>
        )}

        {dietaActiva ? (
          <Card header="Mi Dieta">
            <p style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>{dietaActiva.objetivo_calorico} kcal/dia</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
              <MacroBadge label="Proteinas" value={dietaActiva.proteinas_gramos} unit="g" color="var(--color-error)" />
              <MacroBadge label="Carbos" value={dietaActiva.carbohidratos_gramos} unit="g" color="var(--color-warning)" />
              <MacroBadge label="Grasas" value={dietaActiva.grasas_gramos} unit="g" color="var(--color-success)" />
            </div>
          </Card>
        ) : (
          <Card>
            <EmptyState icon="🥗" title="Sin dieta activa" description="Tu entrenador aun no te ha asignado un plan nutricional." />
          </Card>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{label}</p>
          <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>{value}</p>
        </div>
      </div>
    </Card>
  );
}

function MacroBadge({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{label}</p>
      <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color }}>
        {value != null ? `${value}${unit}` : '—'}
      </p>
    </div>
  );
}
