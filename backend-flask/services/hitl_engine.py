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
from services.case_utils import keys_to_camel_case

logger = logging.getLogger(__name__)


class HitlEngine:

    def __init__(self):
        self.guardian = GuardianSeguridad()
        self.recommender = RecommenderEngine()

    def procesar_solicitud(self, request_data: dict) -> dict:
        inicio = time.time()

        cliente_id = request_data.get('clienteId')
        if not cliente_id:
            return self._error_response('clienteId es requerido', 400)

        entrenador_id = request_data.get('entrenadorId')
        if not entrenador_id:
            return self._error_response('entrenadorId es requerido', 400)

        datos_cliente = self._construir_datos_cliente(request_data, cliente_id)
        if not datos_cliente:
            return self._error_response('Cliente no encontrado o inactivo', 404)

        perfil_medico = self._construir_perfil_medico(request_data, cliente_id)

        plantillas_meta = request_data.get('plantillasDisponibles', [])
        if not plantillas_meta:
            return self._error_response(
                'No hay plantillas activas disponibles para este entrenador', 422
            )

        plantilla_ids = [p.get('id') or p.get('Id') for p in plantillas_meta]
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

        if resultado_clasificador['plantillaId'] is None:
            return self._error_response(
                resultado_clasificador['explicacion'], 422,
                {
                    'plantillas_evaluadas': resultado_clasificador['metadata']['plantillasEvaluadas'],
                    'plantillas_descartadas_por_lesiones': resultado_clasificador['metadata']['plantillasDescartadasPorLesiones'],
                    'plantillas_viables': 0,
                    'scores_detalle': resultado_clasificador['metadata']['scoresDetalle'],
                }
            )

        respuesta = {
            'success': True,
            'plantilla_id': resultado_clasificador['plantillaId'],
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
            f"plantillas_evaluadas={resultado_clasificador['metadata']['plantillasEvaluadas']} "
            f"descartadas_lesiones={resultado_clasificador['metadata']['plantillasDescartadasPorLesiones']} "
            f"viables={resultado_clasificador['metadata']['plantillasViables']} "
            f"mejor={resultado_clasificador['plantillaId']} "
            f"confianza={resultado_clasificador['confianza']}% "
            f"tiempo={tiempo_total}ms"
        )

        return keys_to_camel_case(respuesta)

    def recalibrar_pesos(self, tipo: str = 'rutina') -> dict:
        from services.feedback_learner import recalcular_y_persistir_pesos

        resultado = recalcular_y_persistir_pesos(tipo=tipo)
        if resultado.get('success'):
            self.recommender.actualizar_pesos(resultado['pesosNuevos'])
            self.weights = dict(self.recommender.weights)
        return keys_to_camel_case(resultado)

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
            'condicionesPreexistentes': condiciones,
        }

        datos_cliente_camel = {
            'edad': datos_cliente['edad'],
            'peso': float(datos_cliente['peso']),
            'altura': float(datos_cliente['altura']),
            'sexo': datos_cliente.get('sexo', 'masculino'),
            'nivelActividad': datos_cliente.get('nivel_actividad', 'moderado'),
            'nivelExperiencia': datos_cliente.get('nivel_experiencia'),
            'proposito': datos_cliente.get('proposito', 'mantenimiento'),
            'diasDisponibles': datos_cliente.get('dias_disponibles', 3),
        }

        resultado = self.guardian.validar_ejercicio(
            ejercicio, datos_cliente_camel, perfil_parseado, carga_kg
        )

        return keys_to_camel_case({
            'ejercicio': {
                'id': ejercicio['id'],
                'nombre': ejercicio['nombre'],
                'grupo_muscular': ejercicio['grupo_muscular'],
            },
            'validacion': resultado,
        })

    def _obtener_historial(self, request_data: dict, cliente_id: int) -> list:
        historial_payload = request_data.get('historialReciente')
        if isinstance(historial_payload, dict):
            registros = historial_payload.get('ultimas4Semanas')
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
                'nivelActividad': request_data.get('nivelActividad', 'moderado'),
                'nivelExperiencia': request_data.get('nivelExperiencia'),
                'proposito': request_data.get('proposito', 'mantenimiento'),
                'diasDisponibles': request_data.get('diasDisponibles', 3),
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
            'nivelActividad': cliente.get('nivel_actividad'),
            'nivelExperiencia': cliente.get('nivel_experiencia'),
            'proposito': cliente.get('proposito', 'mantenimiento'),
            'diasDisponibles': cliente.get('dias_disponibles', 3),
            'preferencias': request_data.get('preferencias', {}),
        }

    def _construir_perfil_medico(self, request_data: dict, cliente_id: int) -> dict:
        if 'perfilMedico' in request_data:
            pm = request_data['perfilMedico']
            return {
                'lesiones': pm.get('lesiones', []),
                'condicionesPreexistentes': pm.get('condicionesPreexistentes', []),
                'alergias': pm.get('alergias', []),
                'medicacion': pm.get('medicacion', []),
            }

        perfil_raw = fetch_perfil_medico(cliente_id)
        if not perfil_raw:
            return {'lesiones': [], 'condicionesPreexistentes': []}

        return {
            'lesiones': parsear_lesiones(perfil_raw),
            'condicionesPreexistentes': parsear_condiciones(perfil_raw),
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
        return keys_to_camel_case(respuesta)

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
        nivel_actividad = request_data.get('nivelActividad')
        datos_medicos = request_data.get('datosMedicos', {})

        macros = calcular_macros(gct, peso, proposito)

        resultado_guardian = guardian_dieta(macros, tmb, gct, datos_medicos)

        justificacion = (
            f'Dieta generada con proposito "{proposito}". '
            f'TMB: {round(tmb)} kcal, GCT: {round(gct)} kcal. '
            f'Objetivo calorico ajustado: {macros["objetivoCalorico"]} kcal. '
            f'Proteina: {macros["proteinasGramos"]}g, '
            f'Carbohidratos: {macros["carbohidratosGramos"]}g, '
            f'Grasas: {macros["grasasGramos"]}g.'
        )

        tiempo_total = round((time.time() - inicio) * 1000, 1)

        return keys_to_camel_case({
            'success': True,
            'objetivo_calorico': macros['objetivoCalorico'],
            'proteinas_gramos': macros['proteinasGramos'],
            'carbohidratos_gramos': macros['carbohidratosGramos'],
            'grasas_gramos': macros['grasasGramos'],
            'guardian': resultado_guardian,
            'justificacion': justificacion,
            'metadata': {
                'tiempo_ms': tiempo_total,
                'version_modelo': '1.1.0',
                'motor': 'reglas+nutricion',
            },
        })