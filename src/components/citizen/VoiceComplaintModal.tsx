import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Mic,
  RotateCcw,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import {
  AUTO_DETECT_LANGUAGE_OPTION,
  getSpeechLanguageMetadata,
  SarvamLanguageCode,
  SPEECH_LANGUAGE_OPTIONS,
} from '../../config/speechLanguages';
import {
  RecordedAudioPayload,
  useAudioRecorder,
} from '../../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { transcribeAudioWithSarvam } from '../../services/speechApi';
import { LanguageCode } from '../../types/janaseva';
import { useLanguage } from '../../i18n/LanguageContext';
import { ReadAloudButton } from '../common/ReadAloudButton';

interface VoiceComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToAnalysis: (payload: {
    transcript: string;
    detectedLanguage: LanguageCode;
  }) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
}

function mapSarvamLanguageToJanasevaCode(
  sarvamCode: string | null | undefined,
  selectedHint: SarvamLanguageCode
): LanguageCode {
  const code = (sarvamCode || selectedHint || '').toLowerCase();
  if (code.startsWith('te')) return 'te';
  if (code.startsWith('hi')) return 'hi';
  return 'en';
}

export const VoiceComplaintModal: React.FC<VoiceComplaintModalProps> = ({
  isOpen,
  onClose,
  onContinueToAnalysis,
}) => {
  const { t, uiLanguage } = useLanguage();

  const [selectedLang, setSelectedLang] =
    useState<SarvamLanguageCode>('unknown');
  const [transcript, setTranscript] = useState('');
  const [detectedLang, setDetectedLang] = useState<LanguageCode>(uiLanguage);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usingBrowserFallback, setUsingBrowserFallback] = useState(false);

  const selectedMetadata = getSpeechLanguageMetadata(selectedLang);
  const browserLocale =
    selectedMetadata.browserLocale ||
    (uiLanguage === 'te' ? 'te-IN' : uiLanguage === 'hi' ? 'hi-IN' : 'en-IN');

  const browserSpeech = useSpeechRecognition({
    locale: browserLocale,
  });

  const handleRecordedAudioComplete = async (payload: RecordedAudioPayload) => {
    setErrorMessage(null);
    setIsTranscribing(true);
    setStatusMessage(t('voiceModal.transcribing'));

    try {
      const response = await transcribeAudioWithSarvam({
        audioBlob: payload.blob,
        mimeType: payload.mimeType,
        languageCode: selectedLang,
        mode: 'transcribe',
      });
      setIsTranscribing(false);

      if (response.success && response.transcript.trim()) {
        setTranscript(response.transcript.trim());
        const mappedLang = mapSarvamLanguageToJanasevaCode(
          response.detected_language,
          selectedLang
        );
        setDetectedLang(mappedLang);
        setStatusMessage(
          `Transcribed via Sarvam AI (${response.model || 'saaras:v4'})`
        );
        return;
      }

      if (response.fallback_recommended && browserSpeech.isSupported) {
        setStatusMessage(
          'Switching to Browser Speech Recognition fallback — please speak now...'
        );
        setUsingBrowserFallback(true);
        browserSpeech.resetTranscript();
        browserSpeech.startListening(browserLocale);
        return;
      }

      setErrorMessage(
        response.error_message ||
          'Could not transcribe audio. You can record again or type your complaint directly below.'
      );
    } catch {
      setIsTranscribing(false);
      setErrorMessage(
        'Network error while transcribing audio. Please record again or type below.'
      );
    }
  };

  const audioRecorder = useAudioRecorder({
    maxDurationSeconds: 28,
    onRecordingComplete: handleRecordedAudioComplete,
    onRecorderError: (msg) => setErrorMessage(msg),
  });

  // Sync live browser fallback transcript when active
  useEffect(() => {
    if (usingBrowserFallback && browserSpeech.combinedTranscript) {
      setTranscript(browserSpeech.combinedTranscript);
    }
  }, [usingBrowserFallback, browserSpeech.combinedTranscript]);

  // Reset modal state cleanly when opened or closed
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setStatusMessage(null);
      setDetectedLang(uiLanguage);
    } else {
      if (audioRecorder.isRecording) {
        audioRecorder.cancelAudioRecording();
      }
      if (browserSpeech.isListening) {
        browserSpeech.cancelListening();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setUsingBrowserFallback(false);

    if (audioRecorder.isRecorderSupported) {
      await audioRecorder.startAudioRecording();
      return;
    }

    if (browserSpeech.isSupported) {
      setUsingBrowserFallback(true);
      browserSpeech.resetTranscript();
      browserSpeech.startListening(browserLocale);
      return;
    }

    setErrorMessage(
      'Voice recording is not supported in this browser. Please type your complaint below.'
    );
  };

  const handleStopRecording = () => {
    setErrorMessage(null);

    if (usingBrowserFallback && browserSpeech.isListening) {
      browserSpeech.stopListening();
      setUsingBrowserFallback(false);
      setDetectedLang(selectedMetadata.coreFormLanguage || uiLanguage);
      setStatusMessage('Voice captured using Browser Speech Recognition.');
      return;
    }

    if (audioRecorder.isRecording) {
      audioRecorder.stopAudioRecording();
    }
  };

  const handleRecordAgain = async () => {
    if (audioRecorder.isRecording) {
      audioRecorder.cancelAudioRecording();
    }
    if (browserSpeech.isListening) {
      browserSpeech.cancelListening();
    }
    setTranscript('');
    setErrorMessage(null);
    setStatusMessage(null);
    await handleStartRecording();
  };

  const handleCancelAndClose = () => {
    if (audioRecorder.isRecording) {
      audioRecorder.cancelAudioRecording();
    }
    if (browserSpeech.isListening) {
      browserSpeech.cancelListening();
    }
    onClose();
  };

  const handleContinue = () => {
    const clean = transcript.trim();
    if (!clean) {
      setErrorMessage(t('voiceModal.emptyWarning'));
      return;
    }
    if (audioRecorder.isRecording) {
      audioRecorder.cancelAudioRecording();
    }
    if (browserSpeech.isListening) {
      browserSpeech.cancelListening();
    }
    onContinueToAnalysis({
      transcript: clean,
      detectedLanguage: detectedLang,
    });
  };

  const isCurrentlyRecording =
    audioRecorder.isRecording || browserSpeech.isListening;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A56]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#FFFCF7] border-2 border-[#123B78] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#102A56] to-[#123B78] text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#87CEFA] border border-white/40 flex items-center justify-center text-[#102A56] shadow-sm">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 id="voice-modal-title" className="text-base font-bold">
                {t('voiceModal.title')}
              </h2>
              <p className="text-xs text-sky-200 mt-0.5">
                {t('voiceModal.subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancelAndClose}
            aria-label={t('common.close')}
            className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Spoken Language Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-sky-50/80 border border-sky-200/80">
            <label
              htmlFor="voice-modal-lang"
              className="text-xs font-semibold text-[#102A56]"
            >
              {t('voiceModal.selectSpokenLanguage')}
            </label>
            <select
              id="voice-modal-lang"
              value={selectedLang}
              disabled={isCurrentlyRecording || isTranscribing}
              onChange={(e) =>
                setSelectedLang(e.target.value as SarvamLanguageCode)
              }
              className="px-3 py-1.5 text-xs font-semibold bg-[#FFFCF7] border border-[#123B78]/40 rounded-lg text-[#102A56] focus:outline-none focus:border-[#1D4ED8]"
            >
              <option value={AUTO_DETECT_LANGUAGE_OPTION.code}>
                {t('voiceModal.autoDetect')}
              </option>
              {SPEECH_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.displayName} — {opt.nativeName} ({opt.code})
                </option>
              ))}
            </select>
          </div>

          {/* Central Circular Microphone Action */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            {!isCurrentlyRecording ? (
              <button
                type="button"
                disabled={isTranscribing}
                onClick={handleStartRecording}
                className="group relative w-24 h-24 rounded-full bg-[#87CEFA] hover:bg-[#48A9E8] border-4 border-[#123B78] flex items-center justify-center text-[#102A56] shadow-[0_0_25px_rgba(135,206,250,0.75)] hover:shadow-[0_0_35px_rgba(72,169,232,0.9)] transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <Mic className="w-10 h-10 text-[#102A56] transition-transform group-hover:scale-110" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="relative w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 border-4 border-red-200 flex items-center justify-center text-white shadow-[0_0_30px_rgba(220,38,38,0.7)] animate-pulse transition-all cursor-pointer"
              >
                <Square className="w-9 h-9 fill-current" />
              </button>
            )}

            {/* Recording Status & Timer */}
            {isCurrentlyRecording && (
              <div className="flex flex-col items-center gap-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span>{t('voiceModal.recording')}</span>
                  {audioRecorder.isRecording && (
                    <span className="font-mono">
                      ({formatDuration(audioRecorder.recordingSeconds)})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="text-xs font-semibold text-[#1D4ED8] hover:underline mt-1 cursor-pointer"
                >
                  {t('voiceModal.stopRecording')}
                </button>
              </div>
            )}

            {!isCurrentlyRecording && !isTranscribing && (
              <div className="text-center">
                <div className="text-sm font-bold text-[#102A56]">
                  {t('voiceModal.startRecording')}
                </div>
                <p className="text-xs text-[#63718A] mt-0.5 max-w-md">
                  {t('voiceModal.tip')}
                </p>
              </div>
            )}

            {isTranscribing && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-200 text-xs font-semibold text-[#102A56]">
                <Loader2 className="w-4 h-4 animate-spin text-[#1D4ED8]" />
                <span>{t('voiceModal.transcribing')}</span>
              </div>
            )}
          </div>

          {/* Error or Permission Notice */}
          {(errorMessage || browserSpeech.errorMessage) && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{errorMessage || browserSpeech.errorMessage}</div>
            </div>
          )}

          {statusMessage && !isTranscribing && (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              {statusMessage}
            </div>
          )}

          {/* Editable Transcript Area + Read Aloud */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="voice-modal-transcript"
                className="text-xs font-bold text-[#102A56]"
              >
                {t('voiceModal.transcriptLabel')}
              </label>

              <div className="flex items-center gap-2">
                <ReadAloudButton
                  text={transcript}
                  language={
                    selectedLang !== 'unknown' ? selectedLang : detectedLang
                  }
                />
                {transcript.trim() && (
                  <button
                    type="button"
                    onClick={handleRecordAgain}
                    disabled={isCurrentlyRecording || isTranscribing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-sky-300 text-[#102A56] hover:bg-sky-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('voiceModal.recordAgain')}</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="voice-modal-transcript"
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={t('voiceModal.transcriptPlaceholder')}
              className="w-full p-3.5 text-sm bg-white border border-sky-300/90 rounded-xl text-[#102A56] focus:outline-none focus:border-[#1D4ED8] leading-relaxed"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-sky-50/70 border-t border-sky-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCancelAndClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-[#63718A] hover:text-[#102A56] hover:bg-sky-100/60 transition-colors cursor-pointer"
          >
            {t('voiceModal.cancel')}
          </button>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleRecordAgain}
              disabled={isCurrentlyRecording || isTranscribing}
              className="jana-btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('voiceModal.recordAgain')}</span>
            </button>

            <button
              type="button"
              disabled={isCurrentlyRecording || isTranscribing}
              onClick={handleContinue}
              className="jana-btn-accent px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('voiceModal.continueToAi')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
