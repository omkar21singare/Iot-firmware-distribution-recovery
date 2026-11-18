from fastapi import APIRouter
from app.schemas.schemas import AdaptiveInput, AdaptiveDecisionOut
from app.services.adaptive_engine import AdaptiveEngineService

router = APIRouter(prefix="/adaptive", tags=["Adaptive Engine"])

@router.post("/evaluate", response_model=AdaptiveDecisionOut)
async def evaluate_adaptive_decision(input_data: AdaptiveInput):
    """Calculates adaptive transfer mode, score, concurrency, block size, timeout, and retry policy."""
    return AdaptiveEngineService.evaluate_device(input_data)
