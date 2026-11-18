import os
import hashlib
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.config import settings
from app.models import Firmware, FirmwareVersion
from app.schemas.schemas import FirmwareOut

router = APIRouter(prefix="/firmware", tags=["Firmware"])

@router.get("", response_model=List[FirmwareOut])
async def list_firmware(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Firmware).order_by(Firmware.upload_date.desc()))
    firmwares = result.scalars().all()
    return firmwares

@router.post("/upload", response_model=FirmwareOut)
async def upload_firmware(
    name: str = Form(...),
    version: str = Form(...),
    compatible_group: str = Form("ESP32-MOTOR"),
    changelog: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith(".bin"):
        raise HTTPException(status_code=400, detail="Only .bin firmware files are supported")

    content = await file.read()
    size_bytes = len(content)
    
    # Calculate SHA-256 hash
    sha256 = hashlib.sha256(content).hexdigest()

    saved_filename = f"{name}_{version}_{file.filename}"
    file_path = os.path.join(settings.FIRMWARE_DIRECTORY, saved_filename)
    
    with open(file_path, "wb") as f:
        f.write(content)

    firmware = Firmware(
        name=name,
        version=version,
        filename=saved_filename,
        size_bytes=size_bytes,
        sha256_hash=sha256,
        compatible_group=compatible_group,
        file_path=file_path,
        changelog=changelog,
        status="READY"
    )
    db.add(firmware)
    await db.commit()
    await db.refresh(firmware)

    # Save version record
    fw_ver = FirmwareVersion(
        firmware_id=firmware.id,
        version=version,
        release_notes=changelog,
        is_active=True
    )
    db.add(fw_ver)
    await db.commit()

    return firmware

@router.get("/{firmware_id}", response_model=FirmwareOut)
async def get_firmware_detail(firmware_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Firmware).where(Firmware.id == firmware_id))
    firmware = result.scalar_one_or_none()
    if not firmware:
        raise HTTPException(status_code=404, detail="Firmware binary not found")
    return firmware
