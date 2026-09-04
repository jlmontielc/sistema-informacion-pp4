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
        condiciones = perfil_medico.get('condicionesPreexistentes', []) if perfil_medico else []

        return {
            'lesionesDetectadas': lesiones,
            'condicionesDetectadas': condiciones,
            'precauciones': obtener_precauciones_cliente(condiciones),
            'nivelRiesgoGlobal': self._calcular_nivel_global(lesiones, condiciones),
        }

    def validar_ejercicio(
        self,
        ejercicio: dict,
        datos_cliente: dict,
        perfil_medico: dict,
        carga_kg: float = None,
    ) -> dict:
        lesiones = perfil_medico.get('lesiones', []) if perfil_medico else []
        condiciones = perfil_medico.get('condicionesPreexistentes', []) if perfil_medico else []

        resultado_lesiones = evaluar_ejercicio_por_lesiones(
            ejercicio['nombre'], lesiones
        )

        resultado_condiciones = evaluar_ejercicio_por_condiciones(
            ejercicio['nombre'], condiciones, datos_cliente.get('nivelActividad')
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
