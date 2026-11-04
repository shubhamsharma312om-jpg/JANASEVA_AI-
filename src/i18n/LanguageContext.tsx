import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  TRANSLATIONS,
  UILanguageCode,
  UI_LANGUAGE_OPTIONS,
} from './translations';

const STORAGE_KEY_UI_LANGUAGE = 'janaseva_ui_language';

interface LanguageContextValue {
  uiLanguage: UILanguageCode;
  setUiLanguage: (lang: UILanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  translateCategory: (category: string) => string;
  translateDepartment: (dept: string) => string;
  translateStatus: (status: string) => string;
  translatePriority: (priority: string) => string;
  options: typeof UI_LANGUAGE_OPTIONS;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

function getInitialUiLanguage(): UILanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_UI_LANGUAGE);
    if (saved === 'en' || saved === 'te' || saved === 'hi') {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [uiLanguage, setUiLanguageState] =
    useState<UILanguageCode>(getInitialUiLanguage);

  const setUiLanguage = useCallback((lang: UILanguageCode) => {
    setUiLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_UI_LANGUAGE, lang);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = uiLanguage;
    } catch {
      // ignore
    }
  }, [uiLanguage]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = TRANSLATIONS[uiLanguage] || TRANSLATIONS.en;
      if (dict[key]) return dict[key];
      if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
      return fallback ?? key;
    },
    [uiLanguage]
  );

  const translateCategory = useCallback(
    (category: string): string => {
      if (!category) return '';
      return t(`category.${category}`, category);
    },
    [t]
  );

  const translateDepartment = useCallback(
    (dept: string): string => {
      if (!dept) return '';
      return t(`dept.${dept}`, dept);
    },
    [t]
  );

  const translateStatus = useCallback(
    (status: string): string => {
      if (!status) return '';
      const clean = status.toUpperCase().replace(/\s+/g, '_');
      return t(`status.${clean}`, status);
    },
    [t]
  );

  const translatePriority = useCallback(
    (priority: string): string => {
      if (!priority) return '';
      const clean = priority.toUpperCase().trim();
      return t(`priority.${clean}`, priority);
    },
    [t]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      uiLanguage,
      setUiLanguage,
      t,
      translateCategory,
      translateDepartment,
      translateStatus,
      translatePriority,
      options: UI_LANGUAGE_OPTIONS,
    }),
    [
      uiLanguage,
      setUiLanguage,
      t,
      translateCategory,
      translateDepartment,
      translateStatus,
      translatePriority,
    ]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
