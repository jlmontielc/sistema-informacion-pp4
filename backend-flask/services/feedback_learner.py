import json
import logging

from services.db_connector import execute_one, execute_query, execute_insert
from config.constants import PESOS_BASE_SCORING

logger = logging.getLogger(__name__)

FACTOR_APRENDIZAJE = 0.25
LIMITE_INFERIOR = 0.5
LIMITE_SUPERIOR = 2.0
MINIMO_FEEDBACK = 5
UMBRAL_MODIFICADAS = 0.4
UMBRAL_RECHAZADAS = 0.3


def ensure_tabla_pesos():
    query = """
        CREATE TABLE IF NOT EXISTS pesos_modelo_ia (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pesos JSON NOT NULL,
            total_feedback INT NOT NULL DEFAULT 0,
            tasas JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """
    execute_query(query)


def obtener_tasas_feedback() -> dict:
    query = """
        SELECT accion, COUNT(*) AS total
        FROM feedback_hitl
        GROUP BY accion
    """
    filas = execute_query(query)
    totales = {f['accion']: int(f['total']) for f in filas}
    total = sum(totales.values())
    if total == 0:
        return None
    return {
        'total': total,
        'tasa_aprobada': totales.get('aprobada', 0) / total,
        'tasa_modificada': totales.get('modificada', 0) / total,
        'tasa_rechazada': totales.get('rechazada', 0) / total,
    }


def calcular_nuevos_pesos(pesos_actuales: dict, tasas: dict) -> dict:
    nuevos = dict(pesos_actuales)

    ajuste_global = FACTOR_APRENDIZAJE * (
        tasas['tasa_aprobada'] - tasas['tasa_rechazada']
    )

    nuevos['objetivo'] *= (1 + ajuste_global)
    nuevos['progresion'] *= (1 + ajuste_global * 0.5)

    if tasas['tasa_modificada'] >= UMBRAL_MODIFICADAS:
        factor = 1 + FACTOR_APRENDIZAJE * min(
            (tasas['tasa_modificada'] - UMBRAL_MODIFICADAS) / UMBRAL_MODIFICADAS, 1
        )
        nuevos['nivel'] *= factor
        nuevos['progresion'] *= factor

    if tasas['tasa_rechazada'] >= UMBRAL_RECHAZADAS:
        factor_rechazo = 1 + FACTOR_APRENDIZAJE * min(
            (tasas['tasa_rechazada'] - UMBRAL_RECHAZADAS) / UMBRAL_RECHAZADAS, 1
        )
        nuevos['diversidad'] *= factor_rechazo
        nuevos['balance_grupal'] *= factor_rechazo
        nuevos['objetivo'] *= (1 - FACTOR_APRENDIZAJE * 0.5)

    for clave, base in PESOS_BASE_SCORING.items():
        piso = base * LIMITE_INFERIOR
        techo = base * LIMITE_SUPERIOR
        nuevos[clave] = round(max(piso, min(techo, nuevos[clave])), 4)

    return nuevos


def recalcular_y_persistir_pesos() -> dict:
    ensure_tabla_pesos()

    tasas = obtener_tasas_feedback()
    if not tasas or tasas['total'] < MINIMO_FEEDBACK:
        return {
            'success': False,
            'status': 409,
            'error': 'Feedback insuficiente para recalibrar',
            'detalle': f'Se requieren al menos {MINIMO_FEEDBACK} registros de feedback_hitl',
            'feedback_disponible': tasas['total'] if tasas else 0,
        }

    pesos_previos = dict(cargar_pesos_persistidos() or PESOS_BASE_SCORING)
    pesos_nuevos = calcular_nuevos_pesos(pesos_previos, tasas)

    query = """
        INSERT INTO pesos_modelo_ia (pesos, total_feedback, tasas)
        VALUES (%s, %s, %s)
    """
    execute_insert(query, (
        json.dumps(pesos_nuevos),
        tasas['total'],
        json.dumps({
            'tasa_aprobada': round(tasas['tasa_aprobada'], 4),
            'tasa_modificada': round(tasas['tasa_modificada'], 4),
            'tasa_rechazada': round(tasas['tasa_rechazada'], 4),
        }),
    ))

    logger.info(
        "Pesos recalibrados con feedback=%s aprob=%.2f mod=%.2f rech=%.2f",
        tasas['total'],
        tasas['tasa_aprobada'],
        tasas['tasa_modificada'],
        tasas['tasa_rechazada'],
    )

    return {
        'success': True,
        'pesos_anteriores': pesos_previos,
        'pesos_nuevos': pesos_nuevos,
        'tasas': tasas,
        'mensaje': 'Pesos recalibrados desde feedback_hitl',
    }


def cargar_pesos_persistidos() -> dict:
    fila = execute_one(
        "SELECT pesos FROM pesos_modelo_ia ORDER BY id DESC LIMIT 1"
    )
    if not fila:
        return None
    try:
        datos = fila['pesos']
        if isinstance(datos, str):
            datos = json.loads(datos)
        if not isinstance(datos, dict):
            return None
        return {
            k: float(v) for k, v in datos.items()
            if k in PESOS_BASE_SCORING
        } or None
    except (ValueError, TypeError) as e:
        logger.warning('Pesos persistidos invalidos, usando base: %s', e)
        return None


def aplicar_pesos_a_engine(engine, pesos: dict) -> None:
    validos = {k: float(v) for k, v in pesos.items() if k in PESOS_BASE_SCORING}
    engine.weights.update(validos)
