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
    <div style={{
      marginTop: 'var(--space-4)',
      borderTop: '1px solid var(--color-border-light)',
      paddingTop: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      {explicacion && (
        <div style={{
          padding: 'var(--space-3)',
          background: 'var(--color-neutral-50)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
        }}>
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
            <div className="rutina-resumen-stat-value" style={{ color: '#991b1b' }}>{totalEjerciciosBloqueados}</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
            Plantillas evaluadas ({plantillas.length}):
          </span>
          {plantillas.map((p, i) => (
            <div key={p.plantilla_id || i} style={{
              padding: 'var(--space-3)',
              background: i === 0 ? '#f0f9ff' : 'var(--color-neutral-50)',
              border: i === 0 ? '1px solid #bae6fd' : '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: 'var(--font-medium)' }}>
                  {i + 1}. {p.nombre}
                </p>
                <span style={{
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-full)',
                  background: i === 0 ? '#dcfce7' : '#f3f4f6',
                  color: i === 0 ? '#166534' : '#6b7280',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                }}>
                  {Math.round(p.score * 100)}%
                </span>
              </div>
              <div style={{
                marginTop: 'var(--space-1)',
                display: 'flex',
                gap: 'var(--space-2)',
                flexWrap: 'wrap',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
              }}>
                {p.tipo && <span>{TIPO_LABELS[p.tipo] || p.tipo}</span>}
                {p.nivel_dificultad && <span>· {NIVEL_LABELS[p.nivel_dificultad] || p.nivel_dificultad}</span>}
                {(p.dias_semana || p.frecuencia_semanal) && <span>· {p.dias_semana || p.frecuencia_semanal} días/semana</span>}
                {p.objetivo && <span>· {OBJETIVO_LABELS[p.objetivo] || p.objetivo}</span>}
              </div>
              {p.explicacion && (
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {p.explicacion}
                </p>
              )}
              {p.ejercicios_bloqueados_count > 0 && (
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-xs)', color: '#991b1b' }}>
                  {p.ejercicios_bloqueados_count} ejercicio(s) bloqueado(s) por restricciones médicas
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{
        borderTop: '1px solid var(--color-border-light)',
        paddingTop: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}>
        <div className="field">
          <label className="field-label">Observaciones (opcional)</label>
          <textarea
            className="field-input"
            rows={2}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Notas sobre la decision..."
            style={{ resize: 'vertical' }}
            disabled={procesando}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
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
          {decision && (
            <Button
              size="sm"
              variant={decision === 'aprobada' ? 'success' : 'danger'}
              onClick={handleConfirmar}
              loading={procesando}
              style={{ marginLeft: 'auto' }}
            >
              Confirmar {decision === 'aprobada' ? 'Aprobacion' : 'Rechazo'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
