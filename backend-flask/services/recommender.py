import random
import logging
from collections import defaultdict
from config.constants import (
    MAPEO_OBJETIVO_CONFIG,
    MAPEO_PROPOSITO_TEXTO,
    DIFICULTAD_ORDEN,
    GRUPOS_MUSCULARES,
    PESOS_BASE_SCORING,
)

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

    def generar_rutina(
        self,
        datos_cliente: dict,
        pool_seguro: list,
        historial: list = None,
        plantillas_existentes: list = None,
    ) -> dict:
        proposito_bruto = (datos_cliente.get('proposito') or 'mantenimiento').strip().lower()
        objetivo = MAPEO_PROPOSITO_TEXTO.get(proposito_bruto, proposito_bruto)
        nivel = datos_cliente.get('nivel_experiencia') or datos_cliente.get('nivel_actividad', 'moderado')
        dias = datos_cliente.get('dias_disponibles', 3)
        edad = datos_cliente.get('edad', 30)

        config_obj = MAPEO_OBJETIVO_CONFIG.get(
            objetivo,
            MAPEO_OBJETIVO_CONFIG['mantenimiento']
        )

        dias = max(2, min(dias, 6))
        distribucion = config_obj['distribucion_dias'].get(
            dias,
            config_obj['distribucion_dias'].get(3, ['full_body'] * 3)
        )

        pool_ordenado = self._ordenar_pool_por_nivel(pool_seguro, nivel)

        historial_map = self._construir_historial_map(historial) if historial else {}

        rutina_dias = {}
        ejercicios_usados_global = set()

        for dia_idx, tipo_dia in enumerate(distribucion, 1):
            ejercicios_dia = self._seleccionar_ejercicios_dia(
                tipo_dia,
                pool_ordenado,
                config_obj,
                datos_cliente,
                historial_map,
                ejercicios_usados_global,
            )

            ejercicios_con_params = self._asignar_parametros(
                ejercicios_dia,
                config_obj,
                datos_cliente,
                historial_map,
            )

            rutina_dias[dia_idx] = {
                'dia': dia_idx,
                'tipo': tipo_dia,
                'ejercicios': ejercicios_con_params,
                'total_ejercicios': len(ejercicios_con_params),
            }

            for ej in ejercicios_dia:
                ejercicios_usados_global.add(ej['id'])

        explicacion = self._generar_explicacion(
            objetivo, nivel, dias, len(pool_seguro), distribucion
        )

        confianza = self._calcular_confianza(
            len(pool_seguro), datos_cliente, historial
        )

        return {
            'rutina_sugerida': {
                'nombre': f'Rutina IA - {objetivo.replace("_", " ").title()}',
                'tipo': self._mapear_tipo_rutina(objetivo),
                'dias_semana': dias,
                'distribucion_dias': distribucion,
                'configuracion_objetivo': {
                    'rango_repeticiones': config_obj['rango_repeticiones'],
                    'series_por_ejercicio': config_obj['series_por_ejercicio'],
                    'descanso_segundos': config_obj['descanso_segundos'],
                },
                'dias': rutina_dias,
            },
            'confianza': confianza,
            'explicacion': explicacion,
            'metadata': {
                'pool_disponible': len(pool_seguro),
                'ejercicios_total_usados': len(ejercicios_usados_global),
                'distribucion': distribucion,
            },
        }

    def _ordenar_pool_por_nivel(self, pool: list, nivel_cliente: str) -> list:
        nivel_objetivo = DIFICULTAD_ORDEN.get(nivel_cliente, 2)
        pool_ordenado = sorted(
            pool,
            key=lambda e: abs(
                DIFICULTAD_ORDEN.get(e.get('dificultad', 'intermedio'), 2) - nivel_objetivo
            ),
        )
        return pool_ordenado

    def _construir_historial_map(self, historial: list) -> dict:
        mapa = defaultdict(lambda: {'veces': 0, 'carga_promedio': 0, 'ultima_fecha': None})
        for registro in historial:
            ejercicios_realizados = registro.get('ejercicios_realizados', [])
            if isinstance(ejercicios_realizados, str):
                import json
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

    def _seleccionar_ejercicios_dia(
        self,
        tipo_dia: str,
        pool: list,
        config_obj: dict,
        datos_cliente: dict,
        historial_map: dict,
        ejercicios_usados: set,
    ) -> list:
        target_grupos = self._obtener_grupos_por_tipo(tipo_dia)
        candidatos = [
            ej for ej in pool
            if ej.get('grupo_muscular') in target_grupos
            and ej['id'] not in ejercicios_usados
        ]

        if len(candidatos) < 3:
            candidatos = [
                ej for ej in pool
                if ej['id'] not in ejercicios_usados
            ]

        scored = []
        for ej in candidatos:
            score = self._score_inicial(
                ej, config_obj, datos_cliente, historial_map
            )
            scored.append((ej, score))

        max_ejercicios = min(6, len(scored))
        conteo_grupos = defaultdict(int)
        seleccionados = []
        disponibles = list(candidatos)

        while len(seleccionados) < max_ejercicios and disponibles:
            mejor_ej = None
            mejor_score = None
            for ej in disponibles:
                score = self._score_ejercicio(
                    ej, config_obj, datos_cliente, historial_map,
                    ejercicios_usados, conteo_grupos,
                )
                if mejor_score is None or score > mejor_score:
                    mejor_ej, mejor_score = ej, score
            seleccionados.append(mejor_ej)
            conteo_grupos[mejor_ej.get('grupo_muscular') or ''] += 1
            disponibles.remove(mejor_ej)

        if len(seleccionados) < 3:
            restantes = random.sample(
                disponibles, min(3 - len(seleccionados), len(disponibles))
            )
            seleccionados.extend(restantes)

        return seleccionados

    def _score_inicial(
        self,
        ejercicio: dict,
        config_obj: dict,
        datos_cliente: dict,
        historial_map: dict,
    ) -> float:
        return (
            self._score_objetivo(ejercicio, config_obj)
            + self._score_nivel(ejercicio, datos_cliente)
            + self._score_progresion(ejercicio, historial_map)
            + self._score_equipo(ejercicio, datos_cliente)
        )

    def _score_ejercicio(
        self,
        ejercicio: dict,
        config_obj: dict,
        datos_cliente: dict,
        historial_map: dict,
        ejercicios_usados: set,
        conteo_grupos: dict,
    ) -> float:
        score = 0.0

        score += self._score_objetivo(ejercicio, config_obj)
        score += self._score_nivel(ejercicio, datos_cliente)
        score += self._score_balance_grupal(ejercicio, conteo_grupos)
        score += self._score_progresion(ejercicio, historial_map)
        score += self._score_diversidad(ejercicio, ejercicios_usados)
        score += self._score_equipo(ejercicio, datos_cliente)

        return score

    def _score_objetivo(self, ejercicio: dict, config_obj: dict) -> float:
        nombre = ejercicio.get('nombre', '').lower()
        grupo = (ejercicio.get('grupo_muscular') or '').lower()

        peso = 0.0
        es_compuesto = any(g in grupo for g in ['piernas', 'pecho', 'espalda', 'hombros'])
        es_isolation = any(g in grupo for g in ['brazos', 'gemelos', 'abdominales'])

        if es_compuesto:
            peso = config_obj.get('peso_fuerza', 2) * 0.5
        elif es_isolation:
            peso = config_obj.get('peso_volumen', 2) * 0.3
        else:
            peso = config_obj.get('peso_cardio', 2) * 0.4

        return peso

    def _score_nivel(self, ejercicio: dict, datos_cliente: dict) -> float:
        nivel_cliente = DIFICULTAD_ORDEN.get(
            datos_cliente.get('nivel_experiencia') or datos_cliente.get('nivel_actividad', 'moderado'), 2
        )
        nivel_ejercicio = DIFICULTAD_ORDEN.get(
            ejercicio.get('dificultad', 'intermedio'), 2
        )
        diferencia = abs(nivel_cliente - nivel_ejercicio)
        return max(0, (3 - diferencia)) * (self.weights['nivel'] / 3)

    def _score_balance_grupal(self, ejercicio: dict, conteo_grupos: dict) -> float:
        grupo = ejercicio.get('grupo_muscular', '')
        count_grupo = conteo_grupos.get(grupo, 0)
        if count_grupo < 2:
            return self.weights['balance_grupal']
        return self.weights['balance_grupal'] * 0.3

    def _score_progresion(self, ejercicio: dict, historial_map: dict) -> float:
        ej_id = ejercicio.get('id')
        if ej_id not in historial_map:
            return self.weights['progresion'] * 0.5
        historial = historial_map[ej_id]
        if historial['veces'] > 8:
            return self.weights['progresion'] * 0.2
        if historial['veces'] > 4:
            return self.weights['progresion'] * 0.8
        return self.weights['progresion'] * 1.0

    def _score_diversidad(self, ejercicio: dict, usados: set) -> float:
        if ejercicio.get('id') in usados:
            return 0.0
        return self.weights['diversidad']

    def _score_equipo(self, ejercicio: dict, datos_cliente: dict) -> float:
        equipo = datos_cliente.get('preferencias', {}).get('equipamiento_disponible', [])
        if not equipo:
            return self.weights['equipo'] * 0.5
        equipo_necesario = (ejercicio.get('equipo_necesario') or '').lower()
        for eq in equipo:
            if eq.lower() in equipo_necesario:
                return self.weights['equipo']
        return self.weights['equipo'] * 0.3

    def _asignar_parametros(
        self,
        ejercicios: list,
        config_obj: dict,
        datos_cliente: dict,
        historial_map: dict,
    ) -> list:
        rango_rep = config_obj['rango_repeticiones']
        rango_series = config_obj['series_por_ejercicio']
        rango_descanso = config_obj['descanso_segundos']

        resultado = []
        for idx, ej in enumerate(ejercicios):
            ej_id = ej.get('id')
            hist = historial_map.get(ej_id, {})

            rep_base = random.randint(rango_rep[0], rango_rep[1])
            series_base = random.randint(rango_series[0], rango_series[1])
            descanso = random.randint(rango_descanso[0], rango_descanso[1])

            carga = None
            if hist.get('carga_promedio'):
                carga = round(hist['carga_promedio'] * 1.02, 1)

            resultado.append({
                'ejercicio_id': ej_id,
                'nombre': ej.get('nombre'),
                'grupo_muscular': ej.get('grupo_muscular'),
                'target': ej.get('target'),
                'dificultad': ej.get('dificultad'),
                'orden': idx + 1,
                'series': series_base,
                'repeticiones': rep_base,
                'carga_kg': carga,
                'descanso_segundos': descanso,
                'notas': '',
                'equipo_necesario': ej.get('equipo_necesario'),
                'imagen_url': ej.get('imagen_url'),
                'gif_url': ej.get('gif_url'),
            })

        return resultado

    def _obtener_grupos_por_tipo(self, tipo_dia: str) -> list:
        mapeo = {
            'full_body': GRUPOS_MUSCULARES,
            'tren_superior': ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Trapecios'],
            'tren_inferior': ['Piernas', 'Isquiotibiales', 'Cuadriceps', 'Gluteos', 'Gemelos', 'Core'],
            'push': ['Pecho', 'Hombros', 'Brazos'],
            'pull': ['Espalda', 'Trapecios', 'Brazos'],
            'piernas': ['Piernas', 'Isquiotibiales', 'Cuadriceps', 'Gluteos', 'Gemelos'],
            'cardio': ['Core', 'Abdominales'],
            'cardio_core': ['Core', 'Abdominales'],
            'pecho_triceps': ['Pecho', 'Brazos'],
            'espalda_biceps': ['Espalda', 'Brazos'],
            'pecho_hombro': ['Pecho', 'Hombros'],
            'brazos': ['Brazos'],
            'fuerza_tren_sup': ['Pecho', 'Espalda', 'Hombros'],
            'fuerza_tren_inf': ['Piernas', 'Gluteos'],
            'potencia': ['Piernas', 'Pecho', 'Core'],
            'resistencia': ['Core', 'Piernas'],
            'movilidad': ['Core', 'Piernas'],
            'fuerza_suave': ['Pecho', 'Espalda'],
            'movilidad_fuerza': ['Pecho', 'Piernas', 'Core'],
            'movilidad_cardio': ['Core', 'Piernas'],
            'fuerza_upper': ['Pecho', 'Espalda', 'Hombros'],
            'fuerza_lower': ['Piernas', 'Gluteos'],
            'fuerza_push': ['Pecho', 'Hombros'],
            'fuerza_pull': ['Espalda'],
            'fuerza_piernas': ['Piernas'],
            'cardio_suave': ['Core'],
        }
        return mapeo.get(tipo_dia, GRUPOS_MUSCULARES)

    def _mapear_tipo_rutina(self, objetivo: str) -> str:
        mapeo = {
            'perdida_peso': 'hipertrofia',
            'ganancia_muscular': 'hipertrofia',
            'mantenimiento': 'fuerza',
            'rendimiento': 'fuerza',
            'rehabilitacion': 'funcional',
        }
        return mapeo.get(objetivo, 'fuerza')

    def _generar_explicacion(
        self, objetivo: str, nivel: str, dias: int, pool_total: int, distribucion: list
    ) -> str:
        obj_texto = objetivo.replace('_', ' ')
        dist_texto = ', '.join(distribucion[:dias])
        return (
            f"Rutina generada para objetivo '{objetivo}' con {dias} días/semana. "
            f"Distribución: {dist_texto}. "
            f"Pool de ejercicios seguros evaluados: {pool_total}. "
            f"Nivel de actividad: {nivel}."
        )

    def _calcular_confianza(
        self, pool_seguro: int, datos_cliente: dict, historial: list
    ) -> float:
        confianza_base = 0.5

        if pool_seguro >= 15:
            confianza_base += 0.15
        elif pool_seguro >= 8:
            confianza_base += 0.10
        elif pool_seguro >= 4:
            confianza_base += 0.05

        if datos_cliente.get('edad'):
            confianza_base += 0.05

        if datos_cliente.get('nivel_actividad'):
            confianza_base += 0.05

        if datos_cliente.get('nivel_experiencia'):
            confianza_base += 0.05

        if historial and len(historial) >= 4:
            confianza_base += 0.10
        elif historial and len(historial) >= 2:
            confianza_base += 0.05

        return round(min(confianza_base, 0.95), 2)
