import { useEffect, useState } from 'react';
import { formatearTiempo, tituloTipoRutina } from '../../utils/fechasRutina';

/** Segundos transcurridos desde `fechaInicio`, actualizado cada segundo. */
function useRelojSesion(fechaInicio) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (!fechaInicio) {
      setSegundos(0);
      return undefined;
    }
    const inicio = new Date(fechaInicio).getTime();
    if (Number.isNaN(inicio)) return undefined;

    const calcular = () => setSegundos(Math.max(0, Math.floor((Date.now() - inicio) / 1000)));
    calcular();
    const intervalo = window.setInterval(calcular, 1000);
    return () => window.clearInterval(intervalo);
  }, [fechaInicio]);

  return segundos;
}

/**
 * Cabecera de "Mi Rutina": titulo de la pagina, nombre y tipo de la rutina y el
 * indicador de estado del mockup (semana del plan + reloj de la sesion abierta).
 * Sin sesion en curso se muestra el rango de fechas del plan en lugar del reloj.
 */
export function MiRutinaCabecera({ rutina, semana, sesionAbierta }) {
  const segundos = useRelojSesion(sesionAbierta?.fechaInicio);
  const subtitulo = [rutina?.nombre, tituloTipoRutina(rutina?.tipo)].filter(Boolean).join(' • ');

  return (
    <header className="mi-rutina-cabecera">
      <div className="mi-rutina-cabecera-titulos">
        <h1 className="mi-rutina-cabecera-titulo">Mi Rutina</h1>
        {subtitulo && <p className="mi-rutina-cabecera-subtitulo">{subtitulo}</p>}
      </div>

      <p className="mi-rutina-cabecera-estado">
        {sesionAbierta?.fechaInicio && (
          <>
            <span className="mi-rutina-cabecera-pulso" aria-hidden="true" />
            <span className="mi-rutina-oculto">Sesión en curso</span>
          </>
        )}
        {semana?.etiqueta && <span>{semana.etiqueta}</span>}
        {sesionAbierta?.fechaInicio ? (
          <>
            <span className="mi-rutina-cabecera-separador" aria-hidden="true">
              |
            </span>
            <span>
              Tiempo:{' '}
              <span className="mi-rutina-cabecera-reloj" role="timer">
                {formatearTiempo(segundos)}
              </span>
            </span>
          </>
        ) : (
          semana?.rango && <span className="mi-rutina-cabecera-rango">{semana.rango}</span>
        )}
      </p>
    </header>
  );
}
