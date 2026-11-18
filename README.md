# Adaptive Intelligent Firmware Distribution and Recovery System for IoT Devices Using UDP-Based Multithreaded TFTP

**Final-Year & Patent Architecture Project**

This project is a complete, production-grade full-stack IoT firmware management platform and simulation system that demonstrates an adaptive, resilient, and multithreaded firmware distribution architecture for ESP32 devices using UDP-based TFTP.

---

## 🌟 Key Patent Innovations Demonstrated

1. **Adaptive Decision Engine:** Dynamically calculates composite metrics (Wi-Fi RSSI, Packet Loss %, Device Health Score 0-100, Priority Level, Failure History) to assign **FAST**, **NORMAL**, or **SAFE** transfer modes with dynamic block sizes and thread allocations.
2. **Multithreaded UDP TFTP Protocol Server:** Implements RFC 1350 / RFC 2347 block transfer with custom UDP socket ACK tracking, thread pool worker management, and throughput monitoring.
3. **Block-Level Resume Capability:** Resumes interrupted transfers directly from block `N` (e.g. block 437) without restarting from block 0, conserving bandwidth and device flash memory endurance.
4. **Automated Health Check & Dual-Partition OTA Rollback:** Automatically triggers dual-partition firmware rollback to previous version (e.g. `v2.3.8`) if post-reboot health verification fails.
5. **Cryptographic SHA-256 Hash Integrity Verification:** Computes hardware SHA-256 hashes on binary upload and verifies checksums prior to flash partition commit.
6. **Staged Deployment Pipeline:** Automated multi-stage rollout with health verification gating before progressing to subsequent device batches.
7. **Real ESP32 Hardware Integration:** Includes complete C++/Arduino ESP32 firmware source code (`esp32_client/src/main.cpp`) for hardware flashing.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons, WebSockets.
* **Backend:** Python 3.14+, FastAPI, AsyncIO, Python ThreadPoolExecutor TFTP Manager, WebSockets.
* **Database:** SQLite (default for instant out-of-the-box execution) / PostgreSQL via SQLAlchemy Async Engine.
* **IoT Hardware:** ESP32 C++ Arduino Framework (`Update.h`, `mbedtls/sha256.h`, `WiFiUDP.h`).

---

## 📁 System Architecture & Directory Structure

```text
CP/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI Application & WebSocket Endpoint
│   │   ├── config.py                # System Environment Configuration
│   │   ├── database.py              # Async SQLAlchemy Engine & Session
│   │   ├── models/                  # Relational Schema Models
│   │   ├── schemas/                 # Pydantic Request/Response Models
│   │   ├── api/                     # REST Routers (devices, firmware, deployments, adaptive, transfers, recovery, analytics, demo, esp32)
│   │   ├── services/                # Adaptive Engine, Deployment Manager, Recovery Manager
│   │   ├── tftp/                    # Multithreaded TFTP Server Manager & Worker Protocol
│   │   ├── websocket/               # Real-time WebSocket Connection Manager
│   │   └── demo/                    # Live Demonstration Simulation Engine
│   ├── firmware_repo/               # Storage for uploaded ESP32 .bin binaries
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/              # Sidebar, Header, KPICard, FlowDiagram, ArchitectureDiagram, BlockResumeModal, StagedPipeline
│   │   ├── pages/                   # Dashboard, Devices, DeviceDetail, Firmware, CreateDeployment, AdaptiveEngine, TransferMonitor, RecoveryCenter, Analytics, Architecture, Settings, Landing, Login
│   │   ├── context/                 # SocketContext, AuthContext
│   │   ├── services/                # API Client (Axios)
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── index.css                # Dark Industrial Design System
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── esp32_client/                    # ESP32 C++ Arduino Implementation
│   ├── platformio.ini
│   └── src/main.cpp                 # OTA TFTP Receiver, SHA256, & Rollback Flash Code
└── README.md
```

---

## 🚀 Quick Start Instructions

### 1. Backend Setup

Navigate to the `backend/` directory:

```bash
cd backend
python -m pip install -r requirements.txt
```

Run the backend FastAPI server:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The REST API will start at `http://localhost:8000` and Interactive Swagger API Docs will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup

In a new terminal, navigate to the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173` to access the Industrial IoT Dashboard.

---

## 🎬 How to Run the Patent Demonstration Mode

1. Click the **"Start Demo Deployment"** button located in the top navigation header bar.
2. Watch the live patent workflow execute in real time across the dashboard:
   - **Adaptive Decision Engine:** Evaluates network quality (RSSI), packet loss, and device health to dynamically assign FAST, NORMAL, and SAFE transfer modes to ESP32 nodes.
   - **Multithreaded TFTP Transfer Monitor:** Watch concurrent worker threads stream block data with dynamic progress bars.
   - **Interrupted Session & Block Resume:** Observe device `ESP32-004` pause at block 437 due to simulated packet loss, then trigger a **Block-Level Resume** directly from block 437 without restarting from block 0.
   - **SHA-256 Hash Verification:** Cryptographic hash validation upon block completion.
   - **Health Verification Failure & Automatic Rollback:** Observe device `ESP32-012` fail post-reboot health check, triggering an automatic rollback to firmware version `v2.3.8`.

---

## 🔌 Real ESP32 Hardware Integration

To flash a physical ESP32 microcontroller board:

1. Open `esp32_client/src/main.cpp`.
2. Configure your Wi-Fi SSID, Password, and Backend Server IP (`SERVER_IP`).
3. Compile and flash using PlatformIO or the Arduino IDE.
4. Upon boot, the ESP32 will register itself with the server via `POST /api/esp32/register`, transmit live telemetry heartbeats via `POST /api/esp32/heartbeat`, receive update commands, download binary blocks over UDP TFTP, verify SHA-256 hashes, and flash dual OTA partitions.

---

## 🔑 Default Credentials

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator
