"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  CircleNotch,
  ArrowRight,
  Scroll,
} from "@phosphor-icons/react";
import { useLanguage } from "@/hooks/useLanguage";
import { PageLoader } from "@/components/ui/page-loader";
import { acceptScriptShareAction } from "@/app/actions/scripts";

const translations = {
  en: {
    back: "Back to Scripts",
    accepting: "Accepting invite...",
    acceptingDesc: "We're granting you access to this script. Just a moment.",
    successTitle: "Access granted!",
    successDesc: "You now have access to this script. You can view and add dialogs.",
    openScript: "Open Script",
    errorTitle: "Invalid invite link",
    errorInvalidKey: "This invite link is invalid or has been revoked.",
    errorOwnScript: "You can't accept an invite to your own script.",
    errorAlreadyAccepted: "You already have access to this script.",
    errorGeneric: "Something went wrong. Please try again.",
    goToScripts: "Go to My Scripts",
    noKey: "No invite key found in the link.",
    notLoggedIn: "You need to be logged in to accept an invite.",
  },
  ru: {
    back: "Назад к скриптам",
    accepting: "Принимаем приглашение...",
    acceptingDesc: "Предоставляем вам доступ к скрипту. Подождите секунду.",
    successTitle: "Доступ получен!",
    successDesc: "Теперь у вас есть доступ к этому скрипту. Вы можете просматривать и добавлять диалоги.",
    openScript: "Открыть скрипт",
    errorTitle: "Неверная ссылка",
    errorInvalidKey: "Эта ссылка-приглашение недействительна или была отозвана.",
    errorOwnScript: "Нельзя принять приглашение к своему собственному скрипту.",
    errorAlreadyAccepted: "У вас уже есть доступ к этому скрипту.",
    errorGeneric: "Что-то пошло не так. Попробуйте ещё раз.",
    goToScripts: "К моим скриптам",
    noKey: "В ссылке не найден ключ приглашения.",
    notLoggedIn: "Войдите в аккаунт, чтобы принять приглашение.",
  },
} as const;

type Status = "loading" | "success" | "error";

export default function ConnectScriptPage() {
  const { language, mounted } = useLanguage();
  const t = mounted ? translations[language as keyof typeof translations] : translations.ru;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = React.useState<Status>("loading");
  const [scriptId, setScriptId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  React.useEffect(() => {
    if (!mounted) return;

    const key = searchParams.get("key");
    if (!key) {
      setErrorMsg(t.noKey);
      setStatus("error");
      return;
    }

    acceptScriptShareAction(key)
      .then((id) => {
        setScriptId(id);
        setStatus("success");
      })
      .catch((err: Error) => {
        const msg = err.message;
        if (msg.includes("invalid_key")) setErrorMsg(t.errorInvalidKey);
        else if (msg.includes("own_script")) setErrorMsg(t.errorOwnScript);
        else if (msg.includes("not_authenticated")) setErrorMsg(t.notLoggedIn);
        else setErrorMsg(t.errorGeneric);
        setStatus("error");
      });
  }, [mounted]);

  if (!mounted) return <PageLoader className="min-h-[calc(100vh-5rem)]" />;

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link
          href="/sales-agents/scripts/all"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] shadow-xl overflow-hidden"
        >
          {/* Loading */}
          {status === "loading" && (
            <div className="p-10 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <CircleNotch className="w-8 h-8 text-neutral-500 animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {t.accepting}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                  {t.acceptingDesc}
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="p-10 flex flex-col items-center text-center gap-6">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-9 h-9 text-emerald-600 dark:text-emerald-400" weight="fill" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {t.successTitle}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                  {t.successDesc}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {scriptId && (
                  <Link
                    href={`/sales-agents/scripts/${scriptId}/chat`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                  >
                    <Scroll className="w-4 h-4" weight="duotone" />
                    {t.openScript}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href="/sales-agents/scripts/all"
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {t.goToScripts}
                </Link>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="p-10 flex flex-col items-center text-center gap-6">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center"
              >
                <XCircle className="w-9 h-9 text-rose-600 dark:text-rose-400" weight="fill" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {t.errorTitle}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                  {errorMsg}
                </p>
              </div>
              <Link
                href="/sales-agents/scripts/all"
                className="inline-flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {t.goToScripts}
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
