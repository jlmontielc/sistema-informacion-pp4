import mysql.connector
from mysql.connector import pooling
from config.settings import (
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
)

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        config = {
            'host': DB_HOST,
            'port': int(DB_PORT),
            'database': DB_NAME,
            'user': DB_USER,
            'password': DB_PASSWORD,
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'autocommit': True,
            'connection_timeout': 10,
            'ssl_disabled': False,
        }
        try:
            import ssl
            ssl_ctx = ssl.create_default_context()
            config['ssl_ca'] = None
            config['ssl_verify_cert'] = False
            config['ssl_verify_identity'] = False
        except Exception:
            config['ssl_disabled'] = True

        _pool = pooling.MySQLConnectionPool(
            pool_name='hitl_pool',
            pool_size=5,
            pool_reset_session=True,
            **config,
        )
    return _pool


def get_connection():
    pool = get_pool()
    return pool.get_connection()


def execute_query(query: str, params: tuple = None) -> list:
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        result = cursor.fetchall()
        cursor.close()
        return result
    finally:
        conn.close()


def execute_one(query: str, params: tuple = None) -> dict:
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        result = cursor.fetchone()
        cursor.close()
        return result
    finally:
        conn.close()


def execute_insert(query: str, params: tuple = None) -> int:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        last_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        return last_id
    finally:
        conn.close()
