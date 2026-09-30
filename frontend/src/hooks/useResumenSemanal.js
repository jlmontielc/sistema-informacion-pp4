import { useCallback, useEffect, useRef, useState } from 'react';
import { registroEntrenamientoApi, rutinasAsignadasApi } from '../services/rutinasApi';
import { reportesService } from '../services/reportesService';
import {
  DIAS_SEMANA,
  abreviarDia,
  diaSemanaISO,
  esMismoDia,
  extraerResumenRegistro,
  fechaDeDiaSemana,
  formatearFechaCorta,
  obtenerSemanaPlan,
  rangoSemanaActual,
} from '../utils/fechasRutina';

const ESTADO_INICIAL = {
  cargando: true,
  error: null,
  resumenRutina: null,
  dias: [],
  seriesTotales: 0,
  repeticionesTotales: 0,
  tiempoTotalMin: 0,
  volumenTotalKg: 0,
  diasCompletados: 0,
  diasPlanificados: 0,
  gruposMusculares: [],
};

/* Cada request va envuelto para que un fallo puntual no tire la vista entera */
async function pedir(funcion) {
  try {
    const respuesta = await funcion();
    return respuesta?.data ?? null;
  } catch {
    return null;
  }
}

function normalizarLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.registros)) return respuesta.registros;
  return [];
}

/**
 * Resumen semanal del instruido con 3 requests en paralelo: registros de la
 * semana, grupos musculares propios y resumen de la rutina (fuente de los
 * nombres de ejercicio). No repite las llamadas mientras la rutina activa no
 * cambie; `recargar` fuerza el refresco tras registrar un entrenamiento.
 */
export function useResumenSemanal(rutina) {
  const [datos, setDatos] = useState(ESTADO_INICIAL);
  const idCargadoRef = useRef(null);

  const rutinaId = rutina?.id ?? null;

  const cargar = useCallback(
    async (forzar = false) => {
      if (!rutinaId) {
        setDatos({ ...ESTADO_INICIAL, cargando: false });
        return;
      }
      if (idCargadoRef.current === rutinaId && !forzar) return;
      idCargadoRef.current = rutinaId;

      setDatos((previo) => ({ ...previo, cargando: true, error: null }));

      const { desde, hasta } = rangoSemanaActual();
      const desdeMs = new Date(desde).getTime();
      const hastaMs = new Date(hasta).getTime();

      const [respuestaRegistros, respuestaGrupos, respuestaResumen] = await Promise.all([
        pedir(() =>
          registroEntrenamientoApi.listar({
            rutinaId,
            desde,
            hasta,
            estado: 'completado',
          })
        ),
        pedir(() => reportesService.obtenerGruposMuscularesPropios('7d')),
        pedir(() => rutinasAsignadasApi.obtenerResumen(rutinaId)),
      ]);

      // Con rol `instruido` el backend ignora `rutinaId`/`estado`/`desde`/`hasta`
      // y devuelve todos sus registros, así que el filtrado se repite en cliente.
      const registros = normalizarLista(respuestaRegistros).filter((registro) => {
        if (Number(registro?.rutinaAsignadaId) !== Number(rutinaId)) return false;
        if (registro?.estado !== 'completado') return false;
        const fecha = registro?.fechaInicio || registro?.fecha;
        if (!fecha) return false;
        const momento = new Date(fecha).getTime();
        return momento >= desdeMs && momento <= hastaMs;
      });

      if (respuestaRegistros === null) {
        setDatos((previo) => ({
          ...previo,
          cargando: false,
          error: 'No se pudo cargar tu historial de la semana.',
        }));
        return;
      }

      const grupos = Array.isArray(respuestaGrupos?.grupos) ? respuestaGrupos.grupos : [];
      const resumen = respuestaResumen || null;
      const configDias = resumen?.dias || {};
      const diaHoy = diaSemanaISO(new Date());

      const totalEjerciciosDia = (dia) => {
        const config = configDias[String(dia)];
        if (!config) return 0;
        if (Array.isArray(config.ejercicios)) return config.ejercicios.length;
        return Number(config.totalEjercicios) || 0;
      };

      let seriesTotales = 0;
      let repeticionesTotales = 0;
      let volumenRegistros = 0;

      const dias = DIAS_SEMANA.map(({ num }) => {
        const fecha = fechaDeDiaSemana(num);
        const ejercicios = configDias[String(num)]?.ejercicios || [];
        const registro = registros.find((item) => esMismoDia(item.fechaInicio || item.fecha, fecha));
        const totalEjercicios = ejercicios.length || totalEjerciciosDia(num);
        const esDescanso = totalEjercicios === 0;

        // El resumen con series/reps/volumen vive en `observaciones`.
        const detalle = registro ? extraerResumenRegistro(registro.observaciones) : null;
        const series = Number(detalle?.seriesTotales) || 0;
        const repeticiones = Number(detalle?.repeticionesTotales) || 0;
        const volumen = Number(detalle?.volumenTotal) || 0;

        seriesTotales += series;
        repeticionesTotales += repeticiones;
        volumenRegistros += volumen;

        return {
          dia: num,
          nombre: abreviarDia(num),
          fecha,
          fechaCorta: formatearFechaCorta(fecha),
          nombreSesion: configDias[String(num)]?.nombre || null,
          ejercicios,
          totalEjercicios,
          registroId: registro?.id ?? null,
          duracionMinutos: Number(registro?.duracionMinutos) || 0,
          series,
          repeticiones,
          volumenKg: volumen,
          estado: registro ? 'completado' : esDescanso ? 'descanso' : 'pendiente',
          esHoy: num === diaHoy,
          esPasado: num < diaHoy,
          esFuturo: num > diaHoy,
        };
      });

      setDatos({
        cargando: false,
        error: null,
        resumenRutina: resumen,
        dias,
        seriesTotales,
        repeticionesTotales,
        tiempoTotalMin: registros.reduce(
          (acc, item) => acc + (Number(item.duracionMinutos) || 0),
          0
        ),
        // Preferencia por los registros de la semana; el reporte 7d es el respaldo
        // cuando el backend todavía no guardó el bloque `Resumen:`.
        volumenTotalKg:
          volumenRegistros ||
          grupos.reduce((acc, item) => acc + (Number(item.volumenTotal) || 0), 0),
        diasCompletados: dias.filter((dia) => dia.estado === 'completado').length,
        diasPlanificados: dias.filter((dia) => dia.totalEjercicios > 0).length,
        gruposMusculares: grupos
          .map((grupo) => ({
            nombre: grupo.grupoMuscular || grupo.nombre || 'Sin grupo',
            series: Number(grupo.totalSeries) || 0,
            volumenKg: Number(grupo.volumenTotal) || 0,
          }))
          .filter((grupo) => grupo.series > 0 || grupo.volumenKg > 0)
          .sort((a, b) => b.volumenKg - a.volumenKg),
      });
    },
    [rutinaId]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const recargar = useCallback(() => {
    idCargadoRef.current = null;
    return cargar(true);
  }, [cargar]);

  return {
    semana: obtenerSemanaPlan(rutina),
    ...datos,
    recargar,
  };
}
