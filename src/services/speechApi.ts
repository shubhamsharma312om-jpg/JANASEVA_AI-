import {
  SarvamLanguageCode,
  SarvamTranscriptionMode,
} from '../config/speechLanguages';

export interface SpeechEngineStatusResponse {
  primary_engine: 'sarvam';
  primary_model: string;
  sarvam_configured: boolean;
  fallback_engine: 'browser';
  max_audio_bytes: number;
  supported_language_codes: string[];
}

export interface SpeechTranscribeApiResponse {
  success: boolean;
  engine: 'sarvam' | 'browser';
  model: string;
  transcript: string;
  detected_language: string;
  mode: string;
  request_id?: string | null;
  error_type?:
    | 'missing_api_key'
    | 'authentication_error'
    | 'quota_exhausted'
    | 'validation_error'
    | 'timeout'
    | 'network_error'
    | 'service_unavailable'
    | null;
  error_message?: string | null;
  fallback_recommended: boolean;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to encode recorded audio'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read recorded audio blob'));
    reader.readAsDataURL(blob);
  });
}

function extensionFromMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase();
  if (normalized.includes('webm')) return 'webm';
  if (normalized.includes('ogg') || normalized.includes('opus')) return 'ogg';
  if (normalized.includes('mp4') || normalized.includes('m4a') || normalized.includes('aac'))
    return 'm4a';
  if (normalized.includes('wav')) return 'wav';
  if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'mp3';
  return 'webm';
}

export async function fetchSpeechEngineStatus(): Promise<SpeechEngineStatusResponse | null> {
  try {
    const response = await fetch('/api/speech/status', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as SpeechEngineStatusResponse;
  } catch {
    return null;
  }
}

export async function transcribeAudioWithSarvam(params: {
  audioBlob: Blob;
  mimeType: string;
  languageCode: SarvamLanguageCode;
  mode?: SarvamTranscriptionMode;
  timeoutMs?: number;
}): Promise<SpeechTranscribeApiResponse> {
  const {
    audioBlob,
    mimeType,
    languageCode,
    mode = 'transcribe',
    timeoutMs = 24000,
  } = params;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const audioBase64 = await blobToBase64(audioBlob);
    const ext = extensionFromMimeType(mimeType);
    const filename = `citizen_grievance.${ext}`;

    const response = await fetch('/api/speech/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        audio_base64: audioBase64,
        filename,
        content_type: mimeType || 'audio/webm',
        language_code: languageCode,
        mode,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        engine: 'sarvam',
        model: 'saaras:v4',
        transcript: '',
        detected_language: languageCode,
        mode,
        error_type: 'service_unavailable',
        error_message:
          'Primary speech recognition endpoint returned an error. Switching to browser speech recognition.',
        fallback_recommended: true,
      };
    }

    const data = (await response.json()) as SpeechTranscribeApiResponse;
    return data;
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    return {
      success: false,
      engine: 'sarvam',
      model: 'saaras:v4',
      transcript: '',
      detected_language: languageCode,
      mode,
      error_type: isTimeout ? 'timeout' : 'network_error',
      error_message: isTimeout
        ? 'Primary speech recognition timed out. Switching to browser speech recognition.'
        : 'Unable to reach primary speech recognition server. Switching to browser speech recognition.',
      fallback_recommended: true,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
