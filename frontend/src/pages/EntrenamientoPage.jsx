import { useAuth } from '../context/AuthContext';
import { AdminRutinasView } from '../components/entrenamiento/AdminRutinasView';
import { EntrenadorRutinasView } from '../components/entrenamiento/EntrenadorRutinasView';
import { InstruidoRutinasView } from '../components/entrenamiento/InstruidoRutinasView';

export default function EntrenamientoPage() {
  const { user } = useAuth();

  if (user?.tipo === 'instruido') {
    return <InstruidoRutinasView />;
  }

  if (user?.rol === 'administrador') {
    return <AdminRutinasView />;
  }

  return <EntrenadorRutinasView />;
}
