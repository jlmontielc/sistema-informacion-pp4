import { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { rutinasAsignadasApi, registroEntrenamientoApi } from '../../services/rutinasApi';
import { obtenerNombreDia, obtenerAbbrDia, obtenerDiaActual } from './DiaSelector';
import { EjercicioCard } from './EjercicioCard';

const DIAS_NUM = [1, 2, 3, 4, 5, 6, 7];

export function InstruidoRutinasView() {
  const [tab, setTab] = useState('hoy');
  const [rutina, setRutina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diaActual, setDiaActual] = useState(obtenerDiaActual());
  const [registrando, setRegistrando] = useState(false);
  const [resumen, setResumen] = useState(null);

  const cargarRutina = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rutinasAsignadasApi.listar();
      const rutinas = res.data?.rutinas || res.data || [];
      const activa = rutinas.find((r) => r.activa);
      setRutina(activa || null);
      if (activa) {
        try {
          const resR = await rutinasAsignadasApi.obtenerResumen(activa.id);
          setResumen(resR.data);
        } catch {
          setResumen(null);
        }
      }
    } catch {
      setRutina(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarRutina(); }, [cargarRutina]);

  const ejerciciosDelDia = (rutina?.ejercicios || []).filter((e) => e.dia === diaActual);

  const handleRegistrarEntrenamiento = async () => {
    if (!rutina || ejerciciosDelDia.length === 0) return;
    setRegistrando(true);
    try {
      await registroEntrenamientoApi.crear({
        rutina_asignada_id: rutina.id,
        fecha: new Date().toISOString().split('T')[0],
        ejercicios_realizados: ejerciciosDelDia.map((ej) => ({
          ejercicio_id: ej.ejercicio_id,
          series_completadas: ej.series,
          repeticiones_completadas: ej.repeticiones,
          carga_kg: ej.carga_kg,
        })),
        duracion_minutos: Math.round(ejerciciosDelDia.length * 8),
        percepcion_esfuerzo: 7,
        observaciones: `Entrenamiento del ${obtenerNombreDia(diaActual)}`,
      });
      alert('Entrenamiento registrado correctamente');
    } catch {
      alert('Error al registrar el entrenamiento');
    } finally {
      setRegistrando(false);
    }
  };

  if (loading) return <Loading text="Cargando tu rutina..." />;

  if (!rutina) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div>
          <h2>Mi Rutina</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Tu plan de entrenamiento personalizado
          </p>
        </div>
        <Card>
          <EmptyState
            icon="🏋️"
            title="Sin rutina activa"
            description="Tu entrenador aun no te ha asignado una rutina de entrenamiento. Pronto tendras tu plan personalizado."
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2>Mi Rutina</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {rutina.nombre} · {rutina.frecuenciaSemanal}x/semana
        </p>
      </div>

      <div className="tabs-container">
        <button
          type="button"
          className={`tab-button ${tab === 'hoy' ? 'active' : ''}`}
          onClick={() => setTab('hoy')}
        >
          Rutina del Dia
        </button>
        <button
          type="button"
          className={`tab-button ${tab === 'semana' ? 'active' : ''}`}
          onClick={() => setTab('semana')}
        >
          Vista Semanal
        </button>
      </div>

      {tab === 'hoy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card>
            <div style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
                    {obtenerNombreDia(diaActual)}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                    {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`rutina-tipo-badge ${rutina.tipo}`}>
                  {rutina.tipo}
                </span>
              </div>

              {ejerciciosDelDia.length === 0 ? (
                <div style={{
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                }}>
                  <p style={{ fontSize: 48, margin: 0 }}>😴</p>
                  <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', marginTop: 'var(--space-3)' }}>
                    Dia de descanso
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)' }}>
                    No hay ejercicios programados para hoy
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {ejerciciosDelDia
                      .sort((a, b) => a.orden - b.orden)
                      .map((ej, idx) => (
                        <EjercicioCard
                          key={`${ej.ejercicio_id}-${idx}`}
                          ejercicio={ej}
                          nombreEjercicio={ej.nombre}
                          showActions={false}
                        />
                      ))}
                  </div>
                  <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
                    <Button
                      onClick={handleRegistrarEntrenamiento}
                      loading={registrando}
                      size="lg"
                    >
                      Registrar Entrenamiento
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === 'semana' && (
        <div className="semana-grid">
          {DIAS_NUM.map((num) => {
            const ejerciciosDelDiaSemana = (rutina.ejercicios || []).filter((e) => e.dia === num);
            const esHoy = num === diaActual;
            return (
              <div key={num} className={`semana-dia ${esHoy ? 'hoy' : ''}`}>
                <div className="semana-dia-header">
                  {obtenerAbbrDia(num)}
                  {esHoy && ' (Hoy)'}
                </div>
                <div className="semana-dia-body">
                  {ejerciciosDelDiaSemana.length === 0 ? (
                    <div className="semana-dia-descanso">Descanso</div>
                  ) : (
                    ejerciciosDelDiaSemana
                      .sort((a, b) => a.orden - b.orden)
                      .map((ej, idx) => (
                        <div key={idx} className="semana-ejercicio-item">
                          <strong>{ej.nombre || `Ej ${idx + 1}`}</strong>
                          {ej.series}×{ej.repeticiones}
                          {ej.carga_kg > 0 ? ` · ${ej.carga_kg}kg` : ''}
                        </div>
                      ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
