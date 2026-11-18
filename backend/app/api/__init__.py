from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.devices import router as devices_router
from app.api.firmware import router as firmware_router
from app.api.deployments import router as deployments_router
from app.api.transfers import router as transfers_router
from app.api.adaptive import router as adaptive_router
from app.api.recovery import router as recovery_router
from app.api.analytics import router as analytics_router
from app.api.demo import router as demo_router
from app.api.esp32 import router as esp32_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(devices_router)
api_router.include_router(firmware_router)
api_router.include_router(deployments_router)
api_router.include_router(transfers_router)
api_router.include_router(adaptive_router)
api_router.include_router(recovery_router)
api_router.include_router(analytics_router)
api_router.include_router(demo_router)
api_router.include_router(esp32_router)
