import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.api import api_router
from app.websocket.manager import manager as ws_manager
from app.demo.demo_engine import demo_engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables in Database
    logger.info("Initializing Database Tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed initial demo devices
    await demo_engine.seed_initial_demo_data()
    logger.info("Database and Initial Demo Data ready.")
    
    yield
    
    # Shutdown
    logger.info("Shutting down TFTP server & demo simulation...")
    await demo_engine.stop_demo_simulation()

app = FastAPI(
    title="Adaptive Intelligent Firmware Distribution & Recovery System API",
    description="Backend API for UDP-based Multithreaded TFTP IoT Firmware Deployment System",
    version="2.4.1",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# WebSocket Endpoint
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming ping/pong or client request
            await websocket.send_text(f'{{"type": "PONG", "received": {data}}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

@app.get("/")
async def root():
    return {
        "system": "Adaptive Intelligent Firmware Distribution & Recovery System for IoT Devices",
        "patent_title": "Adaptive Intelligent Firmware Distribution and Recovery System for IoT Devices Using UDP-Based Multithreaded TFTP",
        "version": "2.4.1",
        "docs_url": "/docs",
        "status": "ONLINE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
