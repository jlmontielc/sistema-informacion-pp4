---
description: Construye y levanta los 3 servicios del proyecto con Docker Compose (o solo detiene si se pasa down).
agent: build
---

Gestiona el entorno Docker del proyecto PP4. Segun el parametro:

- Sin argumentos o con `up`: ejecuta `docker-compose up --build` (construye imagenes y levanta backend-node, backend-flask y frontend/nginx). Espera a que los servicios respondan y reporta el estado de cada contenedor con `docker-compose ps`.
- Con `down`: ejecuta `docker-compose down` para detener todo.
- Con `logs`: muestra los logs con `docker-compose logs --tail=50`.

$ARGUMENTS