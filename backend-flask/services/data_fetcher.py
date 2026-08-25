import json
from services.db_connector import execute_query, execute_one


def fetch_cliente_completo(cliente_id: int) -> dict:
    query = """
        SELECT
            i.id, i.nombre, i.edad, i.peso, i.altura, i.sexo,
            i.nivel_actividad, i.nivel_experiencia, i.proposito_entrenamiento, i.dias_disponibles,
            i.activo
        FROM instruidos i
        WHERE i.id = %s AND i.activo = TRUE
    """
    cliente = execute_one(query, (cliente_id,))
    return cliente


def fetch_perfil_medico(cliente_id: int) -> dict:
    query = """
        SELECT
            pm.cliente_id,
            pm.alergias,
            pm.intolerancias,
            pm.lesiones,
            pm.condiciones_preexistentes,
            pm.medicacion_actual,
            pm.observaciones
        FROM perfil_medico pm
        WHERE pm.cliente_id = %s
    """
    perfil = execute_one(query, (cliente_id,))
    return perfil


def fetch_todos_ejercicios() -> list:
    query = """
        SELECT
            e.id, e.nombre, e.descripcion, e.instrucciones_es,
            e.grupo_muscular, e.target, e.equipo_necesario,
            e.dificultad, e.musculos_secundarios,
            e.contraindica_lesiones, e.imagen_url, e.gif_url
        FROM ejercicios e
        ORDER BY e.grupo_muscular, e.nombre
    """
    return execute_query(query)


def fetch_ejercicio_por_id(ejercicio_id: int) -> dict:
    query = """
        SELECT
            e.id, e.nombre, e.descripcion, e.instrucciones_es,
            e.grupo_muscular, e.target, e.equipo_necesario,
            e.dificultad, e.musculos_secundarios,
            e.contraindica_lesiones, e.imagen_url, e.gif_url
        FROM ejercicios e
        WHERE e.id = %s
    """
    return execute_one(query, (ejercicio_id,))


def fetch_historial_entrenamiento(cliente_id: int, semanas: int = 4) -> list:
    query = """
        SELECT
            re.id, re.rutina_asignada_id, re.fecha,
            re.ejercicios_realizados, re.duracion_minutos,
            re.percepcion_esfuerzo, re.observaciones
        FROM registro_entrenamiento re
        WHERE re.cliente_id = %s
          AND re.fecha >= DATE_SUB(CURDATE(), INTERVAL %s WEEK)
        ORDER BY re.fecha DESC
    """
    return execute_query(query, (cliente_id, semanas))


def fetch_rutinas_activas(cliente_id: int) -> list:
    query = """
        SELECT
            ra.id, ra.nombre, ra.tipo, ra.ejercicios,
            ra.frecuencia_semanal, ra.duracion_semanas,
            ra.personalizada_por_entrenador,
            ra.fecha_inicio, ra.fecha_fin
        FROM rutinas_asignadas ra
        WHERE ra.cliente_id = %s AND ra.activa = TRUE
        ORDER BY ra.created_at DESC
    """
    return execute_query(query, (cliente_id,))


def fetch_plantillas_disponibles(entrenador_id: int) -> list:
    query = """
        SELECT
            pe.id, pe.nombre, pe.descripcion, pe.tipo,
            pe.ejercicios, pe.frecuencia_semanal,
            pe.duracion_semanas, pe.objetivo, pe.nivel_dificultad
        FROM plantillas_entrenamiento pe
        WHERE pe.entrenador_id = %s AND pe.activa = TRUE
        ORDER BY pe.nombre
    """
    return execute_query(query, (entrenador_id,))


def fetch_rendimiento_reciente(cliente_id: int, registros: int = 10) -> list:
    query = """
        SELECT
            r.id, r.fecha, r.peso, r.repeticiones_totales,
            r.carga_total_kg, r.imc, r.observaciones
        FROM rendimiento r
        WHERE r.cliente_id = %s
        ORDER BY r.fecha DESC
        LIMIT %s
    """
    return execute_query(query, (cliente_id, registros))


def fetch_calculos_metabolicos(cliente_id: int) -> dict:
    query = """
        SELECT
            cm.tmb, cm.gct, cm.nivel_actividad_usado,
            cm.peso_usado, cm.fecha_calculo
        FROM calculos_metabolicos cm
        WHERE cm.cliente_id = %s
        ORDER BY cm.fecha_calculo DESC
        LIMIT 1
    """
    return execute_one(query, (cliente_id,))


def parsear_lesiones(perfil_medico: dict) -> list:
    if not perfil_medico:
        return []
    raw = perfil_medico.get('lesiones')
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(item) for item in data if item]
        return [str(data)]
    except (json.JSONDecodeError, TypeError):
        if isinstance(raw, str):
            return [l.strip() for l in raw.split(',') if l.strip()]
        return []


def parsear_condiciones(perfil_medico: dict) -> list:
    if not perfil_medico:
        return []
    raw = perfil_medico.get('condiciones_preexistentes')
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(item) for item in data if item]
        return [str(data)]
    except (json.JSONDecodeError, TypeError):
        if isinstance(raw, str):
            return [c.strip() for c in raw.split(',') if c.strip()]
        return []


def parsear_alergias(perfil_medico: dict) -> list:
    if not perfil_medico:
        return []
    raw = perfil_medico.get('alergias')
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(item) for item in data if item]
        return [str(data)]
    except (json.JSONDecodeError, TypeError):
        if isinstance(raw, str):
            return [a.strip() for a in raw.split(',') if a.strip()]
        return []


def parsear_medicacion(perfil_medico: dict) -> list:
    if not perfil_medico:
        return []
    raw = perfil_medico.get('medicacion_actual')
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(item) for item in data if item]
        return [str(data)]
    except (json.JSONDecodeError, TypeError):
        if isinstance(raw, str):
            return [m.strip() for m in raw.split(',') if m.strip()]
        return []
