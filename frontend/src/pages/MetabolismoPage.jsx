import { useAuth } from '../context/AuthContext';
import { CalculadoraMetabolica } from '../components/metabolismo';

export default function MetabolismoPage() {
  const { user } = useAuth();
  const rol = user?.tipo;

  // Los instruidos no deberian acceder a esta pagina (el sidebar ya la oculta),
  // pero por seguridad, mostramos un mensaje si llegan aqui.
  if (rol === 'instruido') {
    return (
      <div>
        <h1>Metabolismo</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Esta seccion no esta disponible para tu rol.
        </p>
        <div style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{ fontSize: 48, lineHeight: 1 }}>🔒</div>
          <h3 style={{ marginTop: 'var(--space-4)' }}>Acceso restringido</h3>
          <p>La seccion de metabolismo esta disponible solo para administradores y entrenadores.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1>Metabolismo</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
            Calculo de tasa metabolica basal y gasto calorico total
          </p>
        </div>
      </div>

      <CalculadoraMetabolica rol={rol} />
    </div>
  );
}
