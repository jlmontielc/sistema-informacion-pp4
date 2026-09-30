import { useState } from 'react';
import { Icono } from '../Icono';

const DIAPOSITIVAS = [
  {
    titulo: 'Rutina de fuerza',
    resumen: 'Peso muerto, remo y press para un torso completo',
    fondo: 'linear-gradient(135deg, #491f98 0%, #33105d 55%, #1d1b20 100%)',
  },
  {
    titulo: 'Cardio de alta intensidad',
    resumen: 'Intervalos cortos que aceleran el metabolismo',
    fondo: 'linear-gradient(135deg, #1d1b20 0%, #33105d 60%, #491f98 100%)',
  },
  {
    titulo: 'Movilidad y calentamiento',
    resumen: 'Prepara articulaciones y reduce el riesgo de lesiones',
    fondo: 'linear-gradient(135deg, #33105d 0%, #1d1b20 50%, #000000 100%)',
  },
  {
    titulo: 'Entrenamiento funcional',
    resumen: 'Movimientos reales que se traducen a tu día a día',
    fondo: 'linear-gradient(135deg, #33105d 0%, #491f98 55%, #1d1b20 100%)',
  },
  {
    titulo: 'Recuperación activa',
    resumen: 'Vuelta a la calma, estiramientos y respiración',
    fondo: 'linear-gradient(135deg, #000000 0%, #1d1b20 50%, #33105d 100%)',
  },
  {
    titulo: 'Trabajo de core',
    resumen: 'Estabilidad, equilibrio y control del centro',
    fondo: 'linear-gradient(135deg, #491f98 0%, #1d1b20 55%, #33105d 100%)',
  },
];

export function Galeria() {
  const [indice, setIndice] = useState(0);
  const total = DIAPOSITIVAS.length;

  const anterior = () => setIndice(actual => (actual - 1 + total) % total);
  const siguiente = () => setIndice(actual => (actual + 1) % total);

  const actual = DIAPOSITIVAS[indice];

  return (
    <section className="landing-seccion landing-galeria">
      <div className="landing-galeria-contenedor">
        <div
          className="landing-galeria-media"
          style={{ background: actual.fondo }}
          role="group"
          aria-roledescription="galeria"
          aria-label="Galería de entrenamiento"
        >
          <span className="landing-galeria-etiqueta">Galería</span>

          <div className="landing-galeria-texto">
            <h3>{actual.titulo}</h3>
            <p>{actual.resumen}</p>
          </div>

          <button
            type="button"
            className="landing-galeria-flecha landing-galeria-flecha-anterior"
            onClick={anterior}
            aria-label="Diapositiva anterior"
          >
            <Icono name="chevron-left" size={26} />
          </button>

          <button
            type="button"
            className="landing-galeria-flecha landing-galeria-flecha-siguiente"
            onClick={siguiente}
            aria-label="Diapositiva siguiente"
          >
            <Icono name="chevron-right" size={26} />
          </button>
        </div>
      </div>
    </section>
  );
}