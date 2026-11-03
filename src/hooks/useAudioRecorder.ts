import { useCallback, useEffect, useRef, useState } from 'react';

export interface RecordedAudioPayload {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  autoStoppedAtLimit: boolean;
}

export interface UseAudioRecorderOptions {
  /** Sarvam Saaras v4 synchronous REST endpoint supports up to 30 seconds per request */
  maxDurationSeconds?: number;
  onRecordingComplete?: (payload: RecordedAudioPayload) => void;
  onRecorderError?: (citizenMessage: string) => void;
}

export interface UseAudioRecorderReturn {
  isRecorderSupported: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  maxDurationSeconds: number;
  supportedMimeType: string;
  startAudioRecording: () => Promise<boolean>;
  stopAudioRecording: () => void;
  cancelAudioRecording: () => void;
}

const CANDIDATE_AUDIO_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
];

export function detectSupportedAudioMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }
  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    return 'audio/webm';
  }
  for (const candidate of CANDIDATE_AUDIO_MIME_TYPES) {
    try {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    } catch {
      // Ignore check error
    }
  }
  return 'audio/webm';
}

export function useAudioRecorder({
  maxDurationSeconds = 28,
  onRecordingComplete,
  onRecorderError,
}: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const [isRecorderSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      typeof navigator?.mediaDevices?.getUserMedia === 'function' &&
      typeof window.MediaRecorder !== 'undefined'
    );
  });

  const [supportedMimeType] = useState<string>(() =>
    detectSupportedAudioMimeType()
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const isCancelledRef = useRef<boolean>(false);
  const autoStoppedRef = useRef<boolean>(false);
  const startedAtRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const maxDurationTimeoutRef = useRef<number | null>(null);

  const onCompleteRef = useRef(onRecordingComplete);
  const onErrorRef = useRef(onRecorderError);

  useEffect(() => {
    onCompleteRef.current = onRecordingComplete;
    onErrorRef.current = onRecorderError;
  }, [onRecordingComplete, onRecorderError]);

  const releaseMediaResources = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (maxDurationTimeoutRef.current !== null) {
      window.clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      }
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  // Always release microphone hardware when component unmounts
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      releaseMediaResources();
    };
  }, [releaseMediaResources]);

  const stopAudioRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        releaseMediaResources();
        setIsRecording(false);
      }
    } else {
      releaseMediaResources();
      setIsRecording(false);
    }
  }, [releaseMediaResources]);

  const cancelAudioRecording = useCallback(() => {
    isCancelledRef.current = true;
    chunksRef.current = [];
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // Ignore stop errors on cancel
      }
    }
    releaseMediaResources();
    setIsRecording(false);
    setRecordingSeconds(0);
  }, [releaseMediaResources]);

  const startAudioRecording = useCallback(async (): Promise<boolean> => {
    if (!isRecorderSupported) {
      onErrorRef.current?.(
        'Audio recording is not supported in this browser. Switching to fallback or manual input.'
      );
      return false;
    }

    releaseMediaResources();
    chunksRef.current = [];
    isCancelledRef.current = false;
    autoStoppedRef.current = false;
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const mimeToUse = detectSupportedAudioMimeType();
      const recorder = mimeToUse
        ? new MediaRecorder(stream, { mimeType: mimeToUse })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        releaseMediaResources();
        setIsRecording(false);
        onErrorRef.current?.(
          'An error occurred while recording audio from your microphone.'
        );
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeToUse || 'audio/webm';
        const elapsedSec = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000)
        );
        const wasCancelled = isCancelledRef.current;
        const wasAutoStopped = autoStoppedRef.current;
        const recordedChunks = [...chunksRef.current];

        chunksRef.current = [];
        releaseMediaResources();
        setIsRecording(false);

        if (wasCancelled) {
          return;
        }

        const audioBlob = new Blob(recordedChunks, { type: finalMime });
        if (audioBlob.size === 0) {
          onErrorRef.current?.(
            "Sorry, we couldn't capture any audio from your microphone. Please try again."
          );
          return;
        }

        onCompleteRef.current?.({
          blob: audioBlob,
          mimeType: finalMime,
          durationSeconds: elapsedSec,
          autoStoppedAtLimit: wasAutoStopped,
        });
      };

      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start(250);
      setIsRecording(true);

      timerIntervalRef.current = window.setInterval(() => {
        const sec = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setRecordingSeconds(sec);
      }, 250);

      // Respect Sarvam REST API's 30-second single-request cap by stopping cleanly at maxDurationSeconds (28s)
      maxDurationTimeoutRef.current = window.setTimeout(() => {
        autoStoppedRef.current = true;
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== 'inactive'
        ) {
          try {
            mediaRecorderRef.current.stop();
          } catch {
            // Ignore stop error
          }
        }
      }, maxDurationSeconds * 1000);

      return true;
    } catch (err: any) {
      releaseMediaResources();
      setIsRecording(false);
      const errName = err?.name || '';
      if (
        errName === 'NotAllowedError' ||
        errName === 'PermissionDeniedError' ||
        errName === 'SecurityError'
      ) {
        onErrorRef.current?.(
          'Microphone permission is required. Please allow microphone access in your browser settings.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        onErrorRef.current?.(
          'No microphone device was detected. Please connect a microphone or type your complaint manually.'
        );
      } else {
        onErrorRef.current?.(
          'Unable to access your microphone. Please check your device settings or type your complaint manually.'
        );
      }
      return false;
    }
  }, [isRecorderSupported, maxDurationSeconds, releaseMediaResources]);

  return {
    isRecorderSupported,
    isRecording,
    recordingSeconds,
    maxDurationSeconds,
    supportedMimeType,
    startAudioRecording,
    stopAudioRecording,
    cancelAudioRecording,
  };
}
