import { useAuth } from '../context/AuthContext';
import { AdminDashboard, EntrenadorDashboard, InstruidoDashboard } from '../components/dashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.rol === 'administrador') return <AdminDashboard />;
  if (user?.rol === 'entrenador') return <EntrenadorDashboard />;
  if (user?.tipo === 'instruido') return <InstruidoDashboard />;

  return <AdminDashboard />;
}
