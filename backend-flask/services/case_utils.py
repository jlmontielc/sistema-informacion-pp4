"""Utilidades para conversión de casing entre snake_case y camelCase.

Este módulo centraliza las transformaciones de claves de diccionarios
para que la API y los servicios internos de backend-flask trabajen con
camelCase sin dispersar lógica de casing en los servicios.
"""

import re


def to_camel_case(snake_str: str) -> str:
    """Convierte una cadena snake_case a camelCase."""
    if not isinstance(snake_str, str):
        return snake_str
    components = snake_str.split('_')
    return components[0] + ''.join(word.capitalize() for word in components[1:])


def keys_to_camel_case(obj):
    """Convierte recursivamente las claves de un dict/lista a camelCase."""
    if isinstance(obj, dict):
        return {to_camel_case(k): keys_to_camel_case(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [keys_to_camel_case(i) for i in obj]
    return obj
