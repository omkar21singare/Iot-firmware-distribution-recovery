from pydantic import BaseModel, Field
from typing import Optional, List
import datetime

# User Schemas
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    username: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True

# Device Schemas
class DeviceCreate(BaseModel):
    device_id: str
    name: str
    ip_address: str
    mac_address: str
    hardware_version: str = "ESP32-WROOM-32D"
    current_firmware_version: str = "v2.3.8"
    compatibility_group: str = "ESP32-MOTOR"
    priority: str = "NORMAL"

class DeviceTelemetry(BaseModel):
    cpu_usage: float
    memory_usage: float
    temperature: float
    wifi_rssi: float
    packet_loss: float
    latency_ms: float

class DeviceOut(BaseModel):
    id: int
    device_id: str
    name: str
    ip_address: str
    mac_address: str
    status: str
    hardware_version: str
    current_firmware_version: str
    target_firmware_version: Optional[str] = None
    priority: str
    compatibility_group: str
    cpu_usage: float
    memory_usage: float
    temperature: float
    wifi_rssi: float
    packet_loss: float
    latency_ms: float
    health_score: float
    failure_count: int
    transfer_success_rate: float
    is_demo: bool
    last_seen: datetime.datetime

    class Config:
        from_attributes = True

# Firmware Schemas
class FirmwareCreate(BaseModel):
    name: str
    version: str
    compatible_group: str = "ESP32-MOTOR"
    changelog: Optional[str] = None

class FirmwareOut(BaseModel):
    id: int
    name: str
    version: str
    filename: str
    size_bytes: int
    sha256_hash: str
    compatible_group: str
    status: str
    changelog: Optional[str] = None
    upload_date: datetime.datetime

    class Config:
        from_attributes = True

# Adaptive Engine Schemas
class AdaptiveInput(BaseModel):
    wifi_rssi: float
    packet_loss: float
    latency_ms: float
    health_score: float
    priority: str
    failure_count: int
    transfer_success_rate: float
    compatibility_match: bool = True

class AdaptiveDecisionOut(BaseModel):
    recommended_mode: str # FAST, NORMAL, SAFE
    score: float
    concurrency_threads: int
    timeout_seconds: float
    max_retries: int
    block_size_bytes: int
    resume_enabled: bool
    explanation: str
    input_breakdown: dict

# Deployment Schemas
class DeploymentWizardCheck(BaseModel):
    firmware_id: int
    target_device_ids: List[int]

class DeploymentCreate(BaseModel):
    name: str
    firmware_id: int
    target_device_ids: List[int]
    strategy: str = "STAGED" # IMMEDIATE, STAGED, MANUAL
    total_stages: int = 3

class DeploymentOut(BaseModel):
    id: int
    name: str
    firmware_id: int
    strategy: str
    status: str
    current_stage: int
    total_stages: int
    created_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    firmware: Optional[FirmwareOut] = None

    class Config:
        from_attributes = True

# Transfer Session Schemas
class TransferSessionOut(BaseModel):
    id: int
    session_uuid: str
    device_id: int
    device_code: str
    firmware_id: int
    firmware_version: str
    transfer_mode: str
    block_size: int
    total_blocks: int
    current_block: int
    progress_percentage: float
    bytes_transferred: int
    status: str
    worker_thread_id: str
    speed_kbps: float
    packets_sent: int
    acks_received: int
    retries: int
    packet_loss: float
    start_time: datetime.datetime
    last_activity: datetime.datetime
    failure_reason: Optional[str] = None

class ResumeRequest(BaseModel):
    from_block: int

# Rollback & Recovery Schemas
class RollbackEventOut(BaseModel):
    id: int
    device_id: int
    device_code: str
    failed_firmware_version: str
    restored_firmware_version: str
    trigger_reason: str
    status: str
    timestamp: datetime.datetime

# ESP32 Integration Schemas
class ESP32RegisterReq(BaseModel):
    device_id: str
    name: str
    mac_address: str
    ip_address: str
    hardware_version: str
    firmware_version: str
    compatibility_group: str

class ESP32HeartbeatReq(BaseModel):
    device_id: str
    status: str
    cpu_usage: float
    memory_usage: float
    temperature: float
    wifi_rssi: float
    packet_loss: float
    latency_ms: float

class ESP32TelemetryReq(ESP32HeartbeatReq):
    pass
