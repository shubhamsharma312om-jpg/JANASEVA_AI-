"""
JANASEVA AI — Intelligent Grievance Understanding API Routes
- POST /api/ai/analyze-grievance : Analyzes citizen complaint text (from Sarvam speech-to-text or manual entry)
  and returns Pydantic-validated structured JSON without creating an unconfirmed ticket.
- GET  /api/ai/status            : Reports configured AI provider, model, and environment variable status.
"""

from fastapi import APIRouter, HTTPException, status
from app.ai_engine.pipeline import grievance_ai_pipeline
from app.ai_engine.validator import (
    GrievanceAnalyzeRequestSchema,
    GrievanceStructuredAnalysisSchema,
)
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["Intelligent Grievance Understanding Engine"])


@router.get("/status", summary="Get Intelligent Grievance Understanding Engine Status")
def get_ai_engine_status():
    """
    Returns the current configuration status of the AI Grievance Understanding Engine
    and indicates which environment variables are configured or pending.
    Never exposes API keys.
    """
    gemini_configured = settings.is_gemini_configured()
    sarvam_configured = settings.is_sarvam_configured()
    missing_vars = []
    if not gemini_configured:
        missing_vars.append("GEMINI_API_KEY")
    if not sarvam_configured:
        missing_vars.append("SARVAM_API_KEY")

    return {
        "engine": "JANASEVA AI Intelligent Grievance Understanding Engine",
        "configured_provider": settings.AI_MODEL_PROVIDER,
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_api_configured": gemini_configured,
        "sarvam_stt_model": settings.SARVAM_STT_MODEL,
        "sarvam_api_configured": sarvam_configured,
        "hybrid_python_validator_active": True,
        "missing_environment_variables": missing_vars,
        "supported_categories": [
            m["category"] for m in settings.get_all_department_records()
        ],
    }


@router.post(
    "/analyze-grievance",
    response_model=GrievanceStructuredAnalysisSchema,
    status_code=status.HTTP_200_OK,
    summary="Analyze Citizen Grievance Transcript & Generate Structured Review Output",
)
def analyze_citizen_grievance(payload: GrievanceAnalyzeRequestSchema):
    """
    Executes the 6-stage Intelligent Grievance Understanding Pipeline:
    1. Language Identification
    2. Multilingual Understanding & Structured Entity Extraction
    3. Hybrid Department Classification (verified against department_mapping.json)
    4. Provisional Priority Assessment
    5. Professional Complaint Generation (in the citizen's language)
    6. Pydantic Schema & Anti-Hallucination Validation

    Does NOT store an unconfirmed grievance in SQLite.
    """
    transcript = (payload.transcript or "").strip()
    if len(transcript) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid complaint description to analyze.",
        )

    result = grievance_ai_pipeline.analyze_grievance(
        transcript=transcript,
        preferred_language=payload.preferred_language,
        conversation_context=payload.conversation_context,
    )
    return result
