import datetime
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Device, Deployment, TransferSession, RollbackEvent, SystemEvent
from app.websocket.manager import manager as ws_manager

logger = logging.getLogger("recovery_manager")

class RecoveryManager:
    @staticmethod
    async def initiate_block_resume(db: AsyncSession, session_id: int, target_block: int) -> bool:
        """Resumes an interrupted TFTP session from a specific block N."""
        result = await db.execute(select(TransferSession).where(TransferSession.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            return False

        device_res = await db.execute(select(Device).where(Device.id == session.device_id))
        device = device_res.scalar_one_or_none()
        device_code = device.device_id if device else "ESP32-UNKNOWN"

        session.current_block = max(0, target_block - 1)
        session.status = "RESUMED"
        session.retries += 1
        session.last_activity = datetime.datetime.utcnow()

        event = SystemEvent(
            level="WARNING",
            category="RECOVERY",
            message=f"Session {session.session_uuid[:8]} resumed from block {target_block} instead of restarting from block 0",
            device_code=device_code
        )
        db.add(event)
        await db.commit()

        # Broadcast event
        await ws_manager.broadcast({
            "type": "TRANSFER_RESUMED",
            "session_id": session_id,
            "device_code": device_code,
            "resumed_block": target_block,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        return True

    @staticmethod
    async def trigger_automatic_rollback(
        db: AsyncSession,
        device_id: int,
        failed_firmware_version: str,
        restored_firmware_version: str,
        reason: str,
        deployment_id: int = None
    ) -> RollbackEvent:
        """Triggers firmware rollback for a device that failed health verification."""
        result = await db.execute(select(Device).where(Device.id == device_id))
        device = result.scalar_one_or_none()
        
        if device:
            device.current_firmware_version = restored_firmware_version
            device.status = "ONLINE"
            device.health_score = 90.0 # Restored state health
            device.failure_count += 1

        rollback_evt = RollbackEvent(
            device_id=device_id,
            deployment_id=deployment_id,
            failed_firmware_version=failed_firmware_version,
            restored_firmware_version=restored_firmware_version,
            trigger_reason=reason,
            status="SUCCESS",
            timestamp=datetime.datetime.utcnow()
        )
        db.add(rollback_evt)

        sys_evt = SystemEvent(
            level="ERROR",
            category="ROLLBACK",
            message=f"Automatic rollback triggered for {device.device_id if device else 'Device'}: Reverted to {restored_firmware_version} due to {reason}",
            device_code=device.device_id if device else None
        )
        db.add(sys_evt)

        await db.commit()
        await db.refresh(rollback_evt)

        await ws_manager.broadcast({
            "type": "ROLLBACK_TRIGGERED",
            "device_code": device.device_id if device else "ESP32",
            "failed_version": failed_firmware_version,
            "restored_version": restored_firmware_version,
            "reason": reason,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })

        return rollback_evt
