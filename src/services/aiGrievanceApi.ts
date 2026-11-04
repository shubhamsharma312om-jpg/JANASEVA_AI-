import { GrievanceAIAnalysisResult } from '../types/janaseva';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface AIEngineStatusResponse {
  engine: string;
  configured_provider: string;
  gemini_model: string;
  gemini_api_configured: boolean;
  sarvam_stt_model: string;
  sarvam_api_configured: boolean;
  hybrid_python_validator_active: boolean;
  missing_environment_variables: string[];
  supported_categories: string[];
}

export async function analyzeCitizenGrievance(params: {
  transcript: string;
  preferredLanguage?: string;
  conversationContext?: Record<string, any> | null;
}): Promise<GrievanceAIAnalysisResult> {
  const response = await fetch(`${API_BASE}/ai/analyze-grievance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      transcript: params.transcript,
      preferred_language: params.preferredLanguage || undefined,
      conversation_context: params.conversationContext || undefined,
    }),
  });

  if (!response.ok) {
    let errDetail = 'Unable to analyze complaint.';
    try {
      const errJson = await response.json();
      if (errJson?.detail) {
        errDetail = errJson.detail;
      }
    } catch {
      // Ignore parse error
    }
    throw new Error(errDetail);
  }

  return (await response.json()) as GrievanceAIAnalysisResult;
}

export async function fetchAIEngineStatus(): Promise<AIEngineStatusResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/ai/status`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return (await response.json()) as AIEngineStatusResponse;
  } catch {
    return null;
  }
}

export function formatDetectedLanguageLabel(code: string): string {
  const normalized = (code || 'en').toLowerCase().trim();
  const map: Record<string, string> = {
    te: 'Telugu (తెలుగు)',
    'te-in': 'Telugu (తెలుగు)',
    hi: 'Hindi (हिन्दी)',
    'hi-in': 'Hindi (हिन्दी)',
    en: 'English',
    'en-in': 'English (India)',
    'hi-en': 'Hinglish (Hindi–English Code-Mixed)',
    'te-en': 'Telugu–English (Code-Mixed)',
    ta: 'Tamil (தமிழ்)',
    kn: 'Kannada (ಕನ್ನಡ)',
    ml: 'Malayalam (മലയാളം)',
    mr: 'Marathi (मराठी)',
    bn: 'Bengali (বাংলা)',
    gu: 'Gujarati (ગુજરાતી)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    or: 'Odia (ଓଡ଼ିଆ)',
    od: 'Odia (ଓଡ଼ିଆ)',
    ur: 'Urdu (اردو)',
  };
  return map[normalized] || code;
}
