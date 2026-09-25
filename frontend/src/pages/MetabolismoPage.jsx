import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { CalculadoraMetabolica } from '../components/metabolismo';

export default function MetabolismoPage() {
  const { user } = useAuth();
  const rol = user?.tipo;

  // Los instruidos no deberian acceder a esta pagina (el sidebar ya la oculta),
  // pero por seguridad, mostramos un mensaje si llegan aqui.
  if (rol === 'instruido') {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-header-text">
            <h1 className="page-title">Metabolismo</h1>
            <p className="page-subtitle">Esta seccion no esta disponible para tu rol.</p>
          </div>
        </div>

        <Card>
          <div className="empty-state">
            <p className="empty-state-icono" aria-hidden="true">🔒</p>
            <h3 className="card-titulo card-titulo-md">Acceso restringido</h3>
            <p className="text-sm text-muted">
              La seccion de metabolismo esta disponible solo para administradores y entrenadores.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Metabolismo</h1>
          <p className="page-subtitle">
            Calculo de tasa metabolica basal y gasto calorico total
          </p>
        </div>
      </div>

      <CalculadoraMetabolica rol={rol} />
    </div>
  );
}
