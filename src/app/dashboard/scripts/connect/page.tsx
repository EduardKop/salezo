"use client";

import Link from "next/link";
import { ArrowLeft, Link2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { PageLoader } from "@/components/ui/page-loader";

const translations = {
  en: {
    back: "Back to All Scripts",
    status: "Placeholder",
    title: "Connect Script",
    description:
      "The script connection flow is not enabled yet. This page is a safe placeholder route.",
  },
  ru: {
    back: "Назад ко Всем Скриптам",
    status: "Заглушка",
    title: "Подключить Скрипт",
    description:
      "Флоу подключения скриптов пока не включен. Эта страница является безопасным маршрутом-заглушкой.",
  },
} as const;

export default function ConnectScriptPage() {
  const { language, mounted } = useLanguage();
  const t = mounted ? translations[language as keyof typeof translations] : translations.ru;

  if (!mounted) {
    return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  }

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#000000] p-8 shadow-sm">
        <Link
          href="/sales-agents/scripts/all"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900">
            <Link2 className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {t.status}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t.title}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {t.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
