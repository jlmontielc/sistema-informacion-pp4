import { useAuth } from '../context/AuthContext';
import { MiPerfil, ListaInstruidos, ListaPerfiles } from '../components/profile';

export default function PerfilPage() {
  const { user, setUser } = useAuth();

  const handleActualizar = (nuevoPerfil) => {
    setUser(prev => ({ ...prev, ...nuevoPerfil }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1>Mi Perfil</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Gestiona tu información personal</p>
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
