import { EmptyState } from '../components/common/EmptyState';

export default function DietasPage() {
  return (
    <div>
      <h1>Dietas</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        Planes alimenticios
      </p>
      <EmptyState
        icon="🥗"
        title="Módulo de Dietas"
        description="Aquí podrás diseñar y asignar planes de alimentación a los clientes."
      />
    </div>
  );
}
