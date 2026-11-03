"""
JANASEVA AI — Sarvam AI Saaras v4 Speech-to-Text Service
Primary Engine: Sarvam AI (model="saaras:v4")
Secondary Fallback Engine: Browser Web Speech API (activated by frontend when fallback_recommended=True)

SECURITY & PRIVACY:
- Reads SARVAM_API_KEY strictly from backend environment variables.
- Never logs or returns the API key or raw internal stack traces.
- Never stores citizen audio recordings permanently on disk.
- Preserves original spoken language (never translates regional speech into English).
"""

import io
import json
import logging
import os
import socket
import urllib.error
import urllib.request
import uuid
from typing import Any, Dict, Optional

from app.core.config import settings, SARVAM_SUPPORTED_LANGUAGE_CODES

logger = logging.getLogger("janaseva.speech_service")

ALLOWED_AUDIO_MIME_PREFIXES = (
    "audio/webm",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "audio/mp3",
    "audio/aac",
    "audio/flac",
    "audio/x-m4a",
    "video/webm",  # Some browsers label MediaRecorder WebM/Opus blobs as video/webm
    "application/octet-stream",
)

# Allowed Saaras v4 output modes that preserve original language (excluding 'translate')
ALLOWED_SAARAS_MODES = ("transcribe", "codemix", "verbatim", "translit")


def normalize_language_code(lang: Optional[str]) -> str:
    """
    Normalize short ISO codes ('en', 'te', 'hi') or BCP-47 codes ('en-IN', 'te-IN', 'hi-IN')
    or 'auto'/'unknown' into officially supported Sarvam Saaras v4 language_code values.
    """
    if not lang:
        return "unknown"
    cleaned = lang.strip()
    lower = cleaned.lower()

    if lower in ("auto", "unknown", "detect"):
        return "unknown"

    short_map = {
        "en": "en-IN",
        "te": "te-IN",
        "hi": "hi-IN",
        "bn": "bn-IN",
        "gu": "gu-IN",
        "kn": "kn-IN",
        "ml": "ml-IN",
        "mr": "mr-IN",
        "od": "od-IN",
        "or": "od-IN",
        "pa": "pa-IN",
        "ta": "ta-IN",
        "as": "as-IN",
        "ur": "ur-IN",
        "ne": "ne-IN",
        "kok": "kok-IN",
        "ks": "ks-IN",
        "sd": "sd-IN",
        "sa": "sa-IN",
        "sat": "sat-IN",
        "mni": "mni-IN",
        "brx": "brx-IN",
        "mai": "mai-IN",
        "doi": "doi-IN",
    }
    if lower in short_map:
        return short_map[lower]

    for valid_code in SARVAM_SUPPORTED_LANGUAGE_CODES:
        if valid_code.lower() == lower:
            return valid_code

    return ""


def _build_multipart_body(
    fields: Dict[str, str],
    file_field: str,
    filename: str,
    file_bytes: bytes,
    content_type: str,
) -> tuple[bytes, str]:
    """Build standard multipart/form-data body using Python stdlib."""
    boundary = f"----JanasevaSarvamBoundary{uuid.uuid4().hex}"
    lines: list[bytes] = []

    for key, val in fields.items():
        lines.append(f"--{boundary}\r\n".encode("utf-8"))
        lines.append(
            f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode("utf-8")
        )
        lines.append(f"{val}\r\n".encode("utf-8"))

    lines.append(f"--{boundary}\r\n".encode("utf-8"))
    lines.append(
        (
            f'Content-Disposition: form-data; name="{file_field}"; '
            f'filename="{filename}"\r\n'
        ).encode("utf-8")
    )
    lines.append(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
    lines.append(file_bytes)
    lines.append(f"\r\n--{boundary}--\r\n".encode("utf-8"))

    body = b"".join(lines)
    multipart_content_type = f"multipart/form-data; boundary={boundary}"
    return body, multipart_content_type


def _make_response(
    *,
    success: bool,
    transcript: str,
    detected_language: Optional[str],
    language_detection_mode: str,
    mode: str = "transcribe",
    message: str = "",
    error_category: Optional[str] = None,
    fallback_recommended: bool = False,
) -> Dict[str, Any]:
    return {
        "success": success,
        "engine": "sarvam",
        "model": settings.SARVAM_STT_MODEL,
        "transcript": transcript,
        "detected_language": detected_language,
        "language_detection_mode": language_detection_mode,
        "mode": mode,
        "error_category": error_category,
        "error_type": error_category,
        "fallback_recommended": fallback_recommended,
        "message": message,
        "error_message": None if success else message,
    }


class SarvamSpeechService:
    """
    Modular service for transcribing citizen grievance audio via Sarvam AI Saaras v4.
    Uses the official `sarvamai` Python SDK when installed, with a zero-dependency
    HTTPS multipart client fallback so it runs reliably in any Python 3 environment.
    """

    @staticmethod
    def validate_audio_payload(
        audio_bytes: bytes,
        content_type: str,
        language_code: str,
        mode: str,
        max_audio_bytes: Optional[int] = None,
    ) -> Optional[Dict[str, Any]]:
        """Validate audio bytes, size, MIME type, language code, and Saaras mode."""
        detection_mode = "automatic" if language_code == "unknown" else "manual"
        max_bytes = max_audio_bytes or settings.SARVAM_MAX_AUDIO_BYTES

        if not audio_bytes or len(audio_bytes) == 0:
            return _make_response(
                success=False,
                transcript="",
                detected_language=None,
                language_detection_mode=detection_mode,
                mode=mode,
                error_category="validation_error",
                fallback_recommended=True,
                message="Uploaded audio recording is empty. Please speak clearly and try again.",
            )

        if len(audio_bytes) > max_bytes:
            return _make_response(
                success=False,
                transcript="",
                detected_language=None,
                language_detection_mode=detection_mode,
                mode=mode,
                error_category="validation_error",
                fallback_recommended=True,
                message="Audio recording exceeds the maximum single-request size limit (10 MB). Please record a shorter clip.",
            )

        clean_mime = (content_type or "audio/webm").split(";")[0].strip().lower()
        if not any(
            clean_mime.startswith(prefix) for prefix in ALLOWED_AUDIO_MIME_PREFIXES
        ):
            return _make_response(
                success=False,
                transcript="",
                detected_language=None,
                language_detection_mode=detection_mode,
                mode=mode,
                error_category="validation_error",
                fallback_recommended=True,
                message=f"Unsupported audio format '{clean_mime}'. Switching to browser speech recognition.",
            )

        if not language_code or language_code not in SARVAM_SUPPORTED_LANGUAGE_CODES:
            return _make_response(
                success=False,
                transcript="",
                detected_language=None,
                language_detection_mode="manual",
                mode=mode,
                error_category="validation_error",
                fallback_recommended=True,
                message="Unsupported language code requested for Sarvam Saaras v4.",
            )

        if mode not in ALLOWED_SAARAS_MODES:
            return _make_response(
                success=False,
                transcript="",
                detected_language=None,
                language_detection_mode="manual",
                mode=mode,
                error_category="validation_error",
                fallback_recommended=True,
                message=f"Unsupported transcription mode '{mode}'.",
            )

        return None

    @classmethod
    def transcribe_audio(
        cls,
        audio_bytes: bytes,
        filename: str = "grievance_audio.webm",
        content_type: Optional[str] = "audio/webm",
        language_preference: Optional[str] = None,
        language_code: Optional[str] = None,
        mode: str = "transcribe",
        api_key_override: Optional[str] = None,
        max_audio_bytes: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Transcribe citizen grievance audio using Sarvam AI Saaras v4.
        Returns a structured dictionary matching the JANASEVA AI API contract.
        """
        requested_lang = language_code if language_code is not None else (language_preference or "unknown")
        normalized_lang = normalize_language_code(requested_lang)
        detection_mode = (
            "automatic" if normalized_lang == "unknown" else "manual"
        )
        clean_mode = (mode or "transcribe").strip().lower()

        # 1. Validate inputs before making any external network call
        validation_error = cls.validate_audio_payload(
            audio_bytes=audio_bytes,
            content_type=content_type or "audio/webm",
            language_code=normalized_lang,
            mode=clean_mode,
            max_audio_bytes=max_audio_bytes,
        )
        if validation_error:
            return validation_error

        # 2. Check whether SARVAM_API_KEY is configured in backend environment
        api_key = (
            api_key_override
            if api_key_override is not None
            else os.getenv("SARVAM_API_KEY", settings.SARVAM_API_KEY)
        ).strip()
        if not api_key or api_key in (
            "YOUR_SARVAM_API_KEY",
            "MY_SARVAM_API_KEY",
            "placeholder",
        ):
            logger.warning(
                "SARVAM_API_KEY is not configured in backend environment. Advising frontend to use Browser Speech API fallback."
            )
            return _make_response(
                success=False,
                transcript="",
                detected_language=None if normalized_lang == "unknown" else normalized_lang,
                language_detection_mode=detection_mode,
                mode=clean_mode,
                error_category="missing_api_key",
                fallback_recommended=True,
                message="Sarvam AI key is not configured on the server. Automatically switching to Browser Speech Recognition.",
            )

        clean_mime = (content_type or "audio/webm").split(";")[0].strip().lower()
        if clean_mime == "video/webm":
            clean_mime = "audio/webm"

        # 3. Attempt transcription via official `sarvamai` Python SDK first, if installed
        try:
            from sarvamai import SarvamAI  # type: ignore

            client = SarvamAI(api_subscription_key=api_key)
            audio_buffer = io.BytesIO(audio_bytes)
            audio_buffer.name = filename or "grievance_audio.webm"

            sdk_response = client.speech_to_text.transcribe(
                file=(audio_buffer.name, audio_buffer, clean_mime),
                model=settings.SARVAM_STT_MODEL,
                language_code=normalized_lang,
                mode=clean_mode,
            )

            transcript_text = getattr(sdk_response, "transcript", "") or ""
            detected_lang = (
                getattr(sdk_response, "language_code", None)
                or (None if normalized_lang == "unknown" else normalized_lang)
            )
            transcript_text = transcript_text.strip()

            if not transcript_text:
                return _make_response(
                    success=False,
                    transcript="",
                    detected_language=detected_lang,
                    language_detection_mode=detection_mode,
                    mode=clean_mode,
                    error_category="empty_transcript",
                    fallback_recommended=True,
                    message="No clear speech was detected by Sarvam AI. Switching to Browser Speech Recognition.",
                )

            return _make_response(
                success=True,
                transcript=transcript_text,
                detected_language=detected_lang,
                language_detection_mode=detection_mode,
                mode=clean_mode,
                message="Transcription completed successfully",
            )

        except ImportError:
            # `sarvamai` SDK package not installed in container; proceed with direct HTTPS call to official Sarvam endpoint
            pass
        except Exception as sdk_err:
            return cls._classify_exception(sdk_err, normalized_lang, detection_mode, clean_mode)

        # 4. Direct HTTPS REST call to https://api.sarvam.ai/speech-to-text
        return cls._transcribe_via_rest_http(
            api_key=api_key,
            audio_bytes=audio_bytes,
            filename=filename or "grievance_audio.webm",
            content_type=clean_mime,
            language_code=normalized_lang,
            mode=clean_mode,
            detection_mode=detection_mode,
        )

    @classmethod
    def _transcribe_via_rest_http(
        cls,
        api_key: str,
        audio_bytes: bytes,
        filename: str,
        content_type: str,
        language_code: str,
        mode: str,
        detection_mode: str,
    ) -> Dict[str, Any]:
        fields = {
            "model": settings.SARVAM_STT_MODEL,
            "language_code": language_code,
            "mode": mode,
        }
        body, multipart_ct = _build_multipart_body(
            fields=fields,
            file_field="file",
            filename=filename,
            file_bytes=audio_bytes,
            content_type=content_type,
        )

        req = urllib.request.Request(
            settings.SARVAM_STT_ENDPOINT,
            data=body,
            method="POST",
            headers={
                "api-subscription-key": api_key,
                "Content-Type": multipart_ct,
                "Accept": "application/json",
            },
        )

        try:
            with urllib.request.urlopen(
                req, timeout=settings.SARVAM_TIMEOUT_SECONDS
            ) as resp:
                raw_resp = resp.read().decode("utf-8", errors="replace")
                parsed = json.loads(raw_resp)
                transcript_text = (parsed.get("transcript") or "").strip()
                detected_lang = parsed.get("language_code") or (
                    None if language_code == "unknown" else language_code
                )

                if not transcript_text:
                    return _make_response(
                        success=False,
                        transcript="",
                        detected_language=detected_lang,
                        language_detection_mode=detection_mode,
                        mode=mode,
                        error_category="empty_transcript",
                        fallback_recommended=True,
                        message="No clear speech was detected by Sarvam AI. Switching to Browser Speech Recognition.",
                    )

                return _make_response(
                    success=True,
                    transcript=transcript_text,
                    detected_language=detected_lang,
                    language_detection_mode=detection_mode,
                    mode=mode,
                    message="Transcription completed successfully",
                )

        except urllib.error.HTTPError as http_err:
            status_code = http_err.code
            return cls._classify_http_status(
                status_code=status_code,
                language_code=language_code,
                detection_mode=detection_mode,
                mode=mode,
            )
        except (TimeoutError, socket.timeout):
            logger.warning("Sarvam AI transcription request timed out.")
            return _make_response(
                success=False,
                transcript="",
                detected_language=None
                if language_code == "unknown"
                else language_code,
                language_detection_mode=detection_mode,
                mode=mode,
                error_category="timeout",
                fallback_recommended=True,
                message="Sarvam AI request timed out. Automatically switching to Browser Speech Recognition.",
            )
        except urllib.error.URLError:
            logger.warning("Network connectivity error reaching Sarvam AI API.")
            return _make_response(
                success=False,
                transcript="",
                detected_language=None
                if language_code == "unknown"
                else language_code,
                language_detection_mode=detection_mode,
                mode=mode,
                error_category="network_error",
                fallback_recommended=True,
                message="Unable to reach Sarvam AI service due to network error. Switching to Browser Speech Recognition.",
            )
        except Exception as exc:
            return cls._classify_exception(exc, language_code, detection_mode, mode)

    @staticmethod
    def _classify_http_status(
        status_code: int, language_code: str, detection_mode: str, mode: str = "transcribe"
    ) -> Dict[str, Any]:
        detected = None if language_code == "unknown" else language_code
        if status_code in (401, 403):
            logger.error(
                "ADMIN ALERT: Sarvam AI authentication failed (HTTP %s). Verify SARVAM_API_KEY configuration.",
                status_code,
            )
            return _make_response(
                success=False,
                transcript="",
                detected_language=detected,
                language_detection_mode=detection_mode,
                mode=mode,
                error_category="authentication_error",
                fallback_recommended=True,
                message="Sarvam AI service credentials require administrator verification. Switching to Browser Speech Recognition.",
            )
        if status_code in (402, 429):
            logger.warning(
                "Sarvam AI quota or rate limit reached (HTTP %s). Falling back to Browser Speech API.",
                status_code,
            )
            return _make_response(
                success=False,
                transcript="",
                detected_language=detected,
                language_detection_mode=detection_mode,
                mode=mode,
                error_category="quota_exhausted",
                fallback_recommended=True,
                message="Sarvam AI quota or rate limit reached. Automatically switching to Browser Speech Recognition.",
            )
        if status_code in (400, 413, 415, 422):
            logger.warning(
                "Sarvam AI audio validation/format rejection (HTTP %s).", status_code
            )
            return _make_response(
                success=False,
                transcript="",
                detected_language=detected,
                language_detection_mode=detection_mode,
                mode=mode,
                error_category="validation_error",
                fallback_recommended=True,
                message="Audio format was not accepted by the primary engine. Switching to Browser Speech Recognition.",
            )
        logger.warning(
            "Sarvam AI service unavailable (HTTP %s). Falling back to Browser Speech API.",
            status_code,
        )
        return _make_response(
            success=False,
            transcript="",
            detected_language=detected,
            language_detection_mode=detection_mode,
            mode=mode,
            error_category="service_unavailable",
            fallback_recommended=True,
            message="Sarvam AI service is temporarily unavailable. Automatically switching to Browser Speech Recognition.",
        )

    @classmethod
    def _classify_exception(
        cls, exc: Exception, language_code: str, detection_mode: str, mode: str = "transcribe"
    ) -> Dict[str, Any]:
        status_code = getattr(exc, "status_code", None)
        if isinstance(status_code, int):
            return cls._classify_http_status(
                status_code=status_code,
                language_code=language_code,
                detection_mode=detection_mode,
                mode=mode,
            )
        logger.warning("Sarvam AI transcription exception encountered (type=%s).", type(exc).__name__)
        return _make_response(
            success=False,
            transcript="",
            detected_language=None
            if language_code == "unknown"
            else language_code,
            language_detection_mode=detection_mode,
            mode=mode,
            error_category="service_unavailable",
            fallback_recommended=True,
            message="Primary transcription engine encountered an error. Switching to Browser Speech Recognition.",
        )


speech_service = SarvamSpeechService()
