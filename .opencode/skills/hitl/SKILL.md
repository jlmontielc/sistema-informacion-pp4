---
name: hitl
description: Flujo completo HITL (Human-in-the-Loop) del sistema PP4. Usa esta skill cuando se trabaje en recomendaciones de rutinas, predicciones de Flask, reglas Guardian de seguridad, feedback de entrenadores, o cualquier tarea que toque el flujo entre backend-node, backend-flask y la tabla feedback_hitl.
---

# Flujo HITL (Human-in-the-Loop)

El sistema PP4 usa un flujo HITL para las recomendaciones de entrenamiento: la IA propone, la logica de seguridad valida, y un humano (entrenador) decide antes de publicar. Cualquier cambio que toque este flujo debe preservar los 4 pasos.

## Diagrama del flujo

```
Instruido -> Node (entrenamiento/hitl.service.js)
   1. Node descifra datos medicos (AES-256-CBC via shared/utils/crypto.js)
   2. POST HTTP -> Flask /api/predict/routine con los datos en claro
      Flask: RecommenderEngine genera recomendacion (services/recommender.py)
   3. Node ejecuta Guardian (reglas en backend-flask/models/rules/:
      injury_rules.py, condition_rules.py, load_rules.py)
      -> si hay contraindicacion: BLOQUEA y alerta al entrenador
   4. Entrenador revisa: acepta / modifica / rechaza
      -> resultado persistido en feedback_hitl (backend-node
      entrenamiento/hitl-feedback.model.js + Flask feedback_store.py)
```

## Puntos criticos (no romper)

- **Cifrado:** `alergias`, `intolerancias`, `lesiones`, `condiciones_preexistentes` se cifran en la DB (AES-256-CBC). Node las descifra SOLO antes de enviarlas a Flask. El frontend nunca las recibe en claro.
- **Guardian doble:** Flask no bloquea; solo predice. La validacion de contraindicaciones ocurre en Node (nivel de riesgo). Ambos lados deben estar sincronizados en el formato de la respuesta (NivelRiesgo, motivos).
- **Contratos HTTP:** el JSON de entrada (ejercicio, historial medico, carga) y salida (recomendacion, nivel de riesgo, motivos de bloqueo) es compartido. Cambiarlo en un lado sin el otro rompe el flujo.

## Archivos clave

| Servicio | Archivo | Rol |
|---|---|---|
| Node | `backend-node/src/modules/entrenamiento/hitl.service.js` | Orquestador del lado Node |
| Node | `backend-node/src/modules/entrenamiento/hitl-feedback.model.js` | Persistencia del feedback |
| Flask | `backend-flask/api/hitl_routes.py` | Endpoints `/routine`, `/validate`, `/feedback` |
| Flask | `backend-flask/services/hitl_engine.py` | Orquestador del lado Flask |
| Flask | `backend-flask/services/guardian.py` | `GuardianSeguridad` |
| Flask | `backend-flask/models/rules/*.py` | Reglas puras de lesiones/condiciones/carga |
| Flask | `backend-flask/tests/test_guardian.py` | 13 asserts que validan el Guardian |

## Verificacion tras cambios

1. `cd backend-flask && python tests/test_guardian.py` — las 13 funciones deben pasar.
2. Revisar que los contratos JSON entre `hitl.service.js` y `hitl_routes.py` sigan coincidiendo.
3. Confirmar que el feedback se persiste en `feedback_hitl` (Node) y `feedback_store.py` (Flask).
4. Si se agrega una regla nueva, anadir su funcion `test_*` al bloque `__main__` de `test_guardian.py`.