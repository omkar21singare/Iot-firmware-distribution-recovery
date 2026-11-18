from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import RollbackEvent, Device, SystemEvent
from app.schemas.schemas import RollbackEventOut
from app.services.recovery_manager import RecoveryManager

router = APIRouter(prefix="/recovery", tags=["Recovery Center"])

@router.get("/rollbacks", response_model=List[RollbackEventOut])
async def list_rollback_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RollbackEvent).order_by(RollbackEvent.timestamp.desc()))
    rollbacks = result.scalars().all()

    output = []
    for r in rollbacks:
        dev_res = await db.execute(select(Device).where(Device.id == r.device_id))
        dev = dev_res.scalar_one_or_none()
        
        output.append(RollbackEventOut(
            id=r.id,
            device_id=r.device_id,
            device_code=dev.device_id if dev else f"DEV-{r.device_id}",
            failed_firmware_version=r.failed_firmware_version,
            restored_firmware_version=r.restored_firmware_version,
            trigger_reason=r.trigger_reason,
            status=r.status,
            timestamp=r.timestamp
        ))
    return output

@router.post("/trigger-rollback/{device_id}")
async def manual_trigger_rollback(
    device_id: int,
    reason: str = "Manual Administrator Rollback Triggered",
    db: AsyncSession = Depends(get_db)
):
    dev_res = await db.execute(select(Device).where(Device.id == device_id))
    dev = dev_res.scalar_one_or_none()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")

    rollback_event = await RecoveryManager.trigger_automatic_rollback(
        db=db,
        device_id=device_id,
        failed_firmware_version=dev.current_firmware_version,
        restored_firmware_version="v2.3.8",
        reason=reason
    )
    return {"message": f"Rollback executed for {dev.device_id}", "rollback_id": rollback_event.id}

@router.get("/events")
async def list_system_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemEvent).order_by(SystemEvent.timestamp.desc()).limit(50))
    events = result.scalars().all()
    return events
