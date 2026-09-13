from config.constants import NivelRiesgo, MAPA_LESIONES
from utils.texto_utils import normalizar_texto, texto_contiene_termino


REGLAS_LESION_EJERCICIO = {
    'rodilla': {
        'prohibidos': {
            'sentadilla': NivelRiesgo.CRITICAL,
            'sentadilla trasera': NivelRiesgo.CRITICAL,
            'prensa de piernas': NivelRiesgo.HIGH,
            'zancadas': NivelRiesgo.HIGH,
            'zancada búlgara': NivelRiesgo.CRITICAL,
            'lunges': NivelRiesgo.HIGH,
            'extensiones de cuádriceps': NivelRiesgo.MEDIUM,
            'curl femoral': NivelRiesgo.MEDIUM,
            'peso muerto rumano': NivelRiesgo.MEDIUM,
            'step ups': NivelRiesgo.HIGH,
            'saltos': NivelRiesgo.CRITICAL,
            'plyometrics': NivelRiesgo.CRITICAL,
        },
        'permitidos_con_precaucion': {
            'elevación de gemelos': NivelRiesgo.LOW,
            'hip thrust': NivelRiesgo.LOW,
            'glute bridge': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'sentadilla': 'Usar sentadilla al cajón o leg press con rango limitado',
            'prensa de piernas': 'Limitar rango a 90°, evitar carga excesiva',
            'zancadas': 'Usar zancada estática sin carga, rango corto',
        },
    },
    'hombro': {
        'prohibidos': {
            'press militar': NivelRiesgo.CRITICAL,
            'press militar con barra': NivelRiesgo.CRITICAL,
            'press de banca': NivelRiesgo.HIGH,
            'press inclinado': NivelRiesgo.HIGH,
            'fondos en paralelas': NivelRiesgo.CRITICAL,
            'remo al cuello': NivelRiesgo.CRITICAL,
            'elevación lateral': NivelRiesgo.MEDIUM,
            'face pull': NivelRiesgo.LOW,
            'aperturas con mancuernas': NivelRiesgo.HIGH,
        },
        'permitidos_con_precaucion': {
            'elevación lateral': NivelRiesgo.MEDIUM,
            'face pull': NivelRiesgo.SAFE,
            'encogimientos': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'press banca': 'Usar press con mancuernas, rango controlado, sin bajar del pecho',
            'elevación lateral': 'Carga ligera, no subir del hombro',
            'press inclinado': 'Press inclinado con mancuernas, rango parcial',
        },
    },
    'espalda_baja': {
        'prohibidos': {
            'peso muerto': NivelRiesgo.CRITICAL,
            'peso muerto rumano': NivelRiesgo.HIGH,
            'peso muerto sumo': NivelRiesgo.CRITICAL,
            'remo con barra': NivelRiesgo.HIGH,
            'sentadilla trasera': NivelRiesgo.HIGH,
            'buenos días': NivelRiesgo.CRITICAL,
            'hiperextensiones': NivelRiesgo.HIGH,
            'giros con carga': NivelRiesgo.CRITICAL,
            'abdominales con carga': NivelRiesgo.HIGH,
        },
        'permitidos_con_precaucion': {
            'remo con mancuerna': NivelRiesgo.MEDIUM,
            'plancha': NivelRiesgo.SAFE,
            'bird dog': NivelRiesgo.SAFE,
            'dead bug': NivelRiesgo.SAFE,
            'pájaro': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'remo con barra': 'Usar remo con mancuerna unilateral, espalda neutra',
            'sentadilla': 'Usar sentadilla al cajón con soporte, evitar inclinación',
            'hiperextensiones': 'Solo con peso corporal y rango controlado',
        },
    },
    'espalda_alta': {
        'prohibidos': {
            'remo con barra': NivelRiesgo.HIGH,
            'remo al cuello': NivelRiesgo.CRITICAL,
            'dominadas': NivelRiesgo.HIGH,
        },
        'permitidos_con_precaucion': {
            'remo con mancuerna': NivelRiesgo.LOW,
            'face pull': NivelRiesgo.SAFE,
            'encogimientos': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'remo con barra': 'Usar remo en polea baja con agarre neutro',
            'dominadas': 'Usar dominadas asistidas o jalón al pecho',
        },
    },
    'codo': {
        'prohibidos': {
            'press francés': NivelRiesgo.CRITICAL,
            'curl de bíceps': NivelRiesgo.HIGH,
            'fondos en paralelas': NivelRiesgo.HIGH,
            'press de banca': NivelRiesgo.MEDIUM,
        },
        'permitidos_con_precaucion': {
            'curl de bíceps': NivelRiesgo.MEDIUM,
            'extensión de tríceps en polea': NivelRiesgo.LOW,
        },
        'modificaciones': {
            'curl de bíceps': 'Usar agarre martillo, carga ligera',
            'press francés': 'Reemplazar por press de tríceps en polea',
        },
    },
    'tobillo': {
        'prohibidos': {
            'saltos': NivelRiesgo.CRITICAL,
            'plyometrics': NivelRiesgo.CRITICAL,
            'elevación de gemelos': NivelRiesgo.HIGH,
            'cardio de alto impacto': NivelRiesgo.CRITICAL,
        },
        'permitidos_con_precaucion': {
            'sentadilla': NivelRiesgo.MEDIUM,
            'elevación de gemelos': NivelRiesgo.MEDIUM,
        },
        'modificaciones': {
            'sentadilla': 'Usar sentadilla con soporte, calzado de estabilidad',
            'elevación de gemelos': 'Solo en máquina, carga progresiva',
        },
    },
    'cuello': {
        'prohibidos': {
            'press de banca': NivelRiesgo.HIGH,
            'press militar': NivelRiesgo.HIGH,
            'dominadas': NivelRiesgo.MEDIUM,
            'encogimientos con carga': NivelRiesgo.CRITICAL,
        },
        'permitidos_con_precaucion': {
            'face pull': NivelRiesgo.SAFE,
            'elevación lateral': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'press banca': 'Evitar inclinación excesiva de cabeza, sin jab',
            'encogimientos': 'Solo peso corporal, rango corto',
        },
    },
    'cadera': {
        'prohibidos': {
            'sentadilla profunda': NivelRiesgo.HIGH,
            'peso muerto': NivelRiesgo.HIGH,
            'zancadas': NivelRiesgo.HIGH,
            'saltos': NivelRiesgo.CRITICAL,
        },
        'permitidos_con_precaucion': {
            'sentadilla': NivelRiesgo.MEDIUM,
            'hip thrust': NivelRiesgo.LOW,
            'glute bridge': NivelRiesgo.SAFE,
        },
        'modificaciones': {
            'sentadilla': 'Rango parcial, sin bajar del paralelo',
            'zancadas': 'Zancada corta sin carga',
        },
    },
    'muneca': {
        'prohibidos': {
            'press de banca': NivelRiesgo.HIGH,
            'fondos en paralelas': NivelRiesgo.HIGH,
            'curl de bíceps': NivelRiesgo.HIGH,
            'press francés': NivelRiesgo.HIGH,
        },
        'permitidos_con_precaucion': {
            'press de banca con mancuernas': NivelRiesgo.MEDIUM,
        },
        'modificaciones': {
            'press banca': 'Usar muñequeras de soporte, agarre neutro',
            'curl de bíceps': 'Usar barra Z, carga ligera',
        },
    },
}


# Señales débiles: grupo muscular o equipo fuertemente asociado a una lesion.
MAPEO_GRUPO_MUSCULAR_LESION = {
    'piernas': ('rodilla', 'cadera', 'tobillo'),
    'cuadriceps': ('rodilla', 'cadera'),
    'isquiotibiales': ('rodilla', 'cadera'),
    'gluteos': ('cadera', 'espalda_baja'),
    'core': ('espalda_baja', 'espalda_alta', 'cuello'),
    'abdomen': ('espalda_baja', 'cuello'),
    'espalda baja': ('espalda_baja',),
    'espalda': ('espalda_baja', 'espalda_alta', 'cuello'),
    'hombro': ('hombro',),
    'pecho': ('hombro',),
    'brazos': ('codo', 'muneca', 'hombro'),
    'antebrazo': ('codo', 'muneca'),
    'cuello': ('cuello',),
    'muñeca': ('muneca',),
}

MAPEO_EQUIPO_LESION = {
    'barra': ('espalda_baja', 'hombro', 'rodilla', 'cadera'),
    'mancuerna': ('hombro', 'muneca'),
    'kettlebell': ('espalda_baja', 'hombro'),
    'polea': ('hombro', 'codo'),
    'maquina': ('rodilla', 'cadera'),
    'cuerda': ('tobillo', 'rodilla'),
    'banda elastica': ('hombro', 'codo'),
    'balon': ('espalda_baja', 'cadera'),
}


def detectar_grupo_lesion(texto_lesion: str) -> list:
    """Detecta los grupos anatomicos de lesion presentes en el texto.

    Normaliza el texto y busca secuencias exactas de tokens (incluyendo
    bigramas y frases mas largas) para evitar falsos positivos.
    """
    grupos_detectados = []
    for grupo, alias_list in MAPA_LESIONES.items():
        for alias in alias_list:
            if texto_contiene_termino(texto_lesion, alias):
                if grupo not in grupos_detectados:
                    grupos_detectados.append(grupo)
                break
    return grupos_detectados


def evaluar_ejercicio_por_lesiones(ejercicio, lesiones_cliente: list) -> dict:
    """Evalua un ejercicio contra las lesiones de un cliente.

    Acepta un diccionario con los campos del ejercicio o, para compatibilidad
    legacy, un string con el nombre del ejercicio.
    """
    if isinstance(ejercicio, str):
        ejercicio = {'nombre': ejercicio}

    contexto = {
        'nombre': normalizar_texto(ejercicio.get('nombre', '')),
        'grupo_muscular': normalizar_texto(
            ejercicio.get('grupo_muscular') or ejercicio.get('grupoMuscular', '')
        ),
        'descripcion': normalizar_texto(ejercicio.get('descripcion', '')),
        'equipo_necesario': normalizar_texto(
            ejercicio.get('equipo_necesario') or ejercicio.get('equipoNecesario', '')
        ),
    }

    contraindica_raw = (
        ejercicio.get('contraindica_lesiones')
        or ejercicio.get('contraindicaLesiones', '')
    )
    contraindica = _parsear_contraindicaciones(contraindica_raw)
    contraindica_norm = [normalizar_texto(c) for c in contraindica if c]

    lesiones_cliente = lesiones_cliente or []

    grupos_lesion_cliente = set()
    lesion_representativa_por_grupo = {}
    for texto_lesion in lesiones_cliente:
        for grupo in detectar_grupo_lesion(texto_lesion):
            grupos_lesion_cliente.add(grupo)
            lesion_representativa_por_grupo[grupo] = texto_lesion

    alertas = []
    nivel_maximo = NivelRiesgo.SAFE
    modificacion_sugerida = None
    motivo_restriccion = None

    # 1. Reglas especificas por nombre de ejercicio y grupo de lesion.
    for grupo in grupos_lesion_cliente:
        reglas = REGLAS_LESION_EJERCICIO.get(grupo, {})

        for ejercicio_regla, nivel in reglas.get('prohibidos', {}).items():
            if _nombre_coincide(contexto['nombre'], ejercicio_regla):
                if _orden_riesgo(nivel) > _orden_riesgo(nivel_maximo):
                    nivel_maximo = nivel
                    motivo_restriccion = 'nombre_ejercicio'
                alertas.append({
                    'tipo': 'lesion',
                    'zonaAfectada': grupo,
                    'lesionDetectada': lesion_representativa_por_grupo.get(grupo, ''),
                    'nivelRiesgo': nivel.value,
                    'mensaje': f'Ejercicio contraindicado por lesión en {grupo}',
                })
                modif = reglas.get('modificaciones', {}).get(ejercicio_regla)
                if modif:
                    modificacion_sugerida = modif

        for ejercicio_regla, nivel in reglas.get('permitidos_con_precaucion', {}).items():
            if _nombre_coincide(contexto['nombre'], ejercicio_regla):
                if _orden_riesgo(nivel) > _orden_riesgo(nivel_maximo):
                    nivel_maximo = nivel
                    if not motivo_restriccion:
                        motivo_restriccion = 'nombre_ejercicio'
                alertas.append({
                    'tipo': 'lesion_precaucion',
                    'zonaAfectada': grupo,
                    'lesionDetectada': lesion_representativa_por_grupo.get(grupo, ''),
                    'nivelRiesgo': nivel.value,
                    'mensaje': f'Ejercicio permitido con precaución por lesión en {grupo}',
                })
                modif = reglas.get('modificaciones', {}).get(ejercicio_regla)
                if modif:
                    modificacion_sugerida = modif

    # 2. Contraindicaciones declaradas por el ejercicio.
    grupos_cliente_norm = {normalizar_texto(g) for g in grupos_lesion_cliente}
    for termino in contraindica_norm:
        coincidencias = []
        for texto_lesion in lesiones_cliente:
            if texto_contiene_termino(texto_lesion, termino):
                coincidencias.append(texto_lesion)
                break
        coincide_grupo = termino in grupos_cliente_norm

        if not coincidencias and not coincide_grupo:
            continue

        # Determina el nivel de riesgo a partir del grupo afectado.
        nivel = None
        if coincidencias:
            for grupo in detectar_grupo_lesion(coincidencias[0]):
                nivel = _nivel_para_ejercicio_en_grupo(contexto['nombre'], grupo)
                if nivel:
                    break
        if nivel is None and coincide_grupo:
            for grupo in grupos_lesion_cliente:
                if normalizar_texto(grupo) == termino:
                    nivel = _nivel_para_ejercicio_en_grupo(contexto['nombre'], grupo)
                    if nivel:
                        break
        if nivel is None:
            nivel = NivelRiesgo.HIGH

        if _orden_riesgo(nivel) > _orden_riesgo(nivel_maximo):
            nivel_maximo = nivel
            motivo_restriccion = 'contraindica_lesiones'

        tipo_alerta = (
            'contraindicacion_ejercicio'
            if nivel in (NivelRiesgo.CRITICAL, NivelRiesgo.HIGH)
            else 'lesion_precaucion'
        )
        lesion_detectada = coincidencias[0] if coincidencias else ''
        zona = None
        if lesion_detectada:
            zonas = detectar_grupo_lesion(lesion_detectada)
            zona = zonas[0] if zonas else None
        if zona is None and coincide_grupo:
            for grupo in grupos_lesion_cliente:
                if normalizar_texto(grupo) == termino:
                    zona = grupo
                    break
        if zona is None:
            zona = termino

        alertas.append({
            'tipo': tipo_alerta,
            'zonaAfectada': zona,
            'lesionDetectada': lesion_detectada,
            'nivelRiesgo': nivel.value,
            'mensaje': f'Ejercicio contraindicado por coincidencia con lesión ({termino})',
        })

    # 3. Señales débiles por grupo muscular o equipo.
    for grupo in grupos_lesion_cliente:
        if _grupo_muscular_asociado(contexto['grupo_muscular'], grupo):
            nivel = NivelRiesgo.LOW
            if not _alerta_existente_para_zona(alertas, grupo, nivel):
                if _orden_riesgo(nivel) > _orden_riesgo(nivel_maximo):
                    nivel_maximo = nivel
                    if not motivo_restriccion:
                        motivo_restriccion = 'grupo_muscular'
                alertas.append({
                    'tipo': 'lesion_precaucion',
                    'zonaAfectada': grupo,
                    'lesionDetectada': lesion_representativa_por_grupo.get(grupo, ''),
                    'nivelRiesgo': nivel.value,
                    'mensaje': f'Ejercicio asociado a grupo muscular afectado por lesión en {grupo}',
                })

        if _equipo_asociado(contexto['equipo_necesario'], grupo):
            nivel = NivelRiesgo.MEDIUM
            if not _alerta_existente_para_zona(alertas, grupo, nivel):
                if _orden_riesgo(nivel) > _orden_riesgo(nivel_maximo):
                    nivel_maximo = nivel
                    if not motivo_restriccion:
                        motivo_restriccion = 'equipo_necesario'
                alertas.append({
                    'tipo': 'lesion_precaucion',
                    'zonaAfectada': grupo,
                    'lesionDetectada': lesion_representativa_por_grupo.get(grupo, ''),
                    'nivelRiesgo': nivel.value,
                    'mensaje': f'Ejercicio con equipo asociado a lesión en {grupo}',
                })

    return {
        'alertas': alertas,
        'nivelMaximo': nivel_maximo,
        'modificacionSugerida': modificacion_sugerida,
        'bloqueado': nivel_maximo in (NivelRiesgo.CRITICAL, NivelRiesgo.HIGH),
        'motivoRestriccion': motivo_restriccion,
    }


def _parsear_contraindicaciones(valor_campo) -> list:
    """Convierte el campo contraindicaLesiones a una lista de strings."""
    if not valor_campo:
        return []
    if isinstance(valor_campo, list):
        return [str(v).strip() for v in valor_campo if v]
    if isinstance(valor_campo, str):
        import json
        try:
            data = json.loads(valor_campo)
            if isinstance(data, list):
                return [str(v).strip() for v in data if v]
            return [str(data).strip()]
        except (json.JSONDecodeError, TypeError):
            return [z.strip() for z in valor_campo.split(',') if z.strip()]
    return []


def _nombre_coincide(nombre_normalizado: str, ejercicio_regla: str) -> bool:
    """Comprueba si el nombre normalizado coincide con el de una regla."""
    regla_norm = normalizar_texto(ejercicio_regla)
    if not regla_norm or not nombre_normalizado:
        return False
    return texto_contiene_termino(nombre_normalizado, regla_norm) or \
           texto_contiene_termino(regla_norm, nombre_normalizado)


def _nivel_para_ejercicio_en_grupo(nombre_normalizado: str, grupo: str):
    """Busca el nivel de riesgo de un ejercicio en las reglas de un grupo."""
    reglas = REGLAS_LESION_EJERCICIO.get(grupo, {})
    for ejercicio_regla, nivel in reglas.get('prohibidos', {}).items():
        if _nombre_coincide(nombre_normalizado, ejercicio_regla):
            return nivel
    for ejercicio_regla, nivel in reglas.get('permitidos_con_precaucion', {}).items():
        if _nombre_coincide(nombre_normalizado, ejercicio_regla):
            return nivel
    return None


def _grupo_muscular_asociado(grupo_muscular: str, lesion_grupo: str) -> bool:
    if not grupo_muscular:
        return False
    for clave, grupos in MAPEO_GRUPO_MUSCULAR_LESION.items():
        if lesion_grupo in grupos and texto_contiene_termino(grupo_muscular, clave):
            return True
    return False


def _equipo_asociado(equipo: str, lesion_grupo: str) -> bool:
    if not equipo:
        return False
    for clave, grupos in MAPEO_EQUIPO_LESION.items():
        if lesion_grupo in grupos and texto_contiene_termino(equipo, clave):
            return True
    return False


def _alerta_existente_para_zona(alertas: list, zona: str, nivel_minimo: NivelRiesgo) -> bool:
    """Evita duplicar alertas cuando ya existe una señal mas fuerte."""
    for alerta in alertas:
        if alerta.get('zonaAfectada') == zona:
            if _orden_riesgo_string(alerta.get('nivelRiesgo')) >= _orden_riesgo(nivel_minimo):
                return True
    return False


def _orden_riesgo(nivel: NivelRiesgo) -> int:
    orden = {
        NivelRiesgo.SAFE: 0,
        NivelRiesgo.LOW: 1,
        NivelRiesgo.MEDIUM: 2,
        NivelRiesgo.HIGH: 3,
        NivelRiesgo.CRITICAL: 4,
    }
    return orden.get(nivel, 0)


def _orden_riesgo_string(nivel) -> int:
    mapping = {
        'SAFE': 0, 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4,
    }
    if isinstance(nivel, NivelRiesgo):
        return _orden_riesgo(nivel)
    return mapping.get(str(nivel).upper(), 0)
