import { useAuth } from '../context/AuthContext';
import { MiPerfil, ListaInstruidos, ListaPerfiles } from '../components/profile';

/* Etiqueta legible del rol para la cabecera */
function etiquetaRol(user) {
  if (user?.rol === 'administrador') return 'Administrador';
  if (user?.rol === 'entrenador') return 'Entrenador';
  return 'Instruido';
}

export default function PerfilPage() {
  const { user, setUser } = useAuth();

  const handleActualizar = (nuevoPerfil) => {
    setUser(prev => ({ ...prev, ...nuevoPerfil }));
  };

  return (
    <div className="pf-pagina">
      {/* Cabecera común de la página */}
      <div className="pf-seccion pf-cabecera">
        <h1 className="pf-titulo">Mi Perfil</h1>
        <p className="pf-subtitulo">
          Gestiona tu información personal · <strong>{etiquetaRol(user)}</strong>
        </p>
      </div>

      {user?.rol === 'administrador' ? (
        <ListaPerfiles />
      ) : (
        <>
          <MiPerfil perfil={user} onActualizar={handleActualizar} />
          {user?.rol === 'entrenador' && <ListaInstruidos />}
        </>
      )}
    </div>
  );
}
