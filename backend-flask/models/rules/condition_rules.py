from config.constants import NivelRiesgo, MAPA_CONDICIONES


def detectar_condicion(texto_condicion: str) -> list:
    texto_lower = texto_condicion.lower()
    condiciones_detectadas = []
    for condicion_key, condicion_data in MAPA_CONDICIONES.items():
        for alias in condicion_data['alias']:
            if alias in texto_lower:
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
    nombre_lower = nombre_ejercicio.lower().strip()
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
                if ej_prohibido.lower() in nombre_lower or nombre_lower in ej_prohibido.lower():
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
