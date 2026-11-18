import datetime
import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Deployment, DeploymentDevice, Device, Firmware, TransferSession, SystemEvent
from app.services.adaptive_engine import AdaptiveEngineService
from app.schemas.schemas import AdaptiveInput
from app.websocket.manager import manager as ws_manager

logger = logging.getLogger("deployment_manager")

class DeploymentManager:
    @staticmethod
    async def create_and_start_deployment(
        db: AsyncSession,
        name: str,
        firmware_id: int,
        target_device_ids: List[int],
        strategy: str = "STAGED",
        total_stages: int = 3
    ) -> Deployment:
        # Fetch firmware
        fw_res = await db.execute(select(Firmware).where(Firmware.id == firmware_id))
        firmware = fw_res.scalar_one_or_none()
        if not firmware:
            raise ValueError(f"Firmware with ID {firmware_id} not found")

        # Create deployment record
        deployment = Deployment(
            name=name,
            firmware_id=firmware_id,
            strategy=strategy,
            status="IN_PROGRESS",
            current_stage=1,
            total_stages=total_stages if strategy == "STAGED" else 1,
            created_at=datetime.datetime.utcnow()
        )
        db.add(deployment)
        await db.flush()

        # Fetch devices
        dev_res = await db.execute(select(Device).where(Device.id.in_(target_device_ids)))
        devices = dev_res.scalars().all()

        devices_per_stage = max(1, (len(devices) + total_stages - 1) // total_stages) if strategy == "STAGED" else len(devices)

        for idx, dev in enumerate(devices):
            stage = (idx // devices_per_stage) + 1 if strategy == "STAGED" else 1
            
            # Evaluate adaptive transfer mode for this device
            adaptive_input = AdaptiveInput(
                wifi_rssi=dev.wifi_rssi,
                packet_loss=dev.packet_loss,
                latency_ms=dev.latency_ms,
                health_score=dev.health_score,
                priority=dev.priority,
                failure_count=dev.failure_count,
                transfer_success_rate=dev.transfer_success_rate,
                compatibility_match=(dev.compatibility_group == firmware.compatible_group)
            )
            decision = AdaptiveEngineService.evaluate_device(adaptive_input)
            
            deploy_device = DeploymentDevice(
                deployment_id=deployment.id,
                device_id=dev.id,
                stage=stage,
                status="PENDING",
                transfer_mode=decision.recommended_mode,
                current_block=0,
                total_blocks=(firmware.size_bytes + decision.block_size_bytes - 1) // decision.block_size_bytes,
                retry_count=0
            )
            db.add(deploy_device)

            # Update target firmware on device
            dev.target_firmware_version = firmware.version

        sys_evt = SystemEvent(
            level="INFO",
            category="DEPLOYMENT",
            message=f"Started deployment '{name}' ({strategy}) for {len(devices)} devices with firmware {firmware.version}"
        )
        db.add(sys_evt)

        await db.commit()
        await db.refresh(deployment)

        await ws_manager.broadcast({
            "type": "DEPLOYMENT_CREATED",
            "deployment_id": deployment.id,
            "name": name,
            "strategy": strategy,
            "firmware_version": firmware.version,
            "total_devices": len(devices),
            "timestamp": datetime.datetime.utcnow().isoformat()
        })

        return deployment
