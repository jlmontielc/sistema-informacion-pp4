from config.constants import NivelRiesgo
from models.rules.injury_rules import evaluar_ejercicio_por_lesiones
from models.rules.condition_rules import (
    evaluar_ejercicio_por_condiciones,
    obtener_precauciones_cliente,
)
from models.rules.load_rules import validar_carga_ejercicio


class GuardianSeguridad:

    def __init__(self):
        self.alertas_global = []
        self.ejercicios_bloqueados = []
        self.ejercicios_con_precaucion = []

    def evaluar_cliente_completo(self, datos_cliente: dict, perfil_medico: dict) -> dict:
        self.alertas_global = []
        self.ejercicios_bloqueados = []
        self.ejercicios_con_precaucion = []

        lesiones = perfil_medico.get('lesiones', []) if perfil_medico else []
        condiciones = perfil_medico.get('condiciones_preexistentes', []) if perfil_medico else []

        return {
            'lesiones_detectadas': lesiones,
            'condiciones_detectadas': condiciones,
            'precauciones': obtener_precauciones_cliente(condiciones),
            'nivel_riesgo_global': self._calcular_nivel_global(lesiones, condiciones),
        }

    def validar_ejercicio(
        self,
        ejercicio: dict,
        datos_cliente: dict,
        perfil_medico: dict,
        carga_kg: float = None,
    ) -> dict:
        lesiones = perfil_medico.get('lesiones', []) if perfil_medico else []
        condiciones = perfil_medico.get('condiciones_preexistentes', []) if perfil_medico else []

        resultado_lesiones = evaluar_ejercicio_por_lesiones(
            ejercicio['nombre'], lesiones
        )

        resultado_condiciones = evaluar_ejercicio_por_condiciones(
            ejercicio['nombre'], condiciones, datos_cliente.get('nivel_actividad')
        )

        resultado_carga = None
        if carga_kg and carga_kg > 0:
            resultado_carga = validar_carga_ejercicio(
                carga_kg,
                datos_cliente['peso'],
                datos_cliente['altura'],
                datos_cliente['edad'],
                datos_cliente.get('nivel_actividad', 'moderado'),
            )

        nivel_maximo = self._determinar_nivel_maximo(
            resultado_lesiones['nivel_maximo'],
            resultado_condiciones['nivel_maximo'],
            resultado_carga['nivel_riesgo'] if resultado_carga else NivelRiesgo.SAFE,
        )

        bloqueado = (
            resultado_lesiones['bloqueado']
            or resultado_condiciones['bloqueado']
            or (resultado_carga and resultado_carga['nivel_riesgo'] == NivelRiesgo.CRITICAL)
        )

        todas_alertas = (
            resultado_lesiones['alertas']
            + resultado_condiciones['alertas']
        )
        if resultado_carga and resultado_carga['nivel_riesgo'] != NivelRiesgo.SAFE:
            todas_alertas.append({
                'tipo': 'carga',
                'nivel_riesgo': resultado_carga['nivel_riesgo'].value,
                'mensaje': resultado_carga['mensaje'],
            })

        modificacion = resultado_lesiones.get('modificacion_sugerida')

        resultado = {
            'ejercicio_id': ejercicio.get('id'),
            'ejercicio_nombre': ejercicio['nombre'],
            'nivel_riesgo': nivel_maximo.value,
            'bloqueado': bloqueado,
            'alertas': todas_alertas,
            'modificacion_sugerida': modificacion,
            'intensidad_permitida': resultado_condiciones.get('intensidad_permitida', 1.0),
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

        for ejercicio in ejercicios:
            resultado = self.validar_ejercicio(
                ejercicio, datos_cliente, perfil_medico
            )
            if resultado['bloqueado']:
                bloqueados.append({
                    'ejercicio': ejercicio,
                    'razon': resultado,
                })
            elif resultado['nivel_riesgo'] != NivelRiesgo.SAFE.value:
                precaucion.append({
                    'ejercicio': ejercicio,
                    'razon': resultado,
                })
                seguros.append(ejercicio)
            else:
                seguros.append(ejercicio)

        return {
            'pool_seguro': seguros,
            'ejercicios_bloqueados': bloqueados,
            'ejercicios_precaucion': precaucion,
            'total_evaluados': len(ejercicios),
            'total_seguros': len(seguros),
            'total_bloqueados': len(bloqueados),
            'total_precaucion': len(precaucion),
            'alertas_globales': self.alertas_global,
        }

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
