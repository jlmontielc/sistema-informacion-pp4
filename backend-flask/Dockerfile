FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir gunicorn -r requirements.txt

COPY . .

EXPOSE 5000

# Forma shell (no exec) para que el shell expanda ${PORT}: Render asigna el puerto
# en la variable de entorno PORT y su proxy inverso solo enruta hacia ese puerto.
# Si PORT no esta definida (docker-compose local), cae en 5000.
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} app:app
