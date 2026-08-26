import json
import logging
from collections import defaultdict
from config.constants import (
    MAPEO_PROPOSITO_TEXTO,
    DIFICULTAD_ORDEN,
    PESOS_BASE_SCORING,
)

logger = logging.getLogger(__name__)

MAX_RECOMENDACIONES = 5


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

    def recomendar_plantillas(
        self,
        plantillas_disponibles: list,
        pool_seguro: list,
        datos_cliente: dict,
        historial: list = None,
        perfil_medico: dict = None,
    ) -> dict:
        if not plantillas_disponibles:
            return {
                'plantillas_recomendadas': [],
                'total_evaluadas': 0,
                'total_seguras': 0,
                'confianza': 0.0,
                'explicacion': 'No hay plantillas disponibles del entrenador.',
                'metadata': {},
            }

        historial_map = self._construir_historial_map(historial) if historial else {}

        ids_pool_seguro = {ej['id'] for ej in pool_seguro}
        ejercicios_por_id = {ej['id']: ej for ej in pool_seguro}

        objetivo_cliente = self._normalizar_objetivo(datos_cliente)
        nivel_cliente = DIFICULTAD_ORDEN.get(
            datos_cliente.get('nivel_experiencia')
            or datos_cliente.get('nivel_actividad', 'moderado'),
            2,
        )
        dias_disponibles = max(2, min(datos_cliente.get('dias_disponibles', 3), 6))
        lesiones_cliente = (perfil_medico or {}).get('lesiones', [])

        plantillas_con_score = []

        for plantilla in plantillas_disponibles:
            resultado = self._evaluar_plantilla(
                plantilla, ids_pool_seguro, ejercicios_por_id,
                objetivo_cliente, nivel_cliente, dias_disponibles,
                historial_map, datos_cliente, lesiones_cliente,
            )
            if resultado is not None:
                plantillas_con_score.append(resultado)

        plantillas_con_score.sort(key=lambda p: p['score'], reverse=True)
        recomendaciones = plantillas_con_score[:MAX_RECOMENDACIONES]

        total_seguras = sum(
            1 for p in plantillas_con_score if p['ejercicios_bloqueados_count'] == 0
        )

        explicacion = self._generar_explicacion_recomendaciones(
            len(plantillas_disponibles), len(recomendaciones), total_seguras, datos_cliente
        )

        confianza = self._calcular_confianza(
            len(plantillas_disponibles), total_seguras, datos_cliente, historial
        )

        return {
            'plantillas_recomendadas': recomendaciones,
            'total_evaluadas': len(plantillas_disponibles),
            'total_seguras': total_seguras,
            'confianza': confianza,
            'explicacion': explicacion,
            'metadata': {
                'pool_seguro_ejercicios': len(pool_seguro),
                'pesos_scoring': dict(self.weights),
            },
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
        from models.rules.injury_rules import detectar_grupo_lesion

        for texto_lesion in lesiones_cliente:
            grupos_cliente = detectar_grupo_lesion(texto_lesion)
            for grupo in grupos_cliente:
                if grupo in contraindicaciones_zonas:
                    return True
        return False

    def _evaluar_plantilla(
        self, plantilla: dict, ids_pool_seguro: set,
        ejercicios_por_id: dict, objetivo_cliente: str,
        nivel_cliente: int, dias_disponibles: int,
        historial_map: dict, datos_cliente: dict,
        lesiones_cliente: list = None,
    ) -> dict:
        ejercicios_raw = plantilla.get('ejercicios')
        if not ejercicios_raw:
            return None

        if isinstance(ejercicios_raw, str):
            try:
                ejercicios_lista = json.loads(ejercicios_raw)
            except (json.JSONDecodeError, TypeError):
                return None
        elif isinstance(ejercicios_raw, list):
            ejercicios_lista = ejercicios_raw
        else:
            return None

        if not ejercicios_lista:
            return None

        ejercicios_seguros = []
        ejercicios_precaucion = []
        ejercicios_bloqueados = []

        for ej in ejercicios_lista:
            ej_id = ej.get('ejercicio_id') or ej.get('id')
            if ej_id is None:
                continue

            if ej_id in ids_pool_seguro:
                ej_info = ejercicios_por_id.get(ej_id, {})
                contraindicaciones = self._parsear_contraindicaciones(
                    ej_info.get('contraindica_lesiones')
                )
                tiene_restriccion_relevante = (
                    contraindicaciones
                    and lesiones_cliente
                    and self._coincide_con_lesiones(contraindicaciones, lesiones_cliente)
                )
                if tiene_restriccion_relevante:
                    ejercicios_precaucion.append(ej_id)
                else:
                    ejercicios_seguros.append(ej_id)
            else:
                ejercicios_bloqueados.append(ej_id)

        total_ejercicios = len(ejercicios_lista)
        if total_ejercicios == 0:
            return None

        ratio_seguros = len(ejercicios_seguros) / total_ejercicios

        if ratio_seguros < 0.5:
            return None

        score_objetivo = self._score_objetivo_plantilla(plantilla, objetivo_cliente)
        score_nivel = self._score_nivel_plantilla(plantilla, nivel_cliente)
        score_dias = self._score_dias_plantilla(plantilla, dias_disponibles)
        score_progresion = self._score_progresion_plantilla(ejercicios_lista, historial_map)
        score_seguridad = self._score_seguridad_plantilla(
            ratio_seguros, len(ejercicios_precaucion), len(ejercicios_bloqueados)
        )

        score_total = (
            score_objetivo + score_nivel + score_dias
            + score_progresion + score_seguridad
        )

        explicacion = self._explicar_plantilla(
            plantilla, objetivo_cliente, nivel_cliente, dias_disponibles,
            len(ejercicios_bloqueados), len(ejercicios_precaucion),
        )

        return {
            'plantilla_id': plantilla.get('id'),
            'nombre': plantilla.get('nombre', 'Sin nombre'),
            'score': round(score_total, 3),
            'explicacion': explicacion,
            'ejercicios_totales': total_ejercicios,
            'ejercicios_seguros': len(ejercicios_seguros),
            'ejercicios_con_precaucion': len(ejercicios_precaucion),
            'ejercicios_bloqueados_count': len(ejercicios_bloqueados),
            'ejercicios_bloqueados': ejercicios_bloqueados,
            'dias_semana': plantilla.get('frecuencia_semanal'),
            'frecuencia_semanal': plantilla.get('frecuencia_semanal'),
            'tipo': plantilla.get('tipo'),
            'nivel_dificultad': plantilla.get('nivel_dificultad'),
            'objetivo': plantilla.get('objetivo'),
        }

    def _normalizar_objetivo(self, datos_cliente: dict) -> str:
        proposito_bruto = (datos_cliente.get('proposito') or 'mantenimiento').strip().lower()
        return MAPEO_PROPOSITO_TEXTO.get(proposito_bruto, proposito_bruto)

    def _score_objetivo_plantilla(self, plantilla: dict, objetivo_cliente: str) -> float:
        objetivo_plantilla = (plantilla.get('objetivo') or '').strip().lower()
        if not objetivo_plantilla:
            return self.weights['objetivo'] * 0.3
        if objetivo_plantilla == objetivo_cliente:
            return self.weights['objetivo']
        compatibilidad = self._compatibilidad_objetivos(objetivo_cliente, objetivo_plantilla)
        return self.weights['objetivo'] * compatibilidad

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
        nivel_plantilla = DIFICULTAD_ORDEN.get(
            (plantilla.get('nivel_dificultad') or 'intermedio').strip().lower(), 2
        )
        diferencia = abs(nivel_cliente - nivel_plantilla)
        return max(0, (3 - diferencia)) * (self.weights['nivel'] / 3)

    def _score_dias_plantilla(self, plantilla: dict, dias_disponibles: int) -> float:
        frecuencia = plantilla.get('frecuencia_semanal')
        if not frecuencia:
            return self.weights['dias'] * 0.3
        try:
            frecuencia = int(frecuencia)
        except (ValueError, TypeError):
            return self.weights['dias'] * 0.3

        diferencia = abs(frecuencia - dias_disponibles)
        if diferencia == 0:
            return self.weights['dias']
        if diferencia == 1:
            return self.weights['dias'] * 0.7
        if diferencia == 2:
            return self.weights['dias'] * 0.4
        return self.weights['dias'] * 0.1

    def _score_progresion_plantilla(self, ejercicios: list, historial_map: dict) -> float:
        if not historial_map:
            return self.weights['progresion'] * 0.5

        total_ej = 0
        suma_penalty = 0.0

        for ej in ejercicios:
            ej_id = ej.get('ejercicio_id') or ej.get('id')
            if ej_id is None:
                continue
            total_ej += 1
            hist = historial_map.get(ej_id, {})
            veces = hist.get('veces', 0)
            if veces > 8:
                suma_penalty += 0.2
            elif veces > 4:
                suma_penalty += 0.8
            else:
                suma_penalty += 1.0

        if total_ej == 0:
            return self.weights['progresion'] * 0.5

        return self.weights['progresion'] * (suma_penalty / total_ej)

    def _score_seguridad_plantilla(
        self, ratio_seguros: float, precaucion_count: int, bloqueados_count: int
    ) -> float:
        score = self.weights['seguridad'] * ratio_seguros
        if bloqueados_count > 0:
            score *= 0.5
        elif precaucion_count > 0:
            score *= 0.8
        return score

    def _explicar_plantilla(
        self, plantilla: dict, objetivo_cliente: str, nivel_cliente: int,
        dias_disponibles: int, bloqueados: int, precaucion: int,
    ) -> str:
        partes = []
        objetivo_p = (plantilla.get('objetivo') or 'no especificado').replace('_', ' ')
        if (plantilla.get('objetivo') or '').strip().lower() == objetivo_cliente:
            partes.append(f"Objetivo '{objetivo_p}' coincide con el del cliente")
        else:
            partes.append(f"Objetivo '{objetivo_p}' (parcialmente compatible)")

        nivel_p = (plantilla.get('nivel_dificultad') or 'intermedio')
        partes.append(f"Nivel: {nivel_p}")

        frecuencia = plantilla.get('frecuencia_semanal')
        if frecuencia:
            partes.append(f"Frecuencia: {frecuencia} días/semana (disponibles: {dias_disponibles})")

        if bloqueados > 0:
            partes.append(f"{bloqueados} ejercicio(s) bloqueado(s) por restricciones médicas")
        elif precaucion > 0:
            partes.append(f"{precaucion} ejercicio(s) con precaución médica")
        else:
            partes.append("Todos los ejercicios son seguros para este cliente")

        return '. '.join(partes) + '.'

    def _construir_historial_map(self, historial: list) -> dict:
        mapa = defaultdict(lambda: {'veces': 0, 'carga_promedio': 0, 'ultima_fecha': None})
        for registro in historial:
            ejercicios_realizados = registro.get('ejercicios_realizados', [])
            if isinstance(ejercicios_realizados, str):
                try:
                    ejercicios_realizados = json.loads(ejercicios_realizados)
                except (json.JSONDecodeError, TypeError):
                    ejercicios_realizados = []

            for ej in ejercicios_realizados:
                ej_id = ej.get('ejercicio_id')
                if ej_id:
                    mapa[ej_id]['veces'] += 1
                    carga = ej.get('carga_kg', 0)
                    if carga:
                        mapa[ej_id]['carga_promedio'] = (
                            (mapa[ej_id]['carga_promedio'] * (mapa[ej_id]['veces'] - 1) + carga)
                            / mapa[ej_id]['veces']
                        )
                    mapa[ej_id]['ultima_fecha'] = registro.get('fecha')
        return dict(mapa)

    def _generar_explicacion_recomendaciones(
        self, total_evaluadas: int, total_recomendadas: int,
        total_seguras: int, datos_cliente: dict,
    ) -> str:
        nivel = datos_cliente.get('nivel_experiencia') or datos_cliente.get('nivel_actividad', 'moderado')
        dias = datos_cliente.get('dias_disponibles', 3)
        return (
            f"Se evaluaron {total_evaluadas} plantillas del entrenador. "
            f"{total_seguras} son completamente seguras para este perfil. "
            f"Se recomiendan las {total_recomendadas} mejores opciones "
            f"para nivel {nivel} con {dias} días/semana disponibles."
        )

    def _calcular_confianza(
        self, total_plantillas: int, total_seguras: int,
        datos_cliente: dict, historial: list,
    ) -> float:
        confianza_base = 0.4

        if total_plantillas >= 5:
            confianza_base += 0.15
        elif total_plantillas >= 3:
            confianza_base += 0.10
        elif total_plantillas >= 1:
            confianza_base += 0.05

        if total_seguras > 0:
            ratio = total_seguras / total_plantillas
            confianza_base += ratio * 0.15

        if datos_cliente.get('nivel_experiencia'):
            confianza_base += 0.05

        if datos_cliente.get('nivel_actividad'):
            confianza_base += 0.05

        if historial and len(historial) >= 4:
            confianza_base += 0.10
        elif historial and len(historial) >= 2:
            confianza_base += 0.05

        return round(min(confianza_base, 0.95), 2)
