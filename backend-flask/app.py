from flask import Flask
from flask_cors import CORS
from api.predict_routes import predict_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(predict_bp, url_prefix='/api/predict')

@app.route('/api/health')
def health():
    return {'status': 'ok', 'service': 'backend-flask'}

if __name__ == '__main__':
    app.run(port=5000, debug=True)
