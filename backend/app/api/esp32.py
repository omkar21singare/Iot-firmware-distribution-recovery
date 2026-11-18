import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import datetime

from app.database import get_db
from app.config import settings
from app.models import Device, Firmware, TransferSession, RollbackEvent, DeviceHealth
from app.schemas.schemas import (
    ESP32RegisterReq, ESP32HeartbeatReq, ESP32TelemetryReq, ResumeRequest
)
from app.services.recovery_manager import RecoveryManager
from app.websocket.manager import manager as ws_manager

router = APIRouter(prefix="/esp32", tags=["ESP32 Hardware Integration"])

@router.post("/register")
async def register_esp32_device(req: ESP32RegisterReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.device_id == req.device_id))
    device = result.scalar_one_or_none()

    if not device:
        device = Device(
            device_id=req.device_id,
            name=req.name,
            mac_address=req.mac_address,
            ip_address=req.ip_address,
            hardware_version=req.hardware_version,
            current_firmware_version=req.firmware_version,
            compatibility_group=req.compatibility_group,
            status="ONLINE",
            last_seen=datetime.datetime.utcnow()
        )
        db.add(device)
    else:
        device.ip_address = req.ip_address
        device.status = "ONLINE"
        device.last_seen = datetime.datetime.utcnow()

    await db.commit()
    await db.refresh(device)

    await ws_manager.broadcast({
        "type": "ESP32_REGISTERED",
        "device_code": device.device_id,
        "ip": device.ip_address,
        "mac": device.mac_address,
        "firmware": device.current_firmware_version
    })

    return {"status": "SUCCESS", "message": f"Device {req.device_id} registered successfully", "device_id": device.id}

@router.post("/heartbeat")
async def esp32_heartbeat(req: ESP32HeartbeatReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.device_id == req.device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")

    device.status = req.status
    device.cpu_usage = req.cpu_usage
    device.memory_usage = req.memory_usage
    device.temperature = req.temperature
    device.wifi_rssi = req.wifi_rssi
    device.packet_loss = req.packet_loss
    device.latency_ms = req.latency_ms
    device.last_seen = datetime.datetime.utcnow()

    # Visual health calculation
    health = 100.0 - (req.packet_loss * 3.0) - (max(0, -req.wifi_rssi - 50) * 0.5)
    device.health_score = round(max(0.0, min(100.0, health)), 1)

    await db.commit()
    return {"status": "ACK", "server_time": datetime.datetime.utcnow().isoformat(), "target_firmware": device.target_firmware_version}

@router.post("/health")
async def esp32_report_health(req: ESP32TelemetryReq, db: AsyncSession = Depends(get_db)):
    return await esp32_heartbeat(req, db)

@router.get("/compatibility/{device_id}")
async def check_esp32_compatibility(device_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    fw_res = await db.execute(select(Firmware).where(Firmware.compatible_group == device.compatibility_group).order_by(Firmware.upload_date.desc()))
    compatible_firmwares = fw_res.scalars().all()

    return {
        "device_id": device.device_id,
        "hardware_version": device.hardware_version,
        "compatibility_group": device.compatibility_group,
        "latest_compatible_version": compatible_firmwares[0].version if compatible_firmwares else None,
        "firmware_options": [
            {
                "id": f.id,
                "version": f.version,
                "size_bytes": f.size_bytes,
                "sha256_hash": f.sha256_hash,
                "download_url": f"/api/esp32/firmware/download/{f.id}"
            }
            for f in compatible_firmwares
        ]
    }

@router.get("/firmware/download/{firmware_id}")
async def download_firmware_binary(firmware_id: int, db: AsyncSession = Depends(get_db)):
    """Allows ESP32 device to download raw binary payload."""
    fw_res = await db.execute(select(Firmware).where(Firmware.id == firmware_id))
    firmware = fw_res.scalar_one_or_none()
    if not firmware or not os.path.exists(firmware.file_path):
        raise HTTPException(status_code=404, detail="Firmware binary file missing")

    return FileResponse(
        path=firmware.file_path,
        filename=firmware.filename,
        media_type="application/octet-stream"
    )

@router.post("/{device_id}/rollback")
async def esp32_trigger_rollback(device_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    event = await RecoveryManager.trigger_automatic_rollback(
        db=db,
        device_id=device.id,
        failed_firmware_version=device.current_firmware_version,
        restored_firmware_version="v2.3.8",
        reason="ESP32 hardware health failure reported"
    )
    return {"status": "SUCCESS", "message": f"Rollback initiated for {device_id}", "restored_version": "v2.3.8"}
