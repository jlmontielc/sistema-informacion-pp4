import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'sistema_entrenador')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
JWT_SECRET = os.getenv('JWT_SECRET', '')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
