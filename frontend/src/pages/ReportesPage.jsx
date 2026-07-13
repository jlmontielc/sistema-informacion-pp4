import { EmptyState } from '../components/common/EmptyState';

export default function ReportesPage() {
  return (
    <div>
      <h1>Reportes</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        Reportes y estadísticas
      </p>
      <EmptyState
        icon="📈"
        title="Módulo de Reportes"
        description="Aquí podrás generar reportes detallados del desempeño y progreso de los clientes."
      />
    </div>
  );
}
