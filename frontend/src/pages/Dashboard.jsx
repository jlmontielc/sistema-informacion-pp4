import { Card } from '../components/common/Card';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Resumen general del sistema</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { title: 'Clientes activos', value: '—', icon: '👥' },
          { title: 'Entrenamientos hoy', value: '—', icon: '🏋️' },
          { title: 'Dietas activas', value: '—', icon: '🥗' },
          { title: 'Metabolismos', value: '—', icon: '⚡' },
        ].map(item => (
          <Card key={item.title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-6)' }}>
              <span style={{ fontSize: 32 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{item.title}</p>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
