import { EmptyState } from '../components/common/EmptyState';

export default function MetabolismoPage() {
  return (
    <div>
      <h1>Metabolismo</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        Análisis metabólico
      </p>
      <EmptyState
        icon="⚡"
        title="Módulo de Metabolismo"
        description="Aquí podrás realizar análisis metabólicos y cálculos de TMB, IMC, etc."
      />
    </div>
  );
}
