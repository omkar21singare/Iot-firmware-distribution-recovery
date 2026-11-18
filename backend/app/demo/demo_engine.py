import asyncio
import random
import datetime
import logging
import uuid
from typing import Dict, Any, List
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import Device, Firmware, Deployment, DeploymentDevice, TransferSession, RollbackEvent, SystemEvent, DeviceHealth, TransferHistory
from app.websocket.manager import manager as ws_manager
from app.services.adaptive_engine import AdaptiveEngineService
from app.schemas.schemas import AdaptiveInput

logger = logging.getLogger("demo_engine")

class DemoSimulationEngine:
    def __init__(self):
        self.is_running = False
        self.current_task: asyncio.Task = None

    async def seed_initial_demo_data(self):
        """Populates the database with initial demonstration ESP32 devices and firmware if empty."""
        async with AsyncSessionLocal() as db:
            # Check devices
            res = await db.execute(select(Device))
            devices = res.scalars().all()
            if not devices:
                logger.info("Seeding demo ESP32 devices...")
                demo_devices = [
                    Device(device_id="ESP32-001", name="ESP32 Motor Controller 01", ip_address="192.168.1.101", mac_address="24:0A:C4:00:01:01", priority="HIGH", compatibility_group="ESP32-MOTOR", wifi_rssi=-52.0, packet_loss=0.8, latency_ms=12.0, health_score=96.0, current_firmware_version="v2.3.8", failure_count=0, transfer_success_rate=99.2, is_demo=True),
                    Device(device_id="ESP32-002", name="ESP32 Motor Controller 02", ip_address="192.168.1.102", mac_address="24:0A:C4:00:01:02", priority="HIGH", compatibility_group="ESP32-MOTOR", wifi_rssi=-58.0, packet_loss=1.5, latency_ms=18.0, health_score=92.0, current_firmware_version="v2.3.8", failure_count=0, transfer_success_rate=98.0, is_demo=True),
                    Device(device_id="ESP32-003", name="ESP32 Sensor Gateway 03", ip_address="192.168.1.103", mac_address="24:0A:C4:00:01:03", priority="NORMAL", compatibility_group="ESP32-MOTOR", wifi_rssi=-64.0, packet_loss=2.1, latency_ms=25.0, health_score=88.0, current_firmware_version="v2.3.8", failure_count=1, transfer_success_rate=95.4, is_demo=True),
                    Device(device_id="ESP32-004", name="ESP32 Edge Node 04", ip_address="192.168.1.104", mac_address="24:0A:C4:00:01:04", priority="NORMAL", compatibility_group="ESP32-MOTOR", wifi_rssi=-78.0, packet_loss=11.5, latency_ms=85.0, health_score=64.0, current_firmware_version="v2.3.8", failure_count=3, transfer_success_rate=72.0, is_demo=True),
                    Device(device_id="ESP32-005", name="ESP32 Valve Monitor 05", ip_address="192.168.1.105", mac_address="24:0A:C4:00:01:05", priority="NORMAL", compatibility_group="ESP32-MOTOR", wifi_rssi=-61.0, packet_loss=1.9, latency_ms=22.0, health_score=91.0, current_firmware_version="v2.3.8", failure_count=0, transfer_success_rate=97.5, is_demo=True),
                    Device(device_id="ESP32-006", name="ESP32 Pump Station 06", ip_address="192.168.1.106", mac_address="24:0A:C4:00:01:06", priority="HIGH", compatibility_group="ESP32-MOTOR", wifi_rssi=-54.0, packet_loss=1.0, latency_ms=14.0, health_score=95.0, current_firmware_version="v2.3.8", failure_count=0, transfer_success_rate=99.0, is_demo=True),
                    Device(device_id="ESP32-007", name="ESP32 Feeder Unit 07", ip_address="192.168.1.107", mac_address="24:0A:C4:00:01:07", priority="LOW", compatibility_group="ESP32-MOTOR", wifi_rssi=-82.0, packet_loss=14.2, latency_ms=110.0, health_score=58.0, current_firmware_version="v2.3.8", failure_count=4, transfer_success_rate=65.0, is_demo=True),
                    Device(device_id="ESP32-008", name="ESP32 Conveyor Node 08", ip_address="192.168.1.108", mac_address="24:0A:C4:00:01:08", priority="NORMAL", compatibility_group="ESP32-MOTOR", wifi_rssi=-67.0, packet_loss=3.8, latency_ms=32.0, health_score=84.0, current_firmware_version="v2.3.8", failure_count=1, transfer_success_rate=92.1, is_demo=True),
                    Device(device_id="ESP32-012", name="ESP32 Critical Turbine 12", ip_address="192.168.1.112", mac_address="24:0A:C4:00:01:12", priority="HIGH", compatibility_group="ESP32-MOTOR", wifi_rssi=-71.0, packet_loss=8.4, latency_ms=62.0, health_score=68.0, current_firmware_version="v2.3.8", failure_count=2, transfer_success_rate=78.5, is_demo=True)
                ]
                db.add_all(demo_devices)
                await db.commit()

            # Check firmware
            fw_res = await db.execute(select(Firmware))
            firmwares = fw_res.scalars().all()
            if not firmwares:
                logger.info("Seeding demo firmware...")
                demo_fw = Firmware(
                    name="ESP32_MOTOR_MONITOR",
                    version="v2.4.1",
                    filename="ESP32_MOTOR_MONITOR_v2.4.1.bin",
                    size_bytes=1908400, # ~1.82 MB
                    sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    compatible_group="ESP32-MOTOR",
                    file_path="./firmware_repo/ESP32_MOTOR_MONITOR_v2.4.1.bin",
                    status="READY",
                    changelog="Added UDP multithreaded TFTP client block-resume support & dynamic RSSI throttling"
                )
                db.add(demo_fw)
                await db.commit()

    async def start_demo_simulation(self):
        if self.is_running:
            return
        self.is_running = True
        self.current_task = asyncio.create_task(self._run_simulation_loop())

    async def stop_demo_simulation(self):
        self.is_running = False
        if self.current_task:
            self.current_task.cancel()

    async def _run_simulation_loop(self):
        logger.info("Starting live demo simulation execution...")
        await self.seed_initial_demo_data()

        async with AsyncSessionLocal() as db:
            # 1. Fetch devices and firmware
            dev_res = await db.execute(select(Device).where(Device.is_demo == True))
            devices = dev_res.scalars().all()

            fw_res = await db.execute(select(Firmware).where(Firmware.version == "v2.4.1"))
            firmware = fw_res.scalar_one_or_none()
            if not firmware:
                firmware = Firmware(
                    name="ESP32_MOTOR_MONITOR",
                    version="v2.4.1",
                    filename="ESP32_MOTOR_MONITOR_v2.4.1.bin",
                    size_bytes=1908400,
                    sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    compatible_group="ESP32-MOTOR",
                    file_path="./firmware_repo/ESP32_MOTOR_MONITOR_v2.4.1.bin",
                    status="READY"
                )
                db.add(firmware)
                await db.commit()
                await db.refresh(firmware)

            # 2. Create Demo Deployment
            deployment = Deployment(
                name="Demo Industrial Fleet Upgrade v2.4.1",
                firmware_id=firmware.id,
                strategy="STAGED",
                status="IN_PROGRESS",
                current_stage=1,
                total_stages=3
            )
            db.add(deployment)
            await db.commit()
            await db.refresh(deployment)

            # Create sessions for devices
            active_sessions: List[Dict[str, Any]] = []
            worker_ids = [f"TFTP-Worker-{i+1}" for i in range(len(devices))]

            for idx, dev in enumerate(devices):
                # Evaluate adaptive engine mode
                adaptive_in = AdaptiveInput(
                    wifi_rssi=dev.wifi_rssi,
                    packet_loss=dev.packet_loss,
                    latency_ms=dev.latency_ms,
                    health_score=dev.health_score,
                    priority=dev.priority,
                    failure_count=dev.failure_count,
                    transfer_success_rate=dev.transfer_success_rate
                )
                decision = AdaptiveEngineService.evaluate_device(adaptive_in)

                sess_uuid = str(uuid.uuid4())
                session_db = TransferSession(
                    session_uuid=sess_uuid,
                    device_id=dev.id,
                    firmware_id=firmware.id,
                    deployment_id=deployment.id,
                    transfer_mode=decision.recommended_mode,
                    block_size=decision.block_size_bytes,
                    total_blocks=1000,
                    current_block=0,
                    bytes_transferred=0,
                    status="TRANSFERRING",
                    worker_thread_id=worker_ids[idx % len(worker_ids)],
                    speed_kbps=256.0 if decision.recommended_mode == "FAST" else (128.0 if decision.recommended_mode == "NORMAL" else 64.0),
                    packets_sent=0,
                    acks_received=0,
                    retries=0,
                    packet_loss=dev.packet_loss,
                    start_time=datetime.datetime.utcnow(),
                    last_activity=datetime.datetime.utcnow()
                )
                db.add(session_db)

                active_sessions.append({
                    "db_id": None, # to be updated after commit
                    "session_uuid": sess_uuid,
                    "device_code": dev.device_id,
                    "device_id": dev.id,
                    "mode": decision.recommended_mode,
                    "current_block": 0,
                    "total_blocks": 1000,
                    "worker_thread": worker_ids[idx % len(worker_ids)],
                    "speed_kbps": 256.0 if decision.recommended_mode == "FAST" else (128.0 if decision.recommended_mode == "NORMAL" else 64.0),
                    "retries": 0,
                    "packets_sent": 0,
                    "acks_received": 0,
                    "status": "TRANSFERRING",
                    "interrupted": False
                })

            await db.commit()

            # Broadcast simulation start
            await ws_manager.broadcast({
                "type": "SIMULATION_STARTED",
                "message": "Live UDP Multithreaded TFTP Demo Deployment Started",
                "deployment_id": deployment.id
            })

            # Simulate block transfers tick by tick
            for block_step in range(1, 101):
                if not self.is_running:
                    break
                await asyncio.sleep(0.35)

                for sess in active_sessions:
                    if sess["status"] == "COMPLETED" or sess["status"] == "PAUSED":
                        continue

                    # Increment block depending on mode speed
                    increment = 25 if sess["mode"] == "FAST" else (15 if sess["mode"] == "NORMAL" else 8)
                    sess["current_block"] = min(sess["total_blocks"], sess["current_block"] + increment)
                    sess["packets_sent"] += increment
                    sess["acks_received"] = max(0, sess["packets_sent"] - sess["retries"])

                    # Simulate specific events:
                    # ESP32-004 interrupted at block 438 to demonstrate Block Resume feature
                    if sess["device_code"] == "ESP32-004" and sess["current_block"] >= 438 and not sess["interrupted"]:
                        sess["current_block"] = 437
                        sess["status"] = "PAUSED"
                        sess["interrupted"] = True
                        sess["retries"] += 2
                        await ws_manager.broadcast({
                            "type": "SYSTEM_EVENT",
                            "level": "WARNING",
                            "category": "TFTP_TIMEOUT",
                            "device_code": "ESP32-004",
                            "message": "ESP32-004 transfer interrupted at block 437 due to packet loss (11.5%). Ready for block-level resume."
                        })

                    if sess["current_block"] >= sess["total_blocks"] and sess["status"] != "PAUSED":
                        sess["status"] = "COMPLETED"
                        await ws_manager.broadcast({
                            "type": "SYSTEM_EVENT",
                            "level": "SUCCESS",
                            "category": "TFTP_COMPLETE",
                            "device_code": sess["device_code"],
                            "message": f"{sess['device_code']} completed TFTP transfer (1000 blocks). SHA-256 Hash Verified ✓"
                        })

                # Broadcast live state update to frontend
                await ws_manager.broadcast({
                    "type": "TRANSFER_MONITOR_UPDATE",
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "active_sessions": active_sessions,
                    "worker_pool": {
                        "max_threads": 10,
                        "active_threads": sum(1 for s in active_sessions if s["status"] == "TRANSFERRING"),
                        "queued": 0,
                        "completed": sum(1 for s in active_sessions if s["status"] == "COMPLETED")
                    }
                })

            # Automatically simulate Resume for ESP32-004
            await asyncio.sleep(1.0)
            for sess in active_sessions:
                if sess["device_code"] == "ESP32-004" and sess["status"] == "PAUSED":
                    sess["status"] = "TRANSFERRING"
                    await ws_manager.broadcast({
                        "type": "SYSTEM_EVENT",
                        "level": "INFO",
                        "category": "RECOVERY",
                        "device_code": "ESP32-004",
                        "message": "ESP32-004 transfer RESUMED from block 437 instead of restarting from block 0!"
                    })
                    for r_block in range(437, 1001, 40):
                        await asyncio.sleep(0.15)
                        sess["current_block"] = min(1000, r_block)
                        await ws_manager.broadcast({
                            "type": "TRANSFER_MONITOR_UPDATE",
                            "timestamp": datetime.datetime.utcnow().isoformat(),
                            "active_sessions": active_sessions,
                            "worker_pool": {"max_threads": 10, "active_threads": 1, "queued": 0, "completed": len(active_sessions)-1}
                        })
                    sess["status"] = "COMPLETED"

            # Simulate Reboot & Health Check + Rollback Event for ESP32-012
            await asyncio.sleep(1.5)
            await ws_manager.broadcast({
                "type": "SYSTEM_EVENT",
                "level": "WARNING",
                "category": "HEALTH_CHECK",
                "device_code": "ESP32-012",
                "message": "ESP32-012 post-update health check FAILED (memory leak detected in v2.4.1 driver)."
            })
            await asyncio.sleep(1.0)

            # Trigger Rollback for ESP32-012
            rollback_evt = RollbackEvent(
                device_id=[d.id for d in devices if d.device_id == "ESP32-012"][0],
                deployment_id=deployment.id,
                failed_firmware_version="v2.4.1",
                restored_firmware_version="v2.3.8",
                trigger_reason="Post-update health check failure (Memory leak in motor telemetry task)",
                status="SUCCESS"
            )
            db.add(rollback_evt)

            sys_evt = SystemEvent(
                level="ERROR",
                category="ROLLBACK",
                message="Automatic Rollback Executed for ESP32-012: Restored firmware v2.3.8 successfully",
                device_code="ESP32-012"
            )
            db.add(sys_evt)

            deployment.status = "COMPLETED"
            await db.commit()

            await ws_manager.broadcast({
                "type": "ROLLBACK_TRIGGERED",
                "device_code": "ESP32-012",
                "failed_version": "v2.4.1",
                "restored_version": "v2.3.8",
                "reason": "Post-update health check failure (Memory leak)",
                "timestamp": datetime.datetime.utcnow().isoformat()
            })

            await ws_manager.broadcast({
                "type": "SIMULATION_COMPLETED",
                "message": "Demo Deployment Completed: All ESP32 devices updated with integrity check & automatic recovery validated!",
                "deployment_id": deployment.id
            })

        self.is_running = False

demo_engine = DemoSimulationEngine()
