import { EmptyState } from '../components/common/EmptyState';

export default function EntrenamientoPage() {
  return (
    <div>
      <h1>Entrenamiento</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        Planes de entrenamiento
      </p>
      <EmptyState
        icon="🏋️"
        title="Módulo de Entrenamiento"
        description="Aquí podrás crear y gestionar rutinas y planes de entrenamiento personalizados."
      />
    </div>
  );
}
