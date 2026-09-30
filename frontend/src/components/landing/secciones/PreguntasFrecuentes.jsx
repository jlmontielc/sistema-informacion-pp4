import { useState } from 'react';
import { Icono } from '../Icono';

const PREGUNTAS = [
  {
    pregunta: '¿Cómo funcionan los planes de entrenamiento?',
    respuesta:
      'Cada plan se adapta a tu nivel, objetivo y disponibilidad semanal. Armamos la rutina con un entrenador y la ajustamos según tu progreso.',
  },
  {
    pregunta: '¿Cómo se mide mi progreso?',
    respuesta:
      'Registrás cada entrenamiento en la plataforma y tu entrenador analiza tus marcas semana a semana para garantizar mejoras reales.',
  },
  {
    pregunta: '¿Puedo cancelar cuando quiera?',
    respuesta:
      'Sí, podés cancelar en cualquier momento desde tu perfil. No hay permanencia mínima ni costos de cancelación.',
  },
];

export function PreguntasFrecuentes() {
  const [abierta, setAbierta] = useState(0);

  const alternar = (indice) => {
    setAbierta((actual) => (actual === indice ? null : indice));
  };

  return (
    <section className="landing-seccion landing-preguntas" id="faq">
      <div className="landing-preguntas-contenedor">
        <h2 className="landing-preguntas-titulo">Preguntas frecuentes</h2>

        <ul className="landing-preguntas-acordeon">
          {PREGUNTAS.map((item, indice) => {
            const estaAbierta = abierta === indice;

            return (
              <li key={item.pregunta} className="landing-pregunta">
                <h3 className="landing-pregunta-encabezado">
                  <button
                    type="button"
                    className="landing-pregunta-boton"
                    onClick={() => alternar(indice)}
                    aria-expanded={estaAbierta}
                    aria-controls={`landing-respuesta-${indice}`}
                  >
                    <span>{item.pregunta}</span>
                    <Icono
                      name="chevron-down"
                      size={24}
                      className={`landing-pregunta-flecha${
                        estaAbierta ? ' landing-pregunta-flecha-activa' : ''
                      }`}
                    />
                  </button>
                </h3>

                <div
                  id={`landing-respuesta-${indice}`}
                  className="landing-pregunta-respuesta"
                  hidden={!estaAbierta}
                >
                  <p>{item.respuesta}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
