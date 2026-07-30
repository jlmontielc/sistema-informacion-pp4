from services.db_connector import execute_insert, execute_query, execute_one


def registrar_feedback_hitl(feedback_data: dict) -> int:
    query = """
        INSERT INTO feedback_hitl
        (rutina_sugerida_id, entrenador_id, cliente_id, accion,
         rutina_original, rutina_final, ejercicios_agregados,
         ejercicios_eliminados, modificacion_cargas, confianza_ia,
         tiempo_revision_seg, observaciones)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        feedback_data.get('rutina_sugerida_id'),
        feedback_data['entrenador_id'],
        feedback_data['cliente_id'],
        feedback_data['accion'],
        _serializar_json(feedback_data.get('rutina_original')),
        _serializar_json(feedback_data.get('rutina_final')),
        _serializar_json(feedback_data.get('ejercicios_agregados', [])),
        _serializar_json(feedback_data.get('ejercicios_eliminados', [])),
        _serializar_json(feedback_data.get('modificacion_cargas', {})),
        feedback_data.get('confianza_ia', 0),
        feedback_data.get('tiempo_revision_seg', 0),
        feedback_data.get('observaciones', ''),
    )
    return execute_insert(query, params)


def obtener_historial_feedback(cliente_id: int, limit: int = 20) -> list:
    query = """
        SELECT
            fh.id, fh.rutina_sugerida_id, fh.entrenador_id,
            fh.cliente_id, fh.accion, fh.rutina_original,
            fh.rutina_final, fh.ejercicios_agregados,
            fh.ejercicios_eliminados, fh.modificacion_cargas,
            fh.confianza_ia, fh.tiempo_revision_seg,
            fh.observaciones, fh.created_at,
            e.nombre AS entrenador_nombre
        FROM feedback_hitl fh
        JOIN entrenadores e ON e.id = fh.entrenador_id
        WHERE fh.cliente_id = %s
        ORDER BY fh.created_at DESC
        LIMIT %s
    """
    return execute_query(query, (cliente_id, limit))


def obtener_estadisticas_feedback() -> dict:
    query_acciones = """
        SELECT
            accion,
            COUNT(*) AS total,
            AVG(confianza_ia) AS confianza_promedio,
            AVG(tiempo_revision_seg) AS tiempo_promedio
        FROM feedback_hitl
        GROUP BY accion
    """
    stats_accion = execute_query(query_acciones)

    query_total = "SELECT COUNT(*) AS total FROM feedback_hitl"
    total = execute_one(query_total)

    query_por_entrenador = """
        SELECT
            e.nombre AS entrenador,
            fh.accion,
            COUNT(*) AS total
        FROM feedback_hitl fh
        JOIN entrenadores e ON e.id = fh.entrenador_id
        GROUP BY fh.entrenador_id, fh.accion
        ORDER BY total DESC
    """
    por_entrenador = execute_query(query_por_entrenador)

    return {
        'total_registros': total['total'] if total else 0,
        'por_accion': stats_accion,
        'por_entrenador': por_entrenador,
    }


def obtener_ultima_sugerencia(cliente_id: int) -> dict:
    query = """
        SELECT
            fh.id, fh.rutina_original, fh.rutina_final,
            fh.accion, fh.confianza_ia, fh.created_at,
            e.nombre AS entrenador_nombre
        FROM feedback_hitl fh
        JOIN entrenadores e ON e.id = fh.entrenador_id
        WHERE fh.cliente_id = %s
        ORDER BY fh.created_at DESC
        LIMIT 1
    """
    return execute_one(query, (cliente_id,))


def _serializar_json(data) -> str:
    if data is None:
        return None
    import json
    if isinstance(data, str):
        return data
    return json.dumps(data, ensure_ascii=False, default=str)
