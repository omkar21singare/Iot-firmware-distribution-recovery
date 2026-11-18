import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adaptive TFTP IoT Firmware System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "super-secret-key-for-jwt-token-auth-change-in-production-123456"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # MySQL Database Config (Strictly enforced: no SQLite fallback)
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_HOST: str = "127.0.0.1"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "tftp_iot_db"

    DATABASE_URL: str = ""

    # TFTP Server Config
    TFTP_HOST: str = "0.0.0.0"
    TFTP_PORT: int = 6969
    FIRMWARE_DIRECTORY: str = "./firmware_repo"
    MAX_TFTP_THREADS: int = 10
    DEFAULT_TIMEOUT: float = 2.0  # seconds
    MAX_RETRIES: int = 5

    # URLs
    WEBSOCKET_URL: str = "ws://localhost:8000/api/ws"
    API_URL: str = "http://localhost:8000/api"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Construct standard MySQL async connection URL if not directly specified
if not settings.DATABASE_URL:
    settings.DATABASE_URL = (
        f"mysql+aiomysql://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@"
        f"{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}?charset=utf8mb4"
    )

if not settings.DATABASE_URL.startswith("mysql+aiomysql://") and not settings.DATABASE_URL.startswith("mysql+asyncmy://"):
    raise RuntimeError(
        f"Invalid DATABASE_URL dialect: '{settings.DATABASE_URL}'. "
        "Strict requirement: MySQL with aiomysql is required. SQLite and PostgreSQL are disabled."
    )

os.makedirs(settings.FIRMWARE_DIRECTORY, exist_ok=True)

