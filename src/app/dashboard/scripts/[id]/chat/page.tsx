"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  CircleNotch,
  CheckCircle,
  ChatCircle,
  User,
  UserCircle,
  X,
  Trash,
  Plus,
  Keyboard,
  Microphone,
  VideoCamera,
  Image as ImageIcon,
  GearSix,
  ShareNetwork,
  UsersThree,
  LinkSimple,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { PageLoader } from "@/components/ui/page-loader";
import {
  saveDialogAction,
  getScriptDialogsAction,
  deleteDialogAction,
  updateScriptMetadataAction,
  getScriptAccessAction,
  getScriptMembersAction,
  getManagedProjectsAction,
  connectScriptToProjectAction,
  disconnectScriptFromProjectAction,
  type DialogTurn,
  type MessageType,
  type Script,
  type ScriptDialog,
  type ScriptAccess,
  type ScriptMember,
} from "@/app/actions/scripts";
import { cn } from "@/lib/utils";

const SALES_TYPE_LABELS: Record<string, { en: string; ru: string }> = {
  phone: { en: "Phone Call", ru: "Телефонный звонок" },
  chat: { en: "Chat / Messenger", ru: "Чат / Мессенджер" },
  in_person: { en: "In-Person", ru: "Живые продажи" },
};

const MSG_TYPES: { key: MessageType; icon: React.ElementType; label: { en: string; ru: string } }[] = [
  { key: "text", icon: Keyboard, label: { en: "Text", ru: "Текст" } },
  { key: "voice", icon: Microphone, label: { en: "Voice", ru: "Голос" } },
  { key: "video", icon: VideoCamera, label: { en: "Video", ru: "Видео" } },
  { key: "screenshot", icon: ImageIcon, label: { en: "Screenshot", ru: "Скриншот" } },
];

const translations = {
  en: {
    back: "All Scripts",
    notFound: "Script not found.",
    newDialog: "New Dialog",
    dialogN: "Dialog",
    noDialogs: "No dialogs yet",
    noDialogsHint: "Record your first dialog →",
    clientTurn: "Client",
    managerTurn: "Manager",
    addClientTurn: "+ Client",
    addManagerTurn: "+ Manager",
    finish: "Save Dialog",
    finishing: "Saving...",
    dialogSaved: "Dialog saved!",
    turnsLabel: "messages",
    errorSaving: "Failed to save dialog.",
    emptyWarning: "Please fill in at least one message from each side.",
    deleteDialog: "Delete dialog",
    dialogDeleted: "Dialog deleted.",
    errorDeleting: "Failed to delete dialog.",
    recording: "Recording...",
    delete: "Delete",
    // per-type placeholders
    textPlaceholderClient: "What would the client say?",
    textPlaceholderManager: "How would the manager respond?",
    voicePlaceholder: "Describe what was said in the voice message...",
    videoSaidPlaceholder: "Describe what was SAID in the video...",
    videoShownPlaceholder: "Describe what is SHOWN in the video (visuals)...",
    screenshotPlaceholder: "Describe what is visible in the screenshot...",
    // field labels
    voiceTranscript: "Voice transcript / content",
    videoNarration: "Video narration",
    videoVisuals: "Visual content (what is shown)",
    screenshotContent: "Screenshot content",
    settings: "Script Settings",
    untitledScript: "Untitled script",
    scriptTitle: "Script Name",
    scriptNotes: "Context for AI",
    saveSettings: "Save changes",
    saving: "Saving...",
    settingsSaved: "Settings saved!",
    errorSettings: "Failed to save settings.",
    share: "Share",
    whoHasAccess: "Who has access",
    sharedViaProject: "Shared via project",
    notShared: "Not shared with any project",
    shareDesc: "Connect this script to a project to share it with team members.",
    connectToProject: "Connect to Project",
    noManagedProjects: "No projects available.",
    connecting: "Connecting...",
    connected_ok: "Connected!",
    errorConnect: "Failed to connect.",
    disconnect: "Disconnect from project",
    disconnected: "Disconnected.",
    errorDisconnect: "Failed to disconnect.",
    roleOwner: "Owner",
    roleAdmin: "Admin",
    roleSalesManager: "Sales Manager",
    roleViewer: "Viewer",
  },
  ru: {
    back: "Все Скрипты",
    notFound: "Скрипт не найден.",
    newDialog: "Новый диалог",
    dialogN: "Диалог",
    noDialogs: "Диалогов пока нет",
    noDialogsHint: "Запишите первый диалог →",
    clientTurn: "Клиент",
    managerTurn: "Менеджер",
    addClientTurn: "+ Клиент",
    addManagerTurn: "+ Менеджер",
    finish: "Сохранить диалог",
    finishing: "Сохранение...",
    dialogSaved: "Диалог сохранён!",
    turnsLabel: "сообщений",
    errorSaving: "Не удалось сохранить диалог.",
    emptyWarning: "Заполните хотя бы по одному сообщению от каждой стороны.",
    deleteDialog: "Удалить диалог",
    dialogDeleted: "Диалог удалён.",
    errorDeleting: "Не удалось удалить диалог.",
    recording: "Запись...",
    delete: "Удалить",
    // per-type placeholders
    textPlaceholderClient: "Что бы сказал клиент?",
    textPlaceholderManager: "Как бы ответил менеджер?",
    voicePlaceholder: "Опишите содержание голосового сообщения...",
    videoSaidPlaceholder: "Опишите что ГОВОРИТСЯ в видео...",
    videoShownPlaceholder: "Опишите что ПОКАЗЫВАЕТСЯ в видео (визуальный контент)...",
    screenshotPlaceholder: "Опишите что видно на скриншоте...",
    // field labels
    voiceTranscript: "Транскрипция / содержание голосового",
    videoNarration: "Что говорится в видео",
    videoVisuals: "Визуальный контент (что показывается)",
    screenshotContent: "Содержимое скриншота",
    settings: "Настройки скрипта",
    untitledScript: "Скрипт без названия",
    scriptTitle: "Название скрипта",
    scriptNotes: "Заметки для ИИ",
    saveSettings: "Сохранить изменения",
    saving: "Сохранение...",
    settingsSaved: "Настройки сохранены!",
    errorSettings: "Не удалось сохранить настройки.",
    share: "Доступ",
    whoHasAccess: "Кто имеет доступ",
    sharedViaProject: "Расшарен через проект",
    notShared: "Не привязан ни к одному проекту",
    shareDesc: "Подключите скрипт к проекту, чтобы открыть доступ участникам команды.",
    connectToProject: "Подключить к проекту",
    noManagedProjects: "Нет доступных проектов.",
    connecting: "Подключение...",
    connected_ok: "Подключено!",
    errorConnect: "Не удалось подключить.",
    disconnect: "Отключить от проекта",
    disconnected: "Отключено.",
    errorDisconnect: "Не удалось отключить.",
    roleOwner: "Владелец",
    roleAdmin: "Админ",
    roleSalesManager: "Менеджер",
    roleViewer: "Наблюдатель",
  },
} as const;

type TurnRole = "client" | "manager";

interface LiveTurn {
  role: TurnRole;
  type: MessageType;
  text: string;
  visual_description: string;
}

// ── Per-message type selector ───────────────────────────────────────────────

function TypeSelector({
  value,
  onChange,
  lang,
}: {
  value: MessageType;
  onChange: (t: MessageType) => void;
  lang: "en" | "ru";
}) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
      {MSG_TYPES.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          title={label[lang]}
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
            value === key
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          )}
        >
          <Icon className="w-3 h-3" weight={value === key ? "fill" : "regular"} />
          <span className="hidden sm:inline">{label[lang]}</span>
        </button>
      ))}
    </div>
  );
}

// ── Bubble editor ───────────────────────────────────────────────────────────

function BubbleEditor({
  turn,
  idx,
  t,
  lang,
  isClient,
  onUpdate,
  onRemove,
}: {
  turn: LiveTurn;
  idx: number;
  t: typeof translations["en"] | typeof translations["ru"];
  lang: "en" | "ru";
  isClient: boolean;
  onUpdate: (field: keyof LiveTurn, value: string | MessageType) => void;
  onRemove: () => void;
}) {
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const textPlaceholder = isClient ? t.textPlaceholderClient : t.textPlaceholderManager;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.02, duration: 0.18 }}
      className={cn("flex gap-3 w-full", isClient ? "flex-row" : "flex-row-reverse")}
    >
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 border",
        isClient
          ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500"
          : "bg-emerald-100 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
      )}>
        {isClient ? <User className="w-3.5 h-3.5" /> : <UserCircle className="w-3.5 h-3.5" />}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 flex-1 group/bubble">
        {/* Label row */}
        <div className={cn("flex items-center gap-2 flex-wrap", !isClient && "flex-row-reverse")}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            {isClient ? t.clientTurn : t.managerTurn}
          </span>
          <TypeSelector value={turn.type} onChange={(v) => onUpdate("type", v)} lang={lang} />
          <button
            onClick={onRemove}
            className="opacity-0 group-hover/bubble:opacity-100 ml-auto p-0.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
            title={t.delete}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Input area — varies by type */}
        <div className={cn(
          "rounded-xl border",
          isClient
            ? "bg-white dark:bg-[#111] border-neutral-200 dark:border-neutral-800 rounded-tl-sm"
            : "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 rounded-tr-sm"
        )}>
          {turn.type === "text" && (
            <textarea
              value={turn.text}
              onInput={(e) => autoResize(e.currentTarget)}
              onChange={(e) => onUpdate("text", e.target.value)}
              placeholder={textPlaceholder}
              className="w-full px-3 py-2 text-[13px] leading-relaxed bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none resize-none"
              style={{ minHeight: "56px" }}
            />
          )}

          {turn.type === "voice" && (
            <div className="p-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-1 flex items-center gap-1.5">
                <Microphone className="w-3 h-3" />
                {t.voiceTranscript}
              </label>
              <textarea
                value={turn.text}
                onInput={(e) => autoResize(e.currentTarget)}
                onChange={(e) => onUpdate("text", e.target.value)}
                placeholder={t.voicePlaceholder}
                className="w-full px-3 py-2 text-[13px] leading-relaxed bg-neutral-50 dark:bg-neutral-900/40 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none resize-none"
                style={{ minHeight: "56px" }}
              />
            </div>
          )}

          {turn.type === "video" && (
            <div className="p-2 flex flex-col gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-1 flex items-center gap-1.5">
                  <VideoCamera className="w-3 h-3" />
                  {t.videoNarration}
                </label>
                <textarea
                  value={turn.text}
                  onInput={(e) => autoResize(e.currentTarget)}
                  onChange={(e) => onUpdate("text", e.target.value)}
                  placeholder={t.videoSaidPlaceholder}
                  className="w-full px-3 py-2 text-[13px] leading-relaxed bg-neutral-50 dark:bg-neutral-900/40 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none resize-none"
                  style={{ minHeight: "48px" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  {t.videoVisuals}
                </label>
                <textarea
                  value={turn.visual_description}
                  onInput={(e) => autoResize(e.currentTarget)}
                  onChange={(e) => onUpdate("visual_description", e.target.value)}
                  placeholder={t.videoShownPlaceholder}
                  className="w-full px-3 py-2 text-[13px] leading-relaxed bg-neutral-50 dark:bg-neutral-900/40 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none resize-none"
                  style={{ minHeight: "48px" }}
                />
              </div>
            </div>
          )}

          {turn.type === "screenshot" && (
            <div className="p-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-1 flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" />
                {t.screenshotContent}
              </label>
              <textarea
                value={turn.text}
                onInput={(e) => autoResize(e.currentTarget)}
                onChange={(e) => onUpdate("text", e.target.value)}
                placeholder={t.screenshotPlaceholder}
                className="w-full px-3 py-2 text-[13px] leading-relaxed bg-neutral-50 dark:bg-neutral-900/40 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none resize-none"
                style={{ minHeight: "56px" }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Saved dialog viewer ─────────────────────────────────────────────────────

function SavedTurnView({ turn, isClient, lang }: { turn: DialogTurn; isClient: boolean; lang: "en" | "ru" }) {
  const typeInfo = MSG_TYPES.find((m) => m.key === turn.type) ?? MSG_TYPES[0];
  const Icon = typeInfo.icon;
  return (
    <div className={cn("flex gap-3 w-full", isClient ? "flex-row" : "flex-row-reverse")}>
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border",
        isClient
          ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500"
          : "bg-emerald-100 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
      )}>
        {isClient ? <User className="w-3.5 h-3.5" /> : <UserCircle className="w-3.5 h-3.5" />}
      </div>
      <div className={cn(
        "flex-1 px-3 py-2.5 rounded-xl text-[13px] leading-relaxed border",
        isClient
          ? "bg-white dark:bg-[#111] border-neutral-200 dark:border-neutral-800 rounded-tl-sm"
          : "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 rounded-tr-sm"
      )}>
        {turn.type !== "text" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
            <Icon className="w-3 h-3" />
            {typeInfo.label[lang]}
          </span>
        )}
        <p className="text-neutral-900 dark:text-neutral-100">{turn.text}</p>
        {turn.visual_description && (
          <p className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 text-[12px] text-neutral-500 italic">
            {turn.visual_description}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function ScriptChatPage() {
  const params = useParams();
  const scriptId = params?.id as string;
  const { language, mounted } = useLanguage();
  const lang = (mounted ? language : "ru") as "en" | "ru";
  const t = translations[lang];

  const [script, setScript] = React.useState<Script | null>(null);
  const [dialogs, setDialogs] = React.useState<ScriptDialog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDialogId, setSelectedDialogId] = React.useState<string | null>(null);
  const [access, setAccess] = React.useState<ScriptAccess | null>(null);

  const [turns, setTurns] = React.useState<LiveTurn[]>([
    { role: "client", type: "text", text: "", visual_description: "" },
    { role: "manager", type: "text", text: "", visual_description: "" },
  ]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState("");
  const [editingDescription, setEditingDescription] = React.useState("");
  const [isUpdatingMeta, setIsUpdatingMeta] = React.useState(false);

  // Share / Access panel state
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [shareMembers, setShareMembers] = React.useState<ScriptMember[]>([]);
  const [shareProjectName, setShareProjectName] = React.useState<string | null>(null);
  const [shareMembersLoading, setShareMembersLoading] = React.useState(false);
  const [managedProjects, setManagedProjects] = React.useState<{ id: string; name: string }[]>([]);
  const [connectingProjectId, setConnectingProjectId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!scriptId) return;
    Promise.all([getScriptAccessAction(scriptId), getScriptDialogsAction(scriptId)])
      .then(([a, d]) => { setAccess(a); setScript(a.script); setDialogs(d); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [scriptId]);

  const addTurn = (role: TurnRole) => {
    setTurns((prev) => [...prev, { role, type: "text", text: "", visual_description: "" }]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const updateTurn = (idx: number, field: keyof LiveTurn, value: string | MessageType) => {
    setTurns((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeTurn = (idx: number) => setTurns((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    const filledTurns: DialogTurn[] = turns
      .filter((tr) => tr.text.trim().length > 0)
      .map((tr) => ({
        role: tr.role,
        type: tr.type,
        text: tr.text.trim(),
        ...(tr.visual_description?.trim() ? { visual_description: tr.visual_description.trim() } : {}),
      }));

    if (filledTurns.length < 2) { toast.error(t.emptyWarning); return; }

    setIsSaving(true);
    try {
      const savedDialog = await saveDialogAction(scriptId, filledTurns);
      setDialogs((prev) =>
        [...prev, savedDialog].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      );
      setTurns([
        { role: "client", type: "text", text: "", visual_description: "" },
        { role: "manager", type: "text", text: "", visual_description: "" },
      ]);
      toast.success(t.dialogSaved);
      void getScriptDialogsAction(scriptId)
        .then((updated) => {
          setDialogs(updated);
        })
        .catch(() => {
          // The save already succeeded; a delayed sync should not block the UI.
        });
    } catch { toast.error(t.errorSaving); }
    finally { setIsSaving(false); }
  };

  const handleDeleteDialog = async (dialogId: string) => {
    setDeletingId(dialogId);
    try {
      await deleteDialogAction(dialogId);
      setDialogs((prev) => prev.filter((d) => d.id !== dialogId));
      if (selectedDialogId === dialogId) setSelectedDialogId(null);
      toast.success(t.dialogDeleted);
    } catch { toast.error(t.errorDeleting); }
    finally { setDeletingId(null); }
  };

  if (!mounted || isLoading) return <PageLoader className="min-h-[calc(100vh-5rem)]" />;
  if (!script || !access) return (
    <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">{t.notFound}</div>
  );

  const canEdit = access.canEdit;
  const canManage = access.canManage;
  const isOwner = access.isOwner;

  const openSettings = () => {
    setEditingTitle(script?.title || "");
    setEditingDescription(script?.description || "");
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    if (!script) return;
    if (!editingTitle.trim() || !editingDescription.trim()) {
      toast.error(lang === "ru" ? "Заполните все поля" : "Please fill in all fields");
      return;
    }
    
    setIsUpdatingMeta(true);
    try {
      await updateScriptMetadataAction(script.id, {
        title: editingTitle.trim(),
        description: editingDescription.trim(),
      });
      setScript({
        ...script,
        title: editingTitle.trim(),
        description: editingDescription.trim(),
      });
      toast.success(t.settingsSaved);
      setIsSettingsOpen(false);
    } catch {
      toast.error(t.errorSettings);
    } finally {
      setIsUpdatingMeta(false);
    }
  };

  const openSharePanel = async () => {
    setIsShareOpen(true);
    setShareMembersLoading(true);
    try {
      const [membersResult, projects] = await Promise.all([
        getScriptMembersAction(scriptId),
        canManage ? getManagedProjectsAction() : Promise.resolve([]),
      ]);
      setShareMembers(membersResult.members);
      setShareProjectName(membersResult.projectName);
      setManagedProjects(projects);
    } catch { /* silent */ }
    finally { setShareMembersLoading(false); }
  };

  const handleConnectToProject = async (projectId: string) => {
    setConnectingProjectId(projectId);
    try {
      await connectScriptToProjectAction(scriptId, projectId);
      toast.success(t.connected_ok);
      // Refresh access + members
      const [a, membersResult] = await Promise.all([
        getScriptAccessAction(scriptId),
        getScriptMembersAction(scriptId),
      ]);
      setAccess(a);
      setScript(a.script);
      setShareMembers(membersResult.members);
      setShareProjectName(membersResult.projectName);
    } catch { toast.error(t.errorConnect); }
    finally { setConnectingProjectId(null); }
  };

  const handleDisconnectFromProject = async () => {
    setConnectingProjectId("disconnect");
    try {
      await disconnectScriptFromProjectAction(scriptId);
      toast.success(t.disconnected);
      const a = await getScriptAccessAction(scriptId);
      setAccess(a);
      setScript(a.script);
      setShareMembers([]);
      setShareProjectName(null);
    } catch { toast.error(t.errorDisconnect); }
    finally { setConnectingProjectId(null); }
  };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = { owner: t.roleOwner, admin: t.roleAdmin, sales_manager: t.roleSalesManager, viewer: t.roleViewer };
    return map[role] ?? role;
  };

  const salesTypeLabel = SALES_TYPE_LABELS[script.sales_type]?.[lang] ?? script.sales_type;
  const selectedDialog = dialogs.find((d) => d.id === selectedDialogId) ?? null;
  const isNewMode = selectedDialogId === null;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] shrink-0">
        <Link
          href="/sales-agents/scripts/all"
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t.back}
        </Link>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />
        <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-wider hidden sm:inline">{salesTypeLabel}</span>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px] sm:max-w-xs">
            {script.title || t.untitledScript}
          </span>
          {/* Role badge for non-owners */}
          {!isOwner && (
            <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
              access.role === 'admin'
                ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
            }`}>
              {access.role}
            </span>
          )}
          {canManage && (
            <>
              <button
                onClick={openSharePanel}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                title={t.share}
              >
                <ShareNetwork className="w-3.5 h-3.5" />
                {t.share}
              </button>
              <button
                onClick={openSettings}
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title={t.settings}
              >
                <GearSix className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#0d0d0d] flex flex-col overflow-hidden">
          {/* New Dialog button — only for users who can edit */}
          {canEdit && (
            <button
              onClick={() => setSelectedDialogId(null)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b border-neutral-200 dark:border-neutral-800 transition-colors shrink-0",
                isNewMode
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800/50"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              {t.newDialog}
            </button>
          )}

          <div className="flex-1 overflow-y-auto">
            {dialogs.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <ChatCircle className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                <p className="text-[11px] text-neutral-400">{t.noDialogs}</p>
                <p className="text-[10px] text-neutral-400 mt-1">{t.noDialogsHint}</p>
              </div>
            ) : (
              dialogs.map((dialog, idx) => {
                const isActive = selectedDialogId === dialog.id;
                return (
                  <div
                    key={dialog.id}
                    className={cn(
                      "group flex items-start justify-between gap-1 px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-800/60 cursor-pointer transition-colors",
                      isActive ? "bg-white dark:bg-neutral-800/50" : "hover:bg-white/80 dark:hover:bg-neutral-800/30"
                    )}
                    onClick={() => setSelectedDialogId(dialog.id)}
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-neutral-900 dark:text-neutral-100">
                        {t.dialogN} {idx + 1}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {dialog.turns.length} {t.turnsLabel}
                      </p>
                    </div>
                    {(canManage || isOwner) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDialog(dialog.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shrink-0 mt-0.5"
                      title={t.deleteDialog}
                    >
                      {deletingId === dialog.id ? (
                        <CircleNotch className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash className="w-3 h-3" />
                      )}
                    </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {!isNewMode && selectedDialog ? (
              /* Saved dialog viewer */
              <motion.div
                key={selectedDialog.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-4"
              >
                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2">
                  {t.dialogN} · {selectedDialog.turns.length} {t.turnsLabel}
                </p>
                {selectedDialog.turns.map((turn, idx) => (
                  <SavedTurnView
                    key={idx}
                    turn={turn}
                    isClient={turn.role === "client"}
                    lang={lang}
                  />
                ))}
              </motion.div>
            ) : (
              /* New dialog editor — only shown if user can edit */
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {canEdit ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                      <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                        {t.recording}
                      </p>
                      {turns.map((turn, idx) => (
                        <BubbleEditor
                          key={idx}
                          turn={turn}
                          idx={idx}
                          t={t}
                          lang={lang}
                          isClient={turn.role === "client"}
                          onUpdate={(field, value) => updateTurn(idx, field, value)}
                          onRemove={() => removeTurn(idx)}
                        />
                      ))}
                      <div ref={bottomRef} />
                    </div>

                    {/* Toolbar */}
                    <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] px-6 py-3 flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => addTurn("client")}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        {t.addClientTurn}
                      </button>
                      <button
                        onClick={() => addTurn("manager")}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <UserCircle className="w-3.5 h-3.5" />
                        {t.addManagerTurn}
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-[13px] font-bold bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 transition-colors shadow-sm disabled:opacity-60"
                      >
                        {isSaving ? (
                          <><CircleNotch className="w-4 h-4 animate-spin" />{t.finishing}</>
                        ) : (
                          <><CheckCircle className="w-4 h-4" />{t.finish}</>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Read-only notice for viewers */
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                      <GearSix className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
                      {lang === 'ru' ? 'Просмотр скрипта' : 'Script View Mode'}
                    </p>
                    <p className="text-[12px] text-neutral-500 max-w-xs">
                      {lang === 'ru'
                        ? 'У вас есть доступ для просмотра. Выберите диалог слева чтобы прочитать его.'
                        : 'You have read-only access. Select a dialog on the left to view it.'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161616]">
                <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                  {t.settings}
                </h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-1.5">
                    {t.scriptTitle}
                  </label>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder={t.untitledScript}
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-lg text-[13px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                    {t.scriptNotes}
                  </label>
                  <textarea
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-lg text-[13px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50/50 dark:bg-[#161616]">
                <button
                  onClick={handleSaveSettings}
                  disabled={isUpdatingMeta}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 px-5 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-sm disabled:opacity-60"
                >
                  {isUpdatingMeta ? (
                    <><CircleNotch className="w-4 h-4 animate-spin" />{t.saving}</>
                  ) : (
                    t.saveSettings
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share / Access Panel */}
      <AnimatePresence>
        {isShareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161616] shrink-0">
                <div className="flex items-center gap-2">
                  <ShareNetwork className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {t.whoHasAccess}
                  </h3>
                </div>
                <button
                  onClick={() => setIsShareOpen(false)}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
                {shareMembersLoading ? (
                  <div className="flex justify-center py-8">
                    <CircleNotch className="w-5 h-5 animate-spin text-neutral-400" />
                  </div>
                ) : (
                  <>
                    {/* Current project connection */}
                    {script.project_id && shareProjectName ? (
                      <div className="flex items-center justify-between rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <LinkSimple className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-[12px] text-emerald-700 dark:text-emerald-300 font-medium">{t.sharedViaProject}</p>
                            <p className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">{shareProjectName}</p>
                          </div>
                        </div>
                        {isOwner && (
                          <button
                            onClick={handleDisconnectFromProject}
                            disabled={!!connectingProjectId}
                            className="text-[11px] font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-colors disabled:opacity-50"
                          >
                            {connectingProjectId === "disconnect" ? <CircleNotch className="w-3.5 h-3.5 animate-spin" /> : t.disconnect}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-4 text-center">
                        <p className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">{t.notShared}</p>
                        <p className="text-[11px] text-neutral-500">{t.shareDesc}</p>
                      </div>
                    )}

                    {/* Members list */}
                    {shareMembers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <UsersThree className="w-4 h-4 text-neutral-400" />
                          <span className="text-[12px] font-bold uppercase tracking-widest text-neutral-500">
                            {shareMembers.length} {lang === "ru" ? "участников" : "members"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {shareMembers.map((member) => (
                            <div key={member.user_id} className="flex items-center gap-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] px-3 py-2.5">
                              {member.avatar_url ? (
                                <img src={member.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0">
                                  {(member.user_name || "?").substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                  {member.user_name || member.user_email || "Unknown"}
                                </p>
                                {member.user_email && (
                                  <p className="text-[11px] text-neutral-500 truncate">{member.user_email}</p>
                                )}
                              </div>
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                                member.role === "owner" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400"
                                  : member.role === "admin" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                              )}>
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connect to project (owner/admin only, when not connected) */}
                    {isOwner && !script.project_id && managedProjects.length > 0 && (
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-500 mb-3">
                          {t.connectToProject}
                        </p>
                        <div className="flex flex-col gap-2">
                          {managedProjects.map((proj) => (
                            <button
                              key={proj.id}
                              onClick={() => handleConnectToProject(proj.id)}
                              disabled={!!connectingProjectId}
                              className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-[#0a0a0a] text-left transition-colors disabled:opacity-50"
                            >
                              <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{proj.name}</span>
                              {connectingProjectId === proj.id ? (
                                <CircleNotch className="w-4 h-4 animate-spin text-neutral-400" />
                              ) : (
                                <LinkSimple className="w-4 h-4 text-neutral-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isOwner && !script.project_id && managedProjects.length === 0 && !shareMembersLoading && (
                      <p className="text-[12px] text-neutral-400 text-center py-2">{t.noManagedProjects}</p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
