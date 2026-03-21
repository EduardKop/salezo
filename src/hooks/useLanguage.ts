"use client";

import { useSyncExternalStore } from "react";

export type Language = "en" | "ru";

const STORAGE_KEY = "salezo_language";

function readLanguage(): Language {
  if (typeof window === "undefined") {
    return "ru";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "ru" ? stored : "ru";
}

function subscribeToLanguage(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => callback();
  window.addEventListener("languageChange", handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener("languageChange", handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function subscribeToHydration() {
  return () => {};
}

export function useLanguage() {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    readLanguage,
    () => "ru"
  );
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  const changeLanguage = (lang: Language) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new Event("languageChange"));
  };

  return { language, changeLanguage, mounted };
}
