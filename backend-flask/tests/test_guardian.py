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
        {'id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'dificultad': 'principiante', 'equipo_necesario': 'barra'},
        {'id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'dificultad': 'principiante', 'equipo_necesario': 'barra'},
        {'id': 3, 'nombre': 'Dominadas', 'grupo_muscular': 'Espalda', 'dificultad': 'intermedio', 'equipo_necesario': 'cuerpo_libre'},
        {'id': 4, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'dificultad': 'principiante', 'equipo_necesario': 'cuerpo_libre'},
        {'id': 5, 'nombre': 'Peso muerto', 'grupo_muscular': 'Espalda baja', 'dificultad': 'intermedio', 'equipo_necesario': 'barra'},
        {'id': 6, 'nombre': 'Curl de bíceps', 'grupo_muscular': 'Brazos', 'dificultad': 'principiante', 'equipo_necesario': 'mancuernas'},
    ]
    plantillas = [
        {
            'id': 10,
            'nombre': 'Rutina Ganancia Muscular 4 dias',
            'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular',
            'nivel_dificultad': 'intermedio',
            'frecuencia_semanal': 4,
            'ejercicios': [
                {'ejercicio_id': 1, 'series': 4, 'repeticiones': 10},
                {'ejercicio_id': 2, 'series': 4, 'repeticiones': 8},
                {'ejercicio_id': 3, 'series': 3, 'repeticiones': 10},
                {'ejercicio_id': 5, 'series': 3, 'repeticiones': 8},
            ],
        },
        {
            'id': 11,
            'nombre': 'Rutina Perdida de Peso',
            'tipo': 'resistencia',
            'objetivo': 'perdida_peso',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 4, 'series': 3, 'repeticiones': 15},
                {'ejercicio_id': 6, 'series': 3, 'repeticiones': 12},
            ],
        },
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

    resultado = engine.recomendar_plantillas(plantillas, pool, datos_cliente, historial=[])

    assert resultado['total_evaluadas'] == 2
    assert len(resultado['plantillas_recomendadas']) >= 1
    mejor = resultado['plantillas_recomendadas'][0]
    assert mejor['plantilla_id'] == 10
    assert mejor['nombre'] == 'Rutina Ganancia Muscular 4 dias'
    print("[PASS] test_recommender_normaliza_proposito")


def test_recommender_plantilla_ejercicios_bloqueados():
    from services.recommender import RecommenderEngine

    engine = RecommenderEngine()
    pool = [
        {'id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'dificultad': 'principiante'},
        {'id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'dificultad': 'principiante'},
        {'id': 4, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'dificultad': 'principiante'},
    ]
    plantillas_con_bloqueados = [
        {
            'id': 20, 'nombre': 'Rutina con bloqueados', 'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular', 'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'series': 4, 'repeticiones': 10},
                {'ejercicio_id': 2, 'series': 4, 'repeticiones': 8},
                {'ejercicio_id': 99, 'series': 3, 'repeticiones': 10},
                {'ejercicio_id': 100, 'series': 3, 'repeticiones': 8},
            ],
        },
    ]
    plantillas_segura = [
        {
            'id': 21, 'nombre': 'Rutina segura', 'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular', 'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'series': 4, 'repeticiones': 10},
                {'ejercicio_id': 2, 'series': 4, 'repeticiones': 8},
            ],
        },
    ]
    datos = {
        'edad': 25, 'peso': 70, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'activo', 'nivel_experiencia': 'principiante',
        'proposito': 'ganar masa muscular', 'dias_disponibles': 3,
    }

    r_bloq = engine.recomendar_plantillas(plantillas_con_bloqueados, pool, datos)
    r_seg = engine.recomendar_plantillas(plantillas_segura, pool, datos)
    rec_bloq = r_bloq['plantillas_recomendadas'][0]
    rec_seg = r_seg['plantillas_recomendadas'][0]

    assert rec_bloq['ejercicios_bloqueados_count'] == 2
    assert rec_bloq['ejercicios_seguros'] == 2
    assert rec_seg['ejercicios_bloqueados_count'] == 0
    assert rec_seg['score'] > rec_bloq['score']
    print("[PASS] test_recommender_plantilla_ejercicios_bloqueados")


def test_recommender_plantilla_ratio_bajo_excluida():
    from services.recommender import RecommenderEngine

    engine = RecommenderEngine()
    pool = [
        {'id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'dificultad': 'principiante'},
    ]
    plantillas = [
        {
            'id': 30,
            'nombre': 'Rutina mayoritariamente bloqueada',
            'tipo': 'fuerza',
            'objetivo': 'mantenimiento',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'series': 3, 'repeticiones': 10},
                {'ejercicio_id': 80, 'series': 3, 'repeticiones': 10},
                {'ejercicio_id': 81, 'series': 3, 'repeticiones': 10},
                {'ejercicio_id': 82, 'series': 3, 'repeticiones': 10},
            ],
        },
    ]
    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'intermedio',
        'proposito': 'mantenimiento', 'dias_disponibles': 3,
    }

    resultado = engine.recomendar_plantillas(plantillas, pool, datos_cliente)
    assert resultado['total_evaluadas'] == 1
    assert len(resultado['plantillas_recomendadas']) == 0
    print("[PASS] test_recommender_plantilla_ratio_bajo_excluida")


def test_recommender_plantillas_sin_historial():
    from services.recommender import RecommenderEngine

    engine = RecommenderEngine()
    pool = [
        {'id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'dificultad': 'principiante'},
        {'id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'dificultad': 'principiante'},
    ]
    plantillas = [
        {
            'id': 40,
            'nombre': 'Rutina basica',
            'tipo': 'fuerza',
            'objetivo': 'mantenimiento',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'series': 3, 'repeticiones': 10},
                {'ejercicio_id': 2, 'series': 3, 'repeticiones': 10},
            ],
        },
    ]
    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'principiante',
        'proposito': 'mantenimiento', 'dias_disponibles': 3,
    }

    resultado = engine.recomendar_plantillas(plantillas, pool, datos_cliente, historial=None)
    assert resultado['total_evaluadas'] == 1
    assert len(resultado['plantillas_recomendadas']) == 1
    assert resultado['confianza'] > 0
    print("[PASS] test_recommender_plantillas_sin_historial")


def test_recommender_plantillas_vacia():
    from services.recommender import RecommenderEngine

    engine = RecommenderEngine()
    resultado = engine.recomendar_plantillas([], [], {'proposito': 'mantenimiento'})
    assert resultado['total_evaluadas'] == 0
    assert len(resultado['plantillas_recomendadas']) == 0
    print("[PASS] test_recommender_plantillas_vacia")


def test_motor_nutricional_deficit():
    from services.nutricion_engine import calcular_macros

    macros = calcular_macros(gct=2500, peso=75, proposito='perder_peso')
    assert macros['objetivo_calorico'] == 2000
    assert macros['proteinas_gramos'] == 165
    assert macros['grasas_gramos'] > 0
    assert macros['carbohidratos_gramos'] > 0

    total_kcal = (macros['proteinas_gramos'] * 4 +
                  macros['carbohidratos_gramos'] * 4 +
                  macros['grasas_gramos'] * 9)
    diff = abs(total_kcal - macros['objetivo_calorico'])
    assert diff < 20, f'Diferencia kcal {diff} demasiado alta'
    print("[PASS] test_motor_nutricional_deficit")


def test_motor_nutricional_superavit():
    from services.nutricion_engine import calcular_macros

    macros = calcular_macros(gct=2500, peso=80, proposito='ganar_musculo')
    assert macros['objetivo_calorico'] == 2875
    assert macros['proteinas_gramos'] == 128
    assert macros['grasas_gramos'] > 0
    assert macros['carbohidratos_gramos'] > 0
    print("[PASS] test_motor_nutricional_superavit")


def test_motor_nutricional_mantenimiento():
    from services.nutricion_engine import calcular_macros

    macros = calcular_macros(gct=2200, peso=70, proposito='mantener')
    assert macros['objetivo_calorico'] == 2200
    assert macros['proteinas_gramos'] == 126
    assert macros['grasas_gramos'] > 0
    assert macros['carbohidratos_gramos'] > 0
    print("[PASS] test_motor_nutricional_mantenimiento")


def test_guardian_dieta_bloqueo_tmb():
    from services.nutricion_engine import guardian_dieta

    tmb = 1600
    gct = 1920
    macros = {'objetivo_calorico': 1500, 'proteinas_gramos': 120, 'carbohidratos_gramos': 100, 'grasas_gramos': 50}

    resultado = guardian_dieta(macros, tmb, gct)
    assert resultado['aprobado'] is False
    assert len(resultado['alertas']) > 0
    assert resultado['alertas'][0]['tipo'] == 'deficit_peligroso'
    print("[PASS] test_guardian_dieta_bloqueo_tmb")


def test_guardian_dieta_aprobado():
    from services.nutricion_engine import guardian_dieta

    tmb = 1600
    gct = 2000
    macros = {'objetivo_calorico': 2000, 'proteinas_gramos': 130, 'carbohidratos_gramos': 200, 'grasas_gramos': 60}

    resultado = guardian_dieta(macros, tmb, gct)
    assert resultado['aprobado'] is True
    assert len(resultado['alertas']) == 0
    print("[PASS] test_guardian_dieta_aprobado")


def test_guardian_dieta_alerta_diabetes():
    from services.nutricion_engine import guardian_dieta

    tmb = 1800
    gct = 2200
    macros = {'objetivo_calorico': 2200, 'proteinas_gramos': 140, 'carbohidratos_gramos': 230, 'grasas_gramos': 65}
    datos_medicos = {'condiciones': ['Diabetes tipo 2']}

    resultado = guardian_dieta(macros, tmb, gct, datos_medicos)
    assert resultado['aprobado'] is True
    alertas_diabetes = [a for a in resultado['alertas'] if a['tipo'] == 'diabetes_alerta']
    assert len(alertas_diabetes) == 1
    assert 'diabetes' in alertas_diabetes[0]['mensaje'].lower()
    print("[PASS] test_guardian_dieta_alerta_diabetes")


def test_guardian_dieta_alertas_alergias():
    from services.nutricion_engine import guardian_dieta

    tmb = 1600
    gct = 2000
    macros = {'objetivo_calorico': 2000, 'proteinas_gramos': 130, 'carbohidratos_gramos': 200, 'grasas_gramos': 60}
    datos_medicos = {'alergias': ['Gluten', 'Lactosa'], 'intolerancias': ['Fructosa']}

    resultado = guardian_dieta(macros, tmb, gct, datos_medicos)
    assert resultado['aprobado'] is True
    alergias = [a for a in resultado['alertas'] if a['tipo'] == 'alergia_informativa']
    assert len(alergias) == 2
    intolerancias = [a for a in resultado['alertas'] if a['tipo'] == 'intolerancia_informativa']
    assert len(intolerancias) == 1
    print("[PASS] test_guardian_dieta_alertas_alergias")


def test_normalizar_proposito():
    from services.nutricion_engine import normalizar_proposito

    assert normalizar_proposito('Perder peso') == 'perder_peso'
    assert normalizar_proposito('GANAR MUSCULO') == 'ganar_musculo'
    assert normalizar_proposito('mantener') == 'mantener'
    assert normalizar_proposito('') == 'mantener'
    assert normalizar_proposito(None) == 'mantener'
    assert normalizar_proposito('xyz_unknown') == 'mantener'
    assert normalizar_proposito('bajar peso') == 'bajar_peso'
    print("[PASS] test_normalizar_proposito")


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
    test_recommender_plantilla_ejercicios_bloqueados()
    test_recommender_plantilla_ratio_bajo_excluida()
    test_recommender_plantillas_sin_historial()
    test_recommender_plantillas_vacia()
    test_motor_nutricional_deficit()
    test_motor_nutricional_superavit()
    test_motor_nutricional_mantenimiento()
    test_guardian_dieta_bloqueo_tmb()
    test_guardian_dieta_aprobado()
    test_guardian_dieta_alerta_diabetes()
    test_guardian_dieta_alertas_alergias()
    test_normalizar_proposito()
    print("\n=== TODOS LOS TESTS PASARON ===")
