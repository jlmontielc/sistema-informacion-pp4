import { useState, useEffect } from 'react';

/**
 * Devuelve `true` si la media query indicada coincide con el viewport actual.
 * Se mantiene sincronizada con los cambios de tamaño de ventana mediante un
 * listener sobre la MediaQueryList (equivalente a un listener de resize, pero
 * solo se re-renderiza cuando la query cruza su punto de corte).
 *
 * Ejemplo: const esMovil = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query) {
  const [coincide, setCoincide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const manejarCambio = (evento) => setCoincide(evento.matches);

    // Sincroniza por si la query cambió o el estado inicial quedó desfasado
    setCoincide(mediaQuery.matches);

    // Navegadores antiguos (Safari < 14) usan addListener/removeListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', manejarCambio);
      return () => mediaQuery.removeEventListener('change', manejarCambio);
    }
    mediaQuery.addListener(manejarCambio);
    return () => mediaQuery.removeListener(manejarCambio);
  }, [query]);

  return coincide;
}
