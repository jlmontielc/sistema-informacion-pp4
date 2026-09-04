import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportesService } from '../services/reportesService';
import { FiltroTiempo } from '../components/reportes/FiltroTiempo';
import { ListaInstruidos } from '../components/reportes/ListaInstruidos';
import { GraficaGruposMusculares } from '../components/reportes/GraficaGruposMusculares';
import { GraficaEvolucionGrupo } from '../components/reportes/GraficaEvolucionGrupo';
import { ResumenComparativa } from '../components/reportes/ResumenComparativa';
import { Loading } from '../components/common/Loading';

const PERIODO_DEFAULT = '30d';

export default function ReportesPage() {
  const { user } = useAuth();
  const esEntrenadorOAdmin = useMemo(
    () => user?.rol === 'administrador' || user?.rol === 'entrenador' || user?.tipo === 'entrenador',
    [user]
  );
  const esInstruido = user?.rol === 'instruido' || user?.tipo === 'instruido';

  const [periodo, setPeriodo] = useState(PERIODO_DEFAULT);
  const [instruidoSeleccionado, setInstruidoSeleccionado] = useState(null);
  const [grupoMuscularSeleccionado, setGrupoMuscularSeleccionado] = useState(null);

  const [instruidos, setInstruidos] = useState([]);
  const [cargandoInstruidos, setCargandoInstruidos] = useState(false);
  const [errorInstruidos, setErrorInstruidos] = useState(null);

  const [gruposMusculares, setGruposMusculares] = useState([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [errorGrupos, setErrorGrupos] = useState(null);

  const [evolucion, setEvolucion] = useState([]);
  const [cargandoEvolucion, setCargandoEvolucion] = useState(false);
  const [errorEvolucion, setErrorEvolucion] = useState(null);

  const [comparativa, setComparativa] = useState(null);
  const [cargandoComparativa, setCargandoComparativa] = useState(false);
  const [errorComparativa, setErrorComparativa] = useState(null);

  // Cargar lista de instruidos para entrenadores y administradores.
  useEffect(() => {
    if (!esEntrenadorOAdmin) return;

    let activo = true;
    setCargandoInstruidos(true);
    setErrorInstruidos(null);

    reportesService
      .listarInstruidos()
      .then((res) => {
        if (!activo) return;
        const lista = res.data?.instruidos || [];
        setInstruidos(lista);
      })
      .catch((err) => {
        if (!activo) return;
        setErrorInstruidos(err.response?.data?.mensaje || 'No se pudieron cargar los instruidos.');
      })
      .finally(() => {
        if (activo) setCargandoInstruidos(false);
      });

    return () => {
      activo = false;
    };
  }, [esEntrenadorOAdmin]);

  // Seleccionar automáticamente el primer instruido si no hay ninguno seleccionado.
  useEffect(() => {
    if (!esEntrenadorOAdmin) return;
    if (instruidos.length > 0 && !instruidoSeleccionado) {
      setInstruidoSeleccionado(instruidos[0]);
    }
  }, [esEntrenadorOAdmin, instruidos, instruidoSeleccionado]);

  const cargarReportes = useCallback(async () => {
    if (!user) return;

    setCargandoGrupos(true);
    setCargandoComparativa(true);
    setErrorGrupos(null);
    setErrorComparativa(null);

    try {
      let resGrupos;
      let resComparativa;

      if (esInstruido || !esEntrenadorOAdmin) {
        resGrupos = await reportesService.obtenerGruposMuscularesPropios(periodo);
        resComparativa = await reportesService.obtenerComparativaPropia(periodo);
      } else if (instruidoSeleccionado) {
        resGrupos = await reportesService.obtenerGruposMuscularesPorInstruido(instruidoSeleccionado.id, periodo);
        resComparativa = await reportesService.obtenerComparativaPorInstruido(instruidoSeleccionado.id, periodo);
      } else {
        setGruposMusculares([]);
        setComparativa(null);
        setCargandoGrupos(false);
        setCargandoComparativa(false);
        return;
      }

      const datosGrupos = resGrupos.data?.grupos || [];
      setGruposMusculares(datosGrupos);

      const datosComparativa = resComparativa.data || null;
      setComparativa(datosComparativa);
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'No se pudieron cargar los reportes.';
      setErrorGrupos(mensaje);
      setErrorComparativa(mensaje);
    } finally {
      setCargandoGrupos(false);
      setCargandoComparativa(false);
    }
  }, [user, esInstruido, esEntrenadorOAdmin, instruidoSeleccionado, periodo]);

  const cargarEvolucion = useCallback(async () => {
    if (!user || !grupoMuscularSeleccionado) return;

    setCargandoEvolucion(true);
    setErrorEvolucion(null);

    try {
      let res;
      if (esInstruido || !esEntrenadorOAdmin) {
        res = await reportesService.obtenerEvolucionPropia(grupoMuscularSeleccionado, periodo);
      } else if (instruidoSeleccionado) {
        res = await reportesService.obtenerEvolucionPorInstruido(
          instruidoSeleccionado.id,
          grupoMuscularSeleccionado,
          periodo
        );
      } else {
        setEvolucion([]);
        setCargandoEvolucion(false);
        return;
      }

      const datos = res.data?.evolucion || [];
      setEvolucion(datos);
    } catch (err) {
      setErrorEvolucion(err.response?.data?.mensaje || 'No se pudo cargar la evolución.');
    } finally {
      setCargandoEvolucion(false);
    }
  }, [user, esInstruido, esEntrenadorOAdmin, instruidoSeleccionado, grupoMuscularSeleccionado, periodo]);

  useEffect(() => {
    let activo = true;
    (async () => {
      if (!activo) return;
      await cargarReportes();
    })();
    return () => {
      activo = false;
    };
  }, [cargarReportes]);

  useEffect(() => {
    let activo = true;
    (async () => {
      if (!activo) return;
      await cargarEvolucion();
    })();
    return () => {
      activo = false;
    };
  }, [cargarEvolucion]);

  const handleSeleccionarInstruido = useCallback((instruido) => {
    setInstruidoSeleccionado(instruido);
    setGrupoMuscularSeleccionado(null);
  }, []);

  const handleSeleccionarGrupo = useCallback((grupo) => {
    setGrupoMuscularSeleccionado(grupo);
  }, []);

  const handleCerrarEvolucion = useCallback(() => {
    setGrupoMuscularSeleccionado(null);
  }, []);

  const handleCambiarPeriodo = useCallback((nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);
  }, []);

  if (!user) {
    return <Loading text="Cargando usuario..." />;
  }

  const tituloInstruido = esInstruido
    ? 'Mis reportes'
    : instruidoSeleccionado
    ? `Reportes de ${instruidoSeleccionado.nombre || 'instruido'}`
    : 'Reportes';

  return (
    <div className="reportes-pagina">
      <header className="reportes-encabezado">
        <div className="reportes-encabezado-fila">
          <div className="reportes-titulo">
            <h1>{tituloInstruido}</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Analiza el rendimiento y la evolución del entrenamiento.
            </p>
          </div>
          <FiltroTiempo periodo={periodo} onChange={handleCambiarPeriodo} />
        </div>
        {!esInstruido && instruidoSeleccionado && (
          <span className="reportes-subtitulo-instruido">
            Viendo reportes de: {instruidoSeleccionado.nombre || instruidoSeleccionado.email}
          </span>
        )}
      </header>

      <div className="reportes-layout">
        {esEntrenadorOAdmin && (
          <aside className="reportes-sidebar">
            <ListaInstruidos
              instruidos={instruidos}
              seleccionado={instruidoSeleccionado}
              onSeleccionar={handleSeleccionarInstruido}
              cargando={cargandoInstruidos}
              error={errorInstruidos}
            />
          </aside>
        )}

        <main className="reportes-contenido">
          <GraficaGruposMusculares
            datos={gruposMusculares}
            cargando={cargandoGrupos}
            error={errorGrupos}
            grupoSeleccionado={grupoMuscularSeleccionado}
            onSeleccionarGrupo={handleSeleccionarGrupo}
          />

          <GraficaEvolucionGrupo
            grupoMuscular={grupoMuscularSeleccionado}
            datos={evolucion}
            cargando={cargandoEvolucion}
            error={errorEvolucion}
            onCerrar={handleCerrarEvolucion}
          />

          <ResumenComparativa
            datos={comparativa}
            cargando={cargandoComparativa}
            error={errorComparativa}
          />
        </main>
      </div>
    </div>
  );
}
