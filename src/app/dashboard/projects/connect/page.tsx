"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Link2, ArrowRight, CheckCircle2, AlertCircle, Loader2, Workflow } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { joinProjectAction } from "@/app/actions/projects";
import { PageLoader } from "@/components/ui/page-loader";
import { connect as translations, common, t as getT, type Language } from "@/lib/i18n/translations";

export default function ConnectProjectPage() {
  const router = useRouter();
  const { language, mounted } = useLanguage();
  const t = mounted ? getT(translations, language as Language) : translations.ru;
  const c = mounted ? getT(common, language as Language) : common.ru;

  const [key, setKey] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || status === "loading" || status === "success") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      await joinProjectAction(key.trim());
      setStatus("success");
      setTimeout(() => router.push("/sales-agents/projects"), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      console.error("Connect error:", message);
      setStatus("error");
      if (message === "already_owner") {
        setErrorMessage(language === 'ru' ? "Вы уже являетесь владельцем этого проекта" : "You are already the owner of this project");
      } else if (message === "already_member") {
        setErrorMessage(language === 'ru' ? "У вас уже есть доступ к этому проекту" : "You already have access to this project");
      } else if (message === "already_requested") {
        setErrorMessage(language === 'ru' ? "Заявка уже отправлена и ожидает одобрения" : "Your request is already pending approval");
      } else if (message === "connect_unavailable") {
        setErrorMessage(t.connectUnavailable);
      } else {
        setErrorMessage(t.invalidKey);
      }
    }
  };

  if (!mounted) {
    return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full p-4 relative">

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="w-full max-w-md bg-white dark:bg-[#000000] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)] overflow-hidden"
      >
        <div className="p-8">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-center mb-6">
            <Workflow className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-2">
            {t.joinTitle}
          </h2>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
            {t.joinDesc}
          </p>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label htmlFor="key" className="block text-[12px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                {t.connectionKey}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link2 className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="text"
                  id="key"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  className="block w-full pl-9 pr-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition-all font-mono"
                  placeholder={t.keyPlaceholder}
                  autoComplete="off"
                  disabled={status === "loading" || status === "success"}
                />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex items-start gap-2 text-[13px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-lg border border-rose-200 dark:border-rose-500/20"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/sales-agents/projects")}
                className="px-4 py-2 bg-transparent text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-sm font-medium transition-colors focus:outline-none"
                disabled={status === "loading" || status === "success"}
              >
                {c.cancel}
              </button>
              <button
                type="submit"
                disabled={!key.trim() || status === "loading" || status === "success"}
                className="relative flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none active:scale-[0.98] min-w-[120px] overflow-hidden"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {status === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2 absolute"
                    >
                      {t.connect} <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                  {status === "error" && (
                    <motion.div
                      key="error"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2 absolute"
                    >
                      {t.tryAgain}
                    </motion.div>
                  )}
                  {status === "loading" && (
                    <motion.div
                      key="loading"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2 absolute"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" /> {t.connecting}
                    </motion.div>
                  )}
                  {status === "success" && (
                    <motion.div
                      key="success"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-2 absolute text-emerald-500 dark:text-emerald-500"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {t.success}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Invisible element to maintain max width needed by absolute elements */}
                <span className="invisible flex items-center gap-2">{t.connecting}</span>
              </button>
            </div>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
           <p className="text-[12px] text-neutral-500">
             {t.footerWarning}
           </p>
        </div>
      </motion.div>
    </div>
  );
}
