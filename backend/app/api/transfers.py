from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from app.database import get_db
from app.models import TransferSession, Device, Firmware
from app.schemas.schemas import TransferSessionOut, ResumeRequest
from app.tftp.tftp_server import tftp_manager
from app.services.recovery_manager import RecoveryManager

router = APIRouter(prefix="/transfers", tags=["Transfers"])

@router.get("/active", response_model=List[TransferSessionOut])
async def list_active_transfers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TransferSession).order_by(TransferSession.last_activity.desc()))
    sessions = result.scalars().all()

    output = []
    for s in sessions:
        dev_res = await db.execute(select(Device).where(Device.id == s.device_id))
        dev = dev_res.scalar_one_or_none()
        
        fw_res = await db.execute(select(Firmware).where(Firmware.id == s.firmware_id))
        fw = fw_res.scalar_one_or_none()

        progress = (s.current_block / max(1, s.total_blocks)) * 100.0 if s.total_blocks else 0.0

        output.append(TransferSessionOut(
            id=s.id,
            session_uuid=s.session_uuid,
            device_id=s.device_id,
            device_code=dev.device_id if dev else f"DEV-{s.device_id}",
            firmware_id=s.firmware_id,
            firmware_version=fw.version if fw else "v1.0.0",
            transfer_mode=s.transfer_mode,
            block_size=s.block_size,
            total_blocks=s.total_blocks,
            current_block=s.current_block,
            progress_percentage=round(progress, 1),
            bytes_transferred=s.bytes_transferred,
            status=s.status,
            worker_thread_id=s.worker_thread_id,
            speed_kbps=s.speed_kbps,
            packets_sent=s.packets_sent,
            acks_received=s.acks_received,
            retries=s.retries,
            packet_loss=s.packet_loss,
            start_time=s.start_time,
            last_activity=s.last_activity,
            failure_reason=s.failure_reason
        ))
    return output

@router.get("/worker-pool")
async def get_tftp_worker_pool_status():
    """Returns multithread worker pool metrics for UI dynamic thread visualization."""
    return tftp_manager.get_worker_pool_status()

@router.post("/{session_id}/resume")
async def resume_transfer_session(
    session_id: int,
    req: ResumeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Resumes an interrupted session from block `req.from_block` instead of block 0."""
    success = await RecoveryManager.initiate_block_resume(db, session_id, req.from_block)
    if not success:
        raise HTTPException(status_code=404, detail="Transfer session not found")
    return {"message": f"Session resumed successfully from block {req.from_block}", "from_block": req.from_block}
