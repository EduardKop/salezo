"use client";

import Link from "next/link";
import { FileText, Link2, Plus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { PageLoader } from "@/components/ui/page-loader";

const translations = {
  en: {
    title: "All Scripts",
    description:
      "Browse and manage all sales scripts in one place. Add and connect flows are prepared as placeholders.",
    addScript: "Add Script",
    connectScript: "Connect Script",
    placeholder: "Placeholder",
    emptyTitle: "Scripts catalog is ready",
    emptyDescription:
      "This is a dedicated page for all scripts. Business logic for script entities will be connected in the next iteration.",
  },
  ru: {
    title: "Все Скрипты",
    description:
      "Просматривайте и управляйте всеми скриптами продаж в одном месте. Кнопки добавления и подключения уже подготовлены как заглушки.",
    addScript: "Добавить Скрипт",
    connectScript: "Подключить Скрипт",
    placeholder: "Заглушка",
    emptyTitle: "Каталог скриптов готов",
    emptyDescription:
      "Это отдельная страница всех скриптов. Бизнес-логика сущностей скриптов будет подключена на следующем этапе.",
  },
} as const;

export default function AllScriptsPage() {
  const { language, mounted } = useLanguage();
  const t = mounted ? translations[language as keyof typeof translations] : translations.ru;

  if (!mounted) {
    return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full pt-20 relative z-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {t.title}
          </h1>
          <p className="text-neutral-500 max-w-2xl text-sm">{t.description}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/sales-agents/scripts/connect"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 hover:border-black dark:hover:border-neutral-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-neutral-200 dark:border-neutral-800 shadow-sm shrink-0"
          >
            <Link2 className="w-4 h-4" />
            {t.connectScript}
          </Link>
          <Link
            href="/sales-agents/scripts/new"
            className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t.addScript}
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/30 p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          {t.placeholder}
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900">
            <FileText className="h-5 w-5 text-neutral-500 dark:text-neutral-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {t.emptyTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-400">
              {t.emptyDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
