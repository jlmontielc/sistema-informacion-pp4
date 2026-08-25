import logging
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from api.auth import registrar_manejador_auth
from api.hitl_routes import hitl_bp
from config.settings import CORS_ORIGINS, LOG_LEVEL

logging.basicConfig(
    level=getattr(logging, str(LOG_LEVEL).upper(), logging.INFO),
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)

registrar_manejador_auth(app)
app.register_blueprint(hitl_bp, url_prefix='/api/predict')


@app.errorhandler(404)
def manejar_404(error):
    return jsonify({'error': 'Recurso no encontrado'}), 404


@app.errorhandler(405)
def manejar_405(error):
    return jsonify({'error': 'Metodo no permitido'}), 405


@app.errorhandler(400)
def manejar_400(error):
    return jsonify({'error': 'Peticion malformada'}), 400


@app.errorhandler(Exception)
def manejar_error_generico(error):
    if isinstance(error, HTTPException):
        return jsonify({'error': error.description}), error.code
    logger.exception('Error no controlado: %s', error)
    return jsonify({'error': 'Error interno del servicio de IA'}), 500


@app.route('/api/health')
def health():
    return {'status': 'ok', 'service': 'backend-flask', 'modules': ['predict', 'hitl', 'diet']}


@app.route('/api/health/detailed')
def health_detailed():
    try:
        from services.db_connector import get_connection
        conn = get_connection()
        conn.close()
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'

    return {
        'status': 'ok',
        'service': 'backend-flask',
        'database': db_status,
        'modules': {
            'predict': 'active',
            'hitl': 'active',
            'guardian': 'active',
            'recommender': 'active',
            'diet': 'active',
        },
    }


if __name__ == '__main__':
    logger.info("Starting Backend-Flask HITL on port 5000")
    app.run(port=5000, debug=True)
