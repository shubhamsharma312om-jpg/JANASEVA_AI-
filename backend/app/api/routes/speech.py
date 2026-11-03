"""
JANASEVA AI — Speech-to-Text API Routes
POST /api/speech/transcribe — Transcribes uploaded citizen audio via Sarvam Saaras v4.
GET  /api/speech/status     — Reports engine readiness and supported languages (never exposes API keys).
"""

from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.services.speech_service import SarvamSpeechService

router = APIRouter(prefix="/speech", tags=["Speech-to-Text (Sarvam Saaras v4)"])


@router.get("/status")
async def get_speech_engine_status():
    """
    Returns whether the Sarvam Saaras v4 primary engine has an API key configured,
    along with the list of officially supported language codes.
    Never exposes the actual API key.
    """
    sarvam_ready = settings.is_sarvam_configured()
    return {
        "primary_engine": "sarvam",
        "primary_model": settings.SARVAM_STT_MODEL,
        "sarvam_configured": sarvam_ready,
        "fallback_engine": "browser",
        "supported_language_codes": settings.SARVAM_LANGUAGE_CODES,
    }


@router.post("/transcribe")
async def transcribe_citizen_speech(
    file: UploadFile = File(...),
    language_code: Optional[str] = Form("unknown"),
    mode: Optional[str] = Form("transcribe"),
):
    """
    Accepts uploaded citizen audio, validates size/type, sends to Sarvam AI Saaras v4,
    and returns a consistent transcription response.
    Audio bytes are processed in memory and never stored permanently.
    """
    try:
        audio_bytes = await file.read()
    finally:
        await file.close()

    result = SarvamSpeechService.transcribe_audio(
        audio_bytes=audio_bytes,
        filename=file.filename or "grievance_audio.webm",
        content_type=file.content_type or "audio/webm",
        language_preference=language_code or "unknown",
        mode=mode or "transcribe",
    )

    status_code = 200 if result.get("success") else 200
    return JSONResponse(status_code=status_code, content=result)
