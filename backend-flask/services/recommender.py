import json
import logging
from config.constants import (
    MAPEO_PROPOSITO_TEXTO,
    DIFICULTAD_ORDEN,
    PESOS_BASE_SCORING,
)
from services.guardian import GuardianSeguridad
from services.case_utils import keys_to_camel_case
from models.rules.injury_rules import detectar_grupo_lesion

logger = logging.getLogger(__name__)


class RecommenderEngine:

    def __init__(self):
        self.weights = dict(PESOS_BASE_SCORING)
        self._cargar_pesos_persistidos()

    def _cargar_pesos_persistidos(self):
        try:
            from services.feedback_learner import cargar_pesos_persistidos
            persistidos = cargar_pesos_persistidos()
            if persistidos:
                self.weights.update(persistidos)
                logger.info('Pesos de scoring cargados: %s', self.weights)
        except Exception as e:
            logger.warning('Usando pesos base (sin persistencia disponible): %s', e)

    def actualizar_pesos(self, pesos: dict):
        validos = {
            k: float(v) for k, v in pesos.items() if k in PESOS_BASE_SCORING
        }
        if validos:
            self.weights.update(validos)
            logger.info('Pesos actualizados en caliente: %s', self.weights)

    def clasificar_mejor_plantilla(
        self,
        plantillas_con_ejercicios: list,
        datos_cliente: dict,
        perfil_medico: dict,
        historial: list = None,
        guardian: GuardianSeguridad = None,
    ) -> dict:
        if not plantillas_con_ejercicios:
            return keys_to_camel_case({
                'plantilla_id': None,
                'confianza': 0.0,
                'explicacion': 'No hay plantillas disponibles del entrenador.',
                'metadata': {
                    'plantillas_evaluadas': 0,
                    'plantillas_descartadas_por_lesiones': 0,
                    'plantillas_viables': 0,
                    'scores_detalle': {},
                },
            })

        objetivo_cliente = self._normalizar_objetivo(datos_cliente)
        nivel_cliente = DIFICULTAD_ORDEN.get(
            datos_cliente.get('nivelExperiencia')
            or datos_cliente.get('nivelActividad', 'moderado'),
            2,
        )
        dias_disponibles = max(2, min(datos_cliente.get('diasDisponibles', 3), 6))
        lesiones_cliente = (perfil_medico or {}).get('lesiones', [])

        if guardian is None:
            guardian = GuardianSeguridad()

        plantillas_viables = []
        scores_detalle = {}
        descartadas_por_lesiones = 0

        for plantilla in plantillas_con_ejercicios:
            plantilla_id = plantilla.get('id')
            ejercicios_raw = plantilla.get('ejercicios')

            if not ejercicios_raw:
                scores_detalle[plantilla_id] = 0
                continue

            if isinstance(ejercicios_raw, str):
                try:
                    ejercicios_lista = json.loads(ejercicios_raw)
                except (json.JSONDecodeError, TypeError):
                    scores_detalle[plantilla_id] = 0
                    continue
            elif isinstance(ejercicios_raw, list):
                ejercicios_lista = ejercicios_raw
            else:
                scores_detalle[plantilla_id] = 0
                continue

            if not ejercicios_lista:
                scores_detalle[plantilla_id] = 0
                continue

            plantilla_bloqueada = False
            ejercicios_bloqueados = []
            ejercicios_precaucion = []

            for ej in ejercicios_lista:
                ej_id = ej.get('ejercicioId') or ej.get('ejercicio_id') or ej.get('id')
                if ej_id is None:
                    continue

                ejercicio_para_guardian = {
                    'id': ej_id,
                    'nombre': ej.get('nombre', f'Ejercicio {ej_id}'),
                    'grupo_muscular': ej.get('grupoMuscular') or ej.get('grupo_muscular', ''),
                    'contraindica_lesiones': ej.get('contraindicaLesiones') or ej.get('contraindica_lesiones', ''),
                }

                resultado_guardian = guardian.validar_ejercicio(
                    ejercicio=ejercicio_para_guardian,
                    datos_cliente=datos_cliente,
                    perfil_medico=perfil_medico,
                )

                if resultado_guardian['bloqueado'] and resultado_guardian['nivelRiesgo'] in ('HIGH', 'CRITICAL'):
                    plantilla_bloqueada = True
                    ejercicios_bloqueados.append({
                        'ejercicio_id': ej_id,
                        'nombre': ejercicio_para_guardian['nombre'],
                        'nivel_riesgo': resultado_guardian['nivelRiesgo'],
                        'razon': resultado_guardian['alertas'][0]['mensaje'] if resultado_guardian['alertas'] else 'Contraindicado por lesión',
                    })
                elif resultado_guardian['nivelRiesgo'] != 'SAFE':
                    ejercicios_precaucion.append({
                        'ejercicio_id': ej_id,
                        'nombre': ejercicio_para_guardian['nombre'],
                        'nivel_riesgo': resultado_guardian['nivelRiesgo'],
                        'modificacion': resultado_guardian.get('modificacionSugerida'),
                    })

            if plantilla_bloqueada:
                descartadas_por_lesiones += 1
                scores_detalle[plantilla_id] = 0
                continue

            score_objetivo = self._score_objetivo_plantilla(plantilla, objetivo_cliente)
            score_nivel = self._score_nivel_plantilla(plantilla, nivel_cliente)
            score_dias = self._score_dias_plantilla(plantilla, dias_disponibles)

            pesos_norm = self._normalizar_pesos()

            score_total = (
                score_objetivo * pesos_norm['objetivo'] / 100 +
                score_nivel * pesos_norm['nivel'] / 100 +
                score_dias * pesos_norm['dias'] / 100
            )

            confianza = round(min(max(score_total, 0), 100), 1)

            scores_detalle[plantilla_id] = confianza

            plantillas_viables.append({
                'plantilla_id': plantilla_id,
                'nombre': plantilla.get('nombre', 'Sin nombre'),
                'confianza': confianza,
                'score_objetivo': round(score_objetivo * pesos_norm['objetivo'], 1),
                'score_nivel': round(score_nivel * pesos_norm['nivel'], 1),
                'score_dias': round(score_dias * pesos_norm['dias'], 1),
                'ejercicios_bloqueados': ejercicios_bloqueados,
                'ejercicios_precaucion': ejercicios_precaucion,
                'tipo': plantilla.get('tipo'),
                'objetivo': plantilla.get('objetivo'),
                'nivel_dificultad': plantilla.get('nivel_dificultad'),
                'frecuencia_semanal': plantilla.get('frecuencia_semanal'),
            })

        if not plantillas_viables:
            return keys_to_camel_case({
                'plantilla_id': None,
                'confianza': 0.0,
                'explicacion': 'Todas las plantillas fueron descartadas por incompatibilidad con lesiones/condiciones del cliente.',
                'metadata': {
                    'plantillas_evaluadas': len(plantillas_con_ejercicios),
                    'plantillas_descartadas_por_lesiones': descartadas_por_lesiones,
                    'plantillas_viables': 0,
                    'scores_detalle': scores_detalle,
                },
            })

        plantillas_viables.sort(key=lambda p: p['confianza'], reverse=True)
        mejor = plantillas_viables[0]

        explicacion = self._generar_explicacion_clasificador(
            mejor, objetivo_cliente, nivel_cliente, dias_disponibles,
            len(plantillas_con_ejercicios), descartadas_por_lesiones, len(plantillas_viables)
        )

        advertencia = None
        if mejor['confianza'] < 50:
            advertencia = 'Confianza baja: la rutina recomendada está sujeta a modificaciones por el entrenador'

        return keys_to_camel_case({
            'plantilla_id': mejor['plantilla_id'],
            'confianza': mejor['confianza'],
            'explicacion': explicacion,
            'advertencia': advertencia,
            'metadata': {
                'plantillas_evaluadas': len(plantillas_con_ejercicios),
                'plantillas_descartadas_por_lesiones': descartadas_por_lesiones,
                'plantillas_viables': len(plantillas_viables),
                'scores_detalle': scores_detalle,
            },
        })

    def _normalizar_pesos(self) -> dict:
        total = sum(self.weights.get(k, 0) for k in ('objetivo', 'nivel', 'dias'))
        if total == 0:
            return {'objetivo': 33.33, 'nivel': 33.33, 'dias': 33.33}
        return {
            'objetivo': self.weights.get('objetivo', 0) / total * 100,
            'nivel': self.weights.get('nivel', 0) / total * 100,
            'dias': self.weights.get('dias', 0) / total * 100,
        }

    def _normalizar_objetivo(self, datos_cliente: dict) -> str:
        proposito_bruto = (datos_cliente.get('proposito') or 'mantenimiento').strip().lower()
        return MAPEO_PROPOSITO_TEXTO.get(proposito_bruto, proposito_bruto)

    def _score_objetivo_plantilla(self, plantilla: dict, objetivo_cliente: str) -> float:
        objetivo_plantilla = (plantilla.get('objetivo') or '').strip().lower()
        if not objetivo_plantilla:
            return 30.0
        if objetivo_plantilla == objetivo_cliente:
            return 100.0
        compatibilidad = self._compatibilidad_objetivos(objetivo_cliente, objetivo_plantilla)
        return 100.0 * compatibilidad

    def _compatibilidad_objetivos(self, objetivo_a: str, objetivo_b: str) -> float:
        matriz = {
            ('ganancia_muscular', 'rendimiento'): 0.7,
            ('ganancia_muscular', 'mantenimiento'): 0.5,
            ('perdida_peso', 'mantenimiento'): 0.6,
            ('perdida_peso', 'ganancia_muscular'): 0.4,
            ('mantenimiento', 'ganancia_muscular'): 0.5,
            ('mantenimiento', 'perdida_peso'): 0.6,
            ('rendimiento', 'ganancia_muscular'): 0.7,
            ('rehabilitacion', 'mantenimiento'): 0.4,
        }
        return matriz.get((objetivo_a, objetivo_b),
               matriz.get((objetivo_b, objetivo_a), 0.2))

    def _score_nivel_plantilla(self, plantilla: dict, nivel_cliente: int) -> float:
        nivel_raw = (
            plantilla.get('nivelDificultad')
            or plantilla.get('nivel_dificultad')
            or 'intermedio'
        )
        nivel_plantilla = DIFICULTAD_ORDEN.get(
            nivel_raw.strip().lower(), 2
        )
        diferencia = abs(nivel_cliente - nivel_plantilla)
        if diferencia == 0:
            return 100.0
        if diferencia == 1:
            return 66.0
        if diferencia == 2:
            return 33.0
        return 0.0

    def _score_dias_plantilla(self, plantilla: dict, dias_disponibles: int) -> float:
        frecuencia = plantilla.get('frecuenciaSemanal') or plantilla.get('frecuencia_semanal')
        if not frecuencia:
            return 30.0
        try:
            frecuencia = int(frecuencia)
        except (ValueError, TypeError):
            return 30.0

        diferencia = abs(frecuencia - dias_disponibles)
        if diferencia == 0:
            return 100.0
        if diferencia == 1:
            return 70.0
        if diferencia == 2:
            return 40.0
        return 10.0

    def _generar_explicacion_clasificador(
        self, mejor: dict, objetivo_cliente: str, nivel_cliente: int,
        dias_disponibles: int, total_evaluadas: int, descartadas: int, viables: int
    ) -> str:
        objetivo_p = (mejor.get('objetivo') or 'no especificado').replace('_', ' ')
        nivel_p = (mejor.get('nivel_dificultad') or 'intermedio')
        frecuencia = mejor.get('frecuencia_semanal')

        partes = []
        if (mejor.get('objetivo') or '').strip().lower() == objetivo_cliente:
            partes.append(f"Objetivo '{objetivo_p}' coincide (100%)")
        else:
            partes.append(f"Objetivo '{objetivo_p}' compatible")

        partes.append(f"Nivel: {nivel_p}")

        if frecuencia:
            partes.append(f"Frecuencia: {frecuencia} días/semana (disponibles: {dias_disponibles})")

        if mejor['ejercicios_precaucion']:
            partes.append(f"{len(mejor['ejercicios_precaucion'])} ejercicio(s) con precaución médica")
        else:
            partes.append("Todos los ejercicios son seguros para este cliente")

        partes.append(f"Evaluadas: {total_evaluadas}, descartadas por lesiones: {descartadas}, viables: {viables}")

        return '. '.join(partes) + '.'

    # MÉTODOS LEGACY - Mantenidos por compatibilidad, marcados como deprecated
    def recomendar_plantillas(
        self,
        plantillas_disponibles: list,
        pool_seguro: list,
        datos_cliente: dict,
        historial: list = None,
        perfil_medico: dict = None,
    ) -> dict:
        logger.warning('recomendar_plantillas() está deprecado, usar clasificar_mejor_plantilla()')
        return {
            'plantillas_recomendadas': [],
            'total_evaluadas': len(plantillas_disponibles),
            'total_seguras': 0,
            'confianza': 0.0,
            'explicacion': 'Método deprecado. Usar clasificar_mejor_plantilla().',
            'metadata': {},
        }

    @staticmethod
    def _parsear_contraindicaciones(valor_campo) -> list:
        if not valor_campo:
            return []
        if isinstance(valor_campo, list):
            return [str(v).strip().lower() for v in valor_campo if v]
        if isinstance(valor_campo, str):
            try:
                data = json.loads(valor_campo)
                if isinstance(data, list):
                    return [str(v).strip().lower() for v in data if v]
            except (json.JSONDecodeError, TypeError):
                pass
            return [z.strip().lower() for z in valor_campo.split(',') if z.strip()]
        return []

    @staticmethod
    def _coincide_con_lesiones(contraindicaciones_zonas: list, lesiones_cliente: list) -> bool:
        for texto_lesion in lesiones_cliente:
            grupos_cliente = detectar_grupo_lesion(texto_lesion)
            for grupo in grupos_cliente:
                if grupo in contraindicaciones_zonas:
                    return True
        return False