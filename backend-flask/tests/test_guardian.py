import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from config.constants import (
    NivelRiesgo,
    MAPA_LESIONES,
    MAPA_CONDICIONES,
    MAPEO_PROPOSITO_TEXTO,
)
from models.rules.injury_rules import (
    detectar_grupo_lesion,
    evaluar_ejercicio_por_lesiones,
    REGLAS_LESION_EJERCICIO,
)
from models.rules.condition_rules import (
    detectar_condicion,
    evaluar_ejercicio_por_condiciones,
    obtener_precauciones_cliente,
)
from models.rules.load_rules import (
    calcular_imc,
    calcular_carga_maxima_recomendada,
    validar_carga_ejercicio,
    estimar_1rm_repeticiones,
)
from services.guardian import GuardianSeguridad


def test_detectar_grupo_lesion():
    assert detectar_grupo_lesion('Hernia discal L4-L5') == ['espalda_baja']
    assert detectar_grupo_lesion('LCA reconstruido rodilla derecha') == ['rodilla']
    assert detectar_grupo_lesion('Manguito rotador hombro izquierdo') == ['hombro']
    assert detectar_grupo_lesion('Epicondilitis codo') == ['codo']
    assert detectar_grupo_lesion('Tunel carpiano') == ['muneca']
    assert detectar_grupo_lesion('Sin lesiones') == []
    print("[PASS] test_detectar_grupo_lesion")


def test_evaluar_ejercicio_por_lesiones_rodilla():
    resultado = evaluar_ejercicio_por_lesiones('Sentadilla', ['rodilla - LCA'])
    assert resultado['bloqueado'] is True
    assert resultado['nivel_maximo'] in (NivelRiesgo.CRITICAL, NivelRiesgo.HIGH)

    resultado2 = evaluar_ejercicio_por_lesiones('Plancha', ['rodilla - LCA'])
    assert resultado2['bloqueado'] is False
    print("[PASS] test_evaluar_ejercicio_por_lesiones_rodilla")


def test_evaluar_ejercicio_por_lesiones_espalda():
    resultado = evaluar_ejercicio_por_lesiones('Peso muerto', ['Hernia discal lumbar'])
    assert resultado['bloqueado'] is True

    resultado2 = evaluar_ejercicio_por_lesiones('Plancha', ['Hernia discal lumbar'])
    assert resultado2['bloqueado'] is False
    print("[PASS] test_evaluar_ejercicio_por_lesiones_espalda")


def test_evaluar_ejercicio_por_condiciones():
    resultado = evaluar_ejercicio_por_condiciones(
        'Press de banca', ['Cardiopatia']
    )
    assert resultado['intensidad_permitida'] <= 0.65
    print("[PASS] test_evaluar_ejercicio_por_condiciones")


def test_detectar_condicion():
    condiciones = detectar_condicion('Diabetes tipo 2')
    assert len(condiciones) >= 1
    assert condiciones[0]['key'] == 'diabetes'

    condiciones2 = detectar_condicion('Sin condiciones')
    assert len(condiciones2) == 0
    print("[PASS] test_detectar_condicion")


def test_calcular_imc():
    imc = calcular_imc(75, 1.75)
    assert 24.0 < imc < 25.0
    print("[PASS] test_calcular_imc")


def test_carga_maxima_recomendada():
    limites = calcular_carga_maxima_recomendada(75, 1.75, 30, 'activo', 'compuesto')
    assert limites['carga_max_kg'] > 0
    assert limites['imc'] > 0

    limites_joven = calcular_carga_maxima_recomendada(75, 1.75, 25, 'activo', 'compuesto')
    limites_viejo = calcular_carga_maxima_recomendada(75, 1.75, 65, 'activo', 'compuesto')
    assert limites_joven['carga_max_kg'] > limites_viejo['carga_max_kg']
    print("[PASS] test_carga_maxima_recomendada")


def test_validar_carga_ejercicio():
    resultado = validar_carga_ejercicio(100, 75, 1.75, 30, 'activo', 'compuesto')
    assert resultado['aprobar'] is True

    resultado2 = validar_carga_ejercicio(500, 75, 1.75, 30, 'activo', 'compuesto')
    assert resultado2['aprobar'] is False
    print("[PASS] test_validar_carga_ejercicio")


def test_estimar_1rm():
    assert estimar_1rm_repeticiones(100, 1) == 100
    rm10 = estimar_1rm_repeticiones(80, 10)
    assert rm10 > 80
    print("[PASS] test_estimar_1rm")


def test_guardian_filtrar_pool():
    guardian = GuardianSeguridad()

    ejercicios = [
        {'id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas'},
        {'id': 2, 'nombre': 'Plancha', 'grupo_muscular': 'Core'},
        {'id': 3, 'nombre': 'Peso muerto', 'grupo_muscular': 'Espalda baja'},
        {'id': 4, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho'},
        {'id': 5, 'nombre': 'Curl de bíceps', 'grupo_muscular': 'Brazos'},
    ]

    datos_cliente = {
        'edad': 30,
        'peso': 75,
        'altura': 1.75,
        'nivel_actividad': 'moderado',
    }

    perfil_medico = {
        'lesiones': ['Hernia discal lumbar'],
        'condiciones_preexistentes': [],
    }

    resultado = guardian.filtrar_pool_ejercicios(ejercicios, datos_cliente, perfil_medico)

    assert resultado['total_evaluados'] == 5
    assert resultado['total_bloqueados'] >= 1
    assert resultado['total_seguros'] >= 2

    nombres_bloqueados = [b['ejercicio']['nombre'] for b in resultado['ejercicios_bloqueados']]
    assert 'Peso muerto' in nombres_bloqueados
    print("[PASS] test_guardian_filtrar_pool")


def test_guardian_multi_lesion():
    guardian = GuardianSeguridad()

    ejercicios = [
        {'id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas'},
        {'id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho'},
        {'id': 3, 'nombre': 'Plancha', 'grupo_muscular': 'Core'},
    ]

    datos_cliente = {
        'edad': 45,
        'peso': 80,
        'altura': 1.70,
        'nivel_actividad': 'ligero',
    }

    perfil_medico = {
        'lesiones': ['rodilla', 'hombro'],
        'condiciones_preexistentes': ['hipertension'],
    }

    resultado = guardian.filtrar_pool_ejercicios(ejercicios, datos_cliente, perfil_medico)

    assert resultado['total_evaluados'] == 3
    assert resultado['total_bloqueados'] >= 2
    print("[PASS] test_guardian_multi_lesion")


def test_mapeo_proposito_texto():
    assert MAPEO_PROPOSITO_TEXTO['perder peso'] == 'perdida_peso'
    assert MAPEO_PROPOSITO_TEXTO['bajar de peso'] == 'perdida_peso'
    assert MAPEO_PROPOSITO_TEXTO['ganar masa muscular'] == 'ganancia_muscular'
    assert MAPEO_PROPOSITO_TEXTO['tonificar'] == 'ganancia_muscular'
    assert MAPEO_PROPOSITO_TEXTO['salud y bienestar'] == 'mantenimiento'
    assert MAPEO_PROPOSITO_TEXTO['mejorar condición física general'] == 'mantenimiento'
    assert MAPEO_PROPOSITO_TEXTO['rendimiento deportivo'] == 'rendimiento'
    assert MAPEO_PROPOSITO_TEXTO['rehabilitación'] == 'rehabilitacion'
    print("[PASS] test_mapeo_proposito_texto")


def test_recommender_normaliza_proposito():
    from services.recommender import RecommenderEngine

    engine = RecommenderEngine()
    pool = [
        {'id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'dificultad': 'principiante', 'equipo': ['barra']},
        {'id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'dificultad': 'principiante', 'equipo': ['barra']},
        {'id': 3, 'nombre': 'Dominadas', 'grupo_muscular': 'Espalda', 'dificultad': 'intermedio', 'equipo': ['cuerpo_libre']},
        {'id': 4, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'dificultad': 'principiante', 'equipo': ['cuerpo_libre']},
        {'id': 5, 'nombre': 'Peso muerto', 'grupo_muscular': 'Espalda baja', 'dificultad': 'intermedio', 'equipo': ['barra']},
        {'id': 6, 'nombre': 'Curl de bíceps', 'grupo_muscular': 'Brazos', 'dificultad': 'principiante', 'equipo': ['mancuernas']},
    ]
    datos_cliente = {
        'edad': 30,
        'peso': 75,
        'altura': 1.75,
        'sexo': 'masculino',
        'nivel_actividad': 'moderado',
        'nivel_experiencia': 'principiante',
        'proposito': 'Ganar masa muscular',
        'dias_disponibles': 3,
    }

    resultado = engine.generar_rutina(datos_cliente, pool, historial=[])

    rutina = resultado['rutina_sugerida']
    assert 'ganancia muscular' in rutina['nombre'].lower()
    assert rutina['configuracion_objetivo']['rango_repeticiones'] == (8, 12)
    assert rutina['configuracion_objetivo']['series_por_ejercicio'] == (3, 4)
    print("[PASS] test_recommender_normaliza_proposito")


if __name__ == '__main__':
    test_detectar_grupo_lesion()
    test_evaluar_ejercicio_por_lesiones_rodilla()
    test_evaluar_ejercicio_por_lesiones_espalda()
    test_evaluar_ejercicio_por_condiciones()
    test_detectar_condicion()
    test_calcular_imc()
    test_carga_maxima_recomendada()
    test_validar_carga_ejercicio()
    test_estimar_1rm()
    test_guardian_filtrar_pool()
    test_guardian_multi_lesion()
    test_mapeo_proposito_texto()
    test_recommender_normaliza_proposito()
    print("\n=== TODOS LOS TESTS PASARON ===")
