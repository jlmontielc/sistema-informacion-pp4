import logging
from flask import Flask
from flask_cors import CORS
from api.hitl_routes import hitl_bp
from config.settings import CORS_ORIGINS

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)

app.register_blueprint(hitl_bp, url_prefix='/api/predict')


@app.route('/api/health')
def health():
    return {'status': 'ok', 'service': 'backend-flask', 'modules': ['predict', 'hitl']}


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
        },
    }


if __name__ == '__main__':
    logger.info("Starting Backend-Flask HITL on port 5000")
    app.run(port=5000, debug=True)
