import { useAuth } from '../context/AuthContext';
import { MiPerfil, ListaInstruidos, ListaPerfiles } from '../components/profile';

export default function PerfilPage() {
  const { user, setUser } = useAuth();

  const handleActualizar = (nuevoPerfil) => {
    setUser(prev => ({ ...prev, ...nuevoPerfil }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Gestiona tu información personal</p>
        </div>
      </div>

      {user?.rol === 'administrador' ? (
        <>
          <ListaPerfiles />
        </>
      ) : (
        <>
          <MiPerfil perfil={user} onActualizar={handleActualizar} />
          {user?.rol === 'entrenador' && <ListaInstruidos />}
        </>
      )}
    </div>
  );
}
