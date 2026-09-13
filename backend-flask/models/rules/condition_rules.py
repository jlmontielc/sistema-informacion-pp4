from config.constants import NivelRiesgo, MAPA_CONDICIONES
from utils.texto_utils import normalizar_texto, texto_contiene_termino


def detectar_condicion(texto_condicion: str) -> list:
    """Detecta las condiciones medicas presentes en el texto.

    Normaliza acentos y mayusculas y busca secuencias exactas de tokens
    para evitar falsos positivos (p. ej. 'tipo 2' no activa 'tipo 1').
    """
    condiciones_detectadas = []
    for condicion_key, condicion_data in MAPA_CONDICIONES.items():
        for alias in condicion_data['alias']:
            if texto_contiene_termino(texto_condicion, alias):
                if condicion_key not in [c['key'] for c in condiciones_detectadas]:
                    condiciones_detectadas.append({
                        'key': condicion_key,
                        'data': condicion_data,
                    })
                break
    return condiciones_detectadas


def evaluar_ejercicio_por_condiciones(
    nombre_ejercicio: str,
    condiciones_cliente: list,
    nivel_actividad: str = None,
) -> dict:
    nombre_norm = normalizar_texto(nombre_ejercicio)
    alertas = []
    nivel_maximo = NivelRiesgo.SAFE
    intensidad_permitida = 1.0
    precauciones = []

    for texto_condicion in condiciones_cliente:
        condiciones = detectar_condicion(texto_condicion)
        for condicion in condiciones:
            key = condicion['key']
            data = condicion['data']

            ejercicios_prohibidos = data.get('ejercicios_prohibidos', [])
            for ej_prohibido in ejercicios_prohibidos:
                if _nombre_coincide(nombre_norm, ej_prohibido):
                    nivel_maximo = NivelRiesgo.CRITICAL
                    alertas.append({
                        'tipo': 'condicion',
                        'condicion': key,
                        'nivelRiesgo': NivelRiesgo.CRITICAL.value,
                        'mensaje': f'Ejercicio prohibido por condición: {key}',
                    })

            intensidad_max = data.get('intensidad_maxima', 1.0)
            if intensidad_max < intensidad_permitida:
                intensidad_permitida = intensidad_max

            if data.get('precaucion'):
                precauciones.append({
                    'condicion': key,
                    'precaucion': data['precaucion'],
                })

    if nivel_maximo == NivelRiesgo.CRITICAL:
        return {
            'alertas': alertas,
            'nivelMaximo': nivel_maximo,
            'intensidadPermitida': 0.0,
            'precauciones': precauciones,
            'bloqueado': True,
        }

    nivel_ajustado = _ajustar_nivel_por_intensidad(intensidad_permitida)

    if nivel_ajustado != NivelRiesgo.SAFE:
        alertas.append({
            'tipo': 'condicion_intensidad',
            'nivelRiesgo': nivel_ajustado.value,
            'mensaje': f'Intensidad limitada al {intensidad_permitida*100:.0f}% por condiciones médicas',
        })

    return {
        'alertas': alertas,
        'nivelMaximo': nivel_maximo if nivel_maximo != NivelRiesgo.SAFE else nivel_ajustado,
        'intensidadPermitida': intensidad_permitida,
        'precauciones': precauciones,
        'bloqueado': False,
    }


def _nombre_coincide(nombre_normalizado: str, ejercicio_regla: str) -> bool:
    """Comprueba si el nombre del ejercicio coincide con una regla."""
    regla_norm = normalizar_texto(ejercicio_regla)
    if not regla_norm or not nombre_normalizado:
        return False
    return texto_contiene_termino(nombre_normalizado, regla_norm) or \
           texto_contiene_termino(regla_norm, nombre_normalizado)


def _ajustar_nivel_por_intensidad(intensidad: float) -> NivelRiesgo:
    if intensidad >= 0.85:
        return NivelRiesgo.SAFE
    elif intensidad >= 0.70:
        return NivelRiesgo.LOW
    elif intensidad >= 0.55:
        return NivelRiesgo.MEDIUM
    else:
        return NivelRiesgo.HIGH


def obtener_precauciones_cliente(condiciones_cliente: list) -> list:
    precauciones_totales = []
    for texto_condicion in condiciones_cliente:
        condiciones = detectar_condicion(texto_condicion)
        for condicion in condiciones:
            data = condicion['data']
            if data.get('precaucion'):
                precauciones_totales.append({
                    'condicion': condicion['key'],
                    'precaucion': data['precaucion'],
                })
    return precauciones_totales
