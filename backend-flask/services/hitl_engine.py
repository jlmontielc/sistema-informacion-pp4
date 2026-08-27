import time
import logging
from services.data_fetcher import (
    fetch_cliente_completo,
    fetch_perfil_medico,
    fetch_historial_entrenamiento,
    fetch_plantillas_por_ids,
    parsear_lesiones,
    parsear_condiciones,
    parsear_alergias,
)
from services.guardian import GuardianSeguridad
from services.recommender import RecommenderEngine

logger = logging.getLogger(__name__)


class HitlEngine:

    def __init__(self):
        self.guardian = GuardianSeguridad()
        self.recommender = RecommenderEngine()

    def procesar_solicitud(self, request_data: dict) -> dict:
        inicio = time.time()

        cliente_id = request_data.get('cliente_id')
        if not cliente_id:
            return self._error_response('cliente_id es requerido', 400)

        entrenador_id = request_data.get('entrenador_id')
        if not entrenador_id:
            return self._error_response('entrenador_id es requerido', 400)

        datos_cliente = self._construir_datos_cliente(request_data, cliente_id)
        if not datos_cliente:
            return self._error_response('Cliente no encontrado o inactivo', 404)

        perfil_medico = self._construir_perfil_medico(request_data, cliente_id)

        plantillas_meta = request_data.get('plantillas_disponibles', [])
        if not plantillas_meta:
            return self._error_response(
                'No hay plantillas activas disponibles para este entrenador', 422
            )

        plantilla_ids = [p['id'] for p in plantillas_meta]
        plantillas_completas = fetch_plantillas_por_ids(entrenador_id, plantilla_ids)

        if not plantillas_completas:
            return self._error_response(
                'No se encontraron plantillas completas para los IDs proporcionados', 422
            )

        historial = self._obtener_historial(request_data, cliente_id)

        resultado_clasificador = self.recommender.clasificar_mejor_plantilla(
            plantillas_con_ejercicios=plantillas_completas,
            datos_cliente=datos_cliente,
            perfil_medico=perfil_medico,
            historial=historial,
            guardian=self.guardian,
        )

        tiempo_total = round((time.time() - inicio) * 1000, 1)

        if resultado_clasificador['plantilla_id'] is None:
            return self._error_response(
                resultado_clasificador['explicacion'], 422,
                {
                    'plantillas_evaluadas': resultado_clasificador['metadata']['plantillas_evaluadas'],
                    'plantillas_descartadas_por_lesiones': resultado_clasificador['metadata']['plantillas_descartadas_por_lesiones'],
                    'plantillas_viables': 0,
                    'scores_detalle': resultado_clasificador['metadata']['scores_detalle'],
                }
            )

        respuesta = {
            'success': True,
            'plantilla_id': resultado_clasificador['plantilla_id'],
            'confianza': resultado_clasificador['confianza'],
            'explicacion': resultado_clasificador['explicacion'],
            'advertencia': resultado_clasificador.get('advertencia'),
            'metadata': {
                'tiempo_ms': tiempo_total,
                'version_modelo': '3.0.0',
                'motor': 'clasificador_plantillas',
                'pesos_scoring': dict(self.recommender.weights),
                'detalle_evaluacion': resultado_clasificador['metadata'],
            },
        }

        logger.info(
            f"HITL clasificador cliente={cliente_id} entrenador={entrenador_id} "
            f"plantillas_evaluadas={resultado_clasificador['metadata']['plantillas_evaluadas']} "
            f"descartadas_lesiones={resultado_clasificador['metadata']['plantillas_descartadas_por_lesiones']} "
            f"viables={resultado_clasificador['metadata']['plantillas_viables']} "
            f"mejor={resultado_clasificador['plantilla_id']} "
            f"confianza={resultado_clasificador['confianza']}% "
            f"tiempo={tiempo_total}ms"
        )

        return respuesta

    def recalibrar_pesos(self, tipo: str = 'rutina') -> dict:
        from services.feedback_learner import recalcular_y_persistir_pesos

        resultado = recalcular_y_persistir_pesos(tipo=tipo)
        if resultado.get('success'):
            self.recommender.actualizar_pesos(resultado['pesos_nuevos'])
            self.weights = dict(self.recommender.weights)
        return resultado

    def validar_ejercicio_individual(
        self, ejercicio_id: int, cliente_id: int, carga_kg: float = None
    ) -> dict:
        from services.data_fetcher import fetch_ejercicio_por_id

        ejercicio = fetch_ejercicio_por_id(ejercicio_id)
        if not ejercicio:
            return {'error': 'Ejercicio no encontrado', 'bloqueado': False}

        datos_cliente = fetch_cliente_completo(cliente_id)
        if not datos_cliente:
            return {'error': 'Cliente no encontrado', 'bloqueado': False}

        perfil_medico = fetch_perfil_medico(cliente_id)
        lesiones = parsear_lesiones(perfil_medico)
        condiciones = parsear_condiciones(perfil_medico)

        perfil_parseado = {
            'lesiones': lesiones,
            'condiciones_preexistentes': condiciones,
        }

        resultado = self.guardian.validar_ejercicio(
            ejercicio, datos_cliente, perfil_parseado, carga_kg
        )

        return {
            'ejercicio': {
                'id': ejercicio['id'],
                'nombre': ejercicio['nombre'],
                'grupo_muscular': ejercicio['grupo_muscular'],
            },
            'validacion': resultado,
        }

    def _obtener_historial(self, request_data: dict, cliente_id: int) -> list:
        historial_payload = request_data.get('historial_reciente')
        if isinstance(historial_payload, dict):
            registros = historial_payload.get('ultimas_4_semanas')
            if isinstance(registros, list):
                return registros
        elif isinstance(historial_payload, list):
            return historial_payload
        return fetch_historial_entrenamiento(cliente_id, semanas=4)

    def _construir_datos_cliente(self, request_data: dict, cliente_id: int) -> dict:
        if 'edad' in request_data and 'peso' in request_data:
            return {
                'id': cliente_id,
                'edad': request_data['edad'],
                'peso': float(request_data['peso']),
                'altura': float(request_data.get('altura', 1.70)),
                'sexo': request_data.get('sexo', 'masculino'),
                'nivel_actividad': request_data.get('nivel_actividad', 'moderado'),
                'nivel_experiencia': request_data.get('nivel_experiencia'),
                'proposito': request_data.get('proposito', 'mantenimiento'),
                'dias_disponibles': request_data.get('dias_disponibles', 3),
                'preferencias': request_data.get('preferencias', {}),
            }

        cliente = fetch_cliente_completo(cliente_id)
        if not cliente:
            return None

        return {
            'id': cliente['id'],
            'edad': cliente['edad'],
            'peso': float(cliente['peso']),
            'altura': float(cliente['altura']),
            'sexo': cliente['sexo'],
            'nivel_actividad': cliente['nivel_actividad'],
            'nivel_experiencia': cliente.get('nivel_experiencia'),
            'proposito': cliente.get('proposito_entrenamiento', 'mantenimiento'),
            'dias_disponibles': cliente.get('dias_disponibles', 3),
            'preferencias': request_data.get('preferencias', {}),
        }

    def _construir_perfil_medico(self, request_data: dict, cliente_id: int) -> dict:
        if 'perfil_medico' in request_data:
            pm = request_data['perfil_medico']
            return {
                'lesiones': pm.get('lesiones', []),
                'condiciones_preexistentes': pm.get('condiciones_preexistentes', []),
                'alergias': pm.get('alergias', []),
                'medicacion': pm.get('medicacion', []),
            }

        perfil_raw = fetch_perfil_medico(cliente_id)
        if not perfil_raw:
            return {'lesiones': [], 'condiciones_preexistentes': []}

        return {
            'lesiones': parsear_lesiones(perfil_raw),
            'condiciones_preexistentes': parsear_condiciones(perfil_raw),
            'alergias': parsear_alergias(perfil_raw),
            'medicacion': [],
        }

    def _error_response(self, mensaje: str, status: int, datos_extra: dict = None) -> dict:
        respuesta = {
            'success': False,
            'error': mensaje,
            'status': status,
        }
        if datos_extra:
            respuesta.update(datos_extra)
        return respuesta

    def procesar_solicitud_dieta(self, request_data: dict) -> dict:
        from services.nutricion_engine import calcular_macros, guardian_dieta, normalizar_proposito

        inicio = time.time()

        tmb = request_data.get('tmb')
        gct = request_data.get('gct')
        peso = request_data.get('peso')
        if not all([tmb, gct, peso]):
            return self._error_response('tmb, gct y peso son requeridos', 400)

        try:
            tmb = float(tmb)
            gct = float(gct)
            peso = float(peso)
        except (ValueError, TypeError):
            return self._error_response('tmb, gct y peso deben ser numericos', 400)

        proposito = normalizar_proposito(request_data.get('proposito', 'mantener'))
        datos_medicos = request_data.get('datosMedicos', {})

        macros = calcular_macros(gct, peso, proposito)

        resultado_guardian = guardian_dieta(macros, tmb, gct, datos_medicos)

        justificacion = (
            f'Dieta generada con proposito "{proposito}". '
            f'TMB: {round(tmb)} kcal, GCT: {round(gct)} kcal. '
            f'Objetivo calorico ajustado: {macros["objetivo_calorico"]} kcal. '
            f'Proteina: {macros["proteinas_gramos"]}g, '
            f'Carbohidratos: {macros["carbohidratos_gramos"]}g, '
            f'Grasas: {macros["grasas_gramos"]}g.'
        )

        tiempo_total = round((time.time() - inicio) * 1000, 1)

        return {
            'success': True,
            'objetivo_calorico': macros['objetivo_calorico'],
            'proteinas_gramos': macros['proteinas_gramos'],
            'carbohidratos_gramos': macros['carbohidratos_gramos'],
            'grasas_gramos': macros['grasas_gramos'],
            'guardian': resultado_guardian,
            'justificacion': justificacion,
            'metadata': {
                'tiempo_ms': tiempo_total,
                'version_modelo': '1.1.0',
                'motor': 'reglas+nutricion',
            },
        }