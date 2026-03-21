export type Language = "en" | "ru";

export const DEFAULT_LANGUAGE: Language = "ru";
export const LANGUAGE_COOKIE = "salezo_language";
export const LANGUAGE_STORAGE_KEY = "salezo_language";

export function isLanguage(value: string | null | undefined): value is Language {
  return value === "en" || value === "ru";
}

export function resolveLanguage(value: string | null | undefined): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export function detectLanguageFromHeader(
  acceptLanguage: string | null | undefined
): Language {
  if (!acceptLanguage) {
    return DEFAULT_LANGUAGE;
  }

  const parts = acceptLanguage
    .toLowerCase()
    .split(",")
    .map((part) => part.trim().split(";")[0]);

  for (const part of parts) {
    if (part.startsWith("en")) {
      return "en";
    }

    if (part.startsWith("ru")) {
      return "ru";
    }
  }

  return DEFAULT_LANGUAGE;
}
