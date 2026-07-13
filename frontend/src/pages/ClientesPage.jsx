import { EmptyState } from '../components/common/EmptyState';

export default function ClientesPage() {
  return (
    <div>
      <h1>Clientes</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        Gestión de clientes
      </p>
      <EmptyState
        icon="👥"
        title="Módulo de Clientes"
        description="Aquí podrás gestionar el registro, edición y seguimiento de clientes."
      />
    </div>
  );
}
