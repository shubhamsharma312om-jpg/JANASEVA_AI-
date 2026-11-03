import { LanguageCode } from '../types/janaseva';

export type SarvamLanguageCode =
  | 'unknown'
  | 'en-IN'
  | 'te-IN'
  | 'hi-IN'
  | 'bn-IN'
  | 'gu-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'mr-IN'
  | 'od-IN'
  | 'pa-IN'
  | 'ta-IN'
  | 'as-IN'
  | 'ur-IN'
  | 'ne-IN'
  | 'kok-IN'
  | 'ks-IN'
  | 'sd-IN'
  | 'sa-IN'
  | 'sat-IN'
  | 'mni-IN'
  | 'brx-IN'
  | 'mai-IN'
  | 'doi-IN';

export type SarvamTranscriptionMode = 'transcribe' | 'codemix';

export interface SpeechLanguageOption {
  /** Official Sarvam Saaras v4 BCP-47 language code (or 'unknown' for auto-detection) */
  code: SarvamLanguageCode;
  /** English display name */
  displayName: string;
  /** Native script label */
  nativeName: string;
  /** Maps back to JANASEVA core 3-language form code when applicable */
  coreFormLanguage: LanguageCode;
  /** Whether this is one of the 3 primary quick-access languages */
  isPrimaryDefault: boolean;
  /** Supported by Sarvam AI Saaras v4 */
  sarvamSupported: boolean;
  /** Supported by Chromium / WebKit Browser SpeechRecognition fallback */
  browserFallbackSupported: boolean;
  /** BCP-47 locale passed to Browser SpeechRecognition when in fallback mode */
  browserLocale: string | null;
}

export const AUTO_DETECT_LANGUAGE_OPTION: SpeechLanguageOption = {
  code: 'unknown',
  displayName: 'Auto-Detect Language',
  nativeName: 'Auto-Detect (बहुभाषी)',
  coreFormLanguage: 'en',
  isPrimaryDefault: false,
  sarvamSupported: true,
  browserFallbackSupported: false, // Browser Web Speech API requires an explicit language code
  browserLocale: null,
};

/**
 * Complete centralized language configuration for JANASEVA AI Voice-to-Grievance.
 * Based on official Sarvam AI Saaras v4 documentation (22 scheduled Indian languages + English).
 */
export const SPEECH_LANGUAGE_OPTIONS: SpeechLanguageOption[] = [
  // Primary 3 Quick-Access Languages (preserved from existing JANASEVA AI interface)
  {
    code: 'en-IN',
    displayName: 'English (India)',
    nativeName: 'English',
    coreFormLanguage: 'en',
    isPrimaryDefault: true,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'en-IN',
  },
  {
    code: 'te-IN',
    displayName: 'Telugu',
    nativeName: 'తెలుగు',
    coreFormLanguage: 'te',
    isPrimaryDefault: true,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'te-IN',
  },
  {
    code: 'hi-IN',
    displayName: 'Hindi',
    nativeName: 'हिन्दी',
    coreFormLanguage: 'hi',
    isPrimaryDefault: true,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'hi-IN',
  },

  // Additional Indian Languages supported by Sarvam Saaras v4 ("More Indian Languages")
  {
    code: 'ta-IN',
    displayName: 'Tamil',
    nativeName: 'தமிழ்',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'ta-IN',
  },
  {
    code: 'kn-IN',
    displayName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'kn-IN',
  },
  {
    code: 'ml-IN',
    displayName: 'Malayalam',
    nativeName: 'മലയാളം',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'ml-IN',
  },
  {
    code: 'mr-IN',
    displayName: 'Marathi',
    nativeName: 'मराठी',
    coreFormLanguage: 'hi',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'mr-IN',
  },
  {
    code: 'bn-IN',
    displayName: 'Bengali',
    nativeName: 'বাংলা',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'bn-IN',
  },
  {
    code: 'gu-IN',
    displayName: 'Gujarati',
    nativeName: 'ગુજરાતી',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'gu-IN',
  },
  {
    code: 'pa-IN',
    displayName: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'pa-IN',
  },
  {
    code: 'od-IN',
    displayName: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'or-IN',
  },
  {
    code: 'ur-IN',
    displayName: 'Urdu',
    nativeName: 'اردو',
    coreFormLanguage: 'hi',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'ur-IN',
  },
  {
    code: 'as-IN',
    displayName: 'Assamese',
    nativeName: 'অসমীয়া',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'as-IN',
  },
  {
    code: 'ne-IN',
    displayName: 'Nepali',
    nativeName: 'नेपाली',
    coreFormLanguage: 'hi',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: true,
    browserLocale: 'ne-NP',
  },
  {
    code: 'kok-IN',
    displayName: 'Konkani',
    nativeName: 'कोंकणी',
    coreFormLanguage: 'hi',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
  {
    code: 'mai-IN',
    displayName: 'Maithili',
    nativeName: 'मैथिली',
    coreFormLanguage: 'hi',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
  {
    code: 'sa-IN',
    displayName: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    coreFormLanguage: 'hi',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
  {
    code: 'ks-IN',
    displayName: 'Kashmiri',
    nativeName: 'कॉशुर / کٲشُر',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
  {
    code: 'sd-IN',
    displayName: 'Sindhi',
    nativeName: 'सिन्धी / سنڌي',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
  {
    code: 'doi-IN',
    displayName: 'Dogri',
    nativeName: 'डोगरी',
    coreFormLanguage: 'hi',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
  {
    code: 'mni-IN',
    displayName: 'Manipuri',
    nativeName: 'মৈতৈলোন্',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
  {
    code: 'sat-IN',
    displayName: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
  {
    code: 'brx-IN',
    displayName: 'Bodo',
    nativeName: 'बर’',
    coreFormLanguage: 'en',
    isPrimaryDefault: false,
    sarvamSupported: true,
    browserFallbackSupported: false,
    browserLocale: null,
  },
];

export const PRIMARY_SPEECH_LANGUAGES = SPEECH_LANGUAGE_OPTIONS.filter(
  (lang) => lang.isPrimaryDefault
);

export const ADDITIONAL_INDIAN_LANGUAGES = SPEECH_LANGUAGE_OPTIONS.filter(
  (lang) => !lang.isPrimaryDefault
);

export const CORE_LANG_TO_SARVAM_CODE: Record<LanguageCode, SarvamLanguageCode> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

export function getSpeechLanguageMetadata(
  code: SarvamLanguageCode | string
): SpeechLanguageOption {
  if (code === 'unknown') {
    return AUTO_DETECT_LANGUAGE_OPTION;
  }
  return (
    SPEECH_LANGUAGE_OPTIONS.find((item) => item.code === code) ||
    SPEECH_LANGUAGE_OPTIONS[0]
  );
}
