import { useState } from 'react';
import { Button } from '../common/Button';

const TIPO_LABELS = {
  fuerza: 'Fuerza', hipertrofia: 'Hipertrofia', resistencia: 'Resistencia',
  cardio: 'Cardio', funcional: 'Funcional', flexibilidad: 'Flexibilidad',
};

const NIVEL_LABELS = {
  principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado',
};

const OBJETIVO_LABELS = {
  perdida_peso: 'Pérdida de peso', ganancia_muscular: 'Ganancia muscular',
  mantenimiento: 'Mantenimiento', rendimiento: 'Rendimiento',
  rehabilitacion: 'Rehabilitación',
};

export function RecomendacionDetalle({ rutina, onAprobar, onRechazar, procesando }) {
  const [decision, setDecision] = useState(null);
  const [comentario, setComentario] = useState('');

  if (!rutina) return null;

  const ejerciciosRaw = rutina.ejercicios || {};

  const explicacion = ejerciciosRaw.explicacion || null;

  const plantillas = ejerciciosRaw.plantillas_recomendadas
    || (Array.isArray(ejerciciosRaw) ? ejerciciosRaw : []);

  const totalEjerciciosSeguros = plantillas.reduce(
    (sum, p) => sum + (p.ejercicios_seguros || 0), 0,
  );
  const totalEjerciciosBloqueados = plantillas.reduce(
    (sum, p) => sum + (p.ejercicios_bloqueados_count || 0), 0,
  );

  const handleDecision = (acc) => {
    setDecision(acc);
  };

  const handleConfirmar = () => {
    if (decision === 'aprobada') {
      onAprobar?.(rutina.id, { observaciones: comentario || undefined });
    } else if (decision === 'rechazada') {
      onRechazar?.(rutina.id, { observaciones: comentario || undefined });
    }
  };

  return (
    <div className="seccion-dividida stack">
      {explicacion && (
        <div className="nota-informativa">
          <strong>Explicacion IA:</strong> {explicacion}
        </div>
      )}

      <div className="rutina-resumen-stats">
        <div className="rutina-resumen-stat">
          <div className="rutina-resumen-stat-value">{plantillas.length}</div>
          <div className="rutina-resumen-stat-label">plantillas</div>
        </div>
        <div className="rutina-resumen-stat">
          <div className="rutina-resumen-stat-value">{totalEjerciciosSeguros}</div>
          <div className="rutina-resumen-stat-label">ej. seguros</div>
        </div>
        {totalEjerciciosBloqueados > 0 && (
          <div className="rutina-resumen-stat">
            <div className="rutina-resumen-stat-value rutina-resumen-stat-value-error">{totalEjerciciosBloqueados}</div>
            <div className="rutina-resumen-stat-label">ej. bloqueados</div>
          </div>
        )}
        {rutina.frecuenciaSemanal && (
          <div className="rutina-resumen-stat">
            <div className="rutina-resumen-stat-value">{rutina.frecuenciaSemanal}</div>
            <div className="rutina-resumen-stat-label">x/semana</div>
          </div>
        )}
      </div>

      {plantillas.length > 0 && (
        <div className="stack stack-sm">
          <span className="text-sm text-medium">
            Plantillas evaluadas ({plantillas.length}):
          </span>
          {plantillas.map((p, i) => (
            <div key={p.plantilla_id || i} className={`ia-plantilla-panel ${i === 0 ? 'ia-plantilla-panel-activa' : ''}`}>
              <div className="row-between">
                <p className="text-medium">
                  {i + 1}. {p.nombre}
                </p>
                <span className={`badge ${i === 0 ? 'badge-success' : 'badge-neutral'}`}>
                  {Math.round(p.score * 100)}%
                </span>
              </div>
              <div className="tabla-subtexto row row-gap-sm">
                {p.tipo && <span>{TIPO_LABELS[p.tipo] || p.tipo}</span>}
                {p.nivel_dificultad && <span>· {NIVEL_LABELS[p.nivel_dificultad] || p.nivel_dificultad}</span>}
                {(p.dias_semana || p.frecuencia_semanal) && <span>· {p.dias_semana || p.frecuencia_semanal} días/semana</span>}
                {p.objetivo && <span>· {OBJETIVO_LABELS[p.objetivo] || p.objetivo}</span>}
              </div>
              {p.explicacion && (
                <p className="tabla-subtexto">
                  {p.explicacion}
                </p>
              )}
              {p.ejercicios_bloqueados_count > 0 && (
                <p className="tabla-subtexto text-error">
                  {p.ejercicios_bloqueados_count} ejercicio(s) bloqueado(s) por restricciones médicas
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="seccion-dividida stack">
        <div className="field">
          <label className="field-label">Observaciones (opcional)</label>
          <textarea
            className="field-input field-textarea"
            rows={2}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Notas sobre la decision..."
            disabled={procesando}
          />
        </div>

        <div className="row-between">
          <div className="row">
            <button
              className={`btn btn-sm ${decision === 'aprobada' ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => handleDecision('aprobada')}
              disabled={procesando}
            >
              Aprobar
            </button>
            <button
              className={`btn btn-sm ${decision === 'rechazada' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => handleDecision('rechazada')}
              disabled={procesando}
            >
              Rechazar
            </button>
          </div>
          {decision && (
            <Button
              size="sm"
              variant={decision === 'aprobada' ? 'success' : 'danger'}
              onClick={handleConfirmar}
              loading={procesando}
            >
              Confirmar {decision === 'aprobada' ? 'Aprobacion' : 'Rechazo'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
