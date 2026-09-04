import { useMemo, useState } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { SerieRow } from './SerieRow';

export function EjercicioRegistroCard({
  ejercicio,
  series,
  onCrearSerie,
  onEditarSerie,
  onEliminarSerie,
}) {
  const [filasNuevas, setFilasNuevas] = useState(1);

  const metaPlanificada = useMemo(() => {
    const partes = [];
    if (ejercicio.series) partes.push(`${ejercicio.series} series`);
    if (ejercicio.repeticiones) partes.push(`${ejercicio.repeticiones} reps`);
    if (ejercicio.cargaKg) partes.push(`${ejercicio.cargaKg} kg`);
    if (ejercicio.descansoSegundos) partes.push(`${ejercicio.descansoSegundos}s descanso`);
    return partes.join(' · ');
  }, [ejercicio]);

  const volumenEjercicio = useMemo(() => {
    return series.reduce((acc, s) => acc + (s.pesoKg || 0) * (s.repeticionesRealizadas || 0), 0);
  }, [series]);

  const handleCrearSerie = (datos) => {
    onCrearSerie({
      ...datos,
      ejercicioId: ejercicio.ejercicioId,
      numeroSerie: series.length + 1,
    });
    setFilasNuevas(1);
  };

  const handleAgregarFila = () => {
    setFilasNuevas((prev) => prev + 1);
  };

  return (
    <div className="ejercicio-registro-card">
      <div className="ejercicio-registro-header">
        <div>
          <h4 className="ejercicio-registro-title">{ejercicio.nombre || 'Ejercicio'}</h4>
          <p className="ejercicio-registro-meta">{metaPlanificada}</p>
        </div>
        <div className="ejercicio-registro-resumen">
          <span className="ejercicio-registro-volumen">{volumenEjercicio.toFixed(1)} kg</span>
          <span className="ejercicio-registro-series">{series.length} series</span>
        </div>
      </div>

      <div className="serie-row serie-row-header">
        <div className="serie-numero">#</div>
        <div className="serie-field">KG</div>
        <div className="serie-field">Reps</div>
        <div className="serie-field">Desc</div>
        <div className="serie-field serie-field-rpe">RPE</div>
        <div className="serie-acciones" />
      </div>

      {series.length === 0 && (
        <p className="serie-empty">Aun no has registrado series para este ejercicio.</p>
      )}

      {series.map((serie, idx) => (
        <SerieRow
          key={serie.id}
          serie={serie}
          numeroSerie={serie.numeroSerie || idx + 1}
          onGuardar={(datos) => onEditarSerie(serie.id, datos)}
          onEliminar={() => onEliminarSerie(serie.id)}
        />
      ))}

      {Array.from({ length: filasNuevas }).map((_, idx) => (
        <SerieRow
          key={`nueva-${idx}`}
          esNueva
          numeroSerie={series.length + idx + 1}
          onGuardar={handleCrearSerie}
        />
      ))}

      <div className="ejercicio-registro-footer">
        <Button variant="secondary" size="sm" onClick={handleAgregarFila}>
          <Icon name="arrow" size={16} style={{ transform: 'rotate(90deg)' }} /> Añadir serie
        </Button>
      </div>
    </div>
  );
}
