import asyncio
import socket
import struct
import os
import hashlib
import time
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional, Callable

logger = logging.getLogger("tftp_server")

# TFTP Opcodes
OP_RRQ = 1
OP_WRQ = 2
OP_DATA = 3
OP_ACK = 4
OP_ERROR = 5

class TFTPSessionWorker:
    """Handles an individual multithreaded TFTP transfer session for an ESP32 device."""
    def __init__(
        self,
        session_id: int,
        session_uuid: str,
        device_code: str,
        file_path: str,
        block_size: int = 512,
        start_block: int = 1,
        mode: str = "NORMAL",
        timeout: float = 2.5,
        max_retries: int = 5,
        worker_id: str = "Worker-1",
        on_progress: Optional[Callable[[Dict[str, Any]], None]] = None
    ):
        self.session_id = session_id
        self.session_uuid = session_uuid
        self.device_code = device_code
        self.file_path = file_path
        self.block_size = block_size
        self.start_block = max(1, start_block)
        self.mode = mode
        self.timeout = timeout
        self.max_retries = max_retries
        self.worker_id = worker_id
        self.on_progress = on_progress

        self.current_block = self.start_block - 1
        self.total_blocks = 0
        self.bytes_transferred = 0
        self.file_size = 0
        self.packets_sent = 0
        self.acks_received = 0
        self.retries = 0
        self.status = "INITIALIZING"
        self.start_time = time.time()
        self.is_paused = False
        self.is_cancelled = False

        if os.path.exists(file_path):
            self.file_size = os.path.getsize(file_path)
            self.total_blocks = (self.file_size + self.block_size - 1) // self.block_size
            if self.start_block > 1:
                self.bytes_transferred = (self.start_block - 1) * self.block_size

    def calculate_sha256(self) -> str:
        sha256 = hashlib.sha256()
        with open(self.file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def read_block_data(self, block_num: int) -> bytes:
        if not os.path.exists(self.file_path):
            return b""
        offset = (block_num - 1) * self.block_size
        with open(self.file_path, "rb") as f:
            f.seek(offset)
            return f.read(self.block_size)

    def pack_data_packet(self, block_num: int, data: bytes) -> bytes:
        # Opcode 3 (DATA) + Block Number (2 bytes unsigned short) + Data
        return struct.pack("!HH", OP_DATA, block_num) + data

    def unpack_ack_packet(self, raw_packet: bytes) -> Optional[int]:
        if len(raw_packet) < 4:
            return None
        opcode, ack_block = struct.unpack("!HH", raw_packet[:4])
        if opcode == OP_ACK:
            return ack_block
        return None

class TFTPServerManager:
    """Manages active TFTP worker threads and active session tracking."""
    def __init__(self, max_workers: int = 10):
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="TFTPWorker")
        self.active_sessions: Dict[str, TFTPSessionWorker] = {}

    def get_worker_pool_status(self) -> Dict[str, Any]:
        active_count = len(self.active_sessions)
        return {
            "max_threads": self.max_workers,
            "active_threads": active_count,
            "available_threads": max(0, self.max_workers - active_count),
            "workers": [
                {
                    "worker_id": session.worker_id,
                    "session_uuid": uuid,
                    "device_code": session.device_code,
                    "mode": session.mode,
                    "current_block": session.current_block,
                    "total_blocks": session.total_blocks,
                    "status": session.status,
                    "speed_kbps": round((session.bytes_transferred / 1024.0) / max(0.1, time.time() - session.start_time), 1)
                }
                for uuid, session in self.active_sessions.items()
            ]
        }

tftp_manager = TFTPServerManager()
