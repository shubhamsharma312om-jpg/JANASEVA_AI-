import { useCallback, useEffect, useRef, useState } from 'react';
import { LanguageCode } from '../types/janaseva';

export type SpeechLocale = string;

export const LANGUAGE_TO_SPEECH_LOCALE: Record<LanguageCode, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

export const SPEECH_LOCALE_LABELS: Record<
  string,
  { nativeLabel: string; englishLabel: string; langCode: LanguageCode }
> = {
  'en-IN': {
    nativeLabel: 'English',
    englishLabel: 'English (en-IN)',
    langCode: 'en',
  },
  'te-IN': {
    nativeLabel: 'తెలుగు',
    englishLabel: 'Telugu (te-IN)',
    langCode: 'te',
  },
  'hi-IN': {
    nativeLabel: 'हिन्दी',
    englishLabel: 'Hindi (hi-IN)',
    langCode: 'hi',
  },
};

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultItemLike {
  transcript: string;
  confidence?: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultItemLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getBrowserSpeechRecognitionConstructor():
  | (new () => SpeechRecognitionInstance)
  | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export interface UseSpeechRecognitionOptions {
  locale: SpeechLocale;
  /** When true, suppresses automatic empty-speech errors during background companion capture */
  silentCompanionMode?: boolean;
  onSessionComplete?: (finalTranscript: string) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  finalTranscript: string;
  interimTranscript: string;
  combinedTranscript: string;
  errorMessage: string | null;
  startListening: (overrideLocale?: SpeechLocale) => void;
  stopListening: () => void;
  cancelListening: () => void;
  resetTranscript: () => void;
  clearError: () => void;
  getLatestTranscriptSnapshot: () => string;
}

export function useSpeechRecognition({
  locale,
  silentCompanionMode = false,
  onSessionComplete,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [isSupported] = useState<boolean>(() =>
    Boolean(getBrowserSpeechRecognitionConstructor())
  );
  const [isListening, setIsListening] = useState<boolean>(false);
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const manualStopRef = useRef<boolean>(false);
  const finalBufferRef = useRef<string>('');
  const interimBufferRef = useRef<string>('');
  const hadErrorRef = useRef<boolean>(false);
  const silentModeRef = useRef<boolean>(silentCompanionMode);
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    silentModeRef.current = silentCompanionMode;
  }, [silentCompanionMode]);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  const mapErrorToCitizenMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microphone permission is required. Please allow microphone access in your browser settings.';
      case 'audio-capture':
        return 'Microphone access is unavailable. Please ensure a working microphone is connected and not used by another application.';
      case 'no-speech':
        return "Sorry, we couldn't recognize your speech. Please try again.";
      case 'network':
        return 'A network error occurred during browser speech recognition. Please check your internet connection or type your complaint manually.';
      case 'language-not-supported':
        return 'The selected speaking language is not supported by your current browser speech engine. Please try another language or type manually.';
      case 'aborted':
        return 'Voice recording was cancelled.';
      default:
        return "Sorry, we couldn't recognize your speech. Please try again or type your complaint manually.";
    }
  };

  const cleanupInstance = useCallback(() => {
    const instance = recognitionRef.current;
    if (instance) {
      instance.onstart = null;
      instance.onresult = null;
      instance.onerror = null;
      instance.onend = null;
      try {
        instance.abort();
      } catch {
        // Ignore cleanup errors
      }
      recognitionRef.current = null;
    }
  }, []);

  // Ensure microphone stops immediately if citizen leaves the page or unmounts component
  useEffect(() => {
    return () => {
      cleanupInstance();
    };
  }, [cleanupInstance]);

  const getLatestTranscriptSnapshot = useCallback((): string => {
    return [finalBufferRef.current, interimBufferRef.current]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const startListening = useCallback(
    (overrideLocale?: SpeechLocale) => {
      setErrorMessage(null);
      const SpeechConstructor = getBrowserSpeechRecognitionConstructor();

      if (!SpeechConstructor) {
        if (!silentModeRef.current) {
          setErrorMessage(
            'Speech recognition is not supported in this browser. You can type your complaint manually.'
          );
        }
        return;
      }

      // Clean up any existing session before starting fresh
      cleanupInstance();

      isCancelledRef.current = false;
      manualStopRef.current = false;
      hadErrorRef.current = false;
      finalBufferRef.current = '';
      interimBufferRef.current = '';
      setFinalTranscript('');
      setInterimTranscript('');

      try {
        const recognition = new SpeechConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = overrideLocale || locale || 'en-IN';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let accumulatedFinal = '';
          let currentInterim = '';

          for (let i = 0; i < event.results.length; i += 1) {
            const result = event.results[i];
            const piece = result[0]?.transcript || '';
            if (result.isFinal) {
              accumulatedFinal += `${piece} `;
            } else {
              currentInterim += piece;
            }
          }

          const cleanFinal = accumulatedFinal.replace(/\s+/g, ' ').trim();
          const cleanInterim = currentInterim.replace(/\s+/g, ' ').trim();

          finalBufferRef.current = cleanFinal;
          interimBufferRef.current = cleanInterim;

          setFinalTranscript(cleanFinal);
          setInterimTranscript(cleanInterim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          if (isCancelledRef.current && event.error === 'aborted') {
            return;
          }
          hadErrorRef.current = true;
          if (!silentModeRef.current) {
            const friendlyMsg = mapErrorToCitizenMessage(event.error);
            setErrorMessage(friendlyMsg);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;

          if (isCancelledRef.current) {
            finalBufferRef.current = '';
            interimBufferRef.current = '';
            setFinalTranscript('');
            setInterimTranscript('');
            return;
          }

          // Combine any remaining interim speech with final transcript
          const merged = [finalBufferRef.current, interimBufferRef.current]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          setFinalTranscript(merged);
          setInterimTranscript('');

          if (!merged && !hadErrorRef.current && !silentModeRef.current) {
            setErrorMessage(
              "Sorry, we couldn't recognize your speech. Please speak clearly into your microphone and try again."
            );
            return;
          }

          if (merged && onSessionCompleteRef.current) {
            onSessionCompleteRef.current(merged);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        setIsListening(false);
        if (!silentModeRef.current) {
          setErrorMessage(
            'Speech recognition service is currently unavailable. Please check your microphone settings or type your complaint manually.'
          );
        }
      }
    },
    [cleanupInstance, locale]
  );

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    const instance = recognitionRef.current;
    if (instance) {
      try {
        instance.stop();
      } catch {
        cleanupInstance();
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }
  }, [cleanupInstance]);

  const cancelListening = useCallback(() => {
    isCancelledRef.current = true;
    finalBufferRef.current = '';
    interimBufferRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    cleanupInstance();
    setIsListening(false);
  }, [cleanupInstance]);

  const resetTranscript = useCallback(() => {
    finalBufferRef.current = '';
    interimBufferRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const combinedTranscript = [finalTranscript, interimTranscript]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    isSupported,
    isListening,
    finalTranscript,
    interimTranscript,
    combinedTranscript,
    errorMessage,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
    clearError,
    getLatestTranscriptSnapshot,
  };
}
