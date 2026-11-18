import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adaptive TFTP IoT Firmware System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "super-secret-key-for-jwt-token-auth-change-in-production-123456"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./tftp_iot.db"

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

os.makedirs(settings.FIRMWARE_DIRECTORY, exist_ok=True)
