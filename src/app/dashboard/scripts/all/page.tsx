"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  ChatCircle,
  Phone,
  Users,
  Link as Link2Icon,
  X,
  CircleNotch,
  CheckCircle,
  Scroll as ScrollText,
  Sparkle,
} from "@phosphor-icons/react";
import { useLanguage } from "@/hooks/useLanguage";
import { PageLoader } from "@/components/ui/page-loader";
import {
  getMyScriptsAction,
  getSharedScriptsAction,
  getManagedProjectsAction,
  connectScriptToProjectAction,
  disconnectScriptFromProjectAction,
  type Script,
} from "@/app/actions/scripts";
import { cn } from "@/lib/utils";

const translations = {
  en: {
    title: "Scripts",
    addScript: "New Script",
    empty: "No scripts yet",
    emptyDesc: "Scripts can be used entirely on their own to structure your team's conversations, or you can link them directly to your Projects for AI agent training.",
    createFirst: "Create First Script",
    dialogCount: "dialogs",
    recommendHint: "Record 3+ dialogs for best training effect",
    connectToProject: "Connect to Project",
    connectedTo: "Connected to",
    notConnected: "Standalone Script",
    disconnect: "Disconnect",
    connectModalTitle: "Connect to Project",
    connectModalDesc:
      "Projects you own or manage are shown. Connected scripts become available to project members.",
    noProjects: "You don't own any projects yet.",
    connecting: "Connecting...",
    connected_ok: "Connected!",
    errorConnect: "Failed to connect script to project.",
    errorDisconnect: "Failed to disconnect.",
    disconnected: "Disconnected from project.",
    addDialogs: "Add Dialog",
    phone: "Phone Call",
    chat: "Chat / Messenger",
    in_person: "In-Person",
    openScript: "Open Editor",
    aiGenerateLabel: "Generate AI diagram",
    comingSoon: "Coming soon",
    scriptTypeLabel: "Sales Channel",
    scriptNotesLabel: "AI Context Notes",
    noNotes: "No context notes provided.",
    integrationManagement: "Integration / Management",
    changeConnection: "Change connection...",
    aiDiagramDesc: "AI will analyze this script and draw a convenient flow diagram for managers.",
    sharedWithMe: "Shared with me",
    sharedDesc: "Scripts shared through your project memberships",
    yourRole: "Your role",
    fromProject: "From project",
  },
  ru: {
    title: "Скрипты",
    addScript: "Новый скрипт",
    empty: "Скриптов пока нет",
    emptyDesc: "Вы можете использовать скрипты как полностью самостоятельный инструмент для работы с командой, так и привязывать их к Проектам для обучения ИИ агентов.",
    createFirst: "Создать первый скрипт",
    dialogCount: "диалогов",
    recommendHint: "Для лучшего эффекта обучения запишите 3+ диалога",
    connectToProject: "Подключить к проекту",
    connectedTo: "Привязан к проекту:",
    notConnected: "Независимый скрипт",
    disconnect: "Отключить",
    connectModalTitle: "Подключить к проекту",
    connectModalDesc:
      "Отображаются ваши проекты и проекты, которыми вы управляете. Подключённые скрипты становятся доступны членам проекта.",
    noProjects: "У вас пока нет своих проектов.",
    connecting: "Подключение...",
    connected_ok: "Подключено!",
    errorConnect: "Не удалось подключить скрипт к проекту.",
    errorDisconnect: "Не удалось отключить.",
    disconnected: "Скрипт отключён от проекта.",
    addDialogs: "Добавить диалог",
    phone: "Звонок",
    chat: "Чат",
    in_person: "Живые",
    openScript: "Редактор",
    aiGenerateLabel: "Сгенерировать ИИ-схему",
    comingSoon: "Скоро",
    scriptTypeLabel: "Канал продаж",
    scriptNotesLabel: "Заметки для ИИ",
    noNotes: "Заметки не указаны.",
    integrationManagement: "Интеграция / Управление",
    changeConnection: "Изменить привязку...",
    aiDiagramDesc: "ИИ проанализирует этот скрипт и нарисует удобную блок-схему (диаграмму) для менеджеров.",
    sharedWithMe: "Доступные мне",
    sharedDesc: "Скрипты, доступные через участие в проектах",
    yourRole: "Ваша роль",
    fromProject: "Из проекта",
  },
} as const;

type T = typeof translations["en"] | typeof translations["ru"];

function SalesTypeIcon({ type, className }: { type: string, className?: string }) {
  if (type === "phone") return <Phone className={className || "w-4 h-4"} weight="duotone" />;
  if (type === "chat") return <ChatCircle className={className || "w-4 h-4"} weight="duotone" />;
  return <Users className={className || "w-4 h-4"} weight="duotone" />;
}

function ConnectModal({
  script,
  t,
  onClose,
  onConnected,
}: {
  script: Script;
  t: T;
  onClose: () => void;
  onConnected: (projectId: string | null, projectName: string | null) => void;
}) {
  const [projects, setProjects] = React.useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [connecting, setConnecting] = React.useState<string | null>(null);

  React.useEffect(() => {
    getManagedProjectsAction()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (projectId: string, projectName: string) => {
    setConnecting(projectId);
    try {
      await connectScriptToProjectAction(script.id, projectId);
      onConnected(projectId, projectName);
      toast.success(t.connected_ok);
      onClose();
    } catch {
      toast.error(t.errorConnect);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    setConnecting("disconnect");
    try {
      await disconnectScriptFromProjectAction(script.id);
      onConnected(null, null);
      toast.success(t.disconnected);
      onClose();
    } catch {
      toast.error(t.errorDisconnect);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-sm bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161616]">
          <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
            {t.connectModalTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-[12px] text-neutral-500 mb-4">{t.connectModalDesc}</p>

          {loading ? (
            <div className="flex justify-center py-6">
              <CircleNotch className="w-5 h-5 animate-spin text-neutral-400" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-[13px] text-neutral-500 text-center py-4">{t.noProjects}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {projects.map((proj) => {
                const isCurrent = script.project_id === proj.id;
                const isConnecting = connecting === proj.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => (isCurrent ? undefined : handleConnect(proj.id, proj.name))}
                    disabled={!!connecting}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-colors",
                      isCurrent
                        ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 cursor-default"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#0a0a0a]"
                    )}
                  >
                    <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                      {proj.name}
                    </span>
                    {isCurrent ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                    ) : isConnecting ? (
                      <CircleNotch className="w-4 h-4 animate-spin text-neutral-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          {script.project_id && (
            <button
              onClick={handleDisconnect}
              disabled={!!connecting}
              className="mt-4 w-full text-center text-[12px] text-rose-600 dark:text-rose-400 hover:underline transition-colors disabled:opacity-50"
            >
              {connecting === "disconnect" ? (
                <CircleNotch className="w-3.5 h-3.5 animate-spin inline mr-1.5" />
              ) : null}
              {t.disconnect}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AllScriptsPage() {
  const { language, mounted } = useLanguage();
  const t = mounted
    ? translations[language as keyof typeof translations]
    : translations.ru;

  const [scripts, setScripts] = React.useState<(Script & { dialog_count: number })[]>([]);
  const [sharedScripts, setSharedScripts] = React.useState<(Script & { dialog_count: number; member_role: string })[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [connectingScript, setConnectingScript] = React.useState<Script | null>(null);

  React.useEffect(() => {
    Promise.all([
      getMyScriptsAction().catch(() => []),
      getSharedScriptsAction().catch(() => []),
    ]).then(([own, shared]) => {
      setScripts(own);
      setSharedScripts(shared);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleConnected = (scriptId: string, projectId: string | null, projectName: string | null) => {
    setScripts((prev) =>
      prev.map((s) => (s.id === scriptId ? { ...s, project_id: projectId, projects: projectName ? { id: projectId!, name: projectName } : null } : s))
    );
  };

  if (!mounted || isLoading) {
    return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  }

  if (scripts.length === 0 && sharedScripts.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col pt-20 lg:pt-32 items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded-xl flex items-center justify-center mb-6 border border-neutral-200 dark:border-neutral-800">
            <ScrollText className="w-8 h-8" weight="duotone" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-base text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">
            {t.emptyDesc}
          </p>

          <Link href="/sales-agents/scripts/new">
            <button className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              {t.createFirst}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex-1 flex flex-col p-6 md:p-8 lg:p-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
              {t.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/sales-agents/scripts/new"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 px-4 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t.addScript}
            </Link>
          </div>
        </div>

        <motion.div
           className="flex flex-col gap-6"
           initial="hidden"
           animate="visible"
           variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {scripts.map((script) => (
            <motion.div 
              key={script.id} 
              className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all dark:border-neutral-800 dark:bg-[#111]"
              variants={{
                hidden: { opacity: 0, y: 5 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 p-5 px-6 dark:border-neutral-900 dark:bg-[#161616]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 text-neutral-600 dark:text-neutral-400">
                    <SalesTypeIcon type={script.sales_type} className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                      {script.title || (language === "ru" ? "Скрипт без названия" : "Untitled script")}
                    </h3>
                    <p className="text-[12px] font-medium text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      {script.dialog_count} {t.dialogCount}
                      {script.dialog_count < 3 && (
                        <span className="text-amber-600 dark:text-amber-500 lowercase">
                          — {t.recommendHint}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/sales-agents/scripts/${script.id}/chat`}
                  className="group flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 transition-all hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 dark:border-neutral-700 dark:bg-[#0a0a0a] dark:text-neutral-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/30 dark:hover:text-cyan-400"
                >
                  {t.openScript} &rarr;
                </Link>
              </div>

              {/* Body */}
              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-neutral-100 dark:divide-neutral-900">
                
                {/* Column 1: Notes & Type */}
                <div className="flex-1 flex flex-col gap-6 p-6">
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      {t.scriptTypeLabel}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800/80 text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                      {t[script.sales_type as keyof T] ?? script.sales_type}
                    </span>
                  </div>
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      {t.scriptNotesLabel}
                    </p>
                    <p className="text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-300">
                      {script.description && script.description.trim().length > 0 
                        ? script.description 
                        : <span className="text-neutral-400 italic">{t.noNotes}</span>}
                    </p>
                  </div>
                </div>

                {/* Column 2: Connected Project */}
                <div className="flex-1 flex flex-col gap-6 p-6 lg:border-r border-neutral-100 dark:border-neutral-900">
                   <div>
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      {t.integrationManagement}
                    </p>
                    
                    {script.project_id && script.projects ? (
                      <div className="flex flex-col items-start gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" weight="fill" />
                          <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">
                            {t.connectedTo} <strong className="font-bold underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4 decoration-dashed">{script.projects.name}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <button
                            onClick={() => setConnectingScript(script)}
                            className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:underline transition-colors"
                          >
                            {t.changeConnection}
                          </button>
                          <button
                            onClick={async () => {
                              const toastId = toast.loading("Отключение...");
                              try {
                                await disconnectScriptFromProjectAction(script.id);
                                handleConnected(script.id, null, null);
                                toast.success(t.disconnected, { id: toastId });
                              } catch (error) {
                                toast.error(t.errorDisconnect, { id: toastId });
                              }
                            }}
                            className="text-[12px] font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-colors"
                          >
                            {t.disconnect}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                          <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" />
                          <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                            {t.notConnected}
                          </span>
                        </div>
                        <button
                          onClick={() => setConnectingScript(script)}
                          disabled={script.dialog_count === 0}
                          title={script.dialog_count === 0 ? (language === "ru" ? "Сначала добавьте хотя бы 1 диалог" : "Add at least 1 dialog first") : undefined}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-transparent hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-40"
                        >
                          <Link2Icon className="w-3.5 h-3.5" />
                          {t.connectToProject}
                        </button>
                      </div>
                    )}
                   </div>
                </div>

                {/* Column 3: AI Diagram feature (Disabled mock) */}
                <div className="flex w-full shrink-0 flex-col bg-neutral-50/30 p-6 lg:w-[320px] dark:bg-black/20 justify-center group/ai">
                  <button disabled className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm opacity-60 cursor-not-allowed">
                     <span className="flex items-center gap-2 text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">
                       <Sparkle className="w-4 h-4 text-cyan-500" weight="fill" />
                       {t.aiGenerateLabel}
                     </span>
                     <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                       {t.comingSoon}
                     </span>
                  </button>
                  <p className="text-[11px] text-neutral-400 text-center mt-3">
                    {t.aiDiagramDesc}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Shared with me */}
        {sharedScripts.length > 0 && (
          <div className="mt-14">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
                {t.sharedWithMe}
              </h2>
              <p className="text-sm text-neutral-500">{t.sharedDesc}</p>
            </div>

            <motion.div
              className="flex flex-col gap-6"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {sharedScripts.map((script) => (
                <motion.div
                  key={script.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm transition-all dark:border-indigo-500/15 dark:bg-[#111]"
                  variants={{
                    hidden: { opacity: 0, y: 5 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
                  }}
                >
                  <div className="flex items-center justify-between border-b border-indigo-50 bg-indigo-50/30 p-5 px-6 dark:border-indigo-900/30 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0 text-neutral-600 dark:text-neutral-400">
                        <SalesTypeIcon type={script.sales_type} className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                          {script.title || (language === "ru" ? "Скрипт без названия" : "Untitled script")}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[12px] font-medium text-neutral-500">
                            {script.dialog_count} {t.dialogCount}
                          </span>
                          {script.projects && (
                            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                              {t.fromProject}: {script.projects.name}
                            </span>
                          )}
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                            script.member_role === "owner" || script.member_role === "admin"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                          )}>
                            {script.member_role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/sales-agents/scripts/${script.id}/chat`}
                      className="group flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 transition-all hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 dark:border-neutral-700 dark:bg-[#0a0a0a] dark:text-neutral-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/30 dark:hover:text-cyan-400"
                    >
                      {t.openScript} &rarr;
                    </Link>
                  </div>

                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-neutral-100 dark:divide-neutral-900">
                    <div className="flex-1 flex flex-col gap-6 p-6">
                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          {t.scriptTypeLabel}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800/80 text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                          {t[script.sales_type as keyof T] ?? script.sales_type}
                        </span>
                      </div>
                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          {t.scriptNotesLabel}
                        </p>
                        <p className="text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-300">
                          {script.description && script.description.trim().length > 0
                            ? script.description
                            : <span className="text-neutral-400 italic">{t.noNotes}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {connectingScript && (
          <ConnectModal
            script={connectingScript}
            t={t}
            onClose={() => setConnectingScript(null)}
            onConnected={(projectId, projectName) => {
              handleConnected(connectingScript.id, projectId, projectName);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
