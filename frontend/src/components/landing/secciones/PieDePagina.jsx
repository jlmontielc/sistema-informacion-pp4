import { Icono } from '../Icono';

const ENLACES = [
  { texto: 'Inicio', destino: '#inicio' },
  { texto: 'Planes', destino: '#planes' },
  { texto: 'Preguntas frecuentes', destino: '#faq' },
  { texto: 'Contacto', destino: '#contacto' },
];

const REDES = [
  { nombre: 'twitter', etiqueta: 'Twitter' },
  { nombre: 'instagram', etiqueta: 'Instagram' },
  { nombre: 'facebook', etiqueta: 'Facebook' },
];

export function PieDePagina() {
  return (
    <footer className="landing-seccion landing-pie" id="contacto">
      <div className="landing-pie-contenedor">
        <div className="landing-pie-cuerpo">
          <div className="landing-pie-presentacion">
            <h2 className="landing-pie-titulo">Empieza ahora</h2>
            <p className="landing-pie-bajada">
              Síguenos en redes para ver rutinas, consejos de entrenamiento y los avances de
              la comunidad YanTraining.
            </p>
          </div>

          <nav className="landing-pie-navegacion" aria-label="Navegación del pie de página">
            <h3 className="landing-pie-subtitulo">Navegación</h3>
            <ul className="landing-pie-lista">
              {ENLACES.map((enlace) => (
                <li key={enlace.texto}>
                  <a href={enlace.destino} className="landing-pie-enlace">
                    <span>{enlace.texto}</span>
                    <Icono name="arrow-right" size={18} className="landing-pie-enlace-flecha" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="landing-pie-inferior">
          <div className="landing-pie-marca">
            <Icono name="dumbbell" size={22} className="landing-pie-marca-icono" />
            <span>YanTraining</span>
          </div>

          <ul className="landing-pie-redes">
            {REDES.map((red) => (
              <li key={red.nombre}>
                <span className="landing-pie-red">
                  <Icono name={red.nombre} size={18} />
                  <span className="landing-solo-lector">{red.etiqueta}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="landing-pie-legal">2024 YanTraining. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
