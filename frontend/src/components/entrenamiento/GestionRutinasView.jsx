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
import { Icon } from '../common/Icon';

const TIPO_LABELS = {
  fuerza: 'Fuerza', hipertrofia: 'Hipertrofia', resistencia: 'Resistencia',
  cardio: 'Cardio', funcional: 'Funcional', flexibilidad: 'Flexibilidad',
};

const DIAS_SEMANA = [1, 2, 3, 4, 5, 6, 7];

const DIAS_ABREVIATURA = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 7: 'D' };

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

  const etiquetaTab = tab === 'plantillas' ? 'Plantillas' : tab === 'asignadas' ? 'Asignadas' : 'Recomendadas IA';

  if (loading) return <Loading text="Cargando rutinas..." />;

  if (error) {
    return (
      <div className="gt-flujo">
        <div className="gt-cabecera">
          <div className="gt-cabecera-texto">
            <h2 className="gt-titulo">{isAdmin ? 'Gestion de Rutinas' : 'Mis Rutinas'}</h2>
            <p className="gt-sub">
              {isAdmin
                ? 'Administra plantillas y rutinas asignadas a todos los clientes'
                : 'Crea plantillas y asigna rutinas a tus clientes'}
            </p>
          </div>
        </div>
        <div className="gt-carta gt-vacio">
          <p className="gt-vacio-icono" aria-hidden="true">⚠️</p>
          <p className="gt-vacio-texto">{error}</p>
          <button type="button" className="gt-boton-secundario" onClick={cargarDatos}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gt-flujo">
      <div className="gt-cabecera">
        <div className="gt-cabecera-texto">
          <h2 className="gt-titulo">{isAdmin ? 'Gestion de Rutinas' : 'Mis Rutinas'}</h2>
          <p className="gt-sub">
            {isAdmin
              ? 'Administra plantillas y rutinas asignadas a todos los clientes'
              : 'Crea plantillas y asigna rutinas a tus clientes'}
          </p>
        </div>
        <div className="gt-cabecera-acciones">
          <button
            type="button"
            className="gt-boton-secundario"
            onClick={() => setTab('recomendadas')}
          >
            <Icon name="bolt" size={16} />
            Recomendación IA
          </button>
          <button
            type="button"
            className="gt-boton-primario"
            onClick={() => { setPlantillaEdit(null); setFormOpen(true); }}
          >
            <Icon name="plus" size={16} />
            Crear Plantilla
          </button>
        </div>
      </div>

      <nav className="gt-miga" aria-label="Migas de pan">
        <span className="gt-miga-item">YanTraining</span>
        <Icon name="next" size={11} className="gt-miga-sep" />
        <span className="gt-miga-item">Entrenamiento</span>
        <Icon name="next" size={11} className="gt-miga-sep" />
        <span className="gt-miga-item gt-miga-activa">{etiquetaTab}</span>
      </nav>

      <div className="gt-tabs-row">
        <div className="gt-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'plantillas'}
            className={`gt-tab ${tab === 'plantillas' ? 'gt-tab-activa' : ''}`}
            onClick={() => setTab('plantillas')}
          >
            Plantillas
            <span className="gt-tab-contador">{plantillas.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'asignadas'}
            className={`gt-tab ${tab === 'asignadas' ? 'gt-tab-activa' : ''}`}
            onClick={() => setTab('asignadas')}
          >
            Asignadas
            <span className="gt-tab-contador">{rutinas.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'recomendadas'}
            className={`gt-tab ${tab === 'recomendadas' ? 'gt-tab-activa' : ''}`}
            onClick={() => setTab('recomendadas')}
          >
            Recomendadas IA
            <span className="gt-tab-contador">{recomendacionesCount}</span>
          </button>
        </div>
        {tab === 'plantillas' && (
          <span className="gt-pildora-total">
            <span className="gt-pildora-dot" />
            Total: {plantillas.length} Plantillas Activas
          </span>
        )}
      </div>

      {tab === 'plantillas' && (
        <>
          {plantillas.length === 0 ? (
            <div className="gt-carta gt-vacio">
              <EmptyState
                icon="📋"
                title="Sin plantillas"
                description="Crea tu primera plantilla de entrenamiento para comenzar a asignar rutinas."
                action={
                  <button
                    type="button"
                    className="gt-boton-primario"
                    onClick={() => { setPlantillaEdit(null); setFormOpen(true); }}
                  >
                    Crear Plantilla
                  </button>
                }
              />
            </div>
          ) : (
            <div className="gt-grid">
              {plantillas.map((p, i) => (
                <div
                  key={p.id}
                  className="gt-carta"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <div className="gt-carta-cuerpo">
                    <div className="gt-carta-cabecera">
                      <h3 className="gt-carta-titulo">{p.nombre}</h3>
                      <span className={`gt-chip gt-chip-${p.tipo}`}>
                        {TIPO_LABELS[p.tipo] || p.tipo}
                      </span>
                    </div>
                    {p.descripcion && (
                      <p className="gt-descripcion">
                        {p.descripcion}
                      </p>
                    )}
                    <div className="gt-stats">
                      <div className="gt-stat">
                        <span className="gt-stat-value">{p.frecuenciaSemanal || '?'}</span>
                        <span className="gt-stat-label">x/semana</span>
                      </div>
                      <div className="gt-stat">
                        <span className="gt-stat-value">{p.duracionSemanas || '?'}</span>
                        <span className="gt-stat-label">semanas</span>
                      </div>
                      <div className="gt-stat">
                        <span className="gt-stat-value">
                          {(p.ejercicios || []).length}
                        </span>
                        <span className="gt-stat-label">ejercicios</span>
                      </div>
                    </div>
                    <div className="gt-detalle">
                      <DiaSelector
                        seleccionados={p.diasSemana ? Object.keys(p.diasSemana).map(Number) : []}
                        modo="vista"
                      />
                    </div>
                    <div className="gt-acciones">
                      <button
                        type="button"
                        className="gt-accion"
                        onClick={() => { setPlantillaEdit(p); setFormOpen(true); }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="gt-accion-primaria"
                        onClick={() => handleAbrirAsignar(p)}
                      >
                        Asignar
                      </button>
                      <button
                        type="button"
                        className="gt-accion-peligro"
                        onClick={() => handleEliminarPlantilla(p.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'asignadas' && (
        <>
          {rutinas.length === 0 ? (
            <div className="gt-carta gt-vacio">
              <EmptyState
                icon="🏋️"
                title="Sin rutinas asignadas"
                description="Selecciona una plantilla y asignala a un cliente para que comience a entrenar."
                action={
                  plantillas.length > 0
                    ? (
                      <button
                        type="button"
                        className="gt-boton-primario"
                        onClick={() => handleAbrirAsignar(plantillas[0])}
                      >
                        Asignar Rutina
                      </button>
                    )
                    : (
                      <button
                        type="button"
                        className="gt-boton-primario"
                        onClick={() => { setPlantillaEdit(null); setFormOpen(true); }}
                      >
                        Crear Plantilla
                      </button>
                    )
                }
              />
            </div>
          ) : (
            <div className="gt-grid">
              {rutinas.map((r, i) => {
                const diasActivos = r.diasSemana ? Object.keys(r.diasSemana).map(Number) : [];
                const totalEjercicios = (r.ejercicios || []).length;
                const frecuenciaPct = Math.min(100, Math.round(((r.frecuenciaSemanal || 0) / 7) * 100));
                const volumenPct = Math.min(100, Math.round((totalEjercicios / 60) * 100));
                return (
                  <div
                    key={r.id}
                    className="gt-carta"
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <div className="gt-carta-cuerpo">
                      <div className="gt-carta-cabecera">
                        <h3 className="gt-carta-titulo">{r.nombre}</h3>
                        <div className="gt-fila">
                          <span className={`gt-chip gt-chip-${r.tipo}`}>
                            {TIPO_LABELS[r.tipo] || r.tipo}
                          </span>
                          <span className={`gt-chip ${r.activa ? 'gt-estado-activa' : 'gt-estado-inactiva'}`}>
                            {r.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>

                      {r.Instruido && (
                        <div className="gt-cliente">
                          <Icon name="user" size={15} className="gt-cliente-icono" />
                          <span>{r.Instruido.nombre}</span>
                        </div>
                      )}

                      <div className="gt-dias">
                        <span className="gt-dias-label">Dias de entrenamiento</span>
                        <div className="gt-dias-fila">
                          {DIAS_SEMANA.map((d) => {
                            const activo = diasActivos.includes(d);
                            return (
                              <span
                                key={d}
                                className={`gt-dia ${activo ? 'gt-dia-activa' : d >= 6 ? 'gt-dia-finde' : ''}`}
                              >
                                {DIAS_ABREVIATURA[d]}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="gt-metricas">
                        <div className="gt-metro">
                          <span className="gt-metro-label">
                            <Icon name="calendar" size={13} className="gt-metro-icono gt-metro-icono-frecuencia" />
                            Frecuencia
                          </span>
                          <span className="gt-metro-valor">
                            {r.frecuenciaSemanal || '?'}
                            <span className="gt-metro-sufijo">x/semana</span>
                          </span>
                          <div className="gt-barra">
                            <div className="gt-barra-relleno gt-barra-frecuencia" style={{ width: `${frecuenciaPct}%` }} />
                          </div>
                        </div>
                        <div className="gt-metro">
                          <span className="gt-metro-label">
                            <Icon name="dumbbell" size={13} className="gt-metro-icono gt-metro-icono-volumen" />
                            Ejercicios
                          </span>
                          <span className="gt-metro-valor">
                            {totalEjercicios}
                            <span className="gt-metro-sufijo">totales</span>
                          </span>
                          <div className="gt-barra">
                            <div className="gt-barra-relleno gt-barra-volumen" style={{ width: `${volumenPct}%` }} />
                          </div>
                        </div>
                      </div>

                      {r.fechaInicio && (
                        <div className="gt-meta">
                          <span>
                            Inicio en <span className="gt-meta-valor">{r.fechaInicio}</span>
                          </span>
                          {r.fechaFin && (
                            <>
                              <span className="gt-meta-sep">•</span>
                              <span>
                                Hasta <span className="gt-meta-valor">{r.fechaFin}</span>
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="gt-acciones">
                        <button
                          type="button"
                          className="gt-ver"
                          onClick={() => setVerRutina(verRutina === r.id ? null : r.id)}
                        >
                          {verRutina === r.id ? 'Ocultar' : 'Ver Detalle'}
                          <Icon name="arrow" size={14} className="gt-ver-icono" />
                        </button>
                        <button
                          type="button"
                          className="gt-accion-peligro"
                          onClick={() => handleEliminarRutina(r.id)}
                        >
                          Eliminar
                        </button>
                      </div>

                      {verRutina === r.id && (
                        <div className="gt-detalle">
                          <DiaSelector
                            seleccionados={diasActivos}
                            onToggle={(d) => setDiaVer(diaVer === d ? null : d)}
                            modo="vista"
                          />
                          {diaVer != null && (
                            <div className="gt-detalle-lista">
                              <h4 className="gt-detalle-titulo">
                                {obtenerNombreDia(diaVer)}
                              </h4>
                              {(r.ejercicios || []).filter((e) => e.dia === diaVer).length === 0 ? (
                                <p className="gt-detalle-vacio">
                                  Sin ejercicios para este dia
                                </p>
                              ) : (
                                <div className="gt-detalle-lista">
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
                  </div>
                );
              })}
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
