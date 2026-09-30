import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/common/Icon';
import { CalculadoraMetabolica } from '../components/metabolismo';

export default function MetabolismoPage() {
  const { user } = useAuth();
  const rol = user?.tipo;

  // Los instruidos no deberían acceder a esta página (el sidebar ya la oculta),
  // pero por seguridad mostramos un guard de acceso si llegan aquí.
  if (rol === 'instruido') {
    return (
      <div className="dm-pagina">
        <header className="dm-seccion dm-cabecera">
          <h1>Metabolismo</h1>
          <p>Cálculo de tasa metabólica basal y gasto calórico total</p>
        </header>

        <section className="dm-seccion">
          <div className="dm-card">
            <div className="dm-guard">
              <span className="dm-guard-icono" aria-hidden="true">
                <Icon name="lock" size={40} />
              </span>
              <h2 className="dm-guard-titulo">Acceso restringido</h2>
              <p className="dm-guard-descripcion">
                La sección de metabolismo está disponible solo para administradores y entrenadores.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="dm-pagina">
      <header className="dm-seccion dm-cabecera">
        <h1>Metabolismo</h1>
        <p>Cálculo de tasa metabólica basal y gasto calórico total</p>
      </header>

      <CalculadoraMetabolica rol={rol} />
    </div>
  );
}
