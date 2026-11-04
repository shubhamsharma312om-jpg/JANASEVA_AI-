import { useCallback, useEffect, useRef, useState } from 'react';

// Global tracker so starting Read Aloud in one component stops any other active utterance
let activeUtteranceId = 0;
const stopListeners = new Set<() => void>();

function notifyAllStop() {
  stopListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

export interface UseTextToSpeechResult {
  isSpeaking: boolean;
  isSupported: boolean;
  notice: string | null;
  speak: (text: string, langHint?: string) => void;
  stop: () => void;
}

function resolveBcp47Tag(langHint?: string, textSample?: string): string {
  const hint = (langHint || '').toLowerCase().trim();
  if (hint.startsWith('te') || hint.includes('telugu') || hint.includes('తెలుగు')) {
    return 'te-IN';
  }
  if (hint.startsWith('hi') || hint.includes('hindi') || hint.includes('हिन्दी')) {
    return 'hi-IN';
  }
  if (hint.startsWith('en') || hint.includes('english')) {
    return 'en-IN';
  }
  // Auto-detect from script if no explicit hint
  if (textSample) {
    if (/[\u0C00-\u0C7F]/.test(textSample)) {
      return 'te-IN';
    }
    if (/[\u0900-\u097F]/.test(textSample)) {
      return 'hi-IN';
    }
  }
  return 'en-IN';
}

export function useTextToSpeech(): UseTextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const myIdRef = useRef<number>(0);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    const handleOtherStart = () => {
      setIsSpeaking(false);
    };
    stopListeners.add(handleOtherStart);
    return () => {
      stopListeners.delete(handleOtherStart);
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [isSpeaking]);

  const speak = useCallback(
    (text: string, langHint?: string) => {
      const cleaned = (text || '').trim();
      if (!cleaned) return;

      if (!isSupported) {
        setNotice(
          'Speech synthesis is not supported in this browser environment.'
        );
        return;
      }

      try {
        // Stop any existing speech first
        window.speechSynthesis.cancel();
        notifyAllStop();

        const nextId = ++activeUtteranceId;
        myIdRef.current = nextId;
        setNotice(null);

        const targetBcp47 = resolveBcp47Tag(langHint, cleaned);
        const langPrefix = targetBcp47.split('-')[0].toLowerCase();

        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = targetBcp47;
        utterance.rate = 0.96;

        const voices = window.speechSynthesis.getVoices?.() || [];
        if (voices.length > 0) {
          // 1. Exact or prefix match for requested language (e.g. te-IN, hi-IN, en-IN)
          const exactVoice =
            voices.find(
              (v) => v.lang.toLowerCase() === targetBcp47.toLowerCase()
            ) ||
            voices.find((v) =>
              v.lang.toLowerCase().startsWith(langPrefix)
            ) ||
            voices.find((v) =>
              v.name.toLowerCase().includes(
                langPrefix === 'te'
                  ? 'telugu'
                  : langPrefix === 'hi'
                  ? 'hindi'
                  : 'english'
              )
            );

          if (exactVoice) {
            utterance.voice = exactVoice;
          } else if (langPrefix !== 'en') {
            // Regional voice not installed on client OS; use Indian English or default voice with a gentle notice
            const fallbackVoice =
              voices.find((v) => v.lang.toLowerCase().includes('in')) ||
              voices.find((v) => v.default) ||
              voices[0];
            if (fallbackVoice) {
              utterance.voice = fallbackVoice;
            }
            setNotice(
              `Native ${
                langPrefix === 'te' ? 'Telugu (te-IN)' : 'Hindi (hi-IN)'
              } system voice not detected on this device; reading with default system voice.`
            );
          }
        }

        utterance.onstart = () => {
          if (myIdRef.current === nextId) {
            setIsSpeaking(true);
          }
        };

        utterance.onend = () => {
          if (myIdRef.current === nextId) {
            setIsSpeaking(false);
          }
        };

        utterance.onerror = () => {
          if (myIdRef.current === nextId) {
            setIsSpeaking(false);
          }
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
        setNotice('Unable to start voice playback on this browser.');
      }
    },
    [isSupported]
  );

  return {
    isSpeaking,
    isSupported,
    notice,
    speak,
    stop,
  };
}
