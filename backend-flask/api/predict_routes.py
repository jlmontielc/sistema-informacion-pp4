from flask import Blueprint, request, jsonify
from models.predictor_rutina import PredictorRutina

predict_bp = Blueprint('predict', __name__)
predictor = PredictorRutina()

@predict_bp.route('/routine', methods=['POST'])
def predict_routine():
    data = request.get_json()
    resultado = predictor.predecir(data)
    return jsonify(resultado)
