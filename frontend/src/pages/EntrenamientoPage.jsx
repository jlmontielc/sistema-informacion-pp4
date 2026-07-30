import { useAuth } from '../context/AuthContext';
import { GestionRutinasView } from '../components/entrenamiento/GestionRutinasView';
import { InstruidoRutinasView } from '../components/entrenamiento/InstruidoRutinasView';

export default function EntrenamientoPage() {
  const { user } = useAuth();

  if (user?.tipo === 'instruido') {
    return <InstruidoRutinasView />;
  }

  return <GestionRutinasView />;
}
