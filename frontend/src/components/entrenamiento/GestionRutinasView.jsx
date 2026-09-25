import { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { plantillasApi, rutinasAsignadasApi } from '../../services/rutinasApi';
import { PlantillaForm } from './PlantillaForm';
import { AsignarRutinaModal } from './AsignarRutinaModal';
import { RecomendacionesIAView } from './RecomendacionesIAView';
import { DiaSelector, obtenerNombreDia } from './DiaSelector';
import { EjercicioCard } from './EjercicioCard';
import { useAuth } from '../../context/AuthContext';

const TIPO_LABELS = {
  fuerza: 'Fuerza', hipertrofia: 'Hipertrofia', resistencia: 'Resistencia',
  cardio: 'Cardio', funcional: 'Funcional', flexibilidad: 'Flexibilidad',
};

export function GestionRutinasView() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'administrador';

  const [tab, setTab] = useState('plantillas');
  const [plantillas, setPlantillas] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [plantillaEdit, setPlantillaEdit] = useState(null);
  const [asignarOpen, setAsignarOpen] = useState(false);
  const [plantillaAsignar, setPlantillaAsignar] = useState(null);
  const [verRutina, setVerRutina] = useState(null);
  const [diaVer, setDiaVer] = useState(null);
  const [recomendacionesCount, setRecomendacionesCount] = useState(0);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resP, resR, resIA] = await Promise.all([
        plantillasApi.listar(),
        rutinasAsignadasApi.listar(),
        rutinasAsignadasApi.listar({ ia: 'true' }),
      ]);
      setPlantillas(resP.data?.plantillas || resP.data || []);
      setRutinas(resR.data?.rutinas || resR.data || []);
      const iaData = resIA.data?.rutinas || resIA.data || [];
      setRecomendacionesCount(Array.isArray(iaData) ? iaData.length : 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleEliminarPlantilla = async (id) => {
    if (!window.confirm('Eliminar esta plantilla?')) return;
    try {
      await plantillasApi.eliminar(id);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la plantilla');
    }
  };

  const handleEliminarRutina = async (id) => {
    if (!window.confirm('Eliminar esta rutina asignada? Esta accion no se puede deshacer.')) return;
    try {
      await rutinasAsignadasApi.eliminar(id);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la rutina');
    }
  };

  const handleAbrirAsignar = (plantilla = null) => {
    setPlantillaAsignar(plantilla);
    setAsignarOpen(true);
  };

  if (loading) return <Loading text="Cargando rutinas..." />;

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-header-text">
            <h2 className="page-title">{isAdmin ? 'Gestion de Rutinas' : 'Mis Rutinas'}</h2>
          </div>
        </div>
        <Card>
          <div className="empty-state">
            <p className="empty-state-icono" aria-hidden="true">⚠️</p>
            <p className="text-lg text-error text-medium">{error}</p>
            <Button onClick={cargarDatos}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-text">
          <h2 className="page-title">{isAdmin ? 'Gestion de Rutinas' : 'Mis Rutinas'}</h2>
          <p className="page-subtitle">
            {isAdmin
              ? 'Administra plantillas y rutinas asignadas a todos los clientes'
              : 'Crea plantillas y asigna rutinas a tus clientes'}
          </p>
        </div>
        <div className="page-actions">
          <Button onClick={() => { setPlantillaEdit(null); setFormOpen(true); }}>
            + Crear Plantilla
          </Button>
        </div>
      </div>

      <div className="tabs-container">
        <button
          type="button"
          className={`tab-button ${tab === 'plantillas' ? 'active' : ''}`}
          onClick={() => setTab('plantillas')}
        >
          Plantillas ({plantillas.length})
        </button>
        <button
          type="button"
          className={`tab-button ${tab === 'asignadas' ? 'active' : ''}`}
          onClick={() => setTab('asignadas')}
        >
          Asignadas ({rutinas.length})
        </button>
        <button
          type="button"
          className={`tab-button ${tab === 'recomendadas' ? 'active' : ''}`}
          onClick={() => setTab('recomendadas')}
        >
          Recomendadas IA ({recomendacionesCount})
        </button>
      </div>

      {tab === 'plantillas' && (
        <>
          {plantillas.length === 0 ? (
            <Card>
              <EmptyState
                icon="📋"
                title="Sin plantillas"
                description="Crea tu primera plantilla de entrenamiento para comenzar a asignar rutinas."
                action={<Button onClick={() => { setPlantillaEdit(null); setFormOpen(true); }}>Crear Plantilla</Button>}
              />
            </Card>
          ) : (
            <div className="rutinas-grid">
              {plantillas.map((p) => (
                <Card key={p.id}>
                  <div className="card-body stack">
                    <div className="row-between">
                      <h3 className="card-titulo card-titulo-md">{p.nombre}</h3>
                      <span className={`rutina-tipo-badge ${p.tipo}`}>
                        {TIPO_LABELS[p.tipo] || p.tipo}
                      </span>
                    </div>
                    {p.descripcion && (
                      <p className="text-sm text-muted">
                        {p.descripcion}
                      </p>
                    )}
                    <div className="rutina-resumen-stats">
                      <div className="rutina-resumen-stat">
                        <div className="rutina-resumen-stat-value">{p.frecuenciaSemanal || '?'}</div>
                        <div className="rutina-resumen-stat-label">x/semana</div>
                      </div>
                      <div className="rutina-resumen-stat">
                        <div className="rutina-resumen-stat-value">{p.duracionSemanas || '?'}</div>
                        <div className="rutina-resumen-stat-label">semanas</div>
                      </div>
                      <div className="rutina-resumen-stat">
                        <div className="rutina-resumen-stat-value">
                          {(p.ejercicios || []).length}
                        </div>
                        <div className="rutina-resumen-stat-label">ejercicios</div>
                      </div>
                    </div>
                    <div>
                      <DiaSelector
                        seleccionados={p.diasSemana ? Object.keys(p.diasSemana).map(Number) : []}
                        modo="vista"
                      />
                    </div>
                    <div className="rutina-acciones">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setPlantillaEdit(p); setFormOpen(true); }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleAbrirAsignar(p)}
                      >
                        Asignar
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-ghost-peligroso"
                        onClick={() => handleEliminarPlantilla(p.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'asignadas' && (
        <>
          {rutinas.length === 0 ? (
            <Card>
              <EmptyState
                icon="🏋️"
                title="Sin rutinas asignadas"
                description="Selecciona una plantilla y asignala a un cliente para que comience a entrenar."
                action={
                  plantillas.length > 0
                    ? <Button onClick={() => handleAbrirAsignar(plantillas[0])}>Asignar Rutina</Button>
                    : <Button onClick={() => { setPlantillaEdit(null); setFormOpen(true); }}>Crear Plantilla</Button>
                }
              />
            </Card>
          ) : (
            <div className="rutinas-grid">
              {rutinas.map((r) => (
                <Card key={r.id}>
                  <div className="card-body stack">
                    <div className="row-between">
                      <h3 className="card-titulo card-titulo-md">{r.nombre}</h3>
                      <div className="row">
                        <span className={`rutina-tipo-badge ${r.tipo}`}>
                          {TIPO_LABELS[r.tipo] || r.tipo}
                        </span>
                        <span className={`rutina-estado-badge ${r.activa ? 'activa' : 'inactiva'}`}>
                          {r.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>

                    {r.Instruido && (
                      <p className="rutina-cliente-nombre">
                        Cliente: {r.Instruido.nombre}
                      </p>
                    )}

                    <div className="rutina-resumen-stats">
                      <div className="rutina-resumen-stat">
                        <div className="rutina-resumen-stat-value">{r.frecuenciaSemanal || '?'}</div>
                        <div className="rutina-resumen-stat-label">x/semana</div>
                      </div>
                      <div className="rutina-resumen-stat">
                        <div className="rutina-resumen-stat-value">
                          {(r.ejercicios || []).length}
                        </div>
                        <div className="rutina-resumen-stat-label">ejercicios</div>
                      </div>
                    </div>

                    {r.fechaInicio && (
                      <p className="text-xs text-muted">
                        Inicio: {r.fechaInicio}{r.fechaFin ? ` → ${r.fechaFin}` : ''}
                      </p>
                    )}

                    <div className="rutina-acciones">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setVerRutina(verRutina === r.id ? null : r.id)}
                      >
                        {verRutina === r.id ? 'Ocultar' : 'Ver Detalle'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-ghost-peligroso"
                        onClick={() => handleEliminarRutina(r.id)}
                      >
                        Eliminar
                      </button>
                    </div>

                    {verRutina === r.id && (
                      <div className="seccion-dividida stack">
                        <DiaSelector
                          seleccionados={r.diasSemana ? Object.keys(r.diasSemana).map(Number) : []}
                          onToggle={(d) => setDiaVer(diaVer === d ? null : d)}
                          modo="vista"
                        />
                        {diaVer != null && (
                          <div className="stack stack-sm">
                            <h4 className="text-sm text-bold">
                              {obtenerNombreDia(diaVer)}
                            </h4>
                            {(r.ejercicios || []).filter((e) => e.dia === diaVer).length === 0 ? (
                              <p className="text-sm text-muted">
                                Sin ejercicios para este dia
                              </p>
                            ) : (
                              <div className="stack stack-sm">
                                {(r.ejercicios || [])
                                  .filter((e) => e.dia === diaVer)
                                  .sort((a, b) => a.orden - b.orden)
                                  .map((ej, idx) => (
                                    <EjercicioCard
                                      key={idx}
                                      ejercicio={ej}
                                      nombreEjercicio={ej.nombre}
                                      showActions={false}
                                    />
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'recomendadas' && (
        <RecomendacionesIAView onRecargar={cargarDatos} />
      )}

      <PlantillaForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setPlantillaEdit(null); }}
        plantilla={plantillaEdit}
        onSaved={cargarDatos}
      />

      <AsignarRutinaModal
        isOpen={asignarOpen}
        onClose={() => { setAsignarOpen(false); setPlantillaAsignar(null); }}
        plantilla={plantillaAsignar}
        onSaved={cargarDatos}
      />
    </div>
  );
}
