from config.constants import NivelRiesgo
from models.rules.injury_rules import evaluar_ejercicio_por_lesiones
from models.rules.condition_rules import (
    evaluar_ejercicio_por_condiciones,
    obtener_precauciones_cliente,
)
from models.rules.load_rules import validar_carga_ejercicio
from utils.texto_utils import normalizar_texto, es_valor_vacio_medico


class GuardianSeguridad:

    def __init__(self):
        self.alertas_global = []
        self.ejercicios_bloqueados = []
        self.ejercicios_con_precaucion = []

    def evaluar_cliente_completo(self, datos_cliente: dict, perfil_medico: dict) -> dict:
        self.alertas_global = []
        self.ejercicios_bloqueados = []
        self.ejercicios_con_precaucion = []

        lesiones = self._limpiar_lista_strings(
            perfil_medico.get('lesiones', []) if perfil_medico else []
        )
        condiciones = self._limpiar_lista_strings(
            perfil_medico.get('condicionesPreexistentes', []) if perfil_medico else []
        )

        return {
            'lesionesDetectadas': lesiones,
            'condicionesDetectadas': condiciones,
            'precauciones': obtener_precauciones_cliente(condiciones),
            'nivelRiesgoGlobal': self._calcular_nivel_global(lesiones, condiciones),
            'sin_lesiones': self.calcular_flag_sin_lesiones(perfil_medico),
        }

    def validar_ejercicio(
        self,
        ejercicio: dict,
        datos_cliente: dict,
        perfil_medico: dict,
        carga_kg: float = None,
        omitir_lesiones: bool = False,
    ) -> dict:
        lesiones = self._limpiar_lista_strings(
            perfil_medico.get('lesiones', []) if perfil_medico else []
        )
        condiciones = self._limpiar_lista_strings(
            perfil_medico.get('condicionesPreexistentes', []) if perfil_medico else []
        )

        ejercicio_contexto = {
            'nombre': ejercicio.get('nombre', ''),
            'grupo_muscular': ejercicio.get('grupo_muscular') or ejercicio.get('grupoMuscular', ''),
            'descripcion': ejercicio.get('descripcion') or ejercicio.get('descripcion', ''),
            'equipo_necesario': ejercicio.get('equipo_necesario') or ejercicio.get('equipoNecesario', ''),
            'contraindica_lesiones': ejercicio.get('contraindica_lesiones') or ejercicio.get('contraindicaLesiones', ''),
        }

        if omitir_lesiones:
            resultado_lesiones = {
                'alertas': [],
                'nivelMaximo': NivelRiesgo.SAFE,
                'modificacionSugerida': None,
                'bloqueado': False,
                'motivoRestriccion': None,
            }
        else:
            resultado_lesiones = evaluar_ejercicio_por_lesiones(
                ejercicio_contexto, lesiones
            )

        resultado_condiciones = evaluar_ejercicio_por_condiciones(
            ejercicio_contexto['nombre'], condiciones, datos_cliente.get('nivelActividad')
        )

        resultado_carga = None
        if carga_kg and carga_kg > 0:
            resultado_carga = validar_carga_ejercicio(
                carga_kg,
                datos_cliente['peso'],
                datos_cliente['altura'],
                datos_cliente['edad'],
                datos_cliente.get('nivelActividad', 'moderado'),
            )

        nivel_maximo = self._determinar_nivel_maximo(
            resultado_lesiones['nivelMaximo'],
            resultado_condiciones['nivelMaximo'],
            resultado_carga['nivelRiesgo'] if resultado_carga else NivelRiesgo.SAFE,
        )

        bloqueado = (
            resultado_lesiones['bloqueado']
            or resultado_condiciones['bloqueado']
            or (resultado_carga and resultado_carga['nivelRiesgo'] == NivelRiesgo.CRITICAL)
        )

        todas_alertas = (
            resultado_lesiones['alertas']
            + resultado_condiciones['alertas']
        )
        if resultado_carga and resultado_carga['nivelRiesgo'] != NivelRiesgo.SAFE:
            todas_alertas.append({
                'tipo': 'carga',
                'nivelRiesgo': resultado_carga['nivelRiesgo'].value,
                'mensaje': resultado_carga['mensaje'],
            })

        modificacion = resultado_lesiones.get('modificacionSugerida')

        resultado = {
            'ejercicioId': ejercicio.get('id'),
            'ejercicioNombre': ejercicio['nombre'],
            'nivelRiesgo': nivel_maximo.value,
            'bloqueado': bloqueado,
            'alertas': todas_alertas,
            'modificacionSugerida': modificacion,
            'intensidadPermitida': resultado_condiciones.get('intensidadPermitida', 1.0),
            'motivoRestriccion': resultado_lesiones.get('motivoRestriccion'),
            'sin_lesiones': self.calcular_flag_sin_lesiones(perfil_medico),
        }

        if bloqueado:
            self.ejercicios_bloqueados.append(resultado)
        elif nivel_maximo != NivelRiesgo.SAFE:
            self.ejercicios_con_precaucion.append(resultado)

        self.alertas_global.extend(todas_alertas)

        return resultado

    def filtrar_pool_ejercicios(
        self,
        ejercicios: list,
        datos_cliente: dict,
        perfil_medico: dict,
    ) -> dict:
        seguros = []
        bloqueados = []
        precaucion = []

        sin_lesiones = self.calcular_flag_sin_lesiones(perfil_medico)

        for ejercicio in ejercicios:
            resultado = self.validar_ejercicio(
                ejercicio, datos_cliente, perfil_medico
            )
            if resultado['bloqueado']:
                bloqueados.append({
                    'ejercicio': ejercicio,
                    'razon': resultado,
                })
            elif resultado['nivelRiesgo'] != NivelRiesgo.SAFE.value:
                precaucion.append({
                    'ejercicio': ejercicio,
                    'razon': resultado,
                })
                seguros.append(ejercicio)
            else:
                seguros.append(ejercicio)

        return {
            'poolSeguro': seguros,
            'ejerciciosBloqueados': bloqueados,
            'ejerciciosPrecaucion': precaucion,
            'totalEvaluados': len(ejercicios),
            'totalSeguros': len(seguros),
            'totalBloqueados': len(bloqueados),
            'totalPrecaucion': len(precaucion),
            'alertasGlobales': self.alertas_global,
            'sin_lesiones': sin_lesiones,
        }

    def calcular_flag_sin_lesiones(self, perfil_medico: dict):
        """True si no hay antecedentes medicos, False si hay alguno, None si falta perfil.

        Reconoce tanto el formato de perfil medico de rutinas
        (lesiones, condicionesPreexistentes) como el de dieta
        (condiciones, alergias, intolerancias, medicacion).
        """
        if not isinstance(perfil_medico, dict):
            return None

        claves_relevantes = [
            'lesiones',
            'condicionesPreexistentes', 'condiciones_preexistentes', 'condiciones',
            'alergias', 'intolerancias',
            'medicacion', 'medicacionActual', 'medicacion_actual',
        ]
        if not any(clave in perfil_medico for clave in claves_relevantes):
            return None

        listas = [
            self._limpiar_lista_strings(perfil_medico.get('lesiones', [])),
            self._limpiar_lista_strings(
                perfil_medico.get('condicionesPreexistentes')
                or perfil_medico.get('condiciones_preexistentes')
                or perfil_medico.get('condiciones', [])
            ),
            self._limpiar_lista_strings(perfil_medico.get('alergias', [])),
            self._limpiar_lista_strings(perfil_medico.get('intolerancias', [])),
            self._limpiar_lista_strings(
                perfil_medico.get('medicacion')
                or perfil_medico.get('medicacionActual')
                or perfil_medico.get('medicacion_actual')
                or []
            ),
        ]

        return all(len(lista) == 0 for lista in listas)

    @staticmethod
    def _limpiar_lista_strings(valor) -> list:
        """Normaliza una lista de strings medicos y descarta valores vacios o negativos."""
        if not valor:
            return []
        if isinstance(valor, str):
            try:
                import json
                data = json.loads(valor)
                if isinstance(data, list):
                    items = [str(x) for x in data if x]
                else:
                    items = [str(data)]
            except (json.JSONDecodeError, TypeError):
                items = [x.strip() for x in valor.split(',') if x.strip()]
        elif isinstance(valor, list):
            items = [str(x) for x in valor if x]
        else:
            items = [str(valor)]

        limpios = []
        for item in items:
            if not es_valor_vacio_medico(item):
                limpios.append(item)
        return limpios

    def _determinar_nivel_maximo(self, *niveles) -> NivelRiesgo:
        orden = {
            NivelRiesgo.SAFE: 0,
            NivelRiesgo.LOW: 1,
            NivelRiesgo.MEDIUM: 2,
            NivelRiesgo.HIGH: 3,
            NivelRiesgo.CRITICAL: 4,
        }
        maximo = NivelRiesgo.SAFE
        for nivel in niveles:
            if isinstance(nivel, NivelRiesgo) and orden.get(nivel, 0) > orden.get(maximo, 0):
                maximo = nivel
        return maximo

    def _calcular_nivel_global(self, lesiones: list, condiciones: list) -> str:
        if len(lesiones) >= 3 or len(condiciones) >= 3:
            return NivelRiesgo.HIGH.value
        elif len(lesiones) >= 2 or len(condiciones) >= 2:
            return NivelRiesgo.MEDIUM.value
        elif len(lesiones) >= 1 or len(condiciones) >= 1:
            return NivelRiesgo.LOW.value
        return NivelRiesgo.SAFE.value
