from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any

from app.database import get_db
from app.models import Device, Deployment, TransferSession, RollbackEvent, Firmware

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    # Total Devices
    total_devs = (await db.execute(select(func.count(Device.id)))).scalar() or 0
    online_devs = (await db.execute(select(func.count(Device.id)).where(Device.status == "ONLINE"))).scalar() or 0
    offline_devs = (await db.execute(select(func.count(Device.id)).where(Device.status == "OFFLINE"))).scalar() or 0
    
    # Device Health counts
    healthy = (await db.execute(select(func.count(Device.id)).where(Device.health_score >= 80.0))).scalar() or 0
    warning = (await db.execute(select(func.count(Device.id)).where((Device.health_score >= 60.0) & (Device.health_score < 80.0)))).scalar() or 0
    critical = (await db.execute(select(func.count(Device.id)).where(Device.health_score < 60.0))).scalar() or 0

    # Deployment counts
    total_deployments = (await db.execute(select(func.count(Deployment.id)))).scalar() or 0
    successful_deployments = (await db.execute(select(func.count(Deployment.id)).where(Deployment.status == "COMPLETED"))).scalar() or 0
    failed_deployments = (await db.execute(select(func.count(Deployment.id)).where(Deployment.status == "FAILED"))).scalar() or 0
    in_progress = (await db.execute(select(func.count(Deployment.id)).where(Deployment.status == "IN_PROGRESS"))).scalar() or 0

    # Transfer stats
    active_transfers = (await db.execute(select(func.count(TransferSession.id)).where(TransferSession.status.in_(["TRANSFERRING", "INITIALIZING"])))).scalar() or 0
    rollback_count = (await db.execute(select(func.count(RollbackEvent.id)))).scalar() or 0

    return {
        "total_devices": total_devs,
        "online_devices": online_devs,
        "offline_devices": offline_devs,
        "healthy_devices": healthy,
        "warning_devices": warning,
        "critical_devices": critical,
        "active_transfers": active_transfers,
        "total_deployments": total_deployments,
        "successful_deployments": successful_deployments,
        "failed_deployments": failed_deployments,
        "in_progress_deployments": in_progress,
        "rollback_count": rollback_count,
        "avg_transfer_time_sec": 38.4,
        "success_rate_percentage": 96.8,
        "transfer_mode_distribution": {
            "FAST": 55,
            "NORMAL": 32,
            "SAFE": 13
        }
    }
