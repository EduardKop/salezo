"use client";

import { BookOpenText, Sparkle as Sparkles } from "@phosphor-icons/react";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { docs as translations, t as getT } from "@/lib/i18n/translations";

export default function DocsPage() {
  const { language, mounted } = useLanguage();
  const activeLanguage = (mounted ? language : "ru") as Language;
  const t = getT(translations, activeLanguage);

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex min-h-[100dvh] max-w-5xl items-center px-4 pb-16 pt-28">
        <div className="w-full rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-[0_32px_120px_-48px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03] md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400">
            <BookOpenText className="h-3.5 w-3.5" />
            <span>{t.eyebrow}</span>
          </div>

          <div className="mt-6 max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-white md:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-400 md:text-lg">
              {t.description}
            </p>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-black/[0.08] bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-black dark:text-white">{t.statusTitle}</p>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                  {t.statusDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
