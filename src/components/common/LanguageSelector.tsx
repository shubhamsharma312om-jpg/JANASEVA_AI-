import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { UILanguageCode } from '../../i18n/translations';

interface LanguageSelectorProps {
  variant?: 'light' | 'dark' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'light',
  className = '',
}) => {
  const { uiLanguage, setUiLanguage, options } = useLanguage();

  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl p-1 border transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-700 text-slate-200'
          : 'bg-[#FFFCF7] border-sky-200/90 text-[#102A56] shadow-2xs'
      } ${className}`}
      role="group"
      aria-label="Select Interface Language"
    >
      <span
        className={`pl-1.5 pr-1 flex items-center gap-1 text-[11px] font-medium ${
          isDark ? 'text-sky-300' : 'text-[#1D4ED8]'
        }`}
        title="Application Interface Language (English / తెలుగు / हिन्दी)"
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
      </span>

      {options.map((opt) => {
        const active = uiLanguage === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setUiLanguage(opt.code as UILanguageCode)}
            aria-pressed={active}
            title={`Switch UI language to ${opt.label} (${opt.nativeLabel})`}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              active
                ? isDark
                  ? 'bg-[#48A9E8] text-[#102A56] shadow-xs'
                  : 'bg-[#102A56] text-white shadow-xs'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-[#63718A] hover:text-[#102A56] hover:bg-sky-50'
            }`}
          >
            {variant === 'compact' ? opt.shortLabel : opt.nativeLabel}
          </button>
        );
      })}
    </div>
  );
};
