import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/common/Icon';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="contenedor-centrado">
      <div className="empty-state">
        <Icon name="search" size={64} color="var(--color-primary-400)" />
        <h2 className="empty-state-titulo">Página no encontrada</h2>
        <p>La página que buscas no existe o ha sido movida.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
