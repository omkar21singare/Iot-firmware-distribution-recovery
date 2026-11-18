from fastapi import APIRouter
from app.demo.demo_engine import demo_engine

router = APIRouter(prefix="/demo", tags=["Demo Simulation"])

@router.post("/start")
async def start_demo_simulation():
    """Triggers live UDP multithreaded TFTP deployment demonstration with realistic block retries, resume, and rollback."""
    await demo_engine.start_demo_simulation()
    return {"message": "Demo simulation started successfully"}

@router.post("/stop")
async def stop_demo_simulation():
    """Stops running demo simulation."""
    await demo_engine.stop_demo_simulation()
    return {"message": "Demo simulation stopped"}

@router.get("/status")
async def get_demo_status():
    return {"is_running": demo_engine.is_running}
