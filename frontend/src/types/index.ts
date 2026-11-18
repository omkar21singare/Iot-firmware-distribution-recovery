export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'TRANSFERRING' | 'ERROR';
export type DevicePriority = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
export type TransferMode = 'FAST' | 'NORMAL' | 'SAFE' | 'INCOMPATIBLE';
export type DeploymentStrategy = 'IMMEDIATE' | 'STAGED' | 'MANUAL';
export type DeploymentStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

export interface Device {
  id: number;
  device_id: string;
  name: string;
  ip_address: string;
  mac_address: string;
  status: DeviceStatus;
  hardware_version: string;
  current_firmware_version: string;
  target_firmware_version?: string;
  priority: DevicePriority;
  compatibility_group: string;
  cpu_usage: number;
  memory_usage: number;
  temperature: number;
  wifi_rssi: number;
  packet_loss: number;
  latency_ms: number;
  health_score: number;
  failure_count: number;
  transfer_success_rate: number;
  is_demo: boolean;
  last_seen: string;
}

export interface Firmware {
  id: number;
  name: string;
  version: string;
  filename: string;
  size_bytes: number;
  sha256_hash: string;
  compatible_group: string;
  status: string;
  changelog?: string;
  upload_date: string;
}

export interface Deployment {
  id: number;
  name: string;
  firmware_id: number;
  strategy: DeploymentStrategy;
  status: DeploymentStatus;
  current_stage: number;
  total_stages: number;
  created_at: string;
  completed_at?: string;
  firmware?: Firmware;
}

export interface TransferSession {
  id: number;
  session_uuid: string;
  device_id: number;
  device_code: string;
  firmware_id: number;
  firmware_version: string;
  transfer_mode: TransferMode;
  block_size: number;
  total_blocks: number;
  current_block: number;
  progress_percentage: number;
  bytes_transferred: number;
  status: 'INITIALIZING' | 'TRANSFERRING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'RESUMED';
  worker_thread_id: string;
  speed_kbps: number;
  packets_sent: number;
  acks_received: number;
  retries: number;
  packet_loss: number;
  start_time: string;
  last_activity: string;
  failure_reason?: string;
}

export interface WorkerThread {
  worker_id: string;
  session_uuid: string;
  device_code: string;
  mode: TransferMode;
  current_block: number;
  total_blocks: number;
  status: string;
  speed_kbps: number;
}

export interface WorkerPoolStatus {
  max_threads: number;
  active_threads: number;
  available_threads: number;
  workers: WorkerThread[];
}

export interface AdaptiveInputData {
  wifi_rssi: number;
  packet_loss: number;
  latency_ms: number;
  health_score: number;
  priority: DevicePriority;
  failure_count: number;
  transfer_success_rate: number;
  compatibility_match: boolean;
}

export interface AdaptiveDecision {
  recommended_mode: TransferMode;
  score: number;
  concurrency_threads: number;
  timeout_seconds: number;
  max_retries: number;
  block_size_bytes: number;
  resume_enabled: boolean;
  explanation: string;
  input_breakdown: {
    network_score: number;
    packet_loss_score: number;
    device_health: number;
    reliability_score: number;
    failure_count: number;
  };
}

export interface RollbackEvent {
  id: number;
  device_id: number;
  device_code: string;
  failed_firmware_version: string;
  restored_firmware_version: string;
  trigger_reason: string;
  status: string;
  timestamp: string;
}

export interface SystemEvent {
  id?: number;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  category: string;
  message: string;
  device_code?: string;
}

export interface AnalyticsSummary {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  healthy_devices: number;
  warning_devices: number;
  critical_devices: number;
  active_transfers: number;
  total_deployments: number;
  successful_deployments: number;
  failed_deployments: number;
  in_progress_deployments: number;
  rollback_count: number;
  avg_transfer_time_sec: number;
  success_rate_percentage: number;
  transfer_mode_distribution: {
    FAST: number;
    NORMAL: number;
    SAFE: number;
  };
}
