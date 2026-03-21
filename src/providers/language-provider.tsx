"use client";

import * as React from "react";
import {
  isLanguage,
  LANGUAGE_COOKIE,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from "@/lib/i18n/config";

type LanguageContextValue = {
  language: Language;
  changeLanguage: (lang: Language) => void;
  mounted: true;
};

export const LanguageContext = React.createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  initialLanguage: Language;
  children: React.ReactNode;
};

function readCookieLanguage(): Language | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${LANGUAGE_COOKIE}=`))
    ?.split("=")[1];

  return isLanguage(cookieValue) ? cookieValue : null;
}

function persistLanguage(language: Language) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; samesite=lax${secure}`;
  document.documentElement.lang = language;
}

export function LanguageProvider({
  initialLanguage,
  children,
}: LanguageProviderProps) {
  const [language, setLanguage] = React.useState<Language>(initialLanguage);

  React.useEffect(() => {
    const cookieLanguage = readCookieLanguage();
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const nextLanguage =
      cookieLanguage ?? (isLanguage(storedLanguage) ? storedLanguage : initialLanguage);

    if (nextLanguage !== language) {
      setLanguage(nextLanguage);
    }

    persistLanguage(nextLanguage);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY || !isLanguage(event.newValue)) {
        return;
      }

      setLanguage(event.newValue);
      persistLanguage(event.newValue);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialLanguage, language]);

  const changeLanguage = React.useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage);
    persistLanguage(nextLanguage);
  }, []);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      language,
      changeLanguage,
      mounted: true,
    }),
    [changeLanguage, language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
