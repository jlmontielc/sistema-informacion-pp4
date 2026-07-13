import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <div style={{ fontSize: 64, lineHeight: 1 }}>🔍</div>
      <h2 style={{ color: 'var(--color-text)' }}>Página no encontrada</h2>
      <p>La página que buscas no existe o ha sido movida.</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
}
