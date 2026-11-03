import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Edit3,
  Globe,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { LanguageCode } from '../../types/janaseva';
import {
  ADDITIONAL_INDIAN_LANGUAGES,
  AUTO_DETECT_LANGUAGE_OPTION,
  CORE_LANG_TO_SARVAM_CODE,
  getSpeechLanguageMetadata,
  PRIMARY_SPEECH_LANGUAGES,
  SarvamLanguageCode,
  SarvamTranscriptionMode,
  SPEECH_LANGUAGE_OPTIONS,
} from '../../config/speechLanguages';
import {
  RecordedAudioPayload,
  useAudioRecorder,
} from '../../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import {
  fetchSpeechEngineStatus,
  transcribeAudioWithSarvam,
} from '../../services/speechApi';

interface VoiceComplaintInputProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentDescription: string;
  onUpdateDescription: (nextDescription: string) => void;
}

type ActiveSpeechEngine = 'sarvam' | 'browser';

function joinWithSingleSpace(baseText: string, addition: string): string {
  const cleanBase = baseText.trim();
  const cleanAdd = addition.trim();
  if (!cleanBase) return cleanAdd;
  if (!cleanAdd) return cleanBase;
  return `${cleanBase} ${cleanAdd}`;
}

export const VoiceComplaintInput: React.FC<VoiceComplaintInputProps> = ({
  selectedLanguage,
  onLanguageChange,
  currentDescription,
  onUpdateDescription,
}) => {
  // Selected Sarvam speech language code (defaults to matching the form's selectedLanguage)
  const [speechLangCode, setSpeechLangCode] = useState<SarvamLanguageCode>(
    () => CORE_LANG_TO_SARVAM_CODE[selectedLanguage] || 'en-IN'
  );
  const [speechMode, setSpeechMode] =
    useState<SarvamTranscriptionMode>('transcribe');

  // Engine status & telemetry
  const [activeEngine, setActiveEngine] =
    useState<ActiveSpeechEngine>('sarvam');
  const [sarvamConfiguredOnServer, setSarvamConfiguredOnServer] = useState<
    boolean | null
  >(null);
  const [isTranscribingSarvam, setIsTranscribingSarvam] =
    useState<boolean>(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [autoLimitNotice, setAutoLimitNotice] = useState<string | null>(null);
  const [detectedLangBadge, setDetectedLangBadge] = useState<string | null>(
    null
  );

  // When Auto-Detect ('unknown') is chosen and Sarvam falls back to Browser API, prompt citizen for explicit language
  const [needsExplicitBrowserLangPrompt, setNeedsExplicitBrowserLangPrompt] =
    useState<boolean>(false);

  // Stores the complaint description text that existed BEFORE the current voice session started
  const baseDescriptionRef = useRef<string>(currentDescription);
  const reviewTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isPureBrowserSessionRef = useRef<boolean>(false);

  const [reviewOpen, setReviewOpen] = useState<boolean>(false);
  const [reviewDraft, setReviewDraft] = useState<string>('');
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false);
  const [confirmedNotice, setConfirmedNotice] = useState<string | null>(null);
  const [uiErrorMessage, setUiErrorMessage] = useState<string | null>(null);

  // Keep speechLangCode synced when parent changes selectedLanguage externally (if currently using one of the 3 primary languages)
  useEffect(() => {
    const mapped = CORE_LANG_TO_SARVAM_CODE[selectedLanguage];
    if (
      mapped &&
      (speechLangCode === 'en-IN' ||
        speechLangCode === 'te-IN' ||
        speechLangCode === 'hi-IN')
    ) {
      setSpeechLangCode(mapped);
    }
  }, [selectedLanguage]);

  // Check backend Sarvam status on mount
  useEffect(() => {
    let mounted = true;
    fetchSpeechEngineStatus().then((status) => {
      if (!mounted || !status) return;
      setSarvamConfiguredOnServer(status.sarvam_configured);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const currentLangMeta = getSpeechLanguageMetadata(speechLangCode);

  const openReviewWithTranscript = (
    transcriptText: string,
    engineUsed: ActiveSpeechEngine,
    detectedCode?: string
  ) => {
    const cleanText = transcriptText.trim();
    if (!cleanText) return;

    setActiveEngine(engineUsed);
    if (detectedCode) {
      setDetectedLangBadge(detectedCode);
    } else {
      setDetectedLangBadge(speechLangCode);
    }
    setReviewDraft(cleanText);
    setReviewOpen(true);
    setIsEditingReview(false);
    setNeedsExplicitBrowserLangPrompt(false);

    // Insert the recognized text into the complaint description field without duplicating prior text
    const updated = joinWithSingleSpace(baseDescriptionRef.current, cleanText);
    onUpdateDescription(updated);
  };

  // Secondary Fallback Engine: Browser Web Speech API
  const {
    isSupported: isBrowserSpeechSupported,
    isListening: isBrowserListening,
    combinedTranscript: browserCombinedTranscript,
    errorMessage: browserErrorMessage,
    startListening: startBrowserListening,
    stopListening: stopBrowserListening,
    cancelListening: cancelBrowserListening,
    resetTranscript: resetBrowserTranscript,
    clearError: clearBrowserError,
    getLatestTranscriptSnapshot,
  } = useSpeechRecognition({
    locale: currentLangMeta.browserLocale || 'en-IN',
    silentCompanionMode: !isPureBrowserSessionRef.current,
    onSessionComplete: (finalBrowserText) => {
      // If we are running a pure Browser fallback session, complete directly into Review
      if (isPureBrowserSessionRef.current) {
        openReviewWithTranscript(
          finalBrowserText,
          'browser',
          currentLangMeta.browserLocale || speechLangCode
        );
      }
    },
  });

  // Primary Engine Audio Recorder: MediaRecorder -> Sarvam AI Saaras v4
  const handleAudioRecordingComplete = async (
    payload: RecordedAudioPayload
  ) => {
    // Stop companion browser recognition if it was running alongside MediaRecorder
    stopBrowserListening();

    if (payload.autoStoppedAtLimit) {
      setAutoLimitNotice(
        'Recording reached the 28-second single-segment limit for optimal accuracy. You can confirm this segment and click Speak Again to add more details.'
      );
    }

    setIsTranscribingSarvam(true);
    setUiErrorMessage(null);

    const sarvamResult = await transcribeAudioWithSarvam({
      audioBlob: payload.blob,
      mimeType: payload.mimeType,
      languageCode: speechLangCode,
      mode: speechMode,
    });

    setIsTranscribingSarvam(false);

    // 1. PRIMARY ENGINE SUCCESS: Sarvam Saaras v4 returned a valid transcript
    if (sarvamResult.success && sarvamResult.transcript.trim()) {
      setFallbackNotice(null);
      const detected = sarvamResult.detected_language || speechLangCode;
      const detectedMeta = getSpeechLanguageMetadata(detected);
      if (detectedMeta.isPrimaryDefault) {
        onLanguageChange(detectedMeta.coreFormLanguage);
      }
      openReviewWithTranscript(
        sarvamResult.transcript,
        'sarvam',
        detected
      );
      return;
    }

    // 2. PRIMARY ENGINE FAILURE -> AUTOMATIC FALLBACK TO BROWSER WEB SPEECH API
    setActiveEngine('browser');

    const companionTranscript = getLatestTranscriptSnapshot();

    // Case A: Companion Browser Web Speech API already captured the citizen's speech during this recording!
    if (companionTranscript) {
      setFallbackNotice(
        `${
          sarvamResult.error_message ||
          'Sarvam AI Saaras v4 was unavailable.'
        } Automatically used Browser Speech Recognition so none of your spoken words were lost.`
      );
      openReviewWithTranscript(
        companionTranscript,
        'browser',
        currentLangMeta.browserLocale || speechLangCode
      );
      return;
    }

    // Case B: Citizen selected Auto-Detect ('unknown'), which Browser Speech API does not support without a language code
    if (speechLangCode === 'unknown') {
      setNeedsExplicitBrowserLangPrompt(true);
      setFallbackNotice(
        `${
          sarvamResult.error_message ||
          'Sarvam AI auto-detection is currently unavailable.'
        } Browser Speech Recognition requires a specific speaking language. Please select your language below to speak with Browser Speech Recognition.`
      );
      onUpdateDescription(baseDescriptionRef.current);
      return;
    }

    // Case C: Selected Indian language is only supported by Sarvam AI and not by Browser Speech API
    if (!currentLangMeta.browserFallbackSupported || !currentLangMeta.browserLocale) {
      setUiErrorMessage(
        `${currentLangMeta.displayName} (${currentLangMeta.nativeName}) requires Sarvam AI Saaras v4 (${
          sarvamResult.error_message || 'currently unavailable'
        }) and is not supported by your browser's built-in speech engine. Please select English, తెలుగు, हिन्दी, or another browser-supported language, or type your complaint manually.`
      );
      onUpdateDescription(baseDescriptionRef.current);
      return;
    }

    // Case D: Browser Speech API is supported for this language, but companion transcript was empty
    if (isBrowserSpeechSupported) {
      setFallbackNotice(
        `${
          sarvamResult.error_message ||
          'Primary Sarvam AI engine was unavailable.'
        } Switched to Browser Speech Recognition (${currentLangMeta.nativeName}). Please click the microphone or "Speak with Browser Engine" to dictate.`
      );
    } else {
      setUiErrorMessage(
        sarvamResult.error_message ||
          "Sorry, we couldn't recognize your speech. Please try again or type your complaint manually."
      );
    }
    onUpdateDescription(baseDescriptionRef.current);
  };

  const {
    isRecorderSupported,
    isRecording: isAudioRecording,
    recordingSeconds,
    maxDurationSeconds,
    startAudioRecording,
    stopAudioRecording,
    cancelAudioRecording,
  } = useAudioRecorder({
    maxDurationSeconds: 28,
    onRecordingComplete: handleAudioRecordingComplete,
    onRecorderError: (msg) => {
      // If MediaRecorder fails, try pure Browser Speech API fallback automatically
      if (
        isBrowserSpeechSupported &&
        currentLangMeta.browserFallbackSupported &&
        currentLangMeta.browserLocale
      ) {
        isPureBrowserSessionRef.current = true;
        setActiveEngine('browser');
        setFallbackNotice(
          'Audio recorder unavailable; switched automatically to Browser Speech Recognition.'
        );
        startBrowserListening(currentLangMeta.browserLocale);
      } else {
        setUiErrorMessage(msg);
      }
    },
  });

  const isAnyRecordingActive = isAudioRecording || isBrowserListening;

  // Live update the complaint description textarea while the citizen is actively speaking
  useEffect(() => {
    if (isAnyRecordingActive && browserCombinedTranscript) {
      const liveMerged = joinWithSingleSpace(
        baseDescriptionRef.current,
        browserCombinedTranscript
      );
      onUpdateDescription(liveMerged);
    }
  }, [isAnyRecordingActive, browserCombinedTranscript, onUpdateDescription]);

  const handleSelectSpeechLanguage = (code: SarvamLanguageCode) => {
    setUiErrorMessage(null);
    clearBrowserError();
    setNeedsExplicitBrowserLangPrompt(false);
    setSpeechLangCode(code);

    const meta = getSpeechLanguageMetadata(code);
    onLanguageChange(meta.coreFormLanguage);

    if (isAnyRecordingActive) {
      stopAudioRecording();
      stopBrowserListening();
    }
  };

  const handleStartPureBrowserFallbackForLanguage = (
    code: SarvamLanguageCode
  ) => {
    const meta = getSpeechLanguageMetadata(code);
    setSpeechLangCode(code);
    onLanguageChange(meta.coreFormLanguage);
    setNeedsExplicitBrowserLangPrompt(false);
    setUiErrorMessage(null);
    clearBrowserError();

    if (!meta.browserLocale || !isBrowserSpeechSupported) {
      setUiErrorMessage(
        'Browser speech recognition is not supported for this language in your browser. Please type your complaint manually.'
      );
      return;
    }

    baseDescriptionRef.current = currentDescription;
    setReviewOpen(false);
    setReviewDraft('');
    setIsEditingReview(false);

    isPureBrowserSessionRef.current = true;
    setActiveEngine('browser');
    startBrowserListening(meta.browserLocale);
  };

  const handleStartRecording = async () => {
    setConfirmedNotice(null);
    setAutoLimitNotice(null);
    setUiErrorMessage(null);
    setFallbackNotice(null);
    setNeedsExplicitBrowserLangPrompt(false);
    clearBrowserError();
    resetBrowserTranscript();

    // Snapshot the current description BEFORE starting this new recording session
    baseDescriptionRef.current = currentDescription;
    setReviewOpen(false);
    setReviewDraft('');
    setIsEditingReview(false);

    // Attempt Primary Engine (MediaRecorder -> Sarvam Saaras v4) first
    if (isRecorderSupported) {
      isPureBrowserSessionRef.current = false;
      setActiveEngine('sarvam');
      const started = await startAudioRecording();
      if (started) {
        // Also start companion Browser Speech Recognition when an explicit browser-supported language is chosen
        // so the citizen sees live interim words AND has a zero-loss instant fallback if Sarvam API fails!
        if (
          isBrowserSpeechSupported &&
          speechLangCode !== 'unknown' &&
          currentLangMeta.browserFallbackSupported &&
          currentLangMeta.browserLocale
        ) {
          startBrowserListening(currentLangMeta.browserLocale);
        }
        return;
      }
    }

    // Fallback to pure Browser Web Speech API if MediaRecorder is not available
    if (isBrowserSpeechSupported) {
      if (speechLangCode === 'unknown') {
        setNeedsExplicitBrowserLangPrompt(true);
        setActiveEngine('browser');
        return;
      }
      if (
        currentLangMeta.browserFallbackSupported &&
        currentLangMeta.browserLocale
      ) {
        isPureBrowserSessionRef.current = true;
        setActiveEngine('browser');
        startBrowserListening(currentLangMeta.browserLocale);
        return;
      }
    }

    setUiErrorMessage(
      'Speech recognition is not supported in this browser. You can type your complaint manually.'
    );
  };

  const handleStopRecording = () => {
    if (isAudioRecording) {
      stopAudioRecording();
    }
    if (isBrowserListening) {
      stopBrowserListening();
    }
  };

  const handleCancelRecording = () => {
    if (isAudioRecording) {
      cancelAudioRecording();
    }
    if (isBrowserListening) {
      cancelBrowserListening();
    }
    setIsTranscribingSarvam(false);
    setReviewOpen(false);
    setReviewDraft('');
    setIsEditingReview(false);
    // Restore description to what it was before this recording session started
    onUpdateDescription(baseDescriptionRef.current);
  };

  const handleConfirmTranscription = () => {
    const finalMerged = joinWithSingleSpace(
      baseDescriptionRef.current,
      reviewDraft
    );
    onUpdateDescription(finalMerged);
    baseDescriptionRef.current = finalMerged;
    setReviewOpen(false);
    setIsEditingReview(false);
    resetBrowserTranscript();
    setConfirmedNotice(
      `Voice transcription (${
        activeEngine === 'sarvam'
          ? 'Powered by Sarvam AI'
          : 'Browser Speech Recognition'
      }) confirmed and inserted into your complaint description below.`
    );
  };

  const handleEnableEditText = () => {
    setIsEditingReview(true);
    setTimeout(() => {
      if (reviewTextareaRef.current) {
        reviewTextareaRef.current.focus();
        const len = reviewTextareaRef.current.value.length;
        reviewTextareaRef.current.setSelectionRange(len, len);
      }
    }, 30);
  };

  const handleReviewDraftChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const nextDraft = e.target.value;
    setReviewDraft(nextDraft);
    // Keep the main complaint description synchronized with edits in the review box
    const updated = joinWithSingleSpace(baseDescriptionRef.current, nextDraft);
    onUpdateDescription(updated);
  };

  const handleRecordAgain = () => {
    // Revert the unconfirmed segment from this session before starting a fresh recording
    onUpdateDescription(baseDescriptionRef.current);
    setReviewOpen(false);
    setReviewDraft('');
    setIsEditingReview(false);
    resetBrowserTranscript();
    clearBrowserError();
    setUiErrorMessage(null);
    handleStartRecording();
  };

  const combinedError =
    uiErrorMessage ||
    (isPureBrowserSessionRef.current ? browserErrorMessage : null);

  const isAdditionalLanguageSelected = ADDITIONAL_INDIAN_LANGUAGES.some(
    (lang) => lang.code === speechLangCode
  );

  return (
    <div className="rounded-2xl border border-sky-300/85 bg-[#FFFCF7]/95 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Row: Prominent Microphone Button + Label + Engine Indicator + Quick Language Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Prominent Sky-Blue & Deep Navy Microphone Button */}
          <button
            type="button"
            disabled={isTranscribingSarvam}
            onClick={
              isAnyRecordingActive ? handleStopRecording : handleStartRecording
            }
            aria-label={
              isAnyRecordingActive
                ? 'Stop Recording Voice Complaint'
                : 'Speak Your Complaint'
            }
            title={
              isAnyRecordingActive
                ? 'Click to stop recording'
                : `Speak your complaint in ${currentLangMeta.nativeName}`
            }
            style={{
              backgroundColor: isAnyRecordingActive ? '#EA580C' : '#87CEFA',
              borderColor: '#123B78',
              boxShadow: isAnyRecordingActive
                ? '0 0 0 6px rgba(234, 88, 12, 0.22), 0 8px 20px -4px rgba(18, 59, 120, 0.35)'
                : '0 8px 20px -4px rgba(18, 59, 120, 0.22), 0 0 18px 2px rgba(72, 169, 232, 0.35)',
            }}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isAnyRecordingActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-35" />
            )}
            {isTranscribingSarvam ? (
              <Loader2 className="w-6 h-6 text-[#123B78] animate-spin relative z-10" />
            ) : isAnyRecordingActive ? (
              <Square className="w-6 h-6 text-white fill-white relative z-10" />
            ) : (
              <Mic className="w-7 h-7 text-[#123B78] stroke-[2.25] relative z-10" />
            )}
          </button>

          {/* Label, Engine Indicator Badge & Supporting Text */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-[#102A56]">
                Speak Your Complaint
              </span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-sky-100/90 text-[#123B78] border border-sky-300/70">
                {speechLangCode === 'unknown'
                  ? 'Auto-Detect'
                  : speechLangCode}
              </span>

              {/* Engine Indicator Badge */}
              {activeEngine === 'sarvam' ? (
                <span
                  title="Primary Engine: Sarvam AI Saaras v4 Multilingual Speech-to-Text"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#123B78] text-white shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-sky-300" />
                  <span>Powered by Sarvam AI</span>
                </span>
              ) : (
                <span
                  title="Secondary Fallback Engine: Browser Web Speech API"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300"
                >
                  <Cpu className="w-3 h-3 text-amber-700" />
                  <span>Using Browser Speech Recognition</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#63718A] leading-relaxed">
              Describe your problem in English, తెలుగు, हिन्दी, or 20+ Indian
              languages (Saaras v4 + automatic browser fallback).
            </p>
          </div>
        </div>

        {/* Speaking Language Selector Controls */}
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#63718A] mr-1">
              Speaking Language:
            </span>
            <div
              role="group"
              aria-label="Select primary speaking language or automatic detection"
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white border border-sky-200/90"
            >
              {/* Default 3 Quick Languages: English, Telugu, Hindi */}
              {PRIMARY_SPEECH_LANGUAGES.map((opt) => {
                const active = speechLangCode === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleSelectSpeechLanguage(opt.code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#123B78] text-white shadow-xs'
                        : 'text-[#102A56] hover:bg-sky-50'
                    }`}
                  >
                    {opt.nativeName}
                  </button>
                );
              })}

              {/* Auto-Detect Button (Sarvam Saaras v4 language_code="unknown") */}
              <button
                type="button"
                onClick={() =>
                  handleSelectSpeechLanguage(AUTO_DETECT_LANGUAGE_OPTION.code)
                }
                title="Automatically detect spoken Indian language via Sarvam AI Saaras v4"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  speechLangCode === 'unknown'
                    ? 'bg-[#1D4ED8] text-white shadow-xs'
                    : 'text-[#102A56] hover:bg-sky-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Auto-Detect</span>
              </button>
            </div>
          </div>

          {/* Second Language Row: "More Indian Languages" Dropdown + Code-Mix Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="more-indian-languages-select"
                className="text-[11px] font-medium text-[#63718A]"
              >
                More Indian Languages:
              </label>
              <select
                id="more-indian-languages-select"
                value={isAdditionalLanguageSelected ? speechLangCode : ''}
                onChange={(e) => {
                  const val = e.target.value as SarvamLanguageCode;
                  if (val) {
                    handleSelectSpeechLanguage(val);
                  }
                }}
                className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border transition-colors focus:outline-none cursor-pointer ${
                  isAdditionalLanguageSelected
                    ? 'bg-[#123B78] text-white border-[#123B78]'
                    : 'bg-white text-[#102A56] border-sky-200/90 hover:border-sky-400'
                }`}
              >
                <option value="" className="bg-white text-[#102A56]">
                  + 20 Indian Languages (Saaras v4)...
                </option>
                {ADDITIONAL_INDIAN_LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-white text-[#102A56]"
                  >
                    {lang.nativeName} — {lang.displayName} ({lang.code}){' '}
                    {lang.browserFallbackSupported
                      ? '[Sarvam + Browser]'
                      : '[Sarvam AI]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Code-Mixed Speech Mode Toggle (e.g., Hinglish / Tanglish / Telugish) */}
            <label
              title="Enable Sarvam Saaras v4 code-mix mode when mixing English words with Telugu, Hindi, or regional languages"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#102A56] bg-white px-2.5 py-1 rounded-lg border border-sky-200/90 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={speechMode === 'codemix'}
                onChange={(e) =>
                  setSpeechMode(e.target.checked ? 'codemix' : 'transcribe')
                }
                className="rounded border-sky-300 text-[#123B78] focus:ring-[#1D4ED8]"
              />
              <span>Code-Mixed Speech</span>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Transient Audio Processing Notice */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200/75 text-[11px] text-[#63718A]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#123B78] shrink-0" />
          <span>
            <strong className="text-[#102A56]">Citizen Audio Privacy:</strong>{' '}
            Your voice recording is processed transiently by{' '}
            <span className="font-semibold text-[#102A56]">
              Sarvam AI (Saaras v4)
            </span>{' '}
            with automatic{' '}
            <span className="font-semibold text-[#102A56]">
              Browser Speech API
            </span>{' '}
            fallback. Raw audio files are never stored.
          </span>
        </div>
        {sarvamConfiguredOnServer === false && (
          <span className="text-[10px] font-medium text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-200">
            SARVAM_API_KEY not set — Auto-Fallback Active
          </span>
        )}
      </div>

      {/* Browser Support Notice if neither MediaRecorder nor Web Speech API is Available */}
      {!isRecorderSupported && !isBrowserSpeechSupported && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <MicOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">
              Speech recognition is not supported in this browser. You can type
              your complaint manually.
            </div>
            <p className="text-amber-800 mt-0.5">
              For voice input, please use Google Chrome, Microsoft Edge, or
              Safari, or continue typing in the description box below.
            </p>
          </div>
        </div>
      )}

      {/* Auto-Detect Fallback Language Prompt (When 'unknown' was selected and Sarvam fell back to Browser API) */}
      {needsExplicitBrowserLangPrompt && !isAnyRecordingActive && (
        <div className="p-4 rounded-xl bg-amber-50/95 border border-amber-300 space-y-3 text-xs text-amber-950">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-bold text-amber-950 block">
                Select Your Speaking Language for Browser Speech Recognition
              </span>
              <p className="text-amber-900 mt-0.5">
                Automatic language detection requires Sarvam AI Saaras v4. To
                continue immediately with Browser Speech Recognition, click your
                spoken language below:
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNeedsExplicitBrowserLangPrompt(false)}
              className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SPEECH_LANGUAGE_OPTIONS.filter(
              (l) => l.browserFallbackSupported
            ).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() =>
                  handleStartPureBrowserFallbackForLanguage(lang.code)
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#123B78] text-[#102A56] hover:text-white border border-amber-300 transition-colors cursor-pointer"
              >
                Speak in {lang.nativeName} ({lang.displayName})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Automatic Fallback Informative Notice */}
      {fallbackNotice && !needsExplicitBrowserLangPrompt && (
        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start justify-between gap-2.5 text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <Cpu className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-950">
                Using Browser Speech Recognition (Automatic Fallback):{' '}
              </span>
              <span>{fallbackNotice}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFallbackNotice(null)}
            aria-label="Dismiss fallback notice"
            className="text-amber-700 hover:text-amber-950 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 28s Single-Segment Auto-Stop Notice */}
      {autoLimitNotice && (
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-2 text-xs text-[#102A56]">
          <span>{autoLimitNotice}</span>
          <button
            type="button"
            onClick={() => setAutoLimitNotice(null)}
            className="text-[#63718A] hover:text-[#102A56] p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Message Alert */}
      {combinedError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-xs text-red-800"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-red-900">
                Voice Recognition Notice
              </span>
              <span className="mt-0.5 block">{combinedError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setUiErrorMessage(null);
              clearBrowserError();
            }}
            aria-label="Dismiss error"
            className="text-red-500 hover:text-red-800 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmed Toast Notice */}
      {confirmedNotice &&
        !isAnyRecordingActive &&
        !isTranscribingSarvam &&
        !reviewOpen && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs text-emerald-800 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{confirmedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setConfirmedNotice(null)}
              aria-label="Dismiss confirmation"
              className="text-emerald-700 hover:text-emerald-950 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      {/* TRANSCRIBING WITH SARVAM AI LOADING STATE */}
      {isTranscribingSarvam && (
        <div className="p-4 rounded-xl bg-sky-50/90 border border-sky-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#123B78] animate-spin shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#102A56]">
                Transcribing speech with Sarvam AI (Saaras v4)...
              </div>
              <div className="text-[11px] text-[#63718A]">
                Preserving original spoken language (
                {currentLangMeta.nativeName}) with automatic browser fallback.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelRecording}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#63718A] hover:text-[#102A56] bg-white border border-sky-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ACTIVE RECORDING PANEL (Shown while Citizen is Speaking) */}
      {isAnyRecordingActive && (
        <div className="p-4 rounded-xl bg-sky-50/90 border border-sky-300 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <span className="text-xs font-bold text-[#102A56] flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#1D4ED8] animate-pulse" />
                <span>
                  Listening in {currentLangMeta.nativeName} (
                  {speechLangCode === 'unknown'
                    ? 'Auto-Detect'
                    : speechLangCode}
                  )...
                </span>
              </span>
              {isAudioRecording && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-[#123B78] border border-sky-200">
                  {recordingSeconds}s / {maxDurationSeconds}s
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop Recording</span>
              </button>

              <button
                type="button"
                onClick={handleCancelRecording}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#63718A] hover:text-[#102A56] bg-white border border-sky-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel Recording
              </button>
            </div>
          </div>

          {/* Live / Interim Transcript Preview Box */}
          <div className="p-3 rounded-lg bg-white border border-sky-200/90 min-h-[60px] text-sm text-[#102A56]">
            {browserCombinedTranscript ? (
              <p className="leading-relaxed">{browserCombinedTranscript}</p>
            ) : (
              <p className="text-xs text-[#63718A] italic">
                {speechLangCode === 'unknown'
                  ? 'Speak clearly in your preferred Indian language... Sarvam AI Saaras v4 will detect your language and transcribe when you click Stop Recording.'
                  : `Speak clearly into your microphone... Your words in ${currentLangMeta.nativeName} will be transcribed when you finish or appear live below.`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TRANSCRIPTION REVIEW AND CONFIRMATION INTERFACE */}
      {reviewOpen && !isAnyRecordingActive && !isTranscribingSarvam && (
        <div className="p-4 sm:p-5 rounded-xl bg-white border-2 border-[#48A9E8] shadow-sm space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-2.5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-[#102A56]">
                  Review Your Voice Transcription
                </h3>
                {activeEngine === 'sarvam' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#123B78] text-white">
                    <Sparkles className="w-2.5 h-2.5 text-sky-300" />
                    <span>Powered by Sarvam AI (Saaras v4)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    <Cpu className="w-2.5 h-2.5 text-amber-700" />
                    <span>Using Browser Speech Recognition</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#63718A] mt-0.5">
                Recognized in{' '}
                {
                  getSpeechLanguageMetadata(
                    detectedLangBadge || speechLangCode
                  ).nativeName
                }{' '}
                ({detectedLangBadge || speechLangCode}). Review or edit your
                text below before confirming.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#1D4ED8] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
              {isEditingReview ? 'Editing Mode' : 'Ready to Confirm'}
            </span>
          </div>

          <div>
            <label htmlFor="voice-review-textarea" className="sr-only">
              Review Your Voice Transcription
            </label>
            <textarea
              id="voice-review-textarea"
              ref={reviewTextareaRef}
              rows={3}
              value={reviewDraft}
              onChange={handleReviewDraftChange}
              className={`w-full px-3.5 py-2.5 text-sm text-[#102A56] rounded-xl border transition-colors focus:outline-none ${
                isEditingReview
                  ? 'bg-white border-[#1D4ED8] ring-2 ring-[#48A9E8]/30'
                  : 'bg-[#FFFCF7] border-sky-300/90 focus:border-[#1D4ED8]'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Confirm Transcription */}
              <button
                type="button"
                onClick={handleConfirmTranscription}
                className="jana-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Transcription</span>
              </button>

              {/* 2. Edit Text */}
              <button
                type="button"
                onClick={handleEnableEditText}
                className="jana-btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Edit Text</span>
              </button>

              {/* 3. Record Again */}
              <button
                type="button"
                onClick={handleRecordAgain}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#EA580C] bg-orange-50 hover:bg-orange-100 border border-orange-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Record Again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
