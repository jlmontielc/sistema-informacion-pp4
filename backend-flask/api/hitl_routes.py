import logging
from flask import Blueprint, request, jsonify
from services.hitl_engine import HitlEngine
from services.feedback_store import (
    registrar_feedback_hitl,
    obtener_historial_feedback,
    obtener_estadisticas_feedback,
    obtener_ultima_sugerencia,
)

logger = logging.getLogger(__name__)

hitl_bp = Blueprint('hitl', __name__)
engine = HitlEngine()


@hitl_bp.route('/routine', methods=['POST'])
def predict_routine():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body requerido'}), 400

    cliente_id = data.get('cliente_id')
    if not cliente_id:
        return jsonify({'error': 'cliente_id es requerido'}), 400

    resultado = engine.procesar_solicitud(data)

    status = resultado.pop('status', 200) if not resultado.get('success') else 200

    return jsonify(resultado), status


@hitl_bp.route('/validate', methods=['POST'])
def validate_exercise():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body requerido'}), 400

    ejercicio_id = data.get('ejercicio_id')
    cliente_id = data.get('cliente_id')

    if not ejercicio_id or not cliente_id:
        return jsonify({'error': 'ejercicio_id y cliente_id son requeridos'}), 400

    carga_kg = data.get('carga_kg')

    resultado = engine.validar_ejercicio_individual(ejercicio_id, cliente_id, carga_kg)

    return jsonify(resultado)


@hitl_bp.route('/feedback', methods=['POST'])
def registrar_feedback():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body requerido'}), 400

    campos_requeridos = ['entrenador_id', 'cliente_id', 'accion']
    for campo in campos_requeridos:
        if campo not in data:
            return jsonify({'error': f'{campo} es requerido'}), 400

    if data['accion'] not in ('aprobada', 'rechazada', 'modificada'):
        return jsonify({'error': 'accion debe ser: aprobada, rechazada, modificada'}), 400

    try:
        feedback_id = registrar_feedback_hitl(data)
        return jsonify({
            'success': True,
            'feedback_id': feedback_id,
            'mensaje': 'Feedback registrado exitosamente',
        }), 201
    except Exception as e:
        logger.error(f"Error registrando feedback: {e}")
        return jsonify({'error': 'Error al registrar feedback'}), 500


@hitl_bp.route('/history/<int:cliente_id>', methods=['GET'])
def historial(cliente_id):
    limit = request.args.get('limit', 20, type=int)
    historial = obtener_historial_feedback(cliente_id, limit)
    return jsonify({
        'cliente_id': cliente_id,
        'historial': historial,
        'total': len(historial),
    })


@hitl_bp.route('/stats', methods=['GET'])
def estadisticas():
    stats = obtener_estadisticas_feedback()
    return jsonify(stats)


@hitl_bp.route('/last/<int:cliente_id>', methods=['GET'])
def ultima_sugerencia(cliente_id):
    ultima = obtener_ultima_sugerencia(cliente_id)
    if not ultima:
        return jsonify({'mensaje': 'No hay sugerencias previas para este cliente'}), 404
    return jsonify(ultima)
