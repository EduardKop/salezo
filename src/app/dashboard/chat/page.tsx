"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowSquareOut,
  Brain,
  ChartBar,
  ChatTeardropDots,
  Lightbulb,
  PaperPlaneRight,
  Plus,
  Sparkle,
  Target,
  Handshake,
  X,
} from "@phosphor-icons/react";
import { hasOpenRouterKeyAction } from "@/app/actions/openrouter";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const CHAT_HISTORY_STORAGE_KEY = "salezo:ai-chat-history:v1";

type HistoryItem = {
  id: string;
  title: string;
  prompt: string;
  updatedAt: number;
};

const translations = {
  en: {
    heading: "AI Sales Assistant",
    subheading: "Ask anything about your sales, scripts, objections, or strategy.",
    placeholder: "Ask about objections, scripts, pricing strategy...",
    send: "Send",
    newChat: "New Chat",
    comingSoon: "Coming Soon",
    comingSoonDesc: "The AI chat is currently being set up. The interface is ready — we're connecting the intelligence.",
    history: "Chat History",
    historyEmpty: "No chats yet",
    historyHint: "Start a new draft or tap a suggestion to save a conversation thread here.",
    noKeyTitle: "Connect OpenRouter to start",
    noKeyDesc: "To use AI chat, you need to connect an OpenRouter API key. It only takes 30 seconds.",
    noKeyStep1: "Click your profile avatar",
    noKeyStep1sub: "top-right corner of the screen",
    noKeyStep2: "Select OpenRouter → Connect",
    noKeyStep2sub: "paste your sk-or- key",
    noKeyGetKey: "Get a free key at openrouter.ai",
    noKeyClose: "Close",
    draftLabel: "Current draft",
    suggestions: [
      { icon: "lightbulb", label: "How to handle price objection?", prompt: "How do I handle a client who says your price is too high?" },
      { icon: "chart", label: "Analyze my sales funnel", prompt: "Help me analyze and improve my sales funnel step by step." },
      { icon: "target", label: "Write a cold outreach message", prompt: "Write a cold outreach message for my product." },
      { icon: "handshake", label: "How to close a hesitant client?", prompt: "What are the best techniques to close a client who keeps hesitating?" },
    ],
  },
  ru: {
    heading: "AI Ассистент продаж",
    subheading: "Спросите о скриптах, возражениях, стратегиях продаж или анализе воронки.",
    placeholder: "Спросите о возражениях, скриптах, ценообразовании...",
    send: "Отправить",
    newChat: "Новый чат",
    comingSoon: "Скоро",
    comingSoonDesc: "AI чат сейчас подключается. Интерфейс готов — мы настраиваем интеллект.",
    history: "История чатов",
    historyEmpty: "Пока пусто",
    historyHint: "Создайте новый draft или нажмите на подсказку — чат сразу сохранится в истории слева.",
    noKeyTitle: "Подключите OpenRouter для начала",
    noKeyDesc: "Чтобы использовать AI чат, нужно подключить ключ OpenRouter. Это займёт 30 секунд.",
    noKeyStep1: "Нажмите на аватар профиля",
    noKeyStep1sub: "правый верхний угол экрана",
    noKeyStep2: "Выберите OpenRouter → Подключить",
    noKeyStep2sub: "вставьте ваш sk-or- ключ",
    noKeyGetKey: "Получить бесплатный ключ на openrouter.ai",
    noKeyClose: "Закрыть",
    draftLabel: "Текущий draft",
    suggestions: [
      { icon: "lightbulb", label: "Как отработать возражение по цене?", prompt: "Как мне ответить клиенту, который говорит что у вас дорого?" },
      { icon: "chart", label: "Анализ моей воронки продаж", prompt: "Помоги мне проанализировать и улучшить воронку продаж шаг за шагом." },
      { icon: "target", label: "Написать холодное сообщение", prompt: "Напиши холодное сообщение для моего продукта." },
      { icon: "handshake", label: "Как закрыть нерешительного клиента?", prompt: "Какие техники помогут закрыть клиента, который постоянно сомневается?" },
    ],
  },
} as const;

function buildTitle(value: string, fallback: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  return normalized.length > 36 ? `${normalized.slice(0, 36)}…` : normalized;
}

function createHistoryId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is HistoryItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as HistoryItem).id === "string" &&
        typeof (item as HistoryItem).title === "string" &&
        typeof (item as HistoryItem).prompt === "string" &&
        typeof (item as HistoryItem).updatedAt === "number"
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function SuggestionIcon({ icon }: { icon: string }) {
  const cls = "h-4 w-4";
  if (icon === "lightbulb") return <Lightbulb className={cls} weight="duotone" />;
  if (icon === "chart") return <ChartBar className={cls} weight="duotone" />;
  if (icon === "target") return <Target className={cls} weight="duotone" />;
  return <Handshake className={cls} weight="duotone" />;
}

export default function ChatPage() {
  const { language, mounted } = useLanguage();
  const t = mounted ? translations[language as keyof typeof translations] : translations.ru;

  const [input, setInput] = React.useState("");
  const [hasKey, setHasKey] = React.useState<boolean | null>(null);
  const [showNoKeyModal, setShowNoKeyModal] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    hasOpenRouterKeyAction().then(setHasKey).catch(() => setHasKey(false));
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const stored = readStoredHistory();
    setHistory(stored);
  }, [mounted]);

  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history, mounted]);

  const resizeTextarea = React.useCallback(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
  }, []);

  React.useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  const upsertHistory = React.useCallback((id: string, prompt: string) => {
    const nextItem: HistoryItem = {
      id,
      title: buildTitle(prompt, t.newChat),
      prompt,
      updatedAt: Date.now(),
    };

    setHistory((previous) => {
      const filtered = previous.filter((item) => item.id !== id);
      return [nextItem, ...filtered];
    });
  }, [t.newChat]);

  const ensureDraft = React.useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return activeChatId;

    const id = activeChatId ?? createHistoryId();
    if (!activeChatId) {
      setActiveChatId(id);
    }
    upsertHistory(id, value);
    return id;
  }, [activeChatId, upsertHistory]);

  const handleSuggestion = (prompt: string) => {
    if (hasKey === false) {
      setShowNoKeyModal(true);
      return;
    }
    setInput(prompt);
    ensureDraft(prompt);
    textareaRef.current?.focus();
  };

  const handleNewChat = React.useCallback(() => {
    setActiveChatId(null);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    textareaRef.current?.focus();
  }, []);

  const handleSelectHistory = React.useCallback((item: HistoryItem) => {
    setActiveChatId(item.id);
    setInput(item.prompt);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const autoResize = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (hasKey === false) {
      setShowNoKeyModal(true);
      event.target.value = "";
      return;
    }
    const nextValue = event.target.value;
    setInput(nextValue);
    if (nextValue.trim()) {
      ensureDraft(nextValue);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (hasKey === false) {
      setShowNoKeyModal(true);
      return;
    }
    ensureDraft(input);
  };

  if (!mounted) return null;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden">
      <AnimatePresence>
        {showNoKeyModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNoKeyModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#111]"
            >
              <div className="flex items-center justify-between px-6 pb-4 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
                    <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" weight="duotone" />
                  </div>
                  <h3 className="text-[15px] font-bold text-neutral-900 dark:text-white">
                    {t.noKeyTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setShowNoKeyModal(false)}
                  className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 px-6 pb-6">
                <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {t.noKeyDesc}
                </p>

                <div className="space-y-3">
                  {[
                    { num: "1", label: t.noKeyStep1, sub: t.noKeyStep1sub },
                    { num: "2", label: t.noKeyStep2, sub: t.noKeyStep2sub },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
                        {step.num}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{step.label}</p>
                        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-500">{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-violet-600 hover:underline dark:text-violet-400"
                >
                  {t.noKeyGetKey}
                  <ArrowSquareOut className="h-3.5 w-3.5" />
                </a>

                <button
                  onClick={() => setShowNoKeyModal(false)}
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {t.noKeyClose}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[12%] h-[34rem] w-[34rem] rounded-full bg-violet-500/[0.05] blur-[120px] dark:bg-violet-500/[0.08]" />
        <div className="absolute bottom-[-16%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-indigo-500/[0.05] blur-[120px] dark:bg-indigo-500/[0.08]" />
      </div>

      <div className="relative z-10 flex h-full min-w-0">
        <aside className="hidden w-[280px] shrink-0 border-r border-black/8 bg-white/55 backdrop-blur-xl dark:border-white/8 dark:bg-white/[0.02] lg:flex">
          <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
            <button
              type="button"
              onClick={handleNewChat}
              className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.05]"
            >
              <Plus className="h-4 w-4 text-violet-500" />
              {t.newChat}
            </button>

            <div className="mb-3 px-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                {t.history}
              </p>
            </div>

            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{t.historyEmpty}</p>
                <p className="mt-2 text-[13px] leading-relaxed">{t.historyHint}</p>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  {history.map((item) => {
                    const active = item.id === activeChatId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectHistory(item)}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                          active
                            ? "border-violet-400/35 bg-violet-500/[0.08] dark:border-violet-400/30 dark:bg-violet-500/[0.10]"
                            : "border-black/6 bg-white/40 hover:bg-black/[0.03] dark:border-white/8 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                        )}
                      >
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-neutral-500 dark:text-neutral-400">
                          {item.prompt || t.newChat}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 px-4 pb-16 pt-8 lg:px-10 lg:pb-20">
            <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center text-center">
              <div className="mb-4 flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300">
                <Sparkle className="h-3.5 w-3.5" weight="fill" />
                {t.comingSoon}
              </div>

              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 shadow-2xl shadow-violet-500/10">
                <ChatTeardropDots className="h-10 w-10 text-violet-600 dark:text-violet-400" weight="duotone" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-4xl">
                {t.heading}
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {t.subheading}
              </p>

              <div className="mt-6 flex w-full items-center justify-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-black transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.05]"
                >
                  <Plus className="h-4 w-4 text-violet-500" />
                  {t.newChat}
                </button>
              </div>

              {activeChatId ? (
                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/65 px-4 py-2 text-[12px] text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300">
                  <span className="font-mono uppercase tracking-[0.18em]">{t.draftLabel}</span>
                  <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                  <span className="truncate">{history.find((item) => item.id === activeChatId)?.title ?? t.newChat}</span>
                </div>
              ) : null}

              <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {t.suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index, duration: 0.3, ease: "easeOut" }}
                    onClick={() => handleSuggestion(suggestion.prompt)}
                    className="group flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/70 p-4 text-left transition-all duration-200 hover:border-violet-200 hover:bg-white hover:shadow-md hover:shadow-violet-500/5 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-violet-500/30 dark:hover:bg-white/[0.06]"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:group-hover:bg-violet-500/25">
                      <SuggestionIcon icon={suggestion.icon} />
                    </span>
                    <span className="text-[13px] font-medium leading-snug text-neutral-700 transition-colors group-hover:text-neutral-950 dark:text-neutral-300 dark:group-hover:text-white">
                      {suggestion.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-10 w-full max-w-2xl">
              <div
                className={cn(
                  "relative flex items-end gap-2 rounded-[20px] border bg-white shadow-lg shadow-black/[0.06] transition-all duration-200 dark:bg-[#111] dark:shadow-black/[0.4]",
                  "border-black/[0.08] dark:border-white/[0.1]",
                  input && "border-violet-300 shadow-violet-500/10 dark:border-violet-500/40",
                  "focus-within:border-violet-300 focus-within:shadow-violet-500/10 dark:focus-within:border-violet-500/40"
                )}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={autoResize}
                  placeholder={t.placeholder}
                  rows={1}
                  onFocus={() => {
                    if (hasKey === false) {
                      setShowNoKeyModal(true);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  className={cn(
                    "min-h-[54px] max-h-[200px] flex-1 resize-none overflow-hidden bg-transparent px-5 py-4 text-[14px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
                  )}
                />
                <div className="flex shrink-0 items-center gap-1.5 pb-3 pr-3">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                      input.trim()
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/30 hover:bg-violet-700"
                        : "cursor-not-allowed bg-black/[0.05] text-neutral-400 dark:bg-white/[0.05]"
                    )}
                  >
                    <PaperPlaneRight className="h-4 w-4" weight="fill" />
                  </motion.button>
                </div>
              </div>
                <p className="mt-2 text-center text-[11px] text-neutral-400 dark:text-neutral-600">
                {t.comingSoonDesc}
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
