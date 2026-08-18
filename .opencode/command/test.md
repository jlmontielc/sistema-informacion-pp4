---
description: Ejecuta las suites de tests de los 3 servicios (Node con coverage, Flask manual, frontend).
agent: tester
---

Ejecuta TODAS las suites de tests del proyecto una por una y reporta el resultado completo de cada una:

1. Node: `cd backend-node && npm test` (Jest con coverage).
2. Flask: `cd backend-flask && python tests/test_guardian.py` (patron manual con asserts).
3. Frontend: `cd frontend && npm test` (react-scripts test, no interactivo).

Al final entrega un resumen por servicio con: cantidad de tests, estado (todos pasan / fallos con causa) y cobertura si aplica. Si usas argumentos adicionales, pasalos al parametro $ARGUMENTS cuando tenga sentido (ej. un filtro de test especifico).

$ARGUMENTS