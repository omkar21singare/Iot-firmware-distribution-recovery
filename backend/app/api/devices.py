from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.models import Device, DeviceHealth, TransferHistory
from app.schemas.schemas import DeviceCreate, DeviceOut, DeviceTelemetry

router = APIRouter(prefix="/devices", tags=["Devices"])

@router.get("", response_model=List[DeviceOut])
async def list_devices(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Device)
    if status:
        query = query.where(Device.status == status)
    result = await db.execute(query)
    devices = result.scalars().all()
    return devices

@router.post("", response_model=DeviceOut)
async def create_device(device_in: DeviceCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Device).where(Device.device_id == device_in.device_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Device {device_in.device_id} already exists")
    
    device = Device(
        device_id=device_in.device_id,
        name=device_in.name,
        ip_address=device_in.ip_address,
        mac_address=device_in.mac_address,
        hardware_version=device_in.hardware_version,
        current_firmware_version=device_in.current_firmware_version,
        compatibility_group=device_in.compatibility_group,
        priority=device_in.priority,
        status="ONLINE"
    )
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device

@router.get("/{device_id}", response_model=DeviceOut)
async def get_device_detail(device_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device).where((Device.device_id == device_id) | (Device.id == int(device_id) if device_id.isdigit() else False)))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.post("/{device_id}/telemetry", response_model=DeviceOut)
async def update_device_telemetry(
    device_id: str,
    telemetry: DeviceTelemetry,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    device.cpu_usage = telemetry.cpu_usage
    device.memory_usage = telemetry.memory_usage
    device.temperature = telemetry.temperature
    device.wifi_rssi = telemetry.wifi_rssi
    device.packet_loss = telemetry.packet_loss
    device.latency_ms = telemetry.latency_ms
    
    # Calculate visual health score (0-100)
    health = 100.0 - (telemetry.packet_loss * 3.0) - (max(0, -telemetry.wifi_rssi - 50) * 0.5) - (max(0, telemetry.temperature - 50) * 1.5)
    device.health_score = round(max(0.0, min(100.0, health)), 1)
    
    # Record health history log
    health_log = DeviceHealth(
        device_id=device.id,
        cpu_usage=telemetry.cpu_usage,
        memory_usage=telemetry.memory_usage,
        temperature=telemetry.temperature,
        wifi_rssi=telemetry.wifi_rssi,
        packet_loss=telemetry.packet_loss,
        latency_ms=telemetry.latency_ms,
        health_score=device.health_score,
        status="HEALTHY" if device.health_score > 75 else ("WARNING" if device.health_score > 50 else "CRITICAL")
    )
    db.add(health_log)
    await db.commit()
    await db.refresh(device)
    return device
