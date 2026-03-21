"use client";

import Link from "next/link";
import { ArrowLeft, Code2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";

const translations = {
  en: {
    back: "Back to project",
    title: "Scripts module",
    description:
      "This workspace is reserved for sales scripts and AI playbooks. The module shell is now in place, so links no longer lead to a 404.",
    status: "Coming soon",
  },
  ru: {
    back: "Назад к проекту",
    title: "Модуль скриптов",
    description:
      "Здесь будет рабочее пространство для скриптов продаж и AI-плейбуков. Пока это безопасный stub-маршрут, чтобы переходы больше не вели в 404.",
    status: "Скоро будет",
  },
} as const;

export default function ProjectScriptsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const { language, mounted } = useLanguage();
  const t = mounted ? translations[language as keyof typeof translations] : translations.ru;

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#000000] p-8 shadow-sm">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900">
            <Code2 className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
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
