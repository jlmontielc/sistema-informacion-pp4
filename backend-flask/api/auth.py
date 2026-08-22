import logging
from functools import wraps

import jwt
from flask import request, jsonify

from config.settings import JWT_SECRET

logger = logging.getLogger(__name__)


class ErrorAutenticacion(Exception):
    def __init__(self, mensaje: str, status: int = 401):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status = status


def require_jwt(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not JWT_SECRET:
            logger.error('JWT_SECRET no configurado; rechazando peticion')
            raise ErrorAutenticacion(
                'Servicio sin credenciales de servicio configuradas', 503
            )

        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            raise ErrorAutenticacion('Token de servicio requerido (Bearer)')

        token = header.removeprefix('Bearer ').strip()
        if not token:
            raise ErrorAutenticacion('Token vacio')

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise ErrorAutenticacion('Token expirado')
        except jwt.InvalidTokenError:
            raise ErrorAutenticacion('Token invalido')

        if payload.get('service') != 'backend-node':
            logger.warning(
                'Token con emisor inesperado: %s', payload.get('service')
            )
            raise ErrorAutenticacion('Emisor no autorizado')

        return func(*args, **kwargs)

    return wrapper


def registrar_manejador_auth(app):
    @app.errorhandler(ErrorAutenticacion)
    def manejar_error_auth(error):
        return jsonify({'error': error.mensaje}), error.status
