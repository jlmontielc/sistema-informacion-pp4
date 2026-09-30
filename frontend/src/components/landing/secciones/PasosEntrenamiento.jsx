import { Icono } from '../Icono';

const METRICAS = [
  { numero: '100+', etiqueta: 'Horas de entrenamiento', icono: 'clock' },
  { numero: '500+', etiqueta: 'Metas alcanzadas', icono: 'target' },
  { numero: '98%', etiqueta: 'Satisfacción de los alumnos', icono: 'star' },
];

const PASOS = [
  'Crea tu cuenta y completa tu perfil médico',
  'Recibe tu rutina y dieta personalizados',
  'Entrena con seguimiento de tu entrenador',
];

export function PasosEntrenamiento() {
  return (
    <section className="landing-seccion landing-pasos">
      <div className="landing-pasos-bloque">
        <div className="landing-pasos-imagen" aria-hidden="true" />
        <div className="landing-pasos-texto">
          <h2 className="landing-pasos-titulo">Empieza tu entrenamiento ahora</h2>
          <p className="landing-pasos-bajada">
            Tu plan se arma en tres pasos: conocemos tu estado, definimos la rutina y te
            acompañamos mientras la ejecutas.
          </p>
        </div>
      </div>

      <ul className="landing-pasos-metricas">
        {METRICAS.map((metrica) => (
          <li key={metrica.etiqueta} className="landing-metrica">
            <Icono name={metrica.icono} size={34} className="landing-metrica-icono" />
            <span className="landing-metrica-numero">{metrica.numero}</span>
            <span className="landing-metrica-etiqueta">{metrica.etiqueta}</span>
          </li>
        ))}
      </ul>

      <div className="landing-pasos-proceso">
        <h3 className="landing-pasos-proceso-titulo">Comienza a entrenar</h3>
        <ol className="landing-pasos-proceso-lista">
          {PASOS.map((paso, indice) => (
            <li key={paso} className="landing-proceso-item">
              <span className="landing-proceso-numero" aria-hidden="true">
                {String(indice + 1).padStart(2, '0')}
              </span>
              <span className="landing-proceso-texto">{paso}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
