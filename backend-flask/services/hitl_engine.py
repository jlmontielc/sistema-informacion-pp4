import time
import logging
from services.data_fetcher import (
    fetch_cliente_completo,
    fetch_perfil_medico,
    fetch_todos_ejercicios,
    fetch_historial_entrenamiento,
    fetch_rutinas_activas,
    parsear_lesiones,
    parsear_condiciones,
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

        datos_cliente = self._construir_datos_cliente(request_data, cliente_id)
        if not datos_cliente:
            return self._error_response('Cliente no encontrado o inactivo', 404)

        perfil_medico = self._construir_perfil_medico(request_data, cliente_id)

        pool_ejercicios = fetch_todos_ejercicios()
        if not pool_ejercicios:
            return self._error_response('No hay ejercicios disponibles en el catálogo', 500)

        resultado_guardian = self.guardian.evaluar_cliente_completo(datos_cliente, perfil_medico)

        pool_filtrado = self.guardian.filtrar_pool_ejercicios(
            pool_ejercicios, datos_cliente, perfil_medico
        )

        if pool_filtrado['total_seguros'] == 0:
            return {
                'success': False,
                'error': 'No hay ejercicios seguros disponibles para este perfil',
                'alertas_seguridad': pool_filtrado['alertas_globales'],
                'ejercicios_bloqueados': [
                    {
                        'nombre': b['ejercicio']['nombre'],
                        'razon': b['razon']['alertas'][0]['mensaje'] if b['razon']['alertas'] else 'Restricción médica',
                    }
                    for b in pool_filtrado['ejercicios_bloqueados']
                ],
                'sugerencia': 'Consultar con el entrenador para ejercicios personalizados o rehabilitación específica.',
                'tiempo_ms': round((time.time() - inicio) * 1000, 1),
            }

        historial = fetch_historial_entrenamiento(cliente_id, semanas=4)

        resultado_recommender = self.recommender.generar_rutina(
            datos_cliente=datos_cliente,
            pool_seguro=pool_filtrado['pool_seguro'],
            historial=historial,
        )

        tiempo_total = round((time.time() - inicio) * 1000, 1)

        respuesta = {
            'success': True,
            'rutina_sugerida': resultado_recommender['rutina_sugerida'],
            'alertas_seguridad': pool_filtrado['alertas_globales'],
            'ejercicios_filtrados': [
                {
                    'nombre': b['ejercicio']['nombre'],
                    'nivel_riesgo': b['razon']['nivel_riesgo'],
                    'razon': b['razon']['alertas'][0]['mensaje'] if b['razon']['alertas'] else 'Restricción médica',
                }
                for b in pool_filtrado['ejercicios_bloqueados']
            ],
            'ejercicios_con_precaucion': [
                {
                    'nombre': p['ejercicio']['nombre'],
                    'nivel_riesgo': p['razon']['nivel_riesgo'],
                    'modificacion': p['razon'].get('modificacion_sugerida'),
                }
                for p in pool_filtrado['ejercicios_precaucion']
            ],
            'precauciones_condicion': resultado_guardian.get('precauciones', []),
            'nivel_riesgo_global': resultado_guardian.get('nivel_riesgo_global', 'SAFE'),
            'confianza': resultado_recommender['confianza'],
            'explicacion': resultado_recommender['explicacion'],
            'resumen_pool': {
                'total_evaluados': pool_filtrado['total_evaluados'],
                'total_seguros': pool_filtrado['total_seguros'],
                'total_bloqueados': pool_filtrado['total_bloqueados'],
                'total_precaucion': pool_filtrado['total_precaucion'],
            },
            'metadata': {
                'tiempo_ms': tiempo_total,
                'version_modelo': '1.0.0',
                'motor': 'reglas+scoring',
            },
        }

        logger.info(
            f"HITL processed cliente={cliente_id} "
            f"ejercicios={pool_filtrado['total_evaluados']} "
            f"seguros={pool_filtrado['total_seguros']} "
            f"bloqueados={pool_filtrado['total_bloqueados']} "
            f"tiempo={tiempo_total}ms"
        )

        return respuesta

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
            'alergias': parsear_lesiones(perfil_raw),
            'medicacion': [],
        }

    def _error_response(self, mensaje: str, status: int) -> dict:
        return {
            'success': False,
            'error': mensaje,
            'status': status,
        }
