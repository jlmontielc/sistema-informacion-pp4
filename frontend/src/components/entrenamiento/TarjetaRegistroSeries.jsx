import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { formatearPeso } from '../../utils/fechasRutina';

const MAXIMO_SERIES = 20;
const CIRCUNFERENCIA_ANILLO = 2 * Math.PI * 13;

/**
 * Título de la columna de carga. La rutina solo guarda `cargaKg`, así que solo
 * se especializa si el ejercicio llega con `equipoNecesario` o `target`.
 */
function tituloColumnaPeso(ejercicio) {
  const texto = `${ejercicio?.equipoNecesario || ''} ${ejercicio?.target || ''}`.toLowerCase();
  if (!texto.trim()) return 'PESO (KG)';
  if (/(mancuerna|mancuernas|dumbbell)/.test(texto)) return 'PESO / MANC. (KG)';
  if (/(lastre|peso corporal|bodyweight|calistenia)/.test(texto)) return 'LASTRE / PESO (KG)';
  if (/(maquina|máquina|aparejo|polea)/.test(texto)) return 'CARGA (KG)';
  return 'PESO (KG)';
}

function formatearAnterior(anterior) {
  if (!anterior) return null;
  const peso =
    anterior.pesoKg === null || anterior.pesoKg === undefined
      ? '—'
      : `${formatearPeso(anterior.pesoKg).replace(' kg', '')} kg`;
  const reps =
    anterior.repeticiones === null || anterior.repeticiones === undefined
      ? '—'
      : anterior.repeticiones;
  return `${peso} × ${reps}`;
}

/**
 * Tarjeta clara con la tabla de series del ejercicio: cada fila es una serie ya
 * registrada (marcada) o una fila planificada por la rutina (sin marcar). El
 * checkbox es el único control de "hecho": marcarlo crea la serie en el backend
 * y desmarcarla la elimina.
 */
export function TarjetaRegistroSeries({
  indice,
  ejercicio,
  filas,
  anterioresPorEjercicio,
  descanso,
  onCambiarCampo,
  onAlternarLista,
  onAgregarFila,
  onIniciarDescanso,
  onCancelarDescanso,
}) {
  const numeros = Object.keys(filas)
    .map(Number)
    .sort((a, b) => a - b);
  const descansoPlaneado = Number(ejercicio?.descansoSegundos) || 0;
  const descansoActivo = descanso?.activo && descanso.ejercicioId === ejercicio.ejercicioId;
  const restante = descansoActivo ? descanso.restante : 0;
  const total = descansoPlaneado;
  const avance = total > 0 ? Math.max(0, Math.min(1, restante / total)) : 0;
  const alcanzado = Boolean(descansoActivo && descanso.terminado);
  const seriesCompletadas = numeros.filter((numero) => filas[numero].lista).length;

  return (
    <article className="mi-rutina-ejercicio mi-rutina-ejercicio-tabla">
      <div className="mi-rutina-ejercicio-cabecera">
        <div>
          <span className="mi-rutina-ejercicio-etiqueta">{`Ejercicio ${indice}`}</span>
          <h3 className="mi-rutina-ejercicio-nombre">{ejercicio?.nombre || 'Ejercicio'}</h3>
        </div>
        <span className="mi-rutina-resumen">
          {seriesCompletadas}/{numeros.length || ejercicio?.series || 0} series
        </span>
      </div>

      <div className="mi-rutina-tabla-envoltura">
        <table className="mi-rutina-tabla">
          <caption className="mi-rutina-oculto">
            {`Series de ${ejercicio?.nombre || 'el ejercicio'}`}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="mi-rutina-col-serie">SERIE</th>
              <th scope="col" className="mi-rutina-anterior-columna hide-mobile">ANTERIOR</th>
              <th scope="col" className="mi-rutina-centro">{tituloColumnaPeso(ejercicio)}</th>
              <th scope="col" className="mi-rutina-centro">REPS</th>
              <th scope="col" className="mi-rutina-centro">RPE</th>
              <th scope="col" className="mi-rutina-centro mi-rutina-col-listo">LISTO</th>
            </tr>
          </thead>
          <tbody>
            {numeros.map((numeroSerie) => {
              const fila = filas[numeroSerie];
              const anterior = formatearAnterior(
                anterioresPorEjercicio?.[fila.ejercicioId]?.[numeroSerie]
              );
              return (
                <tr key={`${fila.ejercicioId}-${numeroSerie}`} className={fila.lista ? 'mi-rutina-fila-lista' : ''}>
                  <td className="mi-rutina-tabla-serie">{numeroSerie}</td>
                  <td className="mi-rutina-anterior hide-mobile">
                    {anterior || <span className="mi-rutina-sin-dato">—</span>}
                  </td>
                  <td className="mi-rutina-centro">
                    <input
                      className="mi-rutina-campo"
                      type="number"
                      min="0"
                      step="0.5"
                      inputMode="decimal"
                      value={fila.pesoKg}
                      placeholder="kg"
                      aria-label={`Peso en kilos de la serie ${numeroSerie}`}
                      onChange={(evento) =>
                        onCambiarCampo(ejercicio.ejercicioId, numeroSerie, 'pesoKg', evento.target.value)
                      }
                    />
                  </td>
                  <td className="mi-rutina-centro">
                    <input
                      className="mi-rutina-campo mi-rutina-campo-reps"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={fila.reps}
                      placeholder="reps"
                      aria-label={`Repeticiones de la serie ${numeroSerie}`}
                      onChange={(evento) =>
                        onCambiarCampo(ejercicio.ejercicioId, numeroSerie, 'reps', evento.target.value)
                      }
                    />
                  </td>
                  <td className="mi-rutina-centro">
                    <input
                      className="mi-rutina-campo mi-rutina-campo-rpe"
                      type="number"
                      min="1"
                      max="10"
                      step="1"
                      inputMode="numeric"
                      value={fila.rpe}
                      placeholder="—"
                      aria-label={`Esfuerzo percibido de la serie ${numeroSerie}`}
                      onChange={(evento) =>
                        onCambiarCampo(ejercicio.ejercicioId, numeroSerie, 'rpe', evento.target.value)
                      }
                    />
                  </td>
                  <td className="mi-rutina-centro">
                    <input
                      className="mi-rutina-check"
                      type="checkbox"
                      checked={fila.lista}
                      aria-label={`Marcar la serie ${numeroSerie} como hecha`}
                      onChange={() =>
                        onAlternarLista(ejercicio.ejercicioId, numeroSerie, !fila.lista)
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {numeros.length === 0 && (
          <p className="mi-rutina-sin-filas">Agrega la primera serie para empezar.</p>
        )}
      </div>

      <div className="mi-rutina-ejercicio-pie">
        <Button
          variant="ghost"
          size="sm"
          className="mi-rutina-enlace"
          onClick={onAgregarFila}
          disabled={numeros.length >= MAXIMO_SERIES}
        >
          <Icon name="arrow" size={14} className="mi-rutina-mas" /> Añadir serie
        </Button>

        {descansoActivo ? (
          <span className="mi-rutina-temporizador">
            <svg className="mi-rutina-anillo" viewBox="0 0 32 32" aria-hidden="true">
              <circle
                cx="16"
                cy="16"
                r="13"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="3"
              />
              <circle
                className="mi-rutina-anillo-circono"
                cx="16"
                cy="16"
                r="13"
                fill="none"
                stroke={alcanzado ? 'var(--color-error)' : 'var(--rutina-marca)'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={CIRCUNFERENCIA_ANILLO}
                strokeDashoffset={CIRCUNFERENCIA_ANILLO * (1 - avance)}
              />
            </svg>
            <span
              className={`mi-rutina-temporizador-texto${alcanzado ? ' mi-rutina-temporizador-listo' : ''}`}
            >
              {alcanzado ? 'Descanso listo' : `${restante}s`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="mi-rutina-enlace"
              onClick={onCancelarDescanso}
            >
              Cancelar
            </Button>
          </span>
        ) : (
          descansoPlaneado > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mi-rutina-enlace"
              onClick={onIniciarDescanso}
            >
              <Icon name="clock" size={14} />
              {` Iniciar ${descansoPlaneado}s descanso`}
            </Button>
          )
        )}
      </div>

      {alcanzado && (
        <p className="mi-rutina-aviso" role="status">
          Descanso terminado. Marca la siguiente serie.
        </p>
      )}
    </article>
  );
}
