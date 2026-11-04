import React from 'react';
import { Square, Volume2 } from 'lucide-react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useLanguage } from '../../i18n/LanguageContext';

interface ReadAloudButtonProps {
  text: string;
  language?: string;
  label?: string;
  className?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  text,
  language,
  label,
  className = '',
}) => {
  const { isSpeaking, isSupported, notice, speak, stop } = useTextToSpeech();
  const { t } = useLanguage();

  const disabled = !text || !text.trim();

  const handleToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, language);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`inline-flex flex-col items-end gap-1 ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        title={isSpeaking ? t('tts.stopReading') : label || t('tts.readAloud')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
          isSpeaking
            ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
            : 'bg-[#87CEFA]/35 text-[#102A56] border-[#123B78]/40 hover:bg-[#87CEFA]/60'
        }`}
      >
        {isSpeaking ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current text-red-600 animate-pulse" />
            <span>{t('tts.stopReading')}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-[#123B78]" />
            <span>{label || t('tts.readAloud')}</span>
          </>
        )}
      </button>

      {notice && (
        <span className="text-[10px] text-[#63718A] max-w-xs text-right">
          {notice}
        </span>
      )}
    </div>
  );
};
