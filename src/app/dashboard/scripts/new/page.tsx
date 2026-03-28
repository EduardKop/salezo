"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { PageLoader } from "@/components/ui/page-loader";
import { createScriptAction, type SalesType } from "@/app/actions/scripts";
import { cn } from "@/lib/utils";

const translations = {
  en: {
    back: "All Scripts",
    pageTitle: "New Sales Script",
    pageDesc: "Choose how your team sells, then record a dialog.",
    selectType: "Select Sales Channel",
    phone: "Phone Call",
    phoneDesc: "Cold/warm calls, consultations, follow-ups",
    chat: "Chat / Messenger",
    chatDesc: "WhatsApp, Telegram, email, CRM chat",
    inPerson: "In-Person",
    inPersonDesc: "Walk-ins, showroom, field sales, meetings",
    creating: "Creating script...",
    continue: "Create Script",
    errorCreating: "Failed to create script. Please try again.",
    scriptTitle: "Script Name",
    scriptTitlePlaceholderPhone: "E.g. Cold calling B2B leads",
    scriptTitlePlaceholderChat: "E.g. First sale - guiding client to register on the website",
    scriptTitlePlaceholderInPerson: "E.g. Showroom consultation",
    scriptNotes: "Context for AI",
    scriptNotesDesc: "Explain what this dialog provides to the AI. Is it a first sale or a repeat purchase? A successful case or objection handling? This context is crucial for AI learning.",
    scriptNotesPlaceholder: "Client was interested in...",
  },
  ru: {
    back: "Все Скрипты",
    pageTitle: "Новый скрипт продаж",
    pageDesc: "Выберите канал продаж, затем запишите диалог.",
    selectType: "Выберите канал продаж",
    phone: "Телефонный звонок",
    phoneDesc: "Холодные/тёплые звонки, консультации, фоллоу-апы",
    chat: "Чат / Мессенджер",
    chatDesc: "WhatsApp, Telegram, Email, чат в CRM",
    inPerson: "Живые продажи",
    inPersonDesc: "Шоу-рум, выезд, встречи, офлайн",
    creating: "Создание скрипта...",
    continue: "Создать скрипт",
    errorCreating: "Не удалось создать скрипт. Попробуйте ещё раз.",
    scriptTitle: "Название скрипта",
    scriptTitlePlaceholderPhone: "Например: Холодный звонок B2B",
    scriptTitlePlaceholderChat: "Например: Первая продажа - доведение клиента до регистрации на сайте",
    scriptTitlePlaceholderInPerson: "Например: Консультация в шоуруме",
    scriptNotes: "Заметки для ИИ",
    scriptNotesDesc: "Уточните для ИИ: это первая продажа или повторная? Успешный кейс или диалог с возражениями? Опишите, какую конкретную ситуацию объясняет этот скрипт.",
    scriptNotesPlaceholder: "Клиент сомневался в цене, но после отработки закрыли сделку...",
  },
} as const;

const SALES_TYPES: {
  type: SalesType;
  icon: React.ReactNode;
  key: "phone" | "chat" | "inPerson";
}[] = [
  {
    type: "phone",
    key: "phone",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
        />
      </svg>
    ),
  },
  {
    type: "chat",
    key: "chat",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
  {
    type: "in_person",
    key: "inPerson",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
];

export default function NewScriptPage() {
  const router = useRouter();
  const { language, mounted } = useLanguage();
  const t = mounted
    ? translations[language as keyof typeof translations]
    : translations.ru;

  const [selected, setSelected] = React.useState<SalesType | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  if (!mounted) return <PageLoader className="min-h-[calc(100vh-5rem)]" />;

  const handleContinue = async () => {
    if (!selected || isCreating) return;
    if (!title.trim() || !description.trim()) {
      toast.error(language === "ru" ? "Заполните все поля" : "Please fill in all fields");
      return;
    }
    
    setIsCreating(true);
    try {
      const scriptId = await createScriptAction(
        selected,
        title.trim(),
        description.trim()
      );
      router.push(`/sales-agents/scripts/${scriptId}/chat`);
    } catch {
      toast.error(t.errorCreating);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col p-6 md:p-8 lg:p-12">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/sales-agents/scripts/all"
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t.back}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t.pageTitle}
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">{t.pageDesc}</p>
      </div>

      {/* Sales Type Selection */}
      <div className="max-w-2xl w-full">
        <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-4">
          {t.selectType}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {SALES_TYPES.map(({ type, key, icon }) => {
            const isActive = selected === type;
            return (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={cn(
                  "group flex flex-col items-start gap-3 p-5 rounded-xl border text-left transition-all",
                  isActive
                    ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800/30"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#111]"
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-lg border transition-colors",
                    isActive
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                      : "bg-neutral-100 dark:bg-[#1a1a1a] border-transparent dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                  )}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {t[key]}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    {t[`${key}Desc` as keyof typeof t]}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="check"
                    className="ml-auto self-start mt-0.5 w-4 h-4 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center"
                  >
                    <svg className="w-2.5 h-2.5 text-white dark:text-neutral-900" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 8, height: 0 }}
              className="mt-6 flex flex-col gap-6"
            >
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-1.5">
                    {t.scriptTitle}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      selected === "chat" ? t.scriptTitlePlaceholderChat :
                      selected === "in_person" ? t.scriptTitlePlaceholderInPerson :
                      t.scriptTitlePlaceholderPhone
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-lg text-[13px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Description (Notes) */}
                <div>
                  <label className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    {t.scriptNotes}
                  </label>
                  <p className="text-[11px] text-neutral-500 mb-2 leading-relaxed">
                    {t.scriptNotesDesc}
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.scriptNotesPlaceholder}
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-lg text-[13px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={isCreating}
                className="self-start flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-sm disabled:opacity-60"
              >
                {isCreating ? (
                  <>
                    <CircleNotch className="w-4 h-4 animate-spin" />
                    {t.creating}
                  </>
                ) : (
                  t.continue
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
