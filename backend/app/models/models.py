import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="OPERATOR") # ADMIN / OPERATOR
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class DeploymentGroup(Base):
    __tablename__ = "deployment_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    hardware_series: Mapped[str] = mapped_column(String(50), default="ESP32-MOTOR")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    devices: Mapped[list["Device"]] = relationship("Device", back_populates="group")

class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[str] = mapped_column(String(50), unique=True, index=True) # e.g. ESP32-001
    name: Mapped[str] = mapped_column(String(100))
    ip_address: Mapped[str] = mapped_column(String(50))
    mac_address: Mapped[str] = mapped_column(String(50))
    group_id: Mapped[int] = mapped_column(Integer, ForeignKey("deployment_groups.id"), nullable=True)
    
    status: Mapped[str] = mapped_column(String(20), default="ONLINE") # ONLINE, OFFLINE, TRANSFERRING, ERROR
    hardware_version: Mapped[str] = mapped_column(String(50), default="ESP32-WROOM-32D")
    current_firmware_version: Mapped[str] = mapped_column(String(50), default="v2.3.8")
    target_firmware_version: Mapped[str] = mapped_column(String(50), nullable=True)
    
    priority: Mapped[str] = mapped_column(String(20), default="NORMAL") # HIGH, MEDIUM, LOW
    compatibility_group: Mapped[str] = mapped_column(String(50), default="ESP32-MOTOR")
    
    # Live Telemetry
    cpu_usage: Mapped[float] = mapped_column(Float, default=12.5)
    memory_usage: Mapped[float] = mapped_column(Float, default=38.2)
    temperature: Mapped[float] = mapped_column(Float, default=42.1)
    wifi_rssi: Mapped[float] = mapped_column(Float, default=-55.0) # dBm
    packet_loss: Mapped[float] = mapped_column(Float, default=1.2) # %
    latency_ms: Mapped[float] = mapped_column(Float, default=15.0)
    
    health_score: Mapped[float] = mapped_column(Float, default=95.0) # 0-100
    failure_count: Mapped[int] = mapped_column(Integer, default=0)
    transfer_success_rate: Mapped[float] = mapped_column(Float, default=98.5)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    
    last_seen: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    group: Mapped[DeploymentGroup] = relationship("DeploymentGroup", back_populates="devices")
    health_logs: Mapped[list["DeviceHealth"]] = relationship("DeviceHealth", back_populates="device", cascade="all, delete-orphan")
    transfers: Mapped[list["TransferSession"]] = relationship("TransferSession", back_populates="device")

class Firmware(Base):
    __tablename__ = "firmware"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100)) # e.g. ESP32_MOTOR_MONITOR
    version: Mapped[str] = mapped_column(String(50)) # e.g. v2.4.1
    filename: Mapped[str] = mapped_column(String(255))
    size_bytes: Mapped[int] = mapped_column(Integer)
    sha256_hash: Mapped[str] = mapped_column(String(64))
    compatible_group: Mapped[str] = mapped_column(String(50), default="ESP32-MOTOR")
    file_path: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default="READY") # READY, REVOKED
    changelog: Mapped[str] = mapped_column(Text, nullable=True)
    upload_date: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    versions: Mapped[list["FirmwareVersion"]] = relationship("FirmwareVersion", back_populates="firmware")

class FirmwareVersion(Base):
    __tablename__ = "firmware_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firmware_id: Mapped[int] = mapped_column(Integer, ForeignKey("firmware.id"))
    version: Mapped[str] = mapped_column(String(50))
    release_notes: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    firmware: Mapped[Firmware] = relationship("Firmware", back_populates="versions")

class Deployment(Base):
    __tablename__ = "deployments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    firmware_id: Mapped[int] = mapped_column(Integer, ForeignKey("firmware.id"))
    strategy: Mapped[str] = mapped_column(String(20), default="STAGED") # IMMEDIATE, STAGED, MANUAL
    status: Mapped[str] = mapped_column(String(20), default="IN_PROGRESS") # DRAFT, IN_PROGRESS, COMPLETED, FAILED, ROLLED_BACK
    current_stage: Mapped[int] = mapped_column(Integer, default=1)
    total_stages: Mapped[int] = mapped_column(Integer, default=3)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    completed_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=True)

    firmware: Mapped[Firmware] = relationship("Firmware")
    deployment_devices: Mapped[list["DeploymentDevice"]] = relationship("DeploymentDevice", back_populates="deployment")

class DeploymentDevice(Base):
    __tablename__ = "deployment_devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    deployment_id: Mapped[int] = mapped_column(Integer, ForeignKey("deployments.id"))
    device_id: Mapped[int] = mapped_column(Integer, ForeignKey("devices.id"))
    stage: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(20), default="PENDING") # PENDING, IN_PROGRESS, SUCCESS, FAILED, ROLLED_BACK
    transfer_mode: Mapped[str] = mapped_column(String(20), default="NORMAL") # FAST, NORMAL, SAFE
    current_block: Mapped[int] = mapped_column(Integer, default=0)
    total_blocks: Mapped[int] = mapped_column(Integer, default=0)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str] = mapped_column(String(255), nullable=True)

    deployment: Mapped[Deployment] = relationship("Deployment", back_populates="deployment_devices")
    device: Mapped[Device] = relationship("Device")

class TransferSession(Base):
    __tablename__ = "transfer_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_uuid: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    device_id: Mapped[int] = mapped_column(Integer, ForeignKey("devices.id"))
    firmware_id: Mapped[int] = mapped_column(Integer, ForeignKey("firmware.id"))
    deployment_id: Mapped[int] = mapped_column(Integer, ForeignKey("deployments.id"), nullable=True)
    
    transfer_mode: Mapped[str] = mapped_column(String(20), default="NORMAL") # FAST, NORMAL, SAFE
    block_size: Mapped[int] = mapped_column(Integer, default=512)
    total_blocks: Mapped[int] = mapped_column(Integer, default=1000)
    current_block: Mapped[int] = mapped_column(Integer, default=0)
    bytes_transferred: Mapped[int] = mapped_column(Integer, default=0)
    
    status: Mapped[str] = mapped_column(String(20), default="INITIALIZING") # INITIALIZING, TRANSFERRING, PAUSED, COMPLETED, FAILED, RESUMED
    worker_thread_id: Mapped[str] = mapped_column(String(50), default="Worker-1")
    speed_kbps: Mapped[float] = mapped_column(Float, default=128.0)
    packets_sent: Mapped[int] = mapped_column(Integer, default=0)
    acks_received: Mapped[int] = mapped_column(Integer, default=0)
    retries: Mapped[int] = mapped_column(Integer, default=0)
    packet_loss: Mapped[float] = mapped_column(Float, default=0.0)
    
    start_time: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    last_activity: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    failure_reason: Mapped[str] = mapped_column(String(255), nullable=True)

    device: Mapped[Device] = relationship("Device", back_populates="transfers")
    firmware: Mapped[Firmware] = relationship("Firmware")
    blocks: Mapped[list["TransferBlock"]] = relationship("TransferBlock", back_populates="session", cascade="all, delete-orphan")

class TransferBlock(Base):
    __tablename__ = "transfer_blocks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("transfer_sessions.id"))
    block_number: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="ACKED") # ACKED, RETRANSMITTED, FAILED
    retries: Mapped[int] = mapped_column(Integer, default=0)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    session: Mapped[TransferSession] = relationship("TransferSession", back_populates="blocks")

class DeviceHealth(Base):
    __tablename__ = "device_health"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[int] = mapped_column(Integer, ForeignKey("devices.id"))
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    
    cpu_usage: Mapped[float] = mapped_column(Float)
    memory_usage: Mapped[float] = mapped_column(Float)
    temperature: Mapped[float] = mapped_column(Float)
    wifi_rssi: Mapped[float] = mapped_column(Float)
    packet_loss: Mapped[float] = mapped_column(Float)
    latency_ms: Mapped[float] = mapped_column(Float)
    health_score: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="HEALTHY")

    device: Mapped[Device] = relationship("Device", back_populates="health_logs")

class TransferHistory(Base):
    __tablename__ = "transfer_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[int] = mapped_column(Integer, ForeignKey("devices.id"))
    firmware_id: Mapped[int] = mapped_column(Integer, ForeignKey("firmware.id"))
    start_time: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    packets_sent: Mapped[int] = mapped_column(Integer, default=0)
    retries: Mapped[int] = mapped_column(Integer, default=0)
    result: Mapped[str] = mapped_column(String(20)) # SUCCESS, FAILED, CANCELLED, RESUMED
    transfer_mode: Mapped[str] = mapped_column(String(20)) # FAST, NORMAL, SAFE
    hash_verified: Mapped[bool] = mapped_column(Boolean, default=True)

class RollbackEvent(Base):
    __tablename__ = "rollback_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    device_id: Mapped[int] = mapped_column(Integer, ForeignKey("devices.id"))
    deployment_id: Mapped[int] = mapped_column(Integer, ForeignKey("deployments.id"), nullable=True)
    failed_firmware_version: Mapped[str] = mapped_column(String(50))
    restored_firmware_version: Mapped[str] = mapped_column(String(50))
    trigger_reason: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default="SUCCESS") # IN_PROGRESS, SUCCESS, FAILED
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class SystemEvent(Base):
    __tablename__ = "system_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    level: Mapped[str] = mapped_column(String(20), default="INFO") # INFO, WARNING, ERROR, SUCCESS
    category: Mapped[str] = mapped_column(String(50), default="SYSTEM")
    message: Mapped[str] = mapped_column(String(255))
    device_code: Mapped[str] = mapped_column(String(50), nullable=True)
