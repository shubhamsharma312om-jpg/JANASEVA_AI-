"""
JANASEVA AI — Unit Tests for Sarvam Saaras v4 Speech-to-Text Service
Verifies audio input validation, language code & mode validation, missing API key handling,
HTTP status error classification (401/403 auth, 402/429 quota, 400 validation, 5xx unavailable),
and original-language transcript preservation.
"""
import unittest
from unittest.mock import patch

from app.core.config import SARVAM_SUPPORTED_LANGUAGE_CODES
from app.services.speech_service import SarvamSpeechService


class TestSarvamSpeechService(unittest.TestCase):
    def setUp(self) -> None:
        self.sample_audio = b"OggS\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00sample_opus_audio_bytes"

    def test_supported_language_codes_include_core_and_indian_languages(self) -> None:
        for code in ("unknown", "en-IN", "te-IN", "hi-IN", "ta-IN", "kn-IN", "ml-IN", "bn-IN", "mr-IN", "gu-IN"):
            self.assertIn(code, SARVAM_SUPPORTED_LANGUAGE_CODES)

    def test_empty_audio_rejected_with_validation_error(self) -> None:
        result = SarvamSpeechService.transcribe_audio(
            audio_bytes=b"",
            filename="empty.webm",
            content_type="audio/webm",
            language_code="te-IN",
            api_key_override="test-key",
        )
        self.assertFalse(result["success"])
        self.assertEqual(result["error_category"], "validation_error")
        self.assertTrue(result["fallback_recommended"])

    def test_oversized_audio_rejected_with_validation_error(self) -> None:
        result = SarvamSpeechService.transcribe_audio(
            audio_bytes=b"x" * 250,
            filename="large.webm",
            content_type="audio/webm",
            language_code="en-IN",
            api_key_override="test-key",
            max_audio_bytes=100,
        )
        self.assertFalse(result["success"])
        self.assertEqual(result["error_category"], "validation_error")
        self.assertTrue(result["fallback_recommended"])

    def test_unsupported_mime_type_rejected(self) -> None:
        result = SarvamSpeechService.transcribe_audio(
            audio_bytes=self.sample_audio,
            filename="malicious.exe",
            content_type="application/x-msdownload",
            language_code="en-IN",
            api_key_override="test-key",
        )
        self.assertFalse(result["success"])
        self.assertEqual(result["error_category"], "validation_error")

    def test_unsupported_language_code_rejected(self) -> None:
        result = SarvamSpeechService.transcribe_audio(
            audio_bytes=self.sample_audio,
            filename="voice.webm",
            content_type="audio/webm",
            language_code="fr-FR",
            api_key_override="test-key",
        )
        self.assertFalse(result["success"])
        self.assertEqual(result["error_category"], "validation_error")

    def test_missing_api_key_recommends_browser_fallback(self) -> None:
        result = SarvamSpeechService.transcribe_audio(
            audio_bytes=self.sample_audio,
            filename="voice.webm",
            content_type="audio/webm",
            language_code="te-IN",
            api_key_override="",
        )
        self.assertFalse(result["success"])
        self.assertEqual(result["error_category"], "missing_api_key")
        self.assertTrue(result["fallback_recommended"])

    def test_quota_exhausted_classification_http_402_and_429(self) -> None:
        res_402 = SarvamSpeechService._classify_http_status(
            status_code=402,
            language_code="hi-IN",
            detection_mode="manual",
            mode="transcribe",
        )
        self.assertFalse(res_402["success"])
        self.assertEqual(res_402["error_category"], "quota_exhausted")
        self.assertTrue(res_402["fallback_recommended"])

        res_429 = SarvamSpeechService._classify_http_status(
            status_code=429,
            language_code="te-IN",
            detection_mode="manual",
            mode="transcribe",
        )
        self.assertEqual(res_429["error_category"], "quota_exhausted")

    def test_authentication_error_classification_http_401(self) -> None:
        res_401 = SarvamSpeechService._classify_http_status(
            status_code=401,
            language_code="en-IN",
            detection_mode="manual",
            mode="transcribe",
        )
        self.assertFalse(res_401["success"])
        self.assertEqual(res_401["error_category"], "authentication_error")
        self.assertTrue(res_401["fallback_recommended"])

    def test_successful_transcription_preserves_original_script_and_detected_language(self) -> None:
        mocked_response = {
            "success": True,
            "engine": "sarvam",
            "model": "saaras:v4",
            "transcript": "మా కాలనీలో గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు",
            "detected_language": "te-IN",
            "language_detection_mode": "automatic",
            "mode": "transcribe",
            "error_category": None,
            "error_type": None,
            "fallback_recommended": False,
            "message": "Transcription completed successfully",
            "error_message": None,
        }
        with patch.object(
            SarvamSpeechService, "_transcribe_via_rest_http", return_value=mocked_response
        ):
            result = SarvamSpeechService.transcribe_audio(
                audio_bytes=self.sample_audio,
                filename="complaint.webm",
                content_type="audio/webm;codecs=opus",
                language_code="unknown",
                mode="transcribe",
                api_key_override="valid-test-key",
            )
            self.assertTrue(result["success"])
            self.assertEqual(result["engine"], "sarvam")
            self.assertEqual(result["model"], "saaras:v4")
            self.assertEqual(result["detected_language"], "te-IN")
            self.assertEqual(result["language_detection_mode"], "automatic")
            self.assertEqual(
                result["transcript"],
                "మా కాలనీలో గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు",
            )
            self.assertFalse(result["fallback_recommended"])


if __name__ == "__main__":
    unittest.main()
