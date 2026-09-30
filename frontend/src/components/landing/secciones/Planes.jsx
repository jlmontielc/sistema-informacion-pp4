import { Icono } from '../Icono';

const PLANES = [
  {
    nombre: 'Básico',
    precio: '4.99',
    destacado: false,
    caracteristicas: [
      'Rutinas personalizadas',
      'Acceso a la biblioteca de ejercicios',
      'Seguimiento semanal',
    ],
  },
  {
    nombre: 'Pro-Dieta',
    precio: '6.88',
    destacado: true,
    caracteristicas: [
      'Rutinas personalizadas',
      'Plan de alimentación a medida',
      'Videollamadas de seguimiento mensual',
    ],
  },
  {
    nombre: 'Elite',
    precio: '9.99',
    destacado: false,
    caracteristicas: [
      'Todo lo del plan Pro-Dieta',
      'Asesoría nutricional personalizada',
      'Ajustes semanales con tu entrenador',
    ],
  },
];

export function Planes() {
  return (
    <section className="landing-seccion landing-planes" id="planes">
      <div className="landing-planes-contenedor">
        <h2 className="landing-planes-titulo">Escoge tu plan</h2>
        <p className="landing-planes-bajada">
          Todos los planes incluyen rutinas guiadas por un entrenador profesional.
        </p>

        <ul className="landing-planes-grid">
          {PLANES.map((plan) => (
            <li
              key={plan.nombre}
              className={`landing-plan${plan.destacado ? ' landing-plan-destacado' : ''}`}
            >
              {plan.destacado && (
                <span className="landing-plan-insignia">Recomendado</span>
              )}

              <div className="landing-plan-imagen" aria-hidden="true" />

              <div className="landing-plan-cuerpo">
                <h3 className="landing-plan-nombre">{plan.nombre}</h3>

                <p className="landing-plan-precio">
                  <span className="landing-plan-moneda">$</span>
                  {plan.precio}
                </p>
                <p className="landing-plan-periodo">por mes</p>

                <ul className="landing-plan-lista">
                  {plan.caracteristicas.map((caracteristica) => (
                    <li key={caracteristica} className="landing-plan-item">
                      <Icono name="check" size={20} className="landing-plan-item-icono" />
                      <span>{caracteristica}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
