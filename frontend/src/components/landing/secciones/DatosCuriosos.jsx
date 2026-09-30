import { Icono } from '../Icono';

const CURIOSIDADES = [
  {
    icono: 'dumbbell',
    titulo: 'Fuerza constante',
    texto:
      'La constancia vence al talento: 30 minutos diarios valen más que tres sesiones largas de vez en cuando.',
  },
  {
    icono: 'clock',
    titulo: 'El músculo crece durmiendo',
    texto:
      'El descanso también es entrenamiento: dormir entre 7 y 9 horas potencia la recuperación y los resultados.',
  },
  {
    icono: 'heart',
    titulo: 'Un corazón activo',
    texto:
      'El corazón es un músculo más: 150 minutos de actividad moderada a la semana reducen el riesgo cardiovascular.',
  },
];

export function DatosCuriosos() {
  return (
    <section className="landing-seccion landing-curiosidades">
      <div className="landing-curiosidades-contenedor">
        <h2 className="landing-curiosidades-titulo">Datos curiosos</h2>

        <div className="landing-curiosidades-panel">
          <ul className="landing-curiosidades-lista">
            {CURIOSIDADES.map(curiosidad => (
              <li key={curiosidad.titulo} className="landing-curiosidad">
                <span className="landing-curiosidad-icono" aria-hidden="true">
                  <Icono name={curiosidad.icono} size={50} />
                </span>
                <h3 className="landing-curiosidad-titulo">{curiosidad.titulo}</h3>
                <p className="landing-curiosidad-texto">{curiosidad.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}