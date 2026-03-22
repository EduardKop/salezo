"use client";

import Link from "next/link";
import { ArrowRight, FileText, LayoutList, Link2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { PageLoader } from "@/components/ui/page-loader";

const translations = {
  en: {
    title: "Scripts",
    description:
      "This is the scripts module entry page. Open the full scripts catalog to manage entities.",
    openAllScripts: "Open All Scripts",
    connectScript: "Connect Script",
    moduleTitle: "Scripts module is active",
    moduleDescription:
      "Use this page as a control point for the scripts section and navigate to the dedicated catalog page.",
    catalogTitle: "Dedicated catalog page",
    catalogDescription:
      "All script entities are grouped on a separate route: /sales-agents/scripts/all",
  },
  ru: {
    title: "Скрипты",
    description:
      "Это входная страница модуля скриптов. Полный каталог скриптов открыт на отдельном маршруте.",
    openAllScripts: "Открыть Все Скрипты",
    connectScript: "Подключить Скрипт",
    moduleTitle: "Модуль скриптов активен",
    moduleDescription:
      "Используйте эту страницу как точку входа в раздел скриптов и переходите в отдельный каталог.",
    catalogTitle: "Отдельная страница каталога",
    catalogDescription:
      "Все сущности скриптов собраны на отдельном маршруте: /sales-agents/scripts/all",
  },
} as const;

export default function ScriptsPage() {
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
            href="/sales-agents/scripts/all"
            className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent shadow-sm shrink-0"
          >
            <LayoutList className="w-4 h-4" />
            {t.openAllScripts}
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/30 p-7">
        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900">
            <FileText className="h-5 w-5 text-neutral-500 dark:text-neutral-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {t.moduleTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500 dark:text-neutral-400">
              {t.moduleDescription}
            </p>

            <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{t.catalogTitle}</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.catalogDescription}</p>
              <Link
                href="/sales-agents/scripts/all"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors"
              >
                {t.openAllScripts}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
