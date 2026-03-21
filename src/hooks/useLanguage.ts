"use client";

import { useContext } from "react";
import { LanguageContext } from "@/providers/language-provider";

export type { Language } from "@/lib/i18n/config";

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
