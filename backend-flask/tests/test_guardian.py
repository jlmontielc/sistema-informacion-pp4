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


def test_clasificador_normaliza_proposito():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [
        {
            'id': 10,
            'nombre': 'Rutina Ganancia Muscular 4 dias',
            'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular',
            'nivel_dificultad': 'intermedio',
            'frecuencia_semanal': 4,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': None},
                {'ejercicio_id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': None},
                {'ejercicio_id': 3, 'nombre': 'Dominadas', 'grupo_muscular': 'Espalda', 'contraindica_lesiones': None},
                {'ejercicio_id': 5, 'nombre': 'Peso muerto', 'grupo_muscular': 'Espalda baja', 'contraindica_lesiones': None},
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
                {'ejercicio_id': 4, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'contraindica_lesiones': None},
                {'ejercicio_id': 6, 'nombre': 'Curl de bíceps', 'grupo_muscular': 'Brazos', 'contraindica_lesiones': None},
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
    perfil_medico = {
        'lesiones': [],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] == 10
    assert resultado['confianza'] > 50
    assert 'ganancia muscular' in resultado['explicacion'].lower() or 'Ganancia Muscular' in resultado['explicacion']
    print("[PASS] test_clasificador_normaliza_proposito")


def test_clasificador_descarta_plantilla_con_ejercicios_bloqueados():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [
        {
            'id': 20,
            'nombre': 'Rutina con bloqueados',
            'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
                {'ejercicio_id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': None},
                {'ejercicio_id': 99, 'nombre': 'Ejercicio inexistente 1', 'grupo_muscular': 'Core', 'contraindica_lesiones': None},
                {'ejercicio_id': 100, 'nombre': 'Ejercicio inexistente 2', 'grupo_muscular': 'Brazos', 'contraindica_lesiones': None},
            ],
        },
        {
            'id': 21,
            'nombre': 'Rutina segura',
            'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': None},
                {'ejercicio_id': 4, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'contraindica_lesiones': None},
            ],
        },
    ]
    datos = {
        'edad': 25, 'peso': 70, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'activo', 'nivel_experiencia': 'principiante',
        'proposito': 'ganar masa muscular', 'dias_disponibles': 3,
    }
    perfil_medico = {
        'lesiones': ['LCA reconstruido rodilla derecha'],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos,
        perfil_medico=perfil_medico,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] == 21
    assert resultado['metadata']['plantillas_descartadas_por_lesiones'] == 1
    assert resultado['metadata']['plantillas_viables'] == 1
    assert resultado['metadata']['scores_detalle'][20] == 0
    assert resultado['metadata']['scores_detalle'][21] > 0
    print("[PASS] test_clasificador_descarta_plantilla_con_ejercicios_bloqueados")


def test_clasificador_todas_descartadas():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [
        {
            'id': 30,
            'nombre': 'Rutina mayoritariamente bloqueada',
            'tipo': 'fuerza',
            'objetivo': 'mantenimiento',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
                {'ejercicio_id': 80, 'nombre': 'Ejercicio 80', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
                {'ejercicio_id': 81, 'nombre': 'Ejercicio 81', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
                {'ejercicio_id': 82, 'nombre': 'Ejercicio 82', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
            ],
        },
    ]
    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'intermedio',
        'proposito': 'mantenimiento', 'dias_disponibles': 3,
    }
    perfil_medico = {
        'lesiones': ['rodilla - LCA'],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] is None
    assert resultado['confianza'] == 0.0
    assert resultado['metadata']['plantillas_evaluadas'] == 1
    assert resultado['metadata']['plantillas_descartadas_por_lesiones'] == 1
    assert resultado['metadata']['plantillas_viables'] == 0
    print("[PASS] test_clasificador_todas_descartadas")


def test_clasificador_sin_historial():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [
        {
            'id': 40,
            'nombre': 'Rutina basica',
            'tipo': 'fuerza',
            'objetivo': 'mantenimiento',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': None},
                {'ejercicio_id': 2, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': None},
            ],
        },
    ]
    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'principiante',
        'proposito': 'mantenimiento', 'dias_disponibles': 3,
    }
    perfil_medico = {
        'lesiones': [],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico,
        historial=None,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] == 40
    assert resultado['confianza'] > 0
    assert resultado['metadata']['plantillas_evaluadas'] == 1
    print("[PASS] test_clasificador_sin_historial")


def test_clasificador_plantillas_vacia():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=[],
        datos_cliente={'proposito': 'mantenimiento'},
        perfil_medico={},
        guardian=guardian,
    )

    assert resultado['plantilla_id'] is None
    assert resultado['confianza'] == 0.0
    assert resultado['metadata']['plantillas_evaluadas'] == 0
    print("[PASS] test_clasificador_plantillas_vacia")


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


def test_recommender_parsear_contraindicaciones():
    from services.recommender import RecommenderEngine

    assert RecommenderEngine._parsear_contraindicaciones(None) == []
    assert RecommenderEngine._parsear_contraindicaciones('') == []
    assert RecommenderEngine._parsear_contraindicaciones('hombro') == ['hombro']
    assert RecommenderEngine._parsear_contraindicaciones('hombro, rodilla') == ['hombro', 'rodilla']
    assert RecommenderEngine._parsear_contraindicaciones(' hombro , rodilla ') == ['hombro', 'rodilla']
    assert RecommenderEngine._parsear_contraindicaciones(['hombro', 'rodilla']) == ['hombro', 'rodilla']
    assert RecommenderEngine._parsear_contraindicaciones('["hombro", "rodilla"]') == ['hombro', 'rodilla']
    print("[PASS] test_recommender_parsear_contraindicaciones")


def test_recommender_coincide_con_lesiones():
    from services.recommender import RecommenderEngine

    assert RecommenderEngine._coincide_con_lesiones(
        ['rodilla'], ['rodilla - LCA']
    ) is True

    assert RecommenderEngine._coincide_con_lesiones(
        ['hombro'], ['rodilla - LCA']
    ) is False

    assert RecommenderEngine._coincide_con_lesiones(
        ['espalda_baja'], ['Hernia discal lumbar']
    ) is True

    assert RecommenderEngine._coincide_con_lesiones(['hombro'], []) is False

    assert RecommenderEngine._coincide_con_lesiones([], ['hombro']) is False

    assert RecommenderEngine._coincide_con_lesiones(
        ['hombro', 'codo'], ['Epicondilitis codo']
    ) is True

    print("[PASS] test_recommender_coincide_con_lesiones")


def test_clasificador_precaucion_solo_si_lesion_coincide():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    # Plantilla con ejercicio de precaución (no bloqueado HIGH/CRITICAL)
    plantillas = [
        {
            'id': 50, 'nombre': 'Rutina test', 'tipo': 'fuerza',
            'objetivo': 'mantenimiento', 'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': 'hombro'},
                {'ejercicio_id': 2, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'contraindica_lesiones': None},
                {'ejercicio_id': 4, 'nombre': 'Elevacion lateral', 'grupo_muscular': 'Hombro', 'contraindica_lesiones': 'hombro'},
            ],
        },
    ]
    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'principiante',
        'proposito': 'mantenimiento', 'dias_disponibles': 3,
    }
    # Lesión de rodilla - no debe afectar a ejercicios de hombro (precaución media)
    perfil_medico_rodilla = {
        'lesiones': ['rodilla - LCA'],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico_rodilla,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] == 50
    assert resultado['confianza'] > 0
    # La plantilla NO se descarta porque la lesión de rodilla no afecta a ejercicios de hombro/pecho/core
    # Press banca y elevacion lateral tienen contraindica_lesiones='hombro' -> no coincide con rodilla
    print("[PASS] test_clasificador_precaucion_solo_si_lesion_coincide")


def test_clasificador_descarta_por_ejercicio_critical_en_plantilla():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    # Plantilla con Sentadilla (CRITICAL para rodilla)
    plantillas = [
        {
            'id': 51, 'nombre': 'Rutina con sentadilla', 'tipo': 'fuerza',
            'objetivo': 'mantenimiento', 'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': None},
                {'ejercicio_id': 3, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
            ],
        },
    ]
    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'principiante',
        'proposito': 'mantenimiento', 'dias_disponibles': 3,
    }
    perfil_medico_rodilla = {
        'lesiones': ['rodilla - LCA'],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico_rodilla,
        guardian=guardian,
    )

    # La plantilla debe descartarse completamente por tener Sentadilla (CRITICAL para rodilla)
    assert resultado['plantilla_id'] is None
    assert resultado['confianza'] == 0.0
    assert resultado['metadata']['plantillas_descartadas_por_lesiones'] == 1
    print("[PASS] test_clasificador_descarta_por_ejercicio_critical_en_plantilla")


def test_clasificador_compatibilidad_sin_perfil_medico():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [{
        'id': 60, 'nombre': 'Rutina sin perfil', 'tipo': 'fuerza',
        'objetivo': 'mantenimiento', 'nivel_dificultad': 'principiante',
        'frecuencia_semanal': 3,
        'ejercicios': [
            {'ejercicio_id': 1, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': 'hombro'},
            {'ejercicio_id': 2, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'contraindica_lesiones': None},
        ],
    }]
    datos = {
        'edad': 25, 'peso': 70, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'activo', 'nivel_experiencia': 'principiante',
        'proposito': 'mantenimiento', 'dias_disponibles': 3,
    }
    perfil_medico = {
        'lesiones': [],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos,
        perfil_medico=perfil_medico,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] == 60
    assert resultado['confianza'] > 0
    # Sin perfil médico, todos los ejercicios son seguros
    print("[PASS] test_clasificador_compatibilidad_sin_perfil_medico")


def test_pool_seguro_vacio_raises_error():
    from services.hitl_engine import HitlEngine

    engine = HitlEngine()

    respuesta = engine._error_response(
        'No hay ejercicios seguros disponibles para este perfil '
        '(lesiones: rodilla). Pool completo filtrado por restricciones médicas.',
        422,
        {
            'alertas_seguridad': [{'tipo': 'lesion', 'nivel_riesgo': 'HIGH'}],
            'ejercicios_bloqueados': 10,
            'ejercicios_precaucion': 0,
            'pool_seguro_count': 0,
        },
    )
    assert respuesta['success'] is False
    assert respuesta['status'] == 422
    assert 'pool_seguro_count' in respuesta
    assert respuesta['pool_seguro_count'] == 0
    assert len(respuesta['alertas_seguridad']) == 1
    print("[PASS] test_pool_seguro_vacio_raises_error")


def test_clasificador_descarta_por_lesion_critical():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [
        {
            'id': 1,
            'nombre': 'Rutina Piernas Fuerte',
            'tipo': 'fuerza',
            'objetivo': 'ganancia_muscular',
            'nivel_dificultad': 'intermedio',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
                {'ejercicio_id': 2, 'nombre': 'Prensa piernas', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
            ],
        },
    ]

    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'intermedio',
        'proposito': 'ganar masa muscular', 'dias_disponibles': 3,
    }
    perfil_medico = {
        'lesiones': ['LCA reconstruido rodilla derecha'],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] is None
    assert resultado['confianza'] == 0.0
    assert resultado['metadata']['plantillas_descartadas_por_lesiones'] == 1
    assert resultado['metadata']['plantillas_viables'] == 0
    print("[PASS] test_clasificador_descarta_por_lesion_critical")


def test_clasificador_descarta_por_lesion_high():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [
        {
            'id': 2,
            'nombre': 'Rutina Empuje',
            'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular',
            'nivel_dificultad': 'intermedio',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 3, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': 'hombro'},
                {'ejercicio_id': 4, 'nombre': 'Press militar', 'grupo_muscular': 'Hombro', 'contraindica_lesiones': 'hombro'},
            ],
        },
    ]

    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'intermedio',
        'proposito': 'ganar masa muscular', 'dias_disponibles': 3,
    }
    perfil_medico = {
        'lesiones': ['Manguito rotador hombro izquierdo'],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] is None
    assert resultado['confianza'] == 0.0
    assert resultado['metadata']['plantillas_descartadas_por_lesiones'] == 1
    print("[PASS] test_clasificador_descarta_por_lesion_high")


def test_clasificador_retorna_mejor_viable():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [
        {
            'id': 10,
            'nombre': 'Rutina Ganancia 4d (con sentadilla)',
            'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular',
            'nivel_dificultad': 'intermedio',
            'frecuencia_semanal': 4,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Sentadilla', 'grupo_muscular': 'Piernas', 'contraindica_lesiones': 'rodilla'},
            ],
        },
        {
            'id': 11,
            'nombre': 'Rutina Push/Pull Segura',
            'tipo': 'hipertrofia',
            'objetivo': 'ganancia_muscular',
            'nivel_dificultad': 'intermedio',
            'frecuencia_semanal': 4,
            'ejercicios': [
                {'ejercicio_id': 5, 'nombre': 'Press de banca', 'grupo_muscular': 'Pecho', 'contraindica_lesiones': None},
                {'ejercicio_id': 6, 'nombre': 'Remo mancuerna', 'grupo_muscular': 'Espalda', 'contraindica_lesiones': None},
            ],
        },
        {
            'id': 12,
            'nombre': 'Rutina Full Body 3d',
            'tipo': 'fuerza',
            'objetivo': 'mantenimiento',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 3,
            'ejercicios': [
                {'ejercicio_id': 7, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'contraindica_lesiones': None},
            ],
        },
    ]

    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'intermedio',
        'proposito': 'ganar masa muscular', 'dias_disponibles': 4,
    }
    perfil_medico = {
        'lesiones': ['LCA reconstruido rodilla derecha'],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] == 11
    assert resultado['confianza'] > 50
    assert resultado['metadata']['plantillas_evaluadas'] == 3
    assert resultado['metadata']['plantillas_descartadas_por_lesiones'] == 1
    assert resultado['metadata']['plantillas_viables'] == 2
    assert 11 in resultado['metadata']['scores_detalle']
    assert 10 in resultado['metadata']['scores_detalle']
    assert resultado['metadata']['scores_detalle'][10] == 0
    print("[PASS] test_clasificador_retorna_mejor_viable")


def test_clasificador_advertencia_baja_confianza():
    from services.recommender import RecommenderEngine
    from services.guardian import GuardianSeguridad

    engine = RecommenderEngine()
    guardian = GuardianSeguridad()

    plantillas = [
        {
            'id': 20,
            'nombre': 'Rutina Mismatch Objetivo',
            'tipo': 'resistencia',
            'objetivo': 'perdida_peso',
            'nivel_dificultad': 'principiante',
            'frecuencia_semanal': 2,
            'ejercicios': [
                {'ejercicio_id': 1, 'nombre': 'Plancha', 'grupo_muscular': 'Core', 'contraindica_lesiones': None},
            ],
        },
    ]

    datos_cliente = {
        'edad': 30, 'peso': 75, 'altura': 1.75, 'sexo': 'masculino',
        'nivel_actividad': 'moderado', 'nivel_experiencia': 'intermedio',
        'proposito': 'ganar masa muscular', 'dias_disponibles': 5,
    }
    perfil_medico = {
        'lesiones': [],
        'condiciones_preexistentes': [],
    }

    resultado = engine.clasificar_mejor_plantilla(
        plantillas_con_ejercicios=plantillas,
        datos_cliente=datos_cliente,
        perfil_medico=perfil_medico,
        guardian=guardian,
    )

    assert resultado['plantilla_id'] == 20
    assert resultado['confianza'] < 50
    assert resultado['advertencia'] is not None
    assert 'sujeta a modificaciones' in resultado['advertencia'].lower()
    print("[PASS] test_clasificador_advertencia_baja_confianza")


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
    test_clasificador_normaliza_proposito()
    test_clasificador_descarta_plantilla_con_ejercicios_bloqueados()
    test_clasificador_todas_descartadas()
    test_clasificador_sin_historial()
    test_clasificador_plantillas_vacia()
    test_motor_nutricional_deficit()
    test_motor_nutricional_superavit()
    test_motor_nutricional_mantenimiento()
    test_guardian_dieta_bloqueo_tmb()
    test_guardian_dieta_aprobado()
    test_guardian_dieta_alerta_diabetes()
    test_guardian_dieta_alertas_alergias()
    test_normalizar_proposito()
    test_recommender_parsear_contraindicaciones()
    test_recommender_coincide_con_lesiones()
    test_clasificador_precaucion_solo_si_lesion_coincide()
    test_clasificador_compatibilidad_sin_perfil_medico()
    test_pool_seguro_vacio_raises_error()
    test_clasificador_descarta_por_lesion_critical()
    test_clasificador_descarta_por_lesion_high()
    test_clasificador_retorna_mejor_viable()
    test_clasificador_advertencia_baja_confianza()
    print("\n=== TODOS LOS TESTS PASARON ===")
