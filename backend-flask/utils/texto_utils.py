"""Utilidades puras de normalizacion de texto para reglas medicas.

Este modulo no debe tener dependencias de servicios ni de Flask.
Todas las funciones son puras y trabajan con cadenas simples.
"""

import re
import unicodedata


PALABRAS_NEGATIVAS = {
    '', '-', '0', 'n/a', 'n a', 'na', 's/n', 's n', 'no', 'none', 'nada',
    'sin', 'ningun', 'ninguna', 'ninguno', 'ningunas', 'ningunos',
    'sin lesiones', 'sin lesion', 'sin condiciones', 'sin condicion',
    'sin alergias', 'sin alergia', 'sin intolerancias', 'sin intolerancia',
    'sin medicacion', 'sin medicamentos', 'sin medicamento',
    'ninguna lesion', 'ninguna lesiones', 'ningun lesion',
    'ninguna condicion', 'ninguna condiciones', 'ningun condicion',
    'ninguna alergia', 'ninguna alergias', 'ningun alergia',
    'ninguna intolerancia', 'ninguna intolerancias', 'ningun intolerancia',
    'ninguna medicacion', 'ninguna medicaciones', 'ningun medicacion',
    'ningun medicamento', 'ninguna medicamento', 'ningunos medicamentos',
    'sin informacion',
}


def normalizar_texto(texto) -> str:
    """Devuelve el texto en minusculas, sin acentos y sin caracteres no alfanumericos.

    - Elimina acentos mediante NFKD + descarte de marcas de combinacion.
    - Reemplaza cualquier caracter que no sea letra o numero por espacio.
    - Compacta espacios multiples en uno solo.
    """
    if not isinstance(texto, str):
        return ''
    texto = texto.strip().lower()
    texto = unicodedata.normalize('NFKD', texto)
    texto = ''.join(c for c in texto if not unicodedata.combining(c))
    texto = re.sub(r'[^a-z0-9]+', ' ', texto)
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto


def stem_basico_espanol(palabra: str) -> str:
    """Aplica un stemming conservador en espanol para terminos medicos.

    Quita plurales regulares y sufijos medicos comunes. Se mantiene
    conservador para no deformar terminos clave (p. ej. 'lumbar' no se
    reduce a 'lumb').
    """
    if not palabra:
        return palabra

    palabra = palabra.lower().strip()

    # Sufijos medicos comunes (aplicar antes que plurales para no perder
    # la 's' final de terminos como 'tendinitis').
    for sufijo in ('itis', 'algias', 'algia', 'osis', 'patias', 'patia'):
        if palabra.endswith(sufijo) and len(palabra) > len(sufijo) + 2:
            palabra = palabra[:-len(sufijo)]
            break

    # Plurales regulares
    if palabra.endswith('es') and len(palabra) > 4:
        # Evitar recortar palabras que terminan en consonante + es cuyo
        # singular no es intuitivo (p. ej. 'mes' -> 'me').
        raiz = palabra[:-2]
        if raiz.endswith(('s', 'x', 'z', 'ch', 'sh')):
            palabra = raiz
        elif len(raiz) >= 3:
            palabra = raiz
    elif palabra.endswith('s') and not palabra.endswith('ss') and len(palabra) > 3:
        palabra = palabra[:-1]

    return palabra


def obtener_tokens_y_bigramas(texto) -> list:
    """Devuelve una lista con los tokens individuales y los bigramas del texto.

    El orden es: todos los tokens seguidos de todos los bigramas consecutivos.
    Se eliminan duplicados conservando el orden de aparicion.
    """
    tokens = normalizar_texto(texto).split()
    bigramas = [f'{a} {b}' for a, b in zip(tokens, tokens[1:])]
    resultado = []
    vistos = set()
    for item in tokens + bigramas:
        if item not in vistos:
            vistos.add(item)
            resultado.append(item)
    return resultado


def texto_contiene_termino(texto, termino) -> bool:
    """Comprueba si el termino normalizado aparece en el texto normalizado.

    Soporta terminos de una o varias palabras buscando la secuencia exacta
    de tokens dentro del texto.
    """
    texto_norm = normalizar_texto(texto)
    termino_norm = normalizar_texto(termino)
    if not termino_norm:
        return False

    tokens_texto = texto_norm.split()
    tokens_termino = termino_norm.split()

    if not tokens_texto:
        return False

    longitud = len(tokens_termino)
    for i in range(len(tokens_texto) - longitud + 1):
        if tokens_texto[i:i + longitud] == tokens_termino:
            return True
    return False


def es_valor_vacio_medico(valor) -> bool:
    """Devuelve True si el valor es una cadena vacia o un marcador negativo."""
    if not isinstance(valor, str):
        return True
    limpio = normalizar_texto(valor)
    return not limpio or limpio in PALABRAS_NEGATIVAS


def lista_esta_vacia_de_informacion(lista) -> bool:
    """Devuelve True si la lista solo contiene cadenas vacias o negativas."""
    if not lista:
        return True
    for item in lista:
        if isinstance(item, str) and not es_valor_vacio_medico(item):
            return False
    return True
