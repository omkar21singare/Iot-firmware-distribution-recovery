from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from app.database import get_db
from app.models import Deployment, Device, Firmware, DeploymentDevice
from app.schemas.schemas import DeploymentCreate, DeploymentOut, DeploymentWizardCheck
from app.services.deployment_manager import DeploymentManager
from app.services.adaptive_engine import AdaptiveEngineService
from app.schemas.schemas import AdaptiveInput

router = APIRouter(prefix="/deployments", tags=["Deployments"])

@router.get("", response_model=List[DeploymentOut])
async def list_deployments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deployment).order_by(Deployment.created_at.desc()))
    deployments = result.scalars().all()
    return deployments

@router.post("/wizard-check")
async def deployment_wizard_compatibility_check(
    req: DeploymentWizardCheck,
    db: AsyncSession = Depends(get_db)
):
    fw_res = await db.execute(select(Firmware).where(Firmware.id == req.firmware_id))
    firmware = fw_res.scalar_one_or_none()
    if not firmware:
        raise HTTPException(status_code=404, detail="Selected firmware binary not found")

    dev_res = await db.execute(select(Device).where(Device.id.in_(req.target_device_ids)))
    devices = dev_res.scalars().all()

    compatible_count = 0
    incompatible_count = 0
    offline_count = 0

    evaluated_devices = []

    for dev in devices:
        if dev.status == "OFFLINE":
            offline_count += 1
            status_str = "OFFLINE"
        elif dev.compatibility_group != firmware.compatible_group:
            incompatible_count += 1
            status_str = "INCOMPATIBLE"
        else:
            compatible_count += 1
            status_str = "COMPATIBLE"

        # Adaptive engine recommendation for wizard preview
        adaptive_in = AdaptiveInput(
            wifi_rssi=dev.wifi_rssi,
            packet_loss=dev.packet_loss,
            latency_ms=dev.latency_ms,
            health_score=dev.health_score,
            priority=dev.priority,
            failure_count=dev.failure_count,
            transfer_success_rate=dev.transfer_success_rate,
            compatibility_match=(dev.compatibility_group == firmware.compatible_group)
        )
        decision = AdaptiveEngineService.evaluate_device(adaptive_in)

        evaluated_devices.append({
            "id": dev.id,
            "device_id": dev.device_id,
            "name": dev.name,
            "compatibility_status": status_str,
            "recommended_mode": decision.recommended_mode,
            "health_score": dev.health_score,
            "wifi_rssi": dev.wifi_rssi,
            "packet_loss": dev.packet_loss,
            "explanation": decision.explanation
        })

    return {
        "firmware_name": firmware.name,
        "firmware_version": firmware.version,
        "total_targets": len(devices),
        "compatible_count": compatible_count,
        "incompatible_count": incompatible_count,
        "offline_count": offline_count,
        "devices": evaluated_devices
    }

@router.post("", response_model=DeploymentOut)
async def create_deployment(
    req: DeploymentCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        deployment = await DeploymentManager.create_and_start_deployment(
            db=db,
            name=req.name,
            firmware_id=req.firmware_id,
            target_device_ids=req.target_device_ids,
            strategy=req.strategy,
            total_stages=req.total_stages
        )
        return deployment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
